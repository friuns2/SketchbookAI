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

// Create crosshair
var crosshair = globalThis.crosshair = document.createElement('div');
crosshair.style.cssText = "position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 20px; height: 20px; border: 2px solid white; border-radius: 50%;";
document.body.appendChild(crosshair);

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

        // Handle aiming mode
        if (this.actions.aim.isPressed) {
            world.camera.fov = this.aimingFOV;
            world.cameraOperator.sensitivity.x = this.aimingSpeed;
            world.cameraOperator.sensitivity.y = this.aimingSpeed;
            // Apply offset relative to camera rotation
            const cameraDirection = world.camera.getWorldDirection(new THREE.Vector3());
            const rotatedOffset = this.aimingOffset.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.atan2(cameraDirection.x, cameraDirection.z));
            world.cameraOperator.target.add(rotatedOffset);
            crosshair.style.display = 'block';

            // Rotate the player towards the aim direction
            const aimDirection = world.camera.getWorldDirection(new THREE.Vector3());
            aimDirection.y = 0; // Ignore vertical component
            aimDirection.normalize();
            this.setOrientation(aimDirection,false);

        } else {
            world.camera.fov = this.originalFOV;
            world.cameraOperator.sensitivity.x = this.originalSensitivity.x;
            world.cameraOperator.sensitivity.y = this.originalSensitivity.y;
            crosshair.style.display = 'none';
        }
    }

    handleMouseButton(event, code, pressed) {
        super.handleMouseButton(event, code, pressed);
        if (event.button === 0 && pressed === true) {
            // Shoot the pistol
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