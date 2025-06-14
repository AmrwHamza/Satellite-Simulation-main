import * as THREE from "three";
import { Earth_Radius, factor } from "../physics/constants";

export class Earth {
  public raduis: number = 5;

  public sphere: THREE.Mesh;

  constructor() {
    const geometry = new THREE.SphereGeometry(Earth_Radius / factor, 64, 64);

    // const material = new THREE.MeshStandardMaterial({ color: 0x0077ff });
    const material = new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load("public/textures/globe3.jpg"),
    });
    this.sphere = new THREE.Mesh(geometry, material);

    // const textureLoader = new THREE.TextureLoader();
    // const earthTexture = textureLoader.load(
    //   "textures/8k_earth_daymap.jpg",
    //   () => {
    //     console.log("Earth texture loaded successfully.");
    //   },
    //   undefined,
    //   (error) => {
    //     console.error("Error loading earth texture:", error);
    //   }
    // );

    // const material = new THREE.MeshStandardMaterial({
    //   map: earthTexture,
    //   roughness: 0.9,
    //   metalness: 0.1,
    // });
    // this.sphere = new THREE.Mesh(geometry, material);

    this.sphere.position.set(0, 0, 0);
  }
}
