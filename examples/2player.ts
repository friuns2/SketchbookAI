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
    AutoScaleInMeters(playerModel.scene, 1.7);
    

    const player = new Player(playerModel.scene);        
    player.setPosition(0, 0, -5);
    world.add(player);
    const player2 = new Player(playerModel.scene);        
    player2.setPosition(0, 0, -6);
    world.add(player2);

    // Set custom keys for player2
    player2.actions.up.eventCodes = ['ArrowUp'];
    player2.actions.down.eventCodes = ['ArrowDown'];
    player2.actions.left.eventCodes = ['ArrowLeft'];
    player2.actions.right.eventCodes = ['ArrowRight'];
    player2.actions.run.eventCodes = ['ShiftRight'];
    player2.actions.jump.eventCodes = ['Enter'];
    player2.actions.enter.eventCodes = ['Backspace'];

    world.inputManager.setInputReceivers(player, player2);
    addMethodListener(world, "update", () => {
        TWEEN.update();
    });
    let farthestPlayerWeightLerp=.5;
    addMethodListener(world.cameraOperator, "update", () => {
        world.cameraOperator.followMode = true;
        const player1Position = new THREE.Vector3();
        const player2Position = new THREE.Vector3();

        if (player.controlledObject) {
            ((player.controlledObject as unknown) as THREE.Object3D).getWorldPosition(player1Position);
        } else {
            player.getWorldPosition(player1Position);
        }

        if (player2.controlledObject) {
            ((player2.controlledObject as unknown) as THREE.Object3D).getWorldPosition(player2Position);
        } else {
            player2.getWorldPosition(player2Position);
        }

        const cameraPosition = world.cameraOperator.camera.position;
        let farthestPlayerWeight = player1Position.distanceTo(cameraPosition) > player2Position.distanceTo(cameraPosition) 
            ? 0.7 
            : 0.3;

        farthestPlayerWeightLerp += (farthestPlayerWeight - farthestPlayerWeightLerp) * 0.1;

        const cameraTarget = new THREE.Vector3();
        cameraTarget.lerpVectors(player1Position, player2Position, farthestPlayerWeightLerp);
        cameraTarget.y += 2;
        world.cameraOperator.target.copy(cameraTarget);

        const distanceBetweenPlayers = player1Position.distanceTo(player2Position);

        const minDistance = 5;
        const maxDistance = 15;
        const newDistance = Math.min(Math.max(distanceBetweenPlayers * 1.5, minDistance), maxDistance);

        world.cameraOperator.setRadius(newDistance, true);
    }, true);

    
}
//#endregion

main();