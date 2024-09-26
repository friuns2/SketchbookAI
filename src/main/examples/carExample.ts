export { };



// IMPORTANT: Always use function AutoScaleInMeters(model: any, approximateSizeInMeters: number) to scale the model
// IMPORTANT: Always use function expose(variable: any, name: string) to expose the parameters to GUI
// IMPORTANT: Assign animation names like this: animationsMapping.idle = Idle animation name from glb etc...

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

class Player extends Character {
    // put player code here
    update(timeStep: number): void {
        super.update(timeStep);
    }

    inputReceiverUpdate(deltaTime: number): void {
        super.inputReceiverUpdate(deltaTime);
    }
}

const player = new Player(playerModel);
expose(player.moveSpeed, "player speed");
player.setPosition(0, 0, -5);
world.add(player);

player.takeControl();
    

let acarModel = await new GLTFLoader().loadAsync("build/assets/car2.glb");
AutoScaleInMeters(acarModel.scene, 5);
let acar = new MyCar(acarModel);
world.add(acar);
acar.setPosition(0.57, -0.53, -3.45);