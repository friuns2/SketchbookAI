import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const world = new World();
await world.initialize('build/assets/world.glb');

const textPrompt = document.createElement('div');
textPrompt.style.cssText = "position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);";
document.body.appendChild(textPrompt);

const loader = new GLTFLoader();
const playerModel = await loader.loadAsync('build/assets/boxman.glb');
expose(playerModel.scene, "player");

class Player extends Character {
    private rhand: THREE.Object3D | null;
    private lhand: THREE.Object3D | null;
    private pistol: Pistol;

    constructor(model: GLTF) {
        super(model);
        this.rhand = model.scene.getObjectByName("rhand");
        this.lhand = model.scene.getObjectByName("lhand");
        this.remapAnimations(model.animations);    
        this.pistol = new Pistol(this.rhand!);
        this.actions.jetpack = KeyBinding.CreateKeyBinding("Space");

    }

    update(timeStep: number): void {
        super.update(timeStep);
        this.pistol.update(timeStep);
        if (this.actions.jetpack.isPressed)
            this.characterCapsule.body.velocity.y += 10 * timeStep;
    }

    private remapAnimations(animations: THREE.AnimationClip[]): void {
        animations.forEach(a => {
            if (a.name === "Idle") a.name = CAnims.idle;
            if (a.name === "Run") a.name = CAnims.run;
        });
    }

    handleMouseButton(event: MouseEvent, code: string, pressed: boolean): void {
        super.handleMouseButton(event, code, pressed);
        if (event.button === 0 && pressed === true) {
            this.pistol.shoot();
        } else if (event.button === 2 && pressed === true) {
            // Perform another action
        }
    }
}

class Pistol extends THREE.Object3D {
    private bulletSpeed: number = 10;
    private bullets: Bullet[] = [];
    private reloadTime: number = 0.5;
    private lastShotTime: number = 0;

    constructor(parent: THREE.Object3D) {
        super();
        parent.attach(this);
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

const player = new Player(playerModel);
player.setPosition(0, 0, -5);
world.add(player);

addMethodListener(player, "inputReceiverInit", function () {
    world.cameraOperator.setRadius(1.6);
});
player.takeControl();
