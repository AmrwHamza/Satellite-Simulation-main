import * as THREE from "three";
import { Earth_Radius, factor } from "../physics/constants";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";

import atmosphereVertexShader from "./shaders/atmosphereVertex.glsl";
import atmosphereFragmentShader from "./shaders/atmosphereFragment.glsl";

import { scene } from "../main";

export class Earth {
  public sphere: THREE.Mesh;
  constructor() {
    const geometry = new THREE.SphereGeometry(Earth_Radius / factor, 64, 64);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        globeTexture: {
          value: new THREE.TextureLoader().load("public/textures/globe3.jpg"),
        },
      },
    });

    this.sphere = new THREE.Mesh(geometry, material);
    this.sphere.position.set(0, 0, 0);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(Earth_Radius / factor, 64, 64),
      new THREE.ShaderMaterial({
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader,
        blending: THREE.AdditiveBlending,
        transparent: true,
        // depthWrite: false,
        // depthTest: true,
        side: THREE.BackSide,
      })
    );
    atmosphere.scale.set(1.5, 1.5, 1.5);

    this.sphere.renderOrder = 0;
    atmosphere.renderOrder = 1;

    const group = new THREE.Group();
    group.add(this.sphere);
    group.add(atmosphere);
    scene.addToScene(group);
  }
}
