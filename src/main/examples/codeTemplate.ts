export {};

// IMPORTANT: Always use function AutoScaleInMeters(model: any, approximateSizeInMeters: number) to scale the model
// IMPORTANT: Always expose adjustable parameters to world.gui
// IMPORTANT: Assign animation names like this: animationsMapping.idle = Idle animation name from glb etc...
// Remember to use getWorldPosition instead of position for THREE.Object3D

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

    const player = new Player(playerModel.scene);    
    world.gui.add(player, "moveSpeed").name("Player Speed").min(0).max(10).step(0.1);
    player.setPosition(0, 0, -5);
    world.add(player);

    player.takeControl();
}
//#endregion

main();