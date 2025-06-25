import * as THREE from "three";
import { Earth_Radius, factor } from "../physics/constants";
import { Vector3NodeUniform } from "three/src/renderers/common/nodes/NodeUniform.js";
import {
  calcAltitude,
  calcSpeed,
  calculateByRungeKutta,
  newPosByEUler,
  newVByEuler,
} from "../physics/physics";
import { scene } from "../main";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import {
  settings,
  PREDICTED_ORBIT_STEPS,
  PREDICTED_ORBIT_DT,
} from "../gui/gui_manager"; // أضف PREDICTED_ORBIT_STEPS, PREDICTED_ORBIT_DT

export class Satellite {
  public name: string;
  public isPreview: boolean;
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

  ////////////// للحذف

  private thrustLines: {
    T?: THREE.Line;
    N?: THREE.Line;
    R?: THREE.Line;
  } = {};
  private thrustMaterials: {
    T: THREE.LineBasicMaterial;
    N: THREE.LineBasicMaterial;
    R: THREE.LineBasicMaterial;
  };

  constructor(
    name: string,
    initPos: THREE.Vector3,
    initV: THREE.Vector3,
    isPreview: boolean = false
  ) {
    this.isPreview = isPreview;
    (this.name = name), (this.pos = initPos);
    this.vel = initV;

    this.tailMaterial = new THREE.LineBasicMaterial({
      color: Math.floor(Math.random() * 0xffffff),
    });

    ///////للحذف

    this.thrustMaterials = {
      T: new THREE.LineBasicMaterial({ color: 0x00ff00 }), // أخضر للدفع المماسي (Tangential)
      N: new THREE.LineBasicMaterial({ color: 0x0000ff }), // أزرق للدفع العمودي (Normal)
      R: new THREE.LineBasicMaterial({ color: 0xff0000 }), // أحمر للدفع القطري (Radial)
    };

    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("./draco/");
    loader.setDRACOLoader(dracoLoader);

    if (!this.isPreview) {
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
    if (settings.thrustTDirection === 1) {
      effectiveThrustMagnitude = settings.thrustTF;
    } else if (settings.thrustTDirection === -1) {
      effectiveThrustMagnitude = -settings.thrustTF;
    }

    const SATELLITE_MASS = 1000;

    const newV: THREE.Vector3 = newVByEuler(
      this.pos,
      this.vel,
      effectiveThrustMagnitude,
      0,
      0,
      SATELLITE_MASS,
      dt
    );
    this.vel = newV;
    const newPos: THREE.Vector3 = newPosByEUler(this.pos, this.vel, dt);

    this.altitude = calcAltitude(this.pos);
    this.totalSpeed = calcSpeed(this.vel);

    this.pos = newPos;
    this.setPosition();
    this.tailPoints.push(this.getPosInThreeUnits().clone());
    this.drawTail();
  }

  public updateByRungeKutta(dt: number) {
    let effectiveThrustTForce = 0;
    if (settings.thrustTDirection === 1) {
      effectiveThrustTForce = settings.thrustTF;
    } else if (settings.thrustTDirection === -1) {
      effectiveThrustTForce = -settings.thrustTF;
    }

    ///////////////////
    let effectiveThrustNForce = 0;
    if (settings.thrustNDirection === 1) {
      effectiveThrustNForce = settings.thrustNF;
    } else if (settings.thrustNDirection === -1) {
      effectiveThrustNForce = -settings.thrustNF;
    }

    /////////////////////
    let effectiveThrustRForce = 0;
    if (settings.thrustRDirection === 1) {
      effectiveThrustRForce = settings.thrustRF;
    } else if (settings.thrustRDirection === -1) {
      effectiveThrustRForce = -settings.thrustRF;
    }

    const SATELLITE_MASS = 1000;

    let newPV = calculateByRungeKutta(
      this.pos,
      this.vel,
      dt,
      effectiveThrustTForce,
      effectiveThrustNForce,
      effectiveThrustRForce,
      SATELLITE_MASS
    );
    this.pos = newPV.pos;
    this.vel = newPV.v;
    this.setPosition();
    this.tailPoints.push(this.getPosInThreeUnits().clone());
    this.drawTail();
    
//لاظهار الخطوط    
    /////////////////////////////////////////////////////////////////////////////////
    
    this.updateThrustLines(
      effectiveThrustTForce,
      effectiveThrustNForce,
      effectiveThrustRForce
    );
//////////////////////////////////////////////////////////////////////////////////
    // if (effectiveThrustTForce !== 0) {
    //   this.calculateAndDrawPredictedOrbit(
    //     this.pos.clone(),
    //     this.vel.clone(),
    //     PREDICTED_ORBIT_STEPS,
    //     PREDICTED_ORBIT_DT,
    //     effectiveThrustTForce
    //   );
    // } else {
    //   // إذا كانت المحركات متوقفة
    //   // if (this.predictedTailLine && this.predictedTailLine.parent) {
    //   //   scene.scene.remove(this.predictedTailLine);
    //   //   this.predictedTailLine.geometry.dispose();
    //   //   this.predictedTailLine = null!;
    //   // }
    // }

    // واستخدم الثوابت المستوردة
    if (settings.showInitialPredictedPath) {
      // تحديث فقط إذا كان المسار المتوقع مرئياً
      this.calculateAndDrawPredictedOrbit(
        this.pos.clone(),
        this.vel.clone(),
        PREDICTED_ORBIT_STEPS, // استخدم الثابت المستورد
        PREDICTED_ORBIT_DT, // استخدم الثابت المستورد
        effectiveThrustTForce,
        effectiveThrustNForce,
        effectiveThrustRForce
      );
    } else {
      if (this.predictedTailLine && this.predictedTailLine.parent) {
        scene.scene.remove(this.predictedTailLine);
        this.predictedTailLine.geometry.dispose();
        if (Array.isArray(this.predictedTailLine.material)) {
          this.predictedTailLine.material.forEach((m) => m.dispose());
        } else {
          this.predictedTailLine.material.dispose();
        }
        this.predictedTailLine = null!; // قم بتعيينها إلى null بعد التخلص منها
      }
    }

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
    dt: number,
    currentThrustTForce: number = 0,
    currentThrustNForce: number = 0,
    currentThrustRForce: number = 0
  ) {
    this.predictedTailPoints = [];
    let currentPos = initialPos.clone();
    let currentVel = initialVel.clone();
    // const PREDICTION_THRUST_MAGNITUDE = 0;
    const PREDICTION_SATELLITE_MASS = 1000;

    for (let i = 0; i < steps; i++) {
      this.predictedTailPoints.push(
        new THREE.Vector3(
          currentPos.x / factor,
          currentPos.y / factor,
          currentPos.z / factor
        )
      );

      let newPV = calculateByRungeKutta(
        currentPos,
        currentVel,
        dt,
        currentThrustTForce,
        currentThrustNForce,
        currentThrustRForce,
        PREDICTION_SATELLITE_MASS
      );
      currentPos.copy(newPV.pos);
      currentVel.copy(newPV.v);

      //////////////////////
      // const newV = newVByEuler(
      //   currentPos,
      //   currentVel,
      //   PREDICTION_THRUST_MAGNITUDE,
      //   PREDICTION_SATELLITE_MASS,
      //   dt
      // );
      // currentVel.copy(newV); // تحديث السرعة الحالية
      // const newPos = newPosByEUler(currentPos, currentVel, dt); // حساب الموضع بالسرعة المحدثة
      // currentPos.copy(newPos); // تحديث الموضع الحالي

      if (calcAltitude(currentPos) <= 0) {
        console.warn(`Predicted orbit crashed into Earth after ${i} steps.`);
        break;
      }
    }

    const curve = new THREE.CatmullRomCurve3(this.predictedTailPoints);
    const points = curve.getPoints(this.predictedTailPoints.length);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xffffff });

    if (!this.predictedTailLine) {
      this.predictedTailLine = new THREE.Line(geometry, material);

      scene.addToScene(this.predictedTailLine);
    } else {
      this.predictedTailLine.geometry.dispose();
      this.predictedTailLine.geometry = geometry;
    }

    // const geom = new THREE.BufferGeometry().setFromPoints(
    //   this.predictedTailPoints
    // );
    // if (!this.predictedTailLine) {
    //   this.predictedTailLine = new THREE.Line(geom, this.predictedTailMaterial);
    //   scene.addToScene(this.predictedTailLine);
    // } else {
    //   this.predictedTailLine.geometry.dispose();
    //   this.predictedTailLine.geometry = geom;
    // }
    return this.predictedTailLine;
  }







// من هون ولتحت للحذف



  private updateSingleThrustLine(
    type: "T" | "N" | "R", // نوع الدفع (Tangential, Normal, Radial)
    force: number, // قوة الدفع (مطلقة)
    direction: THREE.Vector3 // متجه الاتجاه (يجب أن يكون Normalized)
  ) {
    const thrustScaleFactor = 500; // عامل تحويل القوة إلى طول مرئي (يمكن تعديله)
    const currentPositionThreeUnits = this.getPosInThreeUnits();
    const length = Math.abs(force) * thrustScaleFactor;
    const material = this.thrustMaterials[type];

    if (length > 0.01 && direction.lengthSq() > 0) {
      // ارسم الخط فقط إذا كان هناك قوة واتجاه
      // تأكد من أن الاتجاه معكوس إذا كانت القوة سالبة
      const actualDirection =
        force < 0 ? direction.clone().negate() : direction.clone();
      const endPos = currentPositionThreeUnits
        .clone()
        .addScaledVector(actualDirection, length);
      const points = [currentPositionThreeUnits, endPos];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      if (!this.thrustLines[type]) {
        // إنشاء الخط لأول مرة وإضافته للمشهد
        this.thrustLines[type] = new THREE.Line(geometry, material);
        scene.addToScene(this.thrustLines[type]!);
      } else {
        // تحديث الهندسة للخط الموجود
        this.thrustLines[type]!.geometry.dispose();
        this.thrustLines[type]!.geometry = geometry;
      }
    } else {
      // إزالة الخط إذا لم يعد هناك دفع أو قوة ضئيلة جداً
      if (this.thrustLines[type] && this.thrustLines[type]!.parent) {
        scene.scene.remove(this.thrustLines[type]!);
        this.thrustLines[type]!.geometry.dispose();
        // لا نحتاج للتخلص من المادة لأنها مشتركة
        this.thrustLines[type] = undefined; // مسح الإشارة إلى الخط
      }
    }
  }

  // داخل كلاس Satellite
  public updateThrustLines(
    effectiveThrustTForce: number,
    effectiveThrustNForce: number,
    effectiveThrustRForce: number
  ) {
    // ----------------- الدفع المماسي (Tangential) -----------------
    const thrustDirectionT = this.vel.clone().normalize();
    this.updateSingleThrustLine("T", effectiveThrustTForce, thrustDirectionT);

    // ----------------- الدفع العمودي (Normal) -----------------
    const hx = this.pos.y * this.vel.z - this.pos.z * this.vel.y;
    const hy = this.pos.z * this.vel.x - this.pos.x * this.vel.z;
    const hz = this.pos.x * this.vel.y - this.pos.y * this.vel.x;
    const hVector = new THREE.Vector3(hx, hy, hz);
    const hLength = hVector.length();

    let thrustDirectionN = new THREE.Vector3(0, 0, 0);
    if (hLength > 0) {
      thrustDirectionN = hVector.normalize();
    }
    this.updateSingleThrustLine("N", effectiveThrustNForce, thrustDirectionN);

    // ----------------- الدفع القطري (Radial) -----------------
    const thrustDirectionR = this.pos.clone().normalize();
    this.updateSingleThrustLine("R", effectiveThrustRForce, thrustDirectionR);
  }
}
