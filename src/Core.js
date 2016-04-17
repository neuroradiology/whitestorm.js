/**
 * © Alexander Buzin, 2014-2015
 * Site: http://alexbuzin.me/
 * Email: alexbuzin88@gmail.com
*/

/** Class that initializates 3d world. */
WHS.World = class {
    /**
     * Create a 3D world and define defaults.
     *
     * @param {object} params - The scene settings object.
     * @return {World} A 3D world whs object.
     */
    constructor( params = {} ) {

        'use strict';

        if (!THREE)
            console.warn('whitestormJS requires THREE.js. {Object} THREE not found.');
        if (!Physijs)
            console.warn('whitestormJS requires PHYSI.js. {Object} Physijs not found.');

        var target = WHS.API.extend(params, {

            stats: false,
            autoresize: false,

            shadowmap: {
                enabled: true,
                type: THREE.PCFSoftShadowMap
            },

            helpers: {
                grid: false,
                axis: false
            },

            gravity: {
                x: 0,
                y: 0,
                z: 0
            },

            camera: {
                aspect: 75,
                near: 1,
                far: 1000,

                x: 0,
                y: 0,
                z: 0
            },

            rWidth: 1, // Resolution(width).
            rHeight: 1, // Resolution(height).

            width: window.innerWidth, // Container(width).
            height: window.innerHeight, // Container(height).

            physics: {

                quatNormalizeSkip: 0,
                quatNormalizeFast: false,

                solver: {
                    iterations: 20,
                    tolerance: 0,
                },

                defMaterial: {
                    contactEquationStiffness: 1e8,
                    contactEquationRegularizationTime: 3
                }

            },

            background: 0x000000,
            assets: "./assets",
            container: document.body,

            path_worker: '../libs/physijs_worker.js',
            path_ammo: '../libs/ammo.js'

        });

        this._settings = target;

        // INIT.
        this._initScene();
        this._initDOM();
        this._initStats();
        this._initCamera();
        this._initRenderer();
        this._initHelpers();

        // NOTE: ==================== Autoresize. ======================
        var scope = this;

        if (target.autoresize)
            window.addEventListener('resize', () => {
                scope.resize();
            });

        return scope;

    }


    /**
     * Initialize Three.js scene object.
     */
    _initScene() {

        this._initPhysiJS();

        this.scene = new Physijs.Scene;

        this.scene.setGravity(
            new THREE.Vector3(
                this._settings.gravity.x, 
                this._settings.gravity.y,
                this._settings.gravity.z
            )
        );

        // Arrays for processing.
        this.children = [];

    }

    /**
     * Set Physi.js scripts pathes.
     */
    _initPhysiJS() {

        this.simulate = true;

        Physijs.scripts.worker = this._settings.path_worker;
        Physijs.scripts.ammo = this._settings.path_ammo;

    }

    /**
     * Initialize DOM structure for whitestorm.
     */
    _initDOM() {

        this._settings.container.style.margin = 0;
        this._settings.container.style.padding = 0;
        this._settings.container.style.position = 'relative';
        this._settings.container.style.overflow = 'hidden';

        this._dom = document.createElement('div');
        this._dom.className = "whs";

        this._settings.container.appendChild(this._dom);

        return this._dom;

    }

    /**
     * Inititialize stats plugin.
     */
    _initStats() {

        // Debug Renderer
        if (this._settings.stats) {

            this._stats = new Stats();

            if (this._settings.stats == "fps")
                this._stats.setMode(0);

            else if (this._settings.stats == "ms")
                this._stats.setMode(1);

            else if (this._settings.stats == "mb")
                this._stats.setMode(1);

            else {
                this._stats.setMode(0);

                console.warn([this._stats], "Please, apply stats mode [fps, ms, mb] .");
            }

            this._stats.domElement.style.position = 'absolute';
            this._stats.domElement.style.left = '0px';
            this._stats.domElement.style.bottom = '0px';

            this._dom.appendChild(this._stats.domElement);

        }

    }

    /**
     * Create a camera and add it to scene.
     */
    _initCamera() {

        this._camera = new THREE.PerspectiveCamera(
            this._settings.camera.aspect,
            this._settings.width / this._settings.height,
            this._settings.camera.near,
            this._settings.camera.far
        );

        this._camera.position.set(
            this._settings.camera.x,
            this._settings.camera.y,
            this._settings.camera.z
        );

        this.scene.add( this._camera );

    }

    /**
     * Create a renderer and apply it's options.
     */
    _initRenderer() {

        this.render = true;

        // Renderer.
        this._renderer = new THREE.WebGLRenderer();
        this._renderer.setClearColor(this._settings.background);

        // Shadowmap.
        this._renderer.shadowMap.enabled = this._settings.shadowmap.enabled;
        this._renderer.shadowMap.type = this._settings.shadowmap.type;
        this._renderer.shadowMap.cascade = true;

        this._renderer.setSize( 
            +(this._settings.width * this._settings.rWidth).toFixed(), 
            +(this._settings.height * this._settings.rHeight).toFixed()
        );

        this._renderer.render(this.scene, this._camera);

        this._dom.appendChild(this._renderer.domElement);

        this._renderer.domElement.style.width = '100%';
        this._renderer.domElement.style.height = '100%';

    }

    /**
     * Add helpers to scene.
     */
    _initHelpers() {

        if ( this._settings.helpers.axis )
            this.scene.add( 
                new THREE.AxisHelper( 
                    this._settings.helpers.axis.size 
                    ? this._settings.helpers.axis.size 
                    : 5
                ) 
            );

        if ( this._settings.helpers.grid )
            this.scene.add( 
                new THREE.GridHelper( 
                    this._settings.helpers.grid.size 
                    ? this._settings.helpers.grid.size 
                    : 10,
                    this._settings.helpers.grid.step 
                    ? this._settings.helpers.grid.step 
                    : 1
                ) 
            );

    }

    /**
     * Start animation.
     */
    start() {

        'use strict';

        var clock = new THREE.Clock();
        var scope = this;

        function reDraw(time) {

            requestAnimationFrame(reDraw);

            // Init stats.
            if (scope._stats)
                 scope._stats.begin();

            //if (scope._settings.anaglyph)
            //  scope.effect.render(scope.scene, scope._camera);

            scope._process( clock );

            if ( scope.simulate ) scope.scene.simulate();

            scope._updateControls();

            // Effects rendering.
            if ( scope._composer ) {

                scope._composer.reset();

                if ( scope.render ) scope._composer.render( 
                    scope.scene, 
                    scope._camera 
                );

                scope._composer.pass( scope._composer.stack );

                scope._composer.toScreen();

            } else {

                if ( scope.render ) scope._renderer.render( 
                    scope.scene, 
                    scope._camera 
                );

            }

            scope._execLoops( time );

            // End helper.
            if (scope._stats)
                scope._stats.end();
        }

        this._update = reDraw;

        scope._update();
    }

    /**
     * Execute all loops with a specific time.
     *
     * @params {number} time - The time value that will be passed to loops.
     */
    _execLoops( time ) {

        WHS.loops.forEach( loop => {
            if ( loop.enabled ) loop.func( time );
        } );

    }

    /**
     * Update controls time values.
     */
    _updateControls() {

        if (this.controls) {

            this.controls.update(Date.now() - this.time);
            this.time = Date.now();

        }

    }

    /**
     * Update morphs animations.
     *
     * @params {THREE.Clock} clock - The clock object, which.
     */
    _process( clock ) {

            for ( var i = 0; i < this.children.length; i++ ) {

                if ( this.children[i]._type == "morph" ) 
                    this.children[i].mesh.mixer.update( clock.getDelta() );

            }

    }

    /**
     * This functon will scene properties when it's called.
     */
    resize() {

        this._camera.aspect = this._settings.width / this._settings.height;
        this._camera.updateProjectionMatrix();
        
        this._renderer.setSize( 
            +(this._settings.width * this._settings.rWidth).toFixed(), 
            +(this._settings.height * this._settings.rHeight).toFixed()
        );

    }

}
