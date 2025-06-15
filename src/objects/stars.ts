import * as THREE from "three";
import { scene } from "../main";

export class Stars{


    constructor(){

        
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
          color: 0xffffff,
        });
        
        const starVertics = [];
        for (let i = 0; i < 12000; i++) {
          const x = (Math.random() - 0.5) * 10000000;
          const y = (Math.random() - 0.5) * 10000000;
          const z = (Math.random() - 0.5) * 10000000;
         
          starVertics.push(x, y, z);
        }
        
        starGeometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(starVertics, 3)
        );
        
        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.addToScene(stars);
        
    }
}