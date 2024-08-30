globalThis.world = new World();
await world.initialize('build/assets/world.glb');

GLTFLoader.prototype.loadAsync = async function (glbUrl) {
    return new Promise((resolve, reject) => {
        this.load(glbUrl, (gltf) => {
            resolve(gltf);
        }, undefined, reject);
    });
};

var loader = globalThis.loader = new GLTFLoader();

var playerModel = globalThis.playerModel = await loader.loadAsync('build/assets/boxman.glb');
var player = globalThis.player = new Character(playerModel);
world.add(player);
playerModel.animations.forEach(a => {
    if (a.name === "Idle") a.name = CAnims.idle;
    if (a.name === "Run") a.name = CAnims.run;
});

document.addEventListener('mousedown', (event) => {
    if (event.button === 0) {
        shootPistol();
    }
});

addMethodListener(player, "inputReceiverInit", function () {
    world.cameraOperator.setRadius(1.6)
});
player.takeControl();

var pistolModel = globalThis.pistolModel = await loader.loadAsync("build/assets/pistol.glb");



pistolModel.scene.position.copy({ "x": 0, "y": 14.86, "z": -1.93 });
world.graphicsWorld.add(pistolModel.scene);

var object = globalThis.object = pistolModel.scene.getObjectByName("Object_2");
pistol.position.set(0.1, -0.1, 0.1);
pistol.rotation.set(0, Math.PI / 2, 0);

var playerRightHand = globalThis.playerRightHand = player.getObjectByName("rhand");
playerRightHand.addWithPreservedScale(pistol);

expose(pistol);
world.startRenderAndUpdatePhysics?.();

addMethodListener(world, "update", function (timeStep) {
    //world update here
});

var azombie7Model = globalThis.azombie7Model = await new Promise((resolve, reject) => { 
    new GLTFLoader().load("zombie (7).glb", 
        gltf => {
            gltf.animations.forEach(a => {
                if (a.name === "Idle") a.name = CAnims.idle;
                if (a.name === "Walk1_InPlace") a.name = CAnims.walk;
                if (a.name === "Walk_InPlace") a.name = CAnims.walk;
                if (a.name === "Run_InPlace") a.name = CAnims.run;
                if (a.name === "Attack") a.name = CAnims.attack;
                if (a.name === "FallingBack") a.name = CAnims.falling;
                if (a.name === "FallingForward") a.name = CAnims.falling;
                if (a.name === "Walk") a.name = CAnims.walk;
                if (a.name === "Run") a.name = CAnims.run;
                if (a.name === "Walk1") a.name = CAnims.walk;
            });
            resolve(gltf);
        });
});

var azombie7 = globalThis.azombie7 = new Character(azombie7Model);
azombie7.lhand = azombie7Model.scene.getObjectByName("Base_HumanLArmPalm_036");
azombie7.rhand = azombie7Model.scene.getObjectByName("Base_HumanRArmPalm_018");

azombie7.setPosition(-1.44, 14.61, 3.9);
world.add(azombie7);

azombie7.setBehaviour(new FollowTarget(player));

// Pistol shooting function
async function shootPistol() {
    var bulletModel = globalThis.bulletModel = await loader.loadAsync('build/assets/bullet.glb');
    AutoScale({ gltfScene: bulletModel.scene, approximateScaleInMeters: 0.1 });
    var bullet = globalThis.bullet = new BaseObject(bulletModel.scene);    
    bullet.setPosition(pistol.getWorldPosition().clone());
    var force = globalThis.force = 100;
    var direction = globalThis.direction = player.getWorldDirection().clone().multiplyScalar(force);
    bullet.body.applyImpulse(Utils.cannonVector(direction), Utils.cannonVector(bullet.position));
    world.add(bullet);

    // Check for collisions with the zombie
    bullet.body.addEventListener('collide', (event) => {
        var otherBody = globalThis.otherBody = event.body;
        if (otherBody === azombie7.characterCapsule.body) {
            // Zombie hit, do damage or kill
            console.log('Zombie hit!');
            azombie7.removeFromWorld(world);
        }
    });

    // Remove the bullet after a certain time
    setTimeout(() => {
        world.remove(bullet);
    }, 5000);
};