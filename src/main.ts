import * as THREE from "three";
import { Earth } from "./objects/earth";
import { Satellite } from "./objects/satellite";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { SceneManager } from "./worldManager/scene_manager";
import { array } from "three/tsl";
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

const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
});

const starVertics = [];
for (let i = 0; i < 10000; i++) {
  const x = (Math.random() - 0.5) * 2000000;
  const y = (Math.random() - 0.5) * 2000000;
  const z = (Math.random() - 0.5) * 2000000;
 
  starVertics.push(x, y, z);
}

starGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(starVertics, 3)
);

const stars = new THREE.Points(starGeometry, starMaterial);
scene.addToScene(stars);

const orbitalAltitude = 400000;
const initP = new THREE.Vector3(7000000 + orbitalAltitude, 0, 0);
const initV = new THREE.Vector3(0, 0, 8500);
const satellite = new Satellite(initP, initV);
scene.addToScene(satellite.sphere);

const initP2 = new THREE.Vector3(7000000 + orbitalAltitude, 0, 0);
const initV2 = new THREE.Vector3(0, 0, 9500);
const satellite2 = new Satellite(initP2, initV2);
scene.addToScene(satellite2.sphere);

const initP3 = new THREE.Vector3(7000000 + orbitalAltitude, 0, 0);
const initV3 = new THREE.Vector3(0, 8500, 0);
const satellite3 = new Satellite(initP3, initV3);
scene.addToScene(satellite3.sphere);

// camera.position.z = 30000;
camera.position.z = 30000;
controls.update();

camera.lookAt(0, 0, 0);

const timeScale = 1000;
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  earth.sphere.rotation.y += 0.001;
  const dt_real = clock.getDelta();
  const dt_physics = dt_real * timeScale;
  if (dt_physics > 0) {
    satellite.update(dt_physics);
    satellite2.update(dt_physics);
    satellite3.update(dt_physics);
  }

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
