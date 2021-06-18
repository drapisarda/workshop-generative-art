// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");
const random = require('canvas-sketch-util/random');
const eases = require('eases');
const BezierEasing = require('bezier-easing');

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");
const palettes = require('nice-color-palettes');

const canvasSketch = require("canvas-sketch");

const settings = {
  // Make the loop animated
  dimensions: [512, 512],
  fps: 24,
  duration: 5,
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl",
  attributes: { antialias: true }
};

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas
  });

  // WebGL background color
  renderer.setClearColor("#FFF", 1);

  // Setup a camera
  // const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
  const camera = new THREE.OrthographicCamera();
  // camera.position.set(2, 2, -4);
  // camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  // Setup a geometry
  const geometry = new THREE.SphereGeometry(1, 32, 16);
  
  // Setup a material
  const material = new THREE.MeshBasicMaterial({
    color: 'white',
    wireframe: true
  });
  
  // Setup a mesh with geometry + material
  // scene.add(mesh);
    
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);

  const palette = random.pick(palettes);

  for (let i = 0; i < 40; i++) {
    const boxMaterial = new THREE.MeshStandardMaterial({
      color: random.pick(palette),
    })

    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    boxMesh.position.set(
      random.range(-1, 1), 
      random.range(-1, 1), 
      random.range(-1, 1)
    );

    boxMesh.scale.set(
      random.range(-1, 1),
      random.range(-1, 1),
      random.range(-1, 1)
    );

    boxMesh.scale.multiplyScalar(0.5);

    scene.add(boxMesh);
  }

  const light = new THREE.DirectionalLight('white', 1);
  light.position.set(0, 0, 4);
  scene.add(light);

  const easeFn = BezierEasing(.36, -0.32, 0, 1.03);

  scene.add(new THREE.AmbientLight('red', 0.3));

  // const light = new THREE.PointLight('#47caf7', 1, 15.5);
  // light.position.set(2, 2, -4).multiplyScalar(1.5);
  // scene.add(light);

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);
      // camera.aspect = viewportWidth / viewportHeight;
      // camera.updateProjectionMatrix();

      // Isometric Cheatsheet
      const aspect = viewportWidth / viewportHeight;

      // Ortho zoom
      const zoom = 2;

      // Bounds
      camera.left = -zoom * aspect;
      camera.right = zoom * aspect;
      camera.top = zoom;
      camera.bottom = -zoom;

      // Near/Far
      camera.near = -100;
      camera.far = 100;

      // Set position & look at world center
      camera.position.set(zoom, zoom, zoom);
      camera.lookAt(new THREE.Vector3());

      // Update the camera
      camera.updateProjectionMatrix();
      
    },
    // Update & render your scene here
    render({ playhead }) {
      controls.update();
      // boxMesh.rotation.y = time * (10 * Math.PI / 180);
      // mesh.rotation.x = time * (10 * Math.PI / 180);
      const t = Math.sin(playhead * Math.PI * 2);
      scene.rotation.z = easeFn(t);
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
    }
  };
};

canvasSketch(sketch, settings);
