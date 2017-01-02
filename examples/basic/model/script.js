(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _globals = require('./globals');

var UTILS = _interopRequireWildcard(_globals);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var world = new WHS.App([new WHS.modules.ElementModule(), new WHS.modules.SceneModule(), new PHYSICS.WorldModule({
  ammo: 'http://localhost:8001/vendor/ammo.js'
}), new WHS.modules.RenderingModule({
  background: {
    color: 0x162129
  },

  renderer: {
    antialias: true
  },

  shadowmap: {
    type: THREE.PCFSoftShadowMap
  }
}), new WHS.modules.CameraModule({
  position: new THREE.Vector3(0, 10, 50)
}), new WHS.OrbitControlsModule()]);

// const sphere = new WHS.Dodecahedron({ // Create sphere comonent.
//   geometry: {
//     radius: 5,
//     detail: 0
//   },
//
//   modules: [
//     new PHYSICS.ConvexModule({
//       mass: 10,
//       restitution: 1
//     })
//   ],
//
//   material: {
//     color: UTILS.$colors.mesh,
//     kind: 'basic' // lambert
//   },
//
//   position: [0, 20, 0] // 0 100 0
// });

var teapot = new WHS.Model({
  geometry: {
    path: '../../_assets/models/teapot/utah-teapot-large.json'
  },

  modules: [new PHYSICS.ConcaveModule({
    friction: 1,
    mass: 200,
    restitution: 0.5,
    path: '../../_assets/models/teapot/utah-teapot-light.json',
    scale: new THREE.Vector3(4, 4, 4)
  })],

  useCustomMaterial: true,

  material: new THREE.MeshBasicMaterial({
    shading: THREE.SmoothShading,
    map: WHS.texture('../../_assets/textures/teapot.jpg', { repeat: { x: 1, y: 1 } }),
    side: THREE.DoubleSide
  }),

  position: {
    y: 100
  },

  scale: [4, 4, 4]
});

// const ball = new (PHYSICS.$rigidBody(WHS.Sphere, PHYSICS.SPHERE))({
//   geometry: {
//     radius: 3,
//     widthSegments: 16,
//     heightSegments: 16
//   },
//
//   mass: 60,
//
//   material: {
//     kind: 'phong',
//     color: UTILS.$colors.mesh
//   },
//
//   physics: {
//     restitution: 1
//   },
//
//   position: [10, 250, -1.969]
// });

teapot.addTo(world).then(function () {
  // ball.addTo(world);
});

UTILS.addBoxPlane(world, 500);

new WHS.SpotLight({
  light: {
    color: 0xffffff,
    intensity: 1,
    distance: 300,
    angle: 180
  },

  shadowmap: {
    fov: 90
  },

  position: {
    x: 0,
    y: 150,
    z: 50
  }
}).addTo(world);

UTILS.addAmbient(world, 0.3);

world.start();

},{"./globals":2}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addAmbient = addAmbient;
exports.addBasicLights = addBasicLights;
exports.addPlane = addPlane;
exports.addBoxPlane = addBoxPlane;
var $world = exports.$world = {
  stats: "fps", // fps, ms, mb or false if not need.
  autoresize: "window",

  gravity: [0, -100, 0],

  modules: [new WHS.modules.ElementModule(), new WHS.modules.SceneModule(), new WHS.modules.RenderingModule(), new WHS.modules.CameraModule()],

  camera: {
    position: [0, 10, 50]
  },

  rendering: {
    background: {
      color: 0x162129
    },

    renderer: {
      antialias: true
    }
  },

  shadowmap: {
    type: THREE.PCFSoftShadowMap
  }
};

var $colors = exports.$colors = {
  bg: 0x162129,
  plane: 0x447F8B,
  mesh: 0xF2F2F2,
  softbody: 0x434B7F
};

function addAmbient(world, intensity) {
  new WHS.AmbientLight({
    light: {
      intensity: intensity
    }
  }).addTo(world);
}

function addBasicLights(world) {
  var intensity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.5;
  var position = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [0, 10, 10];
  var distance = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 100;

  addAmbient(world, 1 - intensity);

  return new WHS.PointLight({
    light: {
      intensity: intensity,
      distance: distance
    },

    shadowmap: {
      fov: 90
    },

    position: position
  }).addTo(world);
}

function addPlane(world) {
  var size = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;

  return new WHS.Plane({
    geometry: {
      width: size,
      height: size
    },

    modules: [new PHYSICS.PlaneModule({
      mass: 0
    })],

    material: new THREE.MeshPhongMaterial({ color: 0x447F8B }),

    rotation: {
      x: -Math.PI / 2
    }
  }).addTo(world);
}

function addBoxPlane(world) {
  var size = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;

  return new WHS.Box({
    geometry: {
      width: size,
      height: 1,
      depth: size
    },

    modules: [new PHYSICS.BoxModule({
      mass: 0
    })],

    material: new THREE.MeshPhongMaterial({ color: 0x447F8B })
  }).addTo(world);
}

},{}]},{},[1]);
