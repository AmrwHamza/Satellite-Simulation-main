import { Vector3 } from "three";
import * as THREE from "three";
import { Earth_Mass, Earth_Radius, factor, G } from "./constants";




export function calcuateAccformThrust(initV: Vector3,fThrust:number,satMass:number): Vector3{

const vLength=calcRLength(initV);

const vUnit=new Vector3(initV.x/vLength,initV.y/vLength,initV.z/vLength);


const ftx= fThrust*vUnit.x;
const fty= fThrust*vUnit.y;
const ftz= fThrust*vUnit.z;

const atx=ftx/satMass;
const aty=fty/satMass;
const atz=ftz/satMass;


return new Vector3(atx,aty,atz);
}




export function calculateAccFromGravity(initPos: Vector3): Vector3 {
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


export function calculateAcceleration(initPos: Vector3,initV: Vector3,fThrust:number,satMass:number): Vector3 {
  
  
  const aFromE=calculateAccFromGravity(initPos);
  
const aFromT=calcuateAccformThrust(initV,fThrust,satMass);


return new Vector3(aFromE.x+aFromT.x,aFromE.y+aFromT.y,aFromE.z+aFromT.z);

  
  // const r = Math.sqrt(
  //   initPos.x * initPos.x + initPos.y * initPos.y + initPos.z * initPos.z
  // );
  // const rCub = r * r * r;




  // const ax = -G * (Earth_Mass / rCub) * initPos.x;
  // const ay = -G * (Earth_Mass / rCub) * initPos.y;
  // const az = -G * (Earth_Mass / rCub) * initPos.z;


  // const newAcc: Vector3 = new THREE.Vector3(ax, ay, az);




  // return newAcc;
}

export function newVByEuler(pos: Vector3, initV: Vector3,fThrust:number,satMass:number, dt: number): Vector3 {
  const newA: Vector3 = calculateAcceleration(pos,initV,fThrust,satMass);

  const vxNew = initV.x + newA.x * dt;
  const vyNew = initV.y + newA.y * dt;
  const vzNew = initV.z + newA.z * dt;

  const newV = new Vector3(vxNew, vyNew, vzNew);
  return newV;
}

export function newPosByEUler(pos: Vector3, v: Vector3, dt: number): Vector3 {
  const xNew = pos.x + v.x * dt;
  const yNew = pos.y + v.y * dt;
  const zNew = pos.z + v.z * dt;

  const newPos = new Vector3(xNew, yNew, zNew);
  return newPos;
}

export function calculateByRungeKutta(
  pos: Vector3,
  v: Vector3,
  h: number
): { v: Vector3; pos: Vector3 } {

let r =pos;

  let k1r = new Vector3();
  k1r = v;

  let k1v = new Vector3();
  // k1v = calculateAcceleration(pos);

/////////////////////////////////////////

  let k2r = new Vector3();
  
  k2r.x=v.x+h*k1v.x/2;
  k2r.y=v.y+h*k1v.y/2;
  k2r.z=v.z+h*k1v.z/2;



  let k2v=new Vector3();
let pos2=new Vector3();
  pos2.x=pos.x+h*k1r.x/2;
  pos2.y=pos.y+h*k1r.y/2;
  pos2.z=pos.z+h*k1r.z/2;

  // k2v=calculateAcceleration(pos2);

///////////////////////////////////////


  let k3r = new Vector3();



  k3r.x=v.x+h*k2v.x/2;
  k3r.y=v.y+h*k2v.y/2;
  k3r.z=v.z+h*k2v.z/2;

  
    let k3v=new Vector3();
let pos3=new Vector3();


  pos3.x=pos.x+h*k2r.x/2;
  pos3.y=pos.y+h*k2r.y/2;
  pos3.z=pos.z+h*k2r.z/2;


  // k3v=calculateAcceleration(pos3);
///////////////////////////////////////




let k4r= new Vector3();
  k4r.x=v.x+h*k3v.x;
  k4r.y=v.y+h*k3v.y;
  k4r.z=v.z+h*k3v.z;


let k4v=new Vector3();
let pos4=new Vector3();

  pos4.x=pos.x+h*k3r.x;
  pos4.y=pos.y+h*k3r.y;
  pos4.z=pos.z+h*k3r.z;

// k4v=calculateAcceleration(pos4);


////////////////////////////////////

const x=r.x+(h/6)*(k1r.x+2*k2r.x+2*k3r.x+k4r.x);
const y=r.y+(h/6)*(k1r.y+2*k2r.y+2*k3r.y+k4r.y);
const z=r.z+(h/6)*(k1r.z+2*k2r.z+2*k3r.z+k4r.z);


const newPos=new Vector3(x,y,z);

const newVx=v.x+(h/6)*(k1v.x+2*k2v.x+2*k3v.x+k4v.x);
const newVy=v.y+(h/6)*(k1v.y+2*k2v.y+2*k3v.y+k4v.y);
const newVz=v.z+(h/6)*(k1v.z+2*k2v.z+2*k3v.z+k4v.z);

const newV=new Vector3(newVx,newVy,newVz);


return {pos:newPos,v:newV};











}

export function calcRLength(r: Vector3): number {
  const rLength = Math.sqrt(r.x * r.x + r.y * r.y + r.z * r.z);
  return rLength;
}

export function calcAltitude(r:Vector3):number{
const rLength=  calcRLength(r);
const  altitude=rLength-Earth_Radius;
  return altitude; 
}


export function calcSpeed(v: Vector3): number {
  const vLength = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  return vLength;
}
