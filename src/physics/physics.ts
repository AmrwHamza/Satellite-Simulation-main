import { Vector3 } from "three";
import * as THREE from "three";
import { Earth_Mass, factor, G } from "./constants";







export function calculateAcceleration(initPos: Vector3): Vector3 {
  const r = Math.sqrt(
    initPos.x * initPos.x + initPos.y * initPos.y + initPos.z * initPos.z
  );
  const rCub = r * r * r;

  const ax = -G * (Earth_Mass / rCub) * initPos.x;
  const ay = -G * (Earth_Mass / rCub) * initPos.y;
  const az = -G * (Earth_Mass / rCub) * initPos.z;

  const newAcc: Vector3 = new THREE.Vector3(ax, ay, az);

  return newAcc;
}


export function newVByEuler( pos: Vector3,initV: Vector3, dt: number): Vector3 {
const newA: Vector3 = calculateAcceleration(pos);

  const vxNew = initV.x + newA.x * dt;
  const vyNew = initV.y + newA.y * dt;
  const vzNew = initV.z + newA.z * dt;

  const newV = new Vector3(vxNew, vyNew, vzNew);
  return newV;
}

export function newPosByEUler(
  pos: Vector3,
  v: Vector3,
  dt: number
): Vector3 {
  

 

  const xNew = pos.x + v.x * dt;
  const yNew = pos.y + v.y * dt;
  const zNew = pos.z + v.z * dt;

  const newPos = new Vector3(xNew, yNew, zNew);
  return newPos;
}
