import * as THREE from 'three';
import {GLTF,GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';



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


const loader = new GLTFLoader();
loader.load('build/assets/goblin.glb', function (gltf) {
   var model = gltf.scene;
    

    // Create a single bounding box for all objects combined
    const combinedBoundingBox = new THREE.Box3();

    model.traverse(function (object) {
        if (object.isMesh) {
            object.geometry.computeBoundingBox();
            combinedBoundingBox.expandByObject(object);
        }
    });

    // Log the size of the combined bounding box
    console.log('Combined Bounding Box Size:', combinedBoundingBox.getSize(new THREE.Vector3()));
});

// Goblin class
class Goblin extends Character {
  constructor(model: GLTF) {
    super(model);
    this.setAnimations(model.animations);
    this.setAnimation(CAnims.idle, 0);
    this.arcadeVelocityInfluence.set(0.2, 0, 0.2); // Adjust movement speed
    this.setBehaviour(new RandomBehaviour());
  }

  // Update method for goblin's logic (movement, animations, etc.)
  update(timeStep: number): void {
    super.update(timeStep);

    // Example: Randomly switch between animations
    if (Math.random() < 0.01) {
      const randomAnim = Math.floor(Math.random() * 2);
      this.setAnimation(randomAnim === 0 ? CAnims.idle : CAnims.run, 0);
    }

    // Example: Basic random movement
    if (Math.random() < 0.02) {
      this.setArcadeVelocityTarget(Math.random() * 2 - 1, Math.random() * 2 - 1, 0);
    }
  }
}

// Player class
class Player extends Character {
  rhand: THREE.Object3D | null;
  pistol: Pistol | null;
  health: 100;

  constructor(model: GLTF) {
    super(model);
    this.rhand = model.scene.getObjectByName("rhand");
    this.pistol = null;

    // Load the pistol model
    loadAsync('build/assets/pistol.glb').then(gltf => {
      if (this.rhand) {
        this.pistol = new Pistol(this.rhand);
        this.pistol.attach(gltf.scene);
        this.pistol.position.set(0.1, -0.1, 0.1);
        this.pistol.rotation.set(0, Math.PI / 2, 0);
      }
    });
  }

  // Update method for player's logic (movement, shooting, etc.)
  update(timeStep: number): void {
    super.update(timeStep);
    if (this.pistol) {
      this.pistol.update(timeStep);
    }
  }

  // Event handler for mouse button clicks
  handleMouseButton(event: MouseEvent, code: string, pressed: boolean): void {
    super.handleMouseButton(event, code, pressed);
    if (event.button === 0 && pressed === true && this.pistol) {
      this.pistol.shoot();
    }
  }
}

// Pistol class
class Pistol extends THREE.Object3D {
  bulletSpeed: number;
  bullets: Bullet[];
  reloadTime: number;
  lastShotTime: number;

  constructor(parent: THREE.Object3D) {
    super();
    parent.attach(this);
    this.bulletSpeed = 10;
    this.bullets = [];
    this.reloadTime = 0.5;
    this.lastShotTime = 0;
  }

  // Update method for bullet movement
  update(timeStep: number): void {
    this.bullets.forEach((bullet, index) => {
      bullet.position.add(bullet.direction.clone().multiplyScalar(this.bulletSpeed * timeStep));
      if (bullet.position.distanceTo(this.parent!.position) > 20) {
        this.bullets.splice(index, 1);
        world.remove(bullet);
      }
    });
  }

  // Method to shoot a bullet
  shoot(): void {
    this.lastShotTime = Date.now();
    const bullet = new Bullet();
    bullet.position.copy(this.parent!.getWorldPosition(new THREE.Vector3()));
    bullet.direction.copy(world.camera.getWorldDirection(new THREE.Vector3()));
    world.add(bullet);
    this.bullets.push(bullet);
  }
}

// Bullet class
class Bullet extends THREE.Mesh {
  direction: THREE.Vector3;

  constructor() {
    super(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ color: 'red' }));
    this.direction = new THREE.Vector3();
  }
}

// Random behavior AI for goblins
class RandomBehaviour implements ICharacterAI {
  character: Character;
  update(timeStep: number): void {
    if (Math.random() < 0.01) {
      this.character.setArcadeVelocityTarget(Math.random() * 2 - 1, Math.random() * 2 - 1, 0);
    }
  }
}

// Helper function to load GLTF models
async function loadAsync(glbUrl: string): Promise<GLTF> {
  return new Promise((resolve, reject) => {
    new GLTFLoader().load(glbUrl, (gltf) => {
      resolve(gltf);
    }, undefined, reject);
  });
}

// Creating the player and goblin instances
let player: Player = new Player(playerModel);
expose(player.moveSpeed, "player speed");
player.setPosition(0, 0, -5);
world.add(player);

let goblin: Goblin = new Goblin(goblinModel);
goblin.setPosition(5, 0, 5);
world.add(goblin);

// Giving control to the player
player.takeControl();

// ... rest of the code