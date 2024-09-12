import * as THREE from 'three';
import {GLTF,GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Character, ICharacterAI } from './ts/characters/Character';



//IMPORTANT: Always use AutoScale(model, scale) to scale the model
//IMPORTANT: Always use expose(variable, name) to expose the parameters to GUI
//IMPORTANT: Assign animation names like this: animations.forEach(a => { if (a.name === "Idle") a.name = CAnims.idle; if (a.name === "Run") a.name = CAnims.sprint; });

let world = new World();
await world.initialize('build/assets/world.glb');

// UI elements
let textPrompt: HTMLDivElement = document.createElement('div');
textPrompt.style.cssText = "position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);";
document.body.appendChild(textPrompt);


// Loading the goblin model
let goblinModel = await loadAsync('build/assets/goblin.glb');
//expose(goblinModel.scene, "goblin");
AutoScale(goblinModel.scene, 2);

// Loading the player model
let playerModel = await loadAsync('build/assets/boxman.glb');
expose(playerModel.scene, "player");
AutoScale(playerModel.scene, 1.7);


// Goblin class
class Goblin extends Character {
  private rootBone: THREE.Bone | null = null;
  private initialRootPosition: THREE.Vector3 = new THREE.Vector3();

  constructor(model: GLTF) {
    model.animations.forEach(a => {
      if (a.name === "Idle") a.name = CAnims.idle;
      if (a.name === "Walk") a.name = CAnims.sprint;
    });
    super(model);
    this.arcadeVelocityInfluence.set(0.2, 0, 0.2); // Adjust movement speed
    this.setBehaviour(new RandomBehaviour());

    // Remap animations in the goblin model
    

    // Find the root bone
    model.scene.traverse((object: THREE.Bone) => {
      if (object.isBone) {
        
        if (object.name.toLowerCase().includes('root') || object.name.toLowerCase().includes('hips')) {
          this.rootBone = object;
        }
      }
    });

    if (this.rootBone) {
      this.initialRootPosition.copy(this.rootBone.position);
    }
  }

  // Update method for goblin's logic (movement, animations, etc.)
  update(timeStep: number): void {
    super.update(timeStep);


   
  }
}


// Creating the player and goblin instances
let player: Character = new Character(playerModel);
expose(player.moveSpeed, "player speed");
player.setPosition(0, 0, -5);
world.add(player);

let goblin: Goblin = new Goblin(goblinModel);
goblin.setPosition(5, 0, 5);
world.add(goblin);

// Giving control to the player
player.takeControl();

