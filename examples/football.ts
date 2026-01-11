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
    addMethodListener(world, "update", () => {
        TWEEN.update();
    });

    const player = new Player(playerModel.scene);
    world.gui.add(player, "moveSpeed").name("Player Speed").min(0).max(10).step(0.1);
    player.setPosition(0, 0, -5);
    world.add(player);

    player.takeControl();
    //#region Ball
    const ballModel = await loadAsync('build/assets/ball.glb');
    AutoScaleInMeters(ballModel.scene, 1);
    const ball = new BaseObject(ballModel.scene, 1, 'sphere', CANNON.Body.DYNAMIC);
    ball.setPosition(5, 1, 0);
    world.add(ball);
    //#endregion

    //#region Goal
    const goalModel = await loadAsync('build/assets/goal.glb');
    AutoScaleInMeters(goalModel.scene, 5);
    const goal = new BaseObject(goalModel.scene, 0, 'none', CANNON.Body.STATIC);
    goal.setPosition(-5, 0, 0);
    world.add(goal);
    //#endregion

    //#region NPC
    const npcModel = await loadAsync('build/assets/boxman.glb'); // Use the same model as the player for simplicity
    const npc = new Character(npcModel.scene);
    npc.setPosition(0, 0, 5);
    world.add(npc);
    
    // Custom behavior for the NPC to push the ball towards the goal
    npc.setBehaviour(new class implements ICharacterAI {
        character: Character;
        isTargetReached: boolean;
        target: THREE.Object3D;
        goalPosition: THREE.Vector3;
        pushing: boolean = false;

        constructor(target: THREE.Object3D, goal: THREE.Object3D) {
            this.target = target;
            this.goalPosition = new THREE.Vector3().copy(goal.position);
        }

        update(timeStep: number): void {
            const ballPosition = new THREE.Vector3();
            this.target.getWorldPosition(ballPosition);
            const npcPosition = new THREE.Vector3();
            this.character.getWorldPosition(npcPosition);
            
            const directionToGoal = new THREE.Vector3().subVectors(this.goalPosition, ballPosition).normalize();
            const directionToBall = new THREE.Vector3().subVectors(ballPosition, npcPosition).normalize();
            
            const distanceToBall = npcPosition.distanceTo(ballPosition);

            // Determine if the NPC should start pushing
            if (distanceToBall <= 2 && directionToGoal.dot(directionToBall) > 0.8) {  // If NPC is close to the ball and facing the goal
                this.pushing = true;
            } else {
                this.pushing = false;
            }

            if (this.pushing) {
                // Move towards the ball to push it
                this.character.setViewVector(directionToGoal);
                this.character.triggerAction('up', true);
            } else {
                // Circle around the ball itself, not an offset
                const circleRadius = 2;
                const angleToBall = Math.atan2(
                    ballPosition.z - npcPosition.z,
                    ballPosition.x - npcPosition.x
                ) + Math.PI / 2;
                const targetCirclePosition = new THREE.Vector3(
                    ballPosition.x + circleRadius * Math.cos(angleToBall),
                    ballPosition.y,
                    ballPosition.z + circleRadius * Math.sin(angleToBall)
                );
                
                this.character.setViewVector(targetCirclePosition.clone().sub(npcPosition).setY(0));            
                this.character.triggerAction('up', true);
            }
        }
    }(ball, goal)); 
    //#endregion

}
//#endregion

main(); 