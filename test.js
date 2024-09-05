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

class GrenadeProjectile extends BaseObject {
    constructor(position, velocity, explosionRadius = 2, damage = 50) {
        super(new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial({ color: 0xff0000 })), true);
        this.setPosition(position);
        this.body.velocity.copy(velocity);
        this.explosionRadius = explosionRadius;
        this.damage = damage;
        this.updateOrder = 1;
    }

    update(timeStep) {
        super.update(timeStep);

        // Check for collisions
        const hits = world.physicsWorld.bodies.filter(body => body !== this.body && body.material !== defaultMaterial && this.body.position.distanceTo(body.position) < this.explosionRadius);
      
    }
}

class Player extends Character {
    constructor(model) {
        super(model);
        this.rhand = model.scene.getObjectByName("rhand");
        this.lhand = model.scene.getObjectByName("lhand");
        this.remapAnimations(model.animations);
        this.actions.interract = new KeyBinding("KeyR");
        this.originalSensitivity = world.cameraOperator.sensitivity.clone();
        this.actions.throwGrenade = new KeyBinding("MouseLeft");
        this.actions.aim = new KeyBinding("MouseRight");
        this.aimingSpeed = 0.5;
        this.aimingFOV = 40;
        this.aimingOffset = new THREE.Vector3(-0.5, 0.3, 0.0);
        this.originalFOV = world.camera.fov;
        this.grenadeVelocity = new THREE.Vector3();
        this.grenadeVelocity.setLength(20);
    }

    update(timeStep) {
        super.update(timeStep);
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

        // Shoot grenade
        if (this.actions.throwGrenade.isPressed) {
            const grenade = new GrenadeProjectile(this.rhand.getWorldPosition(new THREE.Vector3()), this.grenadeVelocity);
            grenade.addToWorld(world);
        }
    }

    handleMouseButton(event, code, pressed) {
        super.handleMouseButton(event, code, pressed);
        if (event.button === 0 && pressed === true) {
            // Shoot grenade
            const grenade = new GrenadeProjectile(this.rhand.getWorldPosition(new THREE.Vector3()), this.grenadeVelocity);
            grenade.addToWorld(world);
        } else if (event.button === 2 && pressed === true) {
            // Perform another action
        }
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