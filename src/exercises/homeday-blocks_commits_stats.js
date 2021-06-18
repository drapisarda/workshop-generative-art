// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");
const palettes = require('nice-color-palettes');
const canvasSketch = require("canvas-sketch");
const random = require('canvas-sketch-util/random');
require("three/examples/js/controls/OrbitControls");
// const { lerp } = require('canvas-sketch-util/math');


const bgColor = "#00000f";
const redColor = "#F99";
const greenColor = "#B8FFD0";

const rotate = true;
const rotationVelocity = 0.1;
const zoom = 8;
const cartesianSpacing = 10;
const maxSize = cartesianSpacing;
const minSize = 0.1;
const maxSegments = 20;

const hdBlocksDataRaw = require('../../data/homeday-blocks_commits.stats.json');
const hdBlocksData = hdBlocksDataRaw.filter(data =>
  data.files_changed > 0
)
const dataCubeSide = Math.ceil(Math.pow(hdBlocksData.length, 0.334));

let maxFilesChanged = 0;
let maxInsertions = 0;
let maxDeletions = 0;

hdBlocksData.forEach(data => {
  if (data.files_changed > maxFilesChanged) maxFilesChanged = parseFloat(data.files_changed);
  if (data.insertions > maxInsertions) maxInsertions = parseFloat(data.insertions);
  if (data.deletions > maxDeletions) maxDeletions = parseFloat(data.deletions);
})

// const relativeData = (data, base = 1) => { // debug
//   return {
//     filesChanged: lerp(0, maxFilesChanged, data.files_changed) * base,
//     insertions: lerp(0, maxInsertions, data.insertions) * base,
//     deletions: lerp(0, maxDeletions, data.deletions) * base,
//   }
//     // return {
//     //   filesChanged: data.files_changed / maxFilesChanged * base,
//     //   insertions: data.insertions / maxInsertions * base,
//     //   deletions: data.deletions / maxDeletions * base,
//     // }
// };

const expansionDuration = 5;
const positioningDuration = 4;
const animationFn = (normal, duration, time) => {
  if (!time) return;

  if (time >= duration) return normal;

  return normal * (time / duration);
};

const settings = {
  // Make the loop animated
  animate: true,
  fps: 24,
  // duration: 5,
  context: "webgl",
};

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas
  });

  // WebGL background color
  renderer.setClearColor(bgColor, 1);

  const camera = new THREE.OrthographicCamera();

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  // const axesHelper = new THREE.AxesHelper(5);
  // scene.add(axesHelper);

  // Setup a geometry
  const meshes = [];

  const createGrid = () => {
    const points = [];
    const count = dataCubeSide;
    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
        for (let z = 0; z < count; z++) {
          const u = count < 1 ? 0 : x / (count - 1);
          const v = count < 1 ? 0 : y / (count - 1);
          const w = count < 1 ? 0 : z / (count - 1);
          points.push({
            position: [u, v, w],
          });
        }
      }
    }

    return points;
  };

  const points = createGrid();

  const spherePosition = (key) => {
    const [ u, v, w ] = points[key].position;
    return {
      x: cartesianSpacing * u,
      y: cartesianSpacing * v,
      z: cartesianSpacing * w,
    }
  };

  const proportion = (a, b) => {
    if (!a || !b) return minSize;

    if (a > b) return Math.ceil(a/b);

    return Math.ceil(b/a);
  }
  
  hdBlocksData.forEach((commit, key) => {
    const insertions = parseFloat(commit.insertions);
    const deletions = parseFloat(commit.deletions);
    const filesChanged = parseFloat(commit.files_changed) > 2 ? parseFloat(commit.files_changed) : 3.0;
    const linesProportion = proportion(insertions, deletions);
    const geometry = new THREE.SphereGeometry(
      Math.min(linesProportion, maxSize) * 0.1,
      Math.min(filesChanged, maxSegments),
      Math.min(filesChanged, maxSegments)
    );
    // Setup a material
    const boxMaterial = new THREE.MeshBasicMaterial({
      color: insertions > deletions ? greenColor : redColor,
      wireframe: true
    })
    
    const mesh = new THREE.Mesh(geometry, boxMaterial);

    mesh.scale.multiplyScalar(0.0001); // initial invisible
    const position = spherePosition(key);
    const animationDuration = random.range(positioningDuration * 0.5, positioningDuration * 1.5);

    scene.add(mesh);
    // Setup a mesh with geometry + material
    meshes.push({ 
      mesh, 
      insertions, 
      deletions, 
      filesChanged, 
      position, 
      animationDuration,
      rotation : {
        x: random.rangeFloor(-15, 15),
        y: random.rangeFloor(-15, 15),
        z: random.rangeFloor(-15, 15),
      },
    });
  })

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);

      // Isometric Cheatsheet
      const aspect = viewportWidth / viewportHeight;

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
    render({ playhead, time }) {
      meshes.forEach((data, key) => {
        const { x, y, z }  = data.position;

        // rotation
        if (rotate) {
          data.mesh.rotation.x = time * (data.rotation.x * Math.PI / 180);
          data.mesh.rotation.y = time * (data.rotation.y * Math.PI / 180);
          data.mesh.rotation.z = time * (data.rotation.z * Math.PI / 180);

          data.mesh.position.set(
            x + data.rotation.x * Math.sin(time * rotationVelocity * data.rotation.x / 10),
            y + data.rotation.y * Math.cos(time * rotationVelocity * data.rotation.y / 10),
            z + data.rotation.z * Math.sin(time * rotationVelocity * data.rotation.z / 10),
            )
          } else {
          const animationDuration = data.animationDuration;
          data.mesh.position.set(
            animationFn(x, animationDuration, time),
            animationFn(y, animationDuration, time),
            animationFn(z, animationDuration, time),
          )
        }

        // expand
        data.mesh.scale.set(
          animationFn(1, expansionDuration, time),
          animationFn(1, expansionDuration, time),
          animationFn(1, expansionDuration, time)
        )
        
      });
      controls.update();

      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      controls.dispose();
      renderer.dispose();
    }
  };
};

// canvasSketch(sketch, settings);
canvasSketch(sketch, settings);