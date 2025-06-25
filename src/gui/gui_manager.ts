import * as THREE from "three";

import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import { Satellite } from "../objects/satellite";
import { animate, clock, scene } from "../main";

export const gui = new GUI({
  autoPlace: true,
  title: "Satellite Simulation",
  width: 300,
});

export const PREDICTED_ORBIT_STEPS = 1000;
export const PREDICTED_ORBIT_DT = 60;

//قسم الاعدادات الاساسية للمحاكاة ايقاف,تسريع
/////////////////////////////////////
export const settings = {
  timeScale: 500,
  isSimulationRunning: true,
  thrustTF: 50,
  thrustTDirection: 0,
  thrustNF:50,
  thrustNDirection: 0,
  thrustRF:50,
  thrustRDirection: 0,
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
addSatFolder
  .add(settings, "showInitialPredictedPath")
  .name("Show Initial Path")
  .onChange(updatePathPreview);

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
    0,0,0
  );

const thrustTFolder = satFolder.addFolder("Thrust T Controls");
thrustTFolder.add(settings, "thrustTF", 0, 10000000).name("Thrust Force (N)");
thrustTFolder
  .add(settings, "thrustTDirection", -1, 1, 1) // هنا التعديل: min=-1, max=1, step=1
  .name("Thrust Direction")
  .onChange(updateThrustsAndOrbit);

const thrustNFolder = satFolder.addFolder("Thrust N Controls");
thrustNFolder.add(settings, "thrustNF", 0, 10000000).name("Thrust Force (N)");
thrustNFolder
  .add(settings, "thrustNDirection", -1, 1, 1) // هنا التعديل: min=-1, max=1, step=1
  .name("Thrust Direction")
  .onChange(updateThrustsAndOrbit);

const thrustRFolder = satFolder.addFolder("Thrust R Controls");
thrustRFolder.add(settings, "thrustRF", 0, 10000000).name("Thrust Force (N)");
thrustRFolder
  .add(settings, "thrustRDirection", -1, 1, 1) // هنا التعديل: min=-1, max=1, step=1
  .name("Thrust Direction")
  .onChange(updateThrustsAndOrbit);


function updateThrustsAndOrbit() {
  let thrustTForce = 0;
  if (settings.thrustTDirection === 1) {
    thrustTForce = settings.thrustTF;
  } else if (settings.thrustTDirection === -1) {
    thrustTForce = -settings.thrustTF;
  }

  let thrustNForce = 0;
  if (settings.thrustNDirection === 1) {
    thrustNForce = settings.thrustNF;
  } else if (settings.thrustNDirection === -1) {
    thrustNForce = -settings.thrustNF;
  }

  let thrustRForce = 0;
  if (settings.thrustRDirection === 1) {
    thrustRForce = settings.thrustRF;
  } else if (settings.thrustRDirection === -1) {
    thrustRForce = -settings.thrustRF;
  }

  sat.calculateAndDrawPredictedOrbit(
    sat.pos.clone(),
    sat.vel.clone(),
    PREDICTED_ORBIT_STEPS,
    PREDICTED_ORBIT_DT,
    thrustTForce,
    thrustNForce,
    thrustRForce
  );
}

// ملاحظة: تأكد من أن كائن 'settings' يحتوي على الخصائص التالية بقيم افتراضية:
// settings = {
//   thrustTF: 0,
//   thrustTDirection: 0, // قيمة افتراضية مناسبة للشريط الجديد
//   thrustNF: 0,
//   thrustNDirection: 0, // قيمة افتراضية مناسبة للشريط الجديد
//   thrustRF: 0,
//   thrustRDirection: 0, // قيمة افتراضية مناسبة للشريط الجديد
//   // ... أي إعدادات أخرى
// };


    


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
    PREDICTED_ORBIT_DT,0,0,0
  );
}
