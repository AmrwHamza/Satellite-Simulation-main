import * as THREE from "three";
import { Earth_Radius, factor } from "../physics/constants";
import { Vector3NodeUniform } from "three/src/renderers/common/nodes/NodeUniform.js";
import { newPosByEUler, newVByEuler } from "../physics/physics";
import { scene } from "../main";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
export class Satellite {
  // public sphere: THREE.Mesh;
  public pos: THREE.Vector3;
  public vel: THREE.Vector3;
  private tailLine: THREE.Line | null = null;
  public mesh: THREE.Object3D | null = null; // سيحتوي على النموذج المحمل (THREE.Group أو THREE.Mesh)

  public TAIL_LENGTH = 1000;
  public tailPoints: THREE.Vector3[] = [];
  public tailMaterial: THREE.LineBasicMaterial;
  constructor(initPos: THREE.Vector3, initV: THREE.Vector3) {
    // const geometry = new THREE.SphereGeometry(500, 32, 32);
    // const material = new THREE.MeshStandardMaterial({ color: 0xff00ff });
    // this.sphere = new THREE.Mesh(geometry, material);
    this.pos = initPos;
    this.vel = initV;
    // this.setPosition();

    this.tailMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });

    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("./draco/");
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      "public/models/Landsat7.glb",
      (gltf) => {
        this.mesh = gltf.scene; // النموذج المحمل هو عادةً THREE.Group
        scene.addToScene(this.mesh); // أضف النموذج إلى المشهد الرئيسي

        const satScale=400;
        this.mesh.scale.set(satScale, satScale, satScale);

        this.setPosition();

        console.log(`Satellite model loaded from: }`);
      },
      undefined,
      (error) => {
        console.error(`Error loading satellite model from }:`, error);
      }
    );
  }

  public getPosInThreeUnits(): THREE.Vector3 {
    return new THREE.Vector3(
      this.pos.x / factor,
      this.pos.y / factor,
      this.pos.z / factor
    );
  }

  public setPosition() {
    if (this.mesh) {
      const newPos = new THREE.Vector3(
        this.pos.x / factor,
        this.pos.y / factor,
        this.pos.z / factor
      );
      this.mesh.position.copy(newPos);
    }
  }

  public update(dt: number) {
    const r = Math.sqrt(
      this.pos.x * this.pos.x +
        this.pos.y * this.pos.y +
        this.pos.z * this.pos.z
    );
    if (r == Earth_Radius) {
      return;
    }
    const newV: THREE.Vector3 = newVByEuler(this.pos, this.vel, dt);
    this.vel = newV;
    const newPos: THREE.Vector3 = newPosByEUler(this.pos, this.vel, dt);

    this.pos = newPos;
    this.setPosition();
    this.tailPoints.push(this.getPosInThreeUnits().clone());
    this.drawTail();
  }

  drawTail() {
    const pts = this.tailPoints.slice(-this.TAIL_LENGTH);
    if (pts.length < 2) return;

    const geom = new THREE.BufferGeometry().setFromPoints(pts);
    if (!this.tailLine) {
      this.tailLine = new THREE.Line(geom, this.tailMaterial);
      scene.addToScene(this.tailLine);
    } else {
      this.tailLine.geometry.dispose();
      this.tailLine.geometry = geom;
    }
  }
}
