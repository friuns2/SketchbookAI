globalThis.world = new World();
await world.initialize('build/assets/world.glb');

GLTFLoader.prototype.loadAsync = async function (glbUrl) {
    return new Promise((resolve, reject) => {
        this.load(glbUrl, (gltf) => {
            resolve(gltf);
        }, undefined, reject);
    });
};

const textPrompt = document.createElement('div');
textPrompt.style.cssText = "position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);";
document.body.appendChild(textPrompt);

const loader = new GLTFLoader();

const playerModel = await loader.loadAsync('build/assets/boxman.glb');
expose(playerModel.scene, "player");

class MinecraftPlayer extends Character {
    constructor(model) {
        super(model);
        this.rhand = model.scene.getObjectByName("rhand");
        this.lhand = model.scene.getObjectByName("lhand");
        this.remapAnimations(model.animations);
        this.actions.interract = new KeyBinding("KeyR");
        this.lastCubePosition = null;
    }

    remapAnimations(animations) {
        animations.forEach(a => {
            if (a.name === "Idle") a.name = CAnims.idle;
            if (a.name === "Run") a.name = CAnims.run;
        });
    }

    inputReceiverUpdate(deltaTime) {
        super.inputReceiverUpdate(deltaTime);
        for (let updatable of world.objects) {
            if (updatable.interract && this.position.distanceTo(updatable.position) < 2) {
                textPrompt.textContent = "Press R to interact";
                if (this.actions.interract.isPressed) {
                    updatable.interract(this);
                }
                return;
            }
        }
        textPrompt.textContent = "";
    }

    handleMouseButton(event, code, pressed) {
        super.handleMouseButton(event, code, pressed);
        if (event.button === 0 && pressed === true) {
            this.removeCube();
        } else if (event.button === 2 && pressed === true) {
            // Handle right mouse click
            this.placeNewCube();
        }
    }

    removeCube() {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), world.camera);
        const intersects = raycaster.intersectObjects(world.graphicsWorld.children, true);

        if (intersects.length > 0) {
            const intersection = intersects[0].object?.parent; // Get the intersected object
            if (intersection instanceof BaseObject) { // Check if it's a BaseObject
                world.remove(intersection); // Remove from the world
            }
        }
    }

    placeNewCube() {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), world.camera);
        const intersects = raycaster.intersectObjects(world.graphicsWorld.children, true);

        const cubeScale = 0.7;
        const cubescalex2 = 1 / cubeScale;
        if (intersects.length > 0) {
            const intersection = intersects[0];
            const cubePosition = new THREE.Vector3(
                Math.floor(intersection.point.x * cubescalex2) / cubescalex2 + cubeScale / 2,
                Math.floor(intersection.point.y * cubescalex2) / cubescalex2 + cubeScale - (1 - cubeScale) / 2,
                Math.floor(intersection.point.z * cubescalex2) / cubescalex2 + cubeScale / 2
            );

            if (this.lastCubePosition === null || !cubePosition.equals(this.lastCubePosition)) {
                const textureLoader = new THREE.TextureLoader();
                const texture = textureLoader.load('build/assets/crate_diffuse.jpg');
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(1, 1);

                const newCubeModel = new THREE.Mesh(
                    new THREE.BoxGeometry(cubeScale, cubeScale, cubeScale),
                    new THREE.MeshStandardMaterial({ map: texture })
                );
                const newCube = new BaseObject(newCubeModel, true);
                newCube.setPosition(cubePosition);
                newCube.addToWorld(world);

                this.lastCubePosition = cubePosition;
            }
        }
    }
}

class NPC extends Character {
    constructor(model, dialog) {
        super(model);
        this.dialog = dialog;
    }

    interract(player) {
        Swal.fire({
            title: this.dialog,
            toast: false,
            showCancelButton: true,
            confirmButtonText: 'Follow',
        }).then((result) => {
            if (result.isConfirmed) {
                this.setBehaviour(new FollowTarget(player));
            }
        });
    }
}

const player = new Player(playerModel);
player.setPosition(0, 0, -5);
world.add(player);

addMethodListener(player, "inputReceiverInit", function () {
    world.cameraOperator.setRadius(1.6)
});
player.takeControl();

const pistolModel = await loader.loadAsync("build/assets/pistol.glb");
const pistol = pistolModel.scene.getObjectByName("Object_2");
pistol.position.set(0.1, -0.1, 0.1);
pistol.rotation.set(0, Math.PI / 2, 0);
player.rhand.attach(pistol);

expose(pistol, "pistol");
world.startRenderAndUpdatePhysics?.();

// Spawn multiple NPC characters
const npcs = [];
const npcPositions = [
    // Your NPC positions and dialogs here
];

for (let i = 0; i < npcPositions.length; i++) {
    const npcModel = await loader.loadAsync('build/assets/boxman.glb');
    const npc = new NPC(npcModel, npcPositions[i].dialog);
    npc.setPosition(npcPositions[i].x, npcPositions[i].y, npcPositions[i].z);
    npcs.push(npc);
    world.add(npc);
}

