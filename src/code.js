globalThis.world = new World();
await world.initialize('build/assets/world.glb');

GLTFLoader.prototype.loadAsync = async function (glbUrl) {
    return new Promise((resolve, reject) => {
        this.load(glbUrl, (gltf) => {
            resolve(gltf);
        }, undefined, reject);
    });
};

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
}

let player = new Player(playerModel);
world.add(player);




extendMethod(player, "handleMouseButton", function (event, code, pressed) {
    if (event.button === 0 && pressed === true) {
        //mouse 0
    }
});
extendMethod(player, "inputReceiverInit", function () {
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

extendMethod(world, "update", function (timeStep) {
    //world update here
});

/*
let ammoModel = await loader.loadAsync("build/assets/pistol.glb");
let ammo = new BaseObject(ammoModel.scene);
ammo.setPosition({x:0,y:14.86,z:-1.93});
world.add(ammo);
*/