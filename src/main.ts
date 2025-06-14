import * as THREE from "three";
import { Earth } from "./objects/earth";
import { Satellite } from "./objects/satellite";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { SceneManager } from "./worldManager/scene_manager";
import { array } from "three/tsl";
import { Stars } from "./objects/stars";
export const scene = new SceneManager();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  10000000
);

const light = new THREE.AmbientLight();
light.position.set(10000, 10000, 10000);
scene.addToScene(light);

window.addEventListener("resize", onWindowResize.bind(this), false);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.debug.checkShaderErrors = true;

renderer.setSize(window.innerWidth, window.innerHeight);

renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);

const earth = new Earth();
const stars = new Stars();

const orbitalAltitude = 400000;
const initP = new THREE.Vector3(7000000 + orbitalAltitude, 0, 0);
const initV = new THREE.Vector3(0, 0, 8500);
const satellite = new Satellite(initP, initV);
// scene.addToScene(satellite.mesh);

const initP2 = new THREE.Vector3(7000000 + orbitalAltitude, 0, 0);
const initV2 = new THREE.Vector3(0, 1000, 7500);
const satellite2 = new Satellite(initP2, initV2);
// scene.addToScene(satellite2.sphere);

const initP3 = new THREE.Vector3(7000000 + orbitalAltitude, 0, 0);
const initV3 = new THREE.Vector3(0, 8500, 0);
const satellite3 = new Satellite(initP3, initV3);

const initP4 = new THREE.Vector3(6.37e6, 0, 0);
const initV4 = new THREE.Vector3(0, 8500, 0);
const satellite4 = new Satellite(initP4, initV4);
// scene.addToScene(satellite3.sphere);

// camera.position.z = 30000;
camera.position.z = 30000;
controls.update();

camera.lookAt(0, 0, 0);

const timeScale = 1000;
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  // earth.sphere.rotation.y += 0.001;
  const dt_real = clock.getDelta();
  const dt_physics = dt_real * timeScale;
  if (dt_physics > 0) {
    satellite.update(dt_physics);
    satellite2.update(dt_physics);
    satellite3.update(dt_physics);
    satellite4.update(dt_physics);
  }

  // camera.position.set(
  //   satellite2.getPosInThreeUnits().x + 200,
  //   satellite2.getPosInThreeUnits().y + 200,
  //   satellite2.getPosInThreeUnits().z + 200
  // );
  // camera.lookAt(0, 0, 0);
  controls.update();

  renderer.render(scene.scene, camera);
}

animate();

function onWindowResize(): void {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  console.log("Window resized. Renderer and camera adjusted.");
}
