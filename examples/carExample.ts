export { };


const world = new World();
await world.initialize('build/assets/world.glb');

const textPrompt: HTMLDivElement = document.createElement('div');
textPrompt.style.cssText = "position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);";
document.body.appendChild(textPrompt);

const playerModel = await loadAsync('build/assets/boxman.glb');
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
player.setPosition(0, 0, -5);
world.add(player);

player.takeControl();
    

let acarModel = await new GLTFLoader().loadAsync("build/assets/car2.glb");
AutoScaleInMeters(acarModel.scene, 5);
let acar = new MyCar(acarModel);
world.add(acar);
acar.setPosition(0.57, -0.53, -3.45);