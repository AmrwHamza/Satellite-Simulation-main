import * as THREE from "three";
import { Earth_Radius, factor } from "../physics/constants";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";

export class Earth {
  public raduis: number = 5;

  public sphere: THREE.Mesh;

  constructor() {
    const geometry = new THREE.SphereGeometry(Earth_Radius / factor, 64, 64);

    // const material = new THREE.MeshStandardMaterial({ color: 0x0077ff });
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
    });
    this.sphere = new THREE.Mesh(geometry, material);

    this.sphere.position.set(0, 0, 0);
  }
}
