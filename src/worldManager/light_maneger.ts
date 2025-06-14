import * as THREE from "three";
import { scene } from "../main";

export class LightManager {
  public light = new THREE.AmbientLight();

  constructor() {
    this.light.position.set(10000, 10000, 10000);
    scene.addToScene(this.light);
  }
}
