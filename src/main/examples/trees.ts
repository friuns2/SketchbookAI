export {};

// IMPORTANT: Always use function AutoScaleInMeters(model: any, approximateSizeInMeters: number) to scale the model
// IMPORTANT: Always exoise  expose(variable: any, name: string) to expose the parameters to GUI
// IMPORTANT: Assign animation names like this: animationsMapping.idle = Idle animation name from glb etc...

//#region Player Class
class Player extends Character {
    // put player code here
    update(timeStep: number): void {
        super.update(timeStep);
    }

    inputReceiverUpdate(deltaTime: number): void {
        super.inputReceiverUpdate(deltaTime);
    }
}
//#endregion

//#region Main Function
async function main() {
    const world = new World();
    await world.initialize('build/assets/world.glb');

    const textPrompt: HTMLDivElement = document.createElement('div');
    textPrompt.style.cssText = "position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);";
    document.body.appendChild(textPrompt);

    const playerModel = await loadAsync('build/assets/boxman.glb');
    expose(playerModel.scene, "player");
    AutoScaleInMeters(playerModel.scene, 1.7);
    addMethodListener(world, "update", () => {
        TWEEN.update();
    });

    const player = new Player(playerModel);
    world.gui.add(player, "moveSpeed").name("Player Speed").min(0).max(10).step(0.1);
    player.setPosition(0, 0, -5);
    world.add(player);

    player.takeControl();

    const treeModel = await loadAsync('build/assets/tree.glb');

    const numTrees = 10;
    
    let treeSizeControl = world.gui.add({treeSize: 1}, 'treeSize', 0.1, 10).name("Tree Size").step(.1);

    for (let i = 0; i < numTrees; i++) {

        const randomX = Math.random() * 50 - 25;
        const randomZ = Math.random() * 50 - 25;
        const randomScale = Math.random() + 0.5;
        

        const treeClone = treeModel.scene.clone();
        AutoScaleInMeters(treeClone, treeSizeControl.getValue());

        let tree = new BaseObject(treeClone, 0, 'none', CANNON.Body.STATIC);
        treeSizeControl.onChange(function (value: number) {
            tree.scale.setScalar(randomScale * value);
        });
        
        tree.scale.setScalar(randomScale * treeSizeControl.getValue());
        tree.setPosition(randomX, 0, randomZ);
        world.add(tree);
    }


}
//#endregion

main();