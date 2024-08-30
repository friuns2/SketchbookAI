globalThis.world = new World();
await world.initialize('build/assets/world.glb');



GLTFLoader.prototype.loadAsync = async function (glbUrl) {
    return new Promise((resolve, reject) => {
        this.load(glbUrl, (gltf) => {
            resolve(gltf);
        }, undefined, reject);
    });
};

var textPrompt = document.createElement('div');
textPrompt.style.cssText = "position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);";

document.body.appendChild(textPrompt);

let loader = new GLTFLoader();

let playerModel = await loader.loadAsync('build/assets/boxman.glb');
expose(playerModel.scene,"player");
class Player extends Character {
    constructor(model) {
        super(model);
        this.rhand = model.scene.getObjectByName("rhand");
        this.lhand = model.scene.getObjectByName("lhand");
        this.remapAnimations(model.animations);
        
    }

    remapAnimations(animations) {
        animations.forEach(a => {
            if (a.name === "Idle") a.name = CAnims.idle;
            if (a.name === "Run") a.name = CAnims.run;
        });
    }
    handleKeyboardEvent(event, code, pressed) {
        super.handleKeyboardEvent(event, code, pressed);
        if (code === "KeyR" && pressed === true) {
            
        }
    }
    handleMouseButton(event, code, pressed) {
        super.handleMouseButton(event, code, pressed);
        if (event.button === 0 && pressed === true) {
            
        }
    }


}

let player = new Player(playerModel);
world.add(player);

addMethodListener(player, "inputReceiverInit", function () {
    world.cameraOperator.setRadius(1.6)
});
player.takeControl();


let pistolModel = await loader.loadAsync("build/assets/pistol.glb");
//AutoScale({gltfScene:kitchen_knifeModel.scene, approximateScaleInMeters: .4});

/** @type {THREE.Object3D} */
let pistol = pistolModel.scene.getObjectByName("Object_2");
pistol.position.set(0.1, -0.1, 0.1);
pistol.rotation.set(0, Math.PI / 2, 0);

player.rhand.addWithPreservedScale(pistol);


expose(pistol, "pistol");
world.startRenderAndUpdatePhysics?.();

addMethodListener(world, "update", function (timeStep) {
    //world update here
});

/*
let ammoModel = await loader.loadAsync("build/assets/pistol.glb");
let ammo = new BaseObject(ammoModel.scene);
ammo.setPosition({x:0,y:14.86,z:-1.93});
world.add(ammo);
*/

// Spawn NPC character
let npcModel = await loader.loadAsync('build/assets/boxman.glb');
let npc = new Character(npcModel);
npc.setPosition(-0.6, 14.86, -1.98);
npc.setBehaviour(new FollowTarget(player));
world.add(npc);