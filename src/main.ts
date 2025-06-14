import * as THREE from "three";
import { Earth } from "./objects/earth";
import { Satellite } from "./objects/satellite";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { SceneManager } from "./worldManager/scene_manager";
import { Stars } from "./objects/stars";
import { CameraManager } from "./worldManager/camera_maneger";
import { LightManager } from "./worldManager/light_maneger";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import { Earth_Radius } from "./physics/constants";

export const scene = new SceneManager();
const cameraManeger = new CameraManager();
const lightManager = new LightManager();
const earth = new Earth();
const stars = new Stars();
window.addEventListener("resize", onWindowResize.bind(this), false);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.debug.checkShaderErrors = true;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(cameraManeger.camera, renderer.domElement);

const orbitalAltitude = 400000;
// const initP = new THREE.Vector3(7000000 + orbitalAltitude, 0, 0);
// const initV = new THREE.Vector3(0, 0, 8500);
// const satellite = new Satellite(initP, initV);

// const initP2 = new THREE.Vector3(7000000 + orbitalAltitude, 0, 0);
// const initV2 = new THREE.Vector3(0, 1000, 7500);
// const satellite2 = new Satellite(initP2, initV2);

// const initP3 = new THREE.Vector3(7000000 + orbitalAltitude, 0, 0);
// const initV3 = new THREE.Vector3(0, 8500, 0);
// const satellite3 = new Satellite(initP3, initV3);

// const initP4 = new THREE.Vector3(6.37e6, 0, 0);
// const initV4 = new THREE.Vector3(0, 8500, 0);
// const satellite4 = new Satellite(initP4, initV4);

const satelliteArry: Satellite[] = [];
function creatSat(
  initx: number,
  inity: number,
  initz: number,
  initvx: number,
  initvy: number,
  initvz: number
) {
  const initp = new THREE.Vector3(initx, inity, initz);
  const initv = new THREE.Vector3(initvx, initvy, initvz);

  satelliteArry.push(new Satellite(initp, initv));
}
controls.update();
// const timeScale = 1000;
const clock = new THREE.Clock();

const gui = new GUI({
  autoPlace: true,
  title: "Satellite Simulation",
});

const settings = {
  timeScale: 500,
};

const initSatSettings = {
  X: 8000000,
  Y: 0,
  Z: 0,
  Vx: 0,
  Vy: 8500,
  Vz: 0,
  addSat: () => {
    creatSat(
      initSatSettings.X,
      initSatSettings.Y,
      initSatSettings.Z,
      initSatSettings.Vx,
      initSatSettings.Vy,
      initSatSettings.Vz
    );
  },
};

const timeScaleFolder = gui.addFolder("simulation Speed");

timeScaleFolder.add(settings, "timeScale", 60, 1000);

const addSatFolder = gui.addFolder("Add Satellite");

addSatFolder.add(initSatSettings, "X", Earth_Radius, 10000000);
addSatFolder.add(initSatSettings, "Y", -Earth_Radius, 10000000);
addSatFolder.add(initSatSettings, "Z", -Earth_Radius, 10000000);
addSatFolder.add(initSatSettings, "Vx", -15000, 15000);
addSatFolder.add(initSatSettings, "Vy", -15000, 15000);
addSatFolder.add(initSatSettings, "Vz", -15000, 15000);
addSatFolder.add(initSatSettings, "addSat");

function animate() {
  requestAnimationFrame(animate);
  // earth.sphere.rotation.y += 0.001;
  const dt_real = clock.getDelta();
  const dt_physics = dt_real * settings.timeScale;
  if (dt_physics > 0) {
    // satellite.update(dt_physics);
    // satellite2.update(dt_physics);
    // satellite3.update(dt_physics);
    // satellite4.update(dt_physics);

    satelliteArry.forEach((satellite) => {
      satellite.update(dt_physics);
    });
  }

  // camera.position.set(
  //   satellite2.getPosInThreeUnits().x + 200,
  //   satellite2.getPosInThreeUnits().y + 200,
  //   satellite2.getPosInThreeUnits().z + 200
  // );
  // camera.lookAt(0, 0, 0);
  controls.update();

  renderer.render(scene.scene, cameraManeger.camera);
}

animate();

function onWindowResize(): void {
  cameraManeger.camera.aspect = window.innerWidth / window.innerHeight;
  cameraManeger.camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  console.log("Window resized. Renderer and camera adjusted.");
}
