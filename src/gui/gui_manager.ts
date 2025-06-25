import * as THREE from "three";

import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import { Satellite } from "../objects/satellite";
import { animate, clock, scene } from "../main";

export const gui = new GUI({
  autoPlace: true,
  title: "Satellite Simulation",
  width: 300,
});

 const PREDICTED_ORBIT_STEPS = 10000;
  const PREDICTED_ORBIT_DT = 60;

//قسم الاعدادات الاساسية للمحاكاة ايقاف,تسريع
/////////////////////////////////////
export const settings = {
  timeScale: 500,
  isSimulationRunning: true,
  thrustMagnitude: 50,
  thrustDirection: 0,
   showInitialPredictedPath: true, 
};
const timeScaleFolder = gui.addFolder("simulation settings");
timeScaleFolder.add(settings, "timeScale", 60, 1000);
const simulationControls = {
  toggleSimulation: () => {
    settings.isSimulationRunning = !settings.isSimulationRunning;
    if (settings.isSimulationRunning) {
      animate();
      clock.start();
    } else {
      clock.stop();
    }
  },
};
timeScaleFolder.add(simulationControls, "toggleSimulation").name("Start/Stop");

///////////////////////////////////



//اعدادات انشاء قمر صناعي
////////////////////////////////
export const satellitsManeger: {
  sat: Satellite;
  folder: GUI;
  deleteAction: () => void;
}[] = [];



const initSatSettings = {
  X: 8000000,
  Y: 0,
  Z: 0,
  Vx: 0,
  Vy: 8500,
  Vz: 0,
  add_Sat: () => {
    creatSat(
      //   initSatSettings.name,
      initSatSettings.X,
      initSatSettings.Y,
      initSatSettings.Z,
      initSatSettings.Vx,
      initSatSettings.Vy,
      initSatSettings.Vz
    );
  },
  //   clear_all: () => {
  //     removeAll();
  //   },
};

const addSatFolder = gui.addFolder("Add Satellite");
addSatFolder.add(settings, 'showInitialPredictedPath').name('Show Initial Path').onChange(updatePathPreview);

function creatSat(
  initx: number,
  inity: number,
  initz: number,
  initvx: number,
  initvy: number,
  initvz: number
) {
  const initp = new THREE.Vector3(initx, inity, initz);
  const initv = new THREE.Vector3(initvx, initvy, initvz);
  const name = "sat" + (satellitsManeger.length + 1);

  const sat = new Satellite(name, initp, initv);
  const satFolder = gui.addFolder(name);
  satFolder.add(sat, "altitude").name("Altitude").listen();
  satFolder.add(sat, "totalSpeed").name("Speed").listen();

 
  sat.calculateAndDrawPredictedOrbit(
    initp.clone(),
    initv.clone(),
    PREDICTED_ORBIT_STEPS,
    PREDICTED_ORBIT_DT,
    0
  );

  const thrustFolder = satFolder.addFolder("Thruster Controls");
  thrustFolder.add(settings, "thrustMagnitude", 0, 10000000).name("N");
  thrustFolder
    .add(settings, "thrustDirection", { "0": 0, "-1": -1, "1": 1 })
    .name("THRUST DIRECTION")
    .onChange(() => {
    let effectiveThrustMagnitude = 0;
    if (settings.thrustDirection === 1) {
      effectiveThrustMagnitude = settings.thrustMagnitude;
    } else if (settings.thrustDirection === -1) {
      effectiveThrustMagnitude = -settings.thrustMagnitude;
    }

  
    sat.calculateAndDrawPredictedOrbit(
      sat.pos.clone(),
      sat.vel.clone(),
      PREDICTED_ORBIT_STEPS,
      PREDICTED_ORBIT_DT,
      effectiveThrustMagnitude 
    );
    });
//تابع حذف القمر
  const deleteSatelliteFunc = () => {
    scene.scene.remove(sat.mesh);
    scene.scene.remove(sat.tailLine);
    scene.scene.remove(sat.predictedTailLine);
    if (sat.mesh instanceof THREE.Mesh) {
      sat.mesh.geometry.dispose();
      if (Array.isArray(sat.mesh.material)) {
        for (const mat of sat.mesh.material) {
          mat.dispose();
          if (mat.map) mat.map.dispose();
        }
      } else {
        sat.mesh.material.dispose();
        if (sat.mesh.material && sat.mesh.material.map)
          sat.mesh.material.map.dispose();
      }
    }

    satFolder.destroy();

    const indexToRemove = satellitsManeger.findIndex(
      (satellite) => satellite.sat.name === name
    );
    if (indexToRemove > -1) {
      satellitsManeger.splice(indexToRemove, 1);
    }
  };

  const satActions = {
    delete: deleteSatelliteFunc,
  };
  satFolder.add(satActions, "delete").name("Delete Satellite");

  satellitsManeger.push({
    sat: sat,
    folder: satFolder,
    deleteAction: deleteSatelliteFunc,
  });
}


addSatFolder
  .add(initSatSettings, "X", -10000000, 10000000)
  .onChange(updatePathPreview);
addSatFolder
  .add(initSatSettings, "Y", -10000000, 10000000)
  .onChange(updatePathPreview);
addSatFolder
  .add(initSatSettings, "Z", -10000000, 10000000)
  .onChange(updatePathPreview);
addSatFolder
  .add(initSatSettings, "Vx", -15000, 15000)
  .onChange(updatePathPreview);
addSatFolder
  .add(initSatSettings, "Vy", -15000, 15000)
  .onChange(updatePathPreview);
addSatFolder
  .add(initSatSettings, "Vz", -15000, 15000)
  .onChange(updatePathPreview);
addSatFolder.add(initSatSettings, "add_Sat");




let pathPreviewLine: THREE.Line | null = null;
function updatePathPreview() {



 if (!settings.showInitialPredictedPath) {
    if (pathPreviewLine) {
      scene.scene.remove(pathPreviewLine);
      pathPreviewLine.geometry.dispose();
      if (Array.isArray(pathPreviewLine.material)) {
        pathPreviewLine.material.forEach((m) => m.dispose());
      } else {
        pathPreviewLine.material.dispose();
      }
      pathPreviewLine = null;
    }
    return;
  }



  const initp = new THREE.Vector3(
    initSatSettings.X,
    initSatSettings.Y,
    initSatSettings.Z
  );
  const initv = new THREE.Vector3(
    initSatSettings.Vx,
    initSatSettings.Vy,
    initSatSettings.Vz
  );
  const name = "sat";
  const sat = new Satellite(name, initp, initv, true);

  if (pathPreviewLine) {
    scene.scene.remove(pathPreviewLine);
    pathPreviewLine.geometry.dispose();
    if (Array.isArray(pathPreviewLine.material)) {
      pathPreviewLine.material.forEach((m) => m.dispose());
    } else {
      pathPreviewLine.material.dispose();
    }
    pathPreviewLine = null;
  }

 
  pathPreviewLine = sat.calculateAndDrawPredictedOrbit(
    sat.pos.clone(),
    sat.vel.clone(),
    PREDICTED_ORBIT_STEPS,
    PREDICTED_ORBIT_DT
  );
}
