globalThis.world = new World();
await world.initialize('build/assets/world.glb');

GLTFLoader.prototype.loadAsync = async function (glbUrl) {
    return new Promise((resolve, reject) => {
        this.load(glbUrl, (gltf) => {
            resolve(gltf);
        }, undefined, reject);
    });
};

var textPrompt = globalThis.textPrompt = document.createElement('div');
textPrompt.style.cssText = "position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);";
document.body.appendChild(textPrompt);


var loader = globalThis.loader = new GLTFLoader();

var playerModel = globalThis.playerModel = await loader.loadAsync('build/assets/boxman.glb');
expose(playerModel.scene, "player");

class Player extends Character {
    constructor(model) {
        super(model);
        this.rhand = model.scene.getObjectByName("rhand");
        this.lhand = model.scene.getObjectByName("lhand");
        this.remapAnimations(model.animations);
        this.actions.interract = new KeyBinding("KeyR");
        this.originalSensitivity = world.cameraOperator.sensitivity.clone();
        this.actions.throwPistol = new KeyBinding("KeyG");
        this.actions.aim = new KeyBinding("MouseRight");
        this.aimingSpeed = 0.5;
        this.aimingFOV = 40;
        this.aimingOffset = new THREE.Vector3(-0.5, 0.3, 0.0);
        this.originalFOV = world.camera.fov;
        this.pistol = new Pistol(this.rhand);
    }

    update(timeStep) {
        super.update(timeStep);
        this.pistol.update(timeStep);
    }

    remapAnimations(animations) {
        animations.forEach(a => {
            if (a.name === "Idle") a.name = CAnims.idle;
            if (a.name === "Run") a.name = CAnims.run;
        });
    }

    inputReceiverUpdate(deltaTime) {
        super.inputReceiverUpdate(deltaTime);

        textPrompt.textContent = "";

        // Check for interactable objects within range
        for (let updatable of world.updatables) {
            if (updatable.interract && this.position.distanceTo(updatable.position) < 2) {
                textPrompt.textContent = "Press R to interact";
                if (this.actions.interract.isPressed) {
                    updatable.interract(this);
                    break;
                }
            }
        }

    }

    handleMouseButton(event, code, pressed) {
        super.handleMouseButton(event, code, pressed);
        if (event.button === 0 && pressed === true) {
            this.pistol.shoot();
        } else if (event.button === 2 && pressed === true) {
            // Perform another action
        }
    }

}

class Pistol extends THREE.Object3D {
    constructor(parent) {
        super();
        parent.attach(this);
        this.bulletSpeed = 10;
        this.bullets = [];
        this.reloadTime = 0.5;
        this.lastShotTime = 0;
    }

    update(timeStep) {
        this.bullets.forEach((bullet, index) => {
            bullet.position.add(bullet.direction.clone().multiplyScalar(this.bulletSpeed * timeStep));
            if (bullet.position.distanceTo(this.parent.position) > 20) {
                this.bullets.splice(index, 1);
                world.remove(bullet);
            }
        });
    }

    shoot() {
        if (Date.now() - this.lastShotTime > this.reloadTime * 1000) {
            this.lastShotTime = Date.now();
            const bullet = new Bullet();
            bullet.position.copy(this.parent.getWorldPosition());
            bullet.direction.copy(world.camera.getWorldDirection());
            world.add(bullet);
            this.bullets.push(bullet);
        }
    }
}

class Bullet extends THREE.Mesh {
    constructor() {
        super(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ color: 'red' }));
        this.direction = new THREE.Vector3();
    }
}

var player = globalThis.player = new Player(playerModel);
player.setPosition(0, 0, -5);
world.add(player);

addMethodListener(player, "inputReceiverInit", function () {
    world.cameraOperator.setRadius(1.6)
});
player.takeControl();

world.startRenderAndUpdatePhysics?.();
