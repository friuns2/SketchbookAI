(async function () {




    globalThis.world = new World();
    await world.initialize('build/assets/world.glb');

    GLTFLoader.prototype.loadAsync = async function (glbUrl) {
        return new Promise((resolve, reject) => {
            this.load(glbUrl, (gltf) => {
                AutoScale(gltf, 5);
                resolve(gltf);
            }, undefined, reject);
        });
    };



    globalThis.loader = new GLTFLoader();


    let playerModel = await loader.loadAsync('build/assets/boxman.glb');
    playerModel.animations.forEach(a => {
        if (a.name === "Idle") a.name = CAnims.idle;
        if (a.name === "Run") a.name = CAnims.run;
    });

    globalThis.player = new Character(playerModel);
    
    world.add(player);
    player.takeControl();


/*    let teslaModel = await loader.loadAsync('build/assets/tesla.glb');
    let tesla = CreateCar(teslaModel);
    tesla.setPosition(-2.83, 14.86, -4.1);
*/
})();
