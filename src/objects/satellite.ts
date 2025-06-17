import * as THREE from "three";
import { Earth_Radius, factor } from "../physics/constants";
import { Vector3NodeUniform } from "three/src/renderers/common/nodes/NodeUniform.js";
import {
  calcAltitude,
  calcRLength,
  calcSpeed,
  calculateByRungeKutta,
  newPosByEUler,
  newVByEuler,
} from "../physics/physics";
import { scene } from "../main";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { settings } from "../gui/gui_manager";

export class Satellite {
  public name: string;

  // public sphere: THREE.Mesh;
  public pos: THREE.Vector3;
  public vel: THREE.Vector3;
  public altitude: number = 0;
  public totalSpeed: number = 0;

  public tailLine!: THREE.Line;
  public mesh!: THREE.Object3D;
  public TAIL_LENGTH = 1000;
  public tailPoints: THREE.Vector3[] = [];
  public tailMaterial: THREE.LineBasicMaterial;

  ///////////////////
  public predictedTailLine!: THREE.Line;
  public predictedTailPoints: THREE.Vector3[] = [];
  public predictedTailMaterial: THREE.LineBasicMaterial | undefined;

  constructor(name: string, initPos: THREE.Vector3, initV: THREE.Vector3) {
    // const geometry = new THREE.SphereGeometry(500, 32, 32);
    // const material = new THREE.MeshStandardMaterial({ color: 0xff00ff });
    // this.sphere = new THREE.Mesh(geometry, material);
    (this.name = name), (this.pos = initPos);
    this.vel = initV;
    // this.setPosition();

    this.tailMaterial = new THREE.LineBasicMaterial({
      color: Math.floor(Math.random() * 0xffffff),
    });

    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("./draco/");
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      "public/models/Landsat7.glb",
      (gltf) => {
        this.mesh = gltf.scene;
        scene.addToScene(this.mesh);

        const satScale = 800;
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

  public updateByEuler(dt: number) {
  let effectiveThrustMagnitude = 0;
    if (settings.thrustDirection === 1) { // دفع أمامي
        effectiveThrustMagnitude = settings.thrustMagnitude;
    } else if (settings.thrustDirection === -1) { // دفع عكسي
        effectiveThrustMagnitude = -settings.thrustMagnitude;
    }


    //  if (this.altitude <= Earth_Radius) {
    //     // يمكنك هنا إعادة ضبط السرعة والموضع لإيقاف القمر تماماً عند الاصطدام
    //     // أو إزالته من المشهد. حالياً، سيوقف التحديثات الفيزيائية له فقط.
    //     this.vel.set(0, 0, 0); // اجعل السرعة صفر لمنعه من الغوص أكثر
    //     // يمكنك أيضاً إزالة القمر الصناعي من satellitsManeger إذا أردت
    //     return; 
    // }
    const SATELLITE_MASS = 1000;

    const newV: THREE.Vector3 = newVByEuler(
      this.pos,
      this.vel,
      effectiveThrustMagnitude,
      SATELLITE_MASS,
      dt
    );
    this.vel = newV;
    const newPos: THREE.Vector3 = newPosByEUler(this.pos, this.vel, dt);

  // --- أضف هذه الأسطر هنا (بعد حساب newPos و newV وتعيينهما لـ this.pos و this.vel) ---
    console.log(`Satellite ${this.name} - dt_physics: ${dt}`);
    console.log(`Satellite ${this.name} - Pos (meters): X=${this.pos.x.toFixed(2)}, Y=${this.pos.y.toFixed(2)}, Z=${this.pos.z.toFixed(2)}`);
    console.log(`Satellite ${this.name} - Vel (m/s): Vx=${this.vel.x.toFixed(2)}, Vy=${this.vel.y.toFixed(2)}, Vz=${this.vel.z.toFixed(2)}`);
    console.log(`Satellite ${this.name} - Mesh Pos (Three.js units): X=${this.mesh.position.x.toFixed(2)}, Y=${this.mesh.position.y.toFixed(2)}, Z=${this.mesh.position.z.toFixed(2)}`);
    // 


    this.altitude = calcAltitude(this.pos);
    this.totalSpeed = calcSpeed(this.vel);

    this.pos = newPos;
    this.setPosition();
    this.tailPoints.push(this.getPosInThreeUnits().clone());
    this.drawTail();

    //  if (settings.progradeThrustOn || settings.retrogradeThrustOn) {
    //       this.calculateAndDrawPredictedOrbit(this.pos.clone(), this.vel.clone(), this.TAIL_LENGTH, dt); // استخدم نفس الـ dt
    //   }
  }

  public updateByRungeKutta(dt: number) {
    //  this.altitude = calcAltitude(this.pos);
    //  this.totalSpeed=calcSpeed(this.vel);

    let newPV = calculateByRungeKutta(this.pos, this.vel, dt);
    this.pos = newPV.pos;
    this.vel = newPV.v;
    this.setPosition();
    this.tailPoints.push(this.getPosInThreeUnits().clone());
    this.drawTail();

    this.altitude = calcAltitude(this.pos);
    this.totalSpeed = calcSpeed(this.vel);
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

  public calculateAndDrawPredictedOrbit(
    initialPos: THREE.Vector3,
    initialVel: THREE.Vector3,
    steps: number,
    dt: number
  ) {
    steps = 1000;
    dt = 60;
    this.predictedTailPoints = [];
    let currentPos = initialPos;
    let currentVel = initialVel;

    const PREDICTION_THRUST_MAGNITUDE = 0;
    const PREDICTION_SATELLITE_MASS = 1000;

    for (let i = 0; i < steps; i++) {
      this.predictedTailPoints.push(
        new THREE.Vector3(
          currentPos.x / factor,
          currentPos.y / factor,
          currentPos.z / factor
        )
      );

      // const newPV = calculateByRungeKutta(currentPos, currentVel, dt);
      // currentPos = newPV.pos;
      // currentVel = newPV.v;

      //////////////////////
      const newV = newVByEuler(
        currentPos,
        currentVel,
        PREDICTION_THRUST_MAGNITUDE,
        PREDICTION_SATELLITE_MASS,
        dt
      );
      currentVel.copy(newV); // تحديث السرعة الحالية
      const newPos = newPosByEUler(currentPos, currentVel, dt); // حساب الموضع بالسرعة المحدثة
      currentPos.copy(newPos); // تحديث الموضع الحالي

      if (calcAltitude(currentPos) <= 0) {
        console.warn(`Predicted orbit crashed into Earth after ${i} steps.`);
        break;
      }
    }

    const geom = new THREE.BufferGeometry().setFromPoints(
      this.predictedTailPoints
    );
    if (!this.predictedTailLine) {
      this.predictedTailLine = new THREE.Line(geom, this.predictedTailMaterial);
      scene.addToScene(this.predictedTailLine);
    } else {
      this.predictedTailLine.geometry.dispose();
      this.predictedTailLine.geometry = geom;
    }
  }
}
