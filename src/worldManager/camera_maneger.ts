import * as THREE from "three";

export class CameraManager {
  public camera: THREE.PerspectiveCamera;
  constructor() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100000000
    );
    this.camera.position.z = 30000;
    this.camera.lookAt(0, 0, 0);
  }

  setPosition(pos: THREE.Vector3) {
    this.camera.position.set(pos.x, pos.y, pos.z);
  }
}
