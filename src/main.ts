import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import { Earth } from "./objects/earth";
import { Satellite } from "./objects/satellite";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { SceneManager } from "./worldManager/scene_manager";
import { Stars } from "./objects/stars";
import { CameraManager } from "./worldManager/camera_maneger";
import { LightManager } from "./worldManager/light_maneger";
import { gui, satellitsManeger, settings } from "./gui/gui_manager";
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
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = false;

// const orbitalAltitude = 400000;

const initialCameraPosition = new THREE.Vector3(0, 0, 10000000);
const targetCameraPosition = new THREE.Vector3(20000, 20000, -20000);
const cameraLookAt = new THREE.Vector3(0, 0, 0);
cameraManeger.camera.position.copy(initialCameraPosition);
controls.target.copy(cameraLookAt);
function animateCameraOnStart() {
  const positionTween = new TWEEN.Tween(cameraManeger.camera.position)
    .to(
      {
        x: targetCameraPosition.x,
        y: targetCameraPosition.y,
        z: targetCameraPosition.z,
      },
      5000
    )
    .easing(TWEEN.Easing.Quadratic.Out)
    .onComplete(() => {
      controls.enabled = true;
    });

  const lookAtTween = new TWEEN.Tween(controls.target)
    .to({ x: cameraLookAt.x, y: cameraLookAt.y, z: cameraLookAt.z }, 5000)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onComplete(() => {});

  controls.enabled = false;
  positionTween.start();
  // lookAtTween.start();
}

controls.update();
export const clock = new THREE.Clock();




animate();

export function animate() {
  requestAnimationFrame(animate);
  TWEEN.update();
  if (settings.isSimulationRunning) {
    earth.sphere.rotation.y += 0.001;
    const dt_real = clock.getDelta();
    const dt_physics = dt_real * settings.timeScale;
    if (dt_physics > 0) {
      satellitsManeger.forEach((satellite) => {
        satellite.sat.update(dt_physics);
      });
    }
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

animateCameraOnStart();

function onWindowResize(): void {
  cameraManeger.camera.aspect = window.innerWidth / window.innerHeight;
  cameraManeger.camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  console.log("Window resized. Renderer and camera adjusted.");
}
