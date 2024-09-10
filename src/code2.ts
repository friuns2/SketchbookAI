export {};
let GLTFLoader= THREE.GLTFLoader; 
//IMPORTANT: Always use AutoScale(model, scale) to scale the model
//IMPORTANT: Always use expose(variable, name) to expose the parameters to GUI
//IMPORTANT: Assign animation names like this: animations.forEach(a => { if (a.name === "Idle") a.name = CAnims.idle; if (a.name === "Run") a.name = CAnims.sprint; });


let world = new World();
await world.initialize('build/assets/world.glb');


let textPrompt: HTMLDivElement = document.createElement('div');
textPrompt.style.cssText = "position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);";
document.body.appendChild(textPrompt);


let playerModel = await loadAsync('build/assets/boxman.glb');

expose(playerModel.scene, "player");
AutoScale(playerModel.scene, 1.7);
addMethodListener(world, world.update, function () {
    TWEEN.update();
});

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

    update(timeStep: number): void {
        this.bullets.forEach((bullet, index) => {
            bullet.position.add(bullet.direction.clone().multiplyScalar(this.bulletSpeed * timeStep));
            if (bullet.position.distanceTo(this.parent!.position) > 20) {
                this.bullets.splice(index, 1);
                world.remove(bullet);
            }
        });
    }

    shoot(): void {
        if (Date.now() - this.lastShotTime > this.reloadTime * 1000) {
            this.lastShotTime = Date.now();
            const bullet = new Bullet();
            bullet.position.copy(this.parent!.getWorldPosition(new THREE.Vector3()));
            bullet.direction.copy(world.camera.getWorldDirection(new THREE.Vector3()));
            world.add(bullet);
            this.bullets.push(bullet);
        }
    }
}

class Bullet extends THREE.Mesh {
    direction: THREE.Vector3;

    constructor() {
        super(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ color: 'red' }));
        this.direction = new THREE.Vector3();
    }
}

class Player extends Character {
    rhand: THREE.Object3D | null;
    pistol: Pistol | null;
    health:100;
    constructor(model: THREE.GLTF) {
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

    update(timeStep: number): void {
        super.update(timeStep);
        if (this.pistol) {
            this.pistol.update(timeStep);
        }
    }
    
    inputReceiverUpdate(deltaTime: number): void {
        super.inputReceiverUpdate(deltaTime);
    }

    handleMouseButton(event: MouseEvent, code: string, pressed: boolean): void {
        super.handleMouseButton(event, code, pressed);
        if (event.button === 0 && pressed === true && this.pistol) {
            this.pistol.shoot();
        }
    }
}


class Zombie extends Character {
    target: Player;
    constructor(model: THREE.GLTF, target: Player) {
        super(model);
        this.target = target;
        this.setBehaviour(new FollowTarget(target, 2));
    }

    update(timeStep: number): void {
        super.update(timeStep);
        if (this.position.distanceTo(this.target.position) < 1) {
            this.target.health -= 1;
            console.log("Zombie hit player! Health:", this.target.health);
        }
    }
}

let player: Player = new Player(playerModel);
expose(player.moveSpeed, "player speed");
player.setPosition(0, 0, -5);
world.add(player);

player.takeControl();

// Create a zombie
let zombieModel = await loadAsync('build/assets/zombie.glb'); // Replace with the actual zombie model
AutoScale(zombieModel.scene, 1.5); // Adjust the scale as needed
let zombie = new Zombie(zombieModel, player);
zombie.setPosition(5, 0, 0); // Set the initial position of the zombie
world.add(zombie);

// ... rest of the code