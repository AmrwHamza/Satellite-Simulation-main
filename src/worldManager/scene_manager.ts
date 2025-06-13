import * as THREE from 'three';
export class SceneManager{
    public scene: THREE.Scene ;
    
    constructor(){
        this.scene = new THREE.Scene();
    }

      getScene() {
    
        return this.scene;
        
    }

    addToScene(object: THREE.Object3D){
        this.scene.add(object);

    }


}