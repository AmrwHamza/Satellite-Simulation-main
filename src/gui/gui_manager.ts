import * as THREE from "three";

import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import { Satellite } from "../objects/satellite";
import { animate, clock, scene } from "../main";

export const gui = new GUI({
  autoPlace: true,
  title: "Satellite Simulation",
});

export const settings = {
  timeScale: 500,
  isSimulationRunning: true,
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

// const simulationFolder = gui.addFolder("Simulation Controls");
timeScaleFolder
  .add(simulationControls, "toggleSimulation")
  .name("Start/Stop");

export const satellitsManeger: {
  sat: Satellite;
  folder: GUI;
  deleteAction: () => void;
}[] = [];

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
  satFolder.add(sat, "altitude").name("position").listen();

  const deleteSatelliteFunc = () => {
    scene.scene.remove(sat.mesh);
    scene.scene.remove(sat.tailLine);

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
    console.log(`Satellite ${name} and its folder removed.`);
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

addSatFolder.add(initSatSettings, "X", -10000000, 10000000);
addSatFolder.add(initSatSettings, "Y", -10000000, 10000000);
addSatFolder.add(initSatSettings, "Z", -10000000, 10000000);
addSatFolder.add(initSatSettings, "Vx", -15000, 15000);
addSatFolder.add(initSatSettings, "Vy", -15000, 15000);
addSatFolder.add(initSatSettings, "Vz", -15000, 15000);
addSatFolder.add(initSatSettings, "add_Sat");
// addSatFolder.add(initSatSettings, "clear_all");
// addSatFolder.forEach((element) => {});

// function removeAll() {
//   satelliteArry.forEach((element) => scene.scene.remove(element.mesh));
//   satelliteArry.forEach((element) => scene.scene.remove(element.tailLine));
//   satelliteArry.splice(0, satelliteArry.length);
// }
