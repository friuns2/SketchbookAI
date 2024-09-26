export {};

// IMPORTANT: Always use function AutoScaleInMeters(model: any, approximateSizeInMeters: number) to scale the model
// IMPORTANT: Always use function expose(variable: any, name: string) to expose the parameters to GUI
// IMPORTANT: Assign animation names like this: animationsMapping.idle = Idle animation name from glb etc...

const world = new World();
await world.initialize('build/assets/world.glb');

// Interactable Interface
interface Interactable {
    interact(player: Player): void;
    position: THREE.Vector3;
}

const interactableObjects: Interactable[] = [];

const textPrompt: HTMLDivElement = document.createElement('div');
textPrompt.style.cssText = "position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);";
document.body.appendChild(textPrompt);

class Player extends Character {
    // put player code here
    update(timeStep: number): void {
        super.update(timeStep);
    }

    inputReceiverUpdate(deltaTime: number): void {
        super.inputReceiverUpdate(deltaTime);
        this.handleInteractions();
    }

    handleInteractions(): void {
        textPrompt.textContent = ""; // Clear previous text
        for (let a of interactableObjects) {
            const distance = this.position.distanceTo(a.position);
            if (distance < 2) {
                textPrompt.textContent = "Press E to interact"; // Show prompt
                if (this.actions.interactKey.isPressed) {
                    a.interact(this);
                    break;
                }
            }
        }
    }
}

const playerModel = await loadAsync('build/assets/boxman.glb');
expose(playerModel.scene, "player");
AutoScaleInMeters(playerModel.scene, 1.7);
const player = new Player(playerModel);
expose(player.moveSpeed, "player speed");
player.setPosition(0, 0, -5);
world.add(player);
player.takeControl();

let aalkingModel = await new GLTFLoader().loadAsync("talking.glb");

let aalking = new Character(aalkingModel);
//CRITICAL: Uncomment and assign hands immediately! Use aalkingModel hierarchy to find the correct bones
// NOTE:  I'm assuming the hands are named "mixamorigRightHand_030" and "mixamorigLeftHand_010"
aalking.rhand = aalkingModel.scene.getObjectByName("mixamorigRightHand_030");
aalking.lhand = aalkingModel.scene.getObjectByName("mixamorigLeftHand_010");

            
/* CRITICAL: Uncomment and replace "???" with correct aniamtion name!
aalking.animationsMapping.??? = "mixamo.com";
*/
aalking.animationsMapping.idle = "Idle";
aalking.animationsMapping.talking = "mixamo.com"; // Replace "Talking" with the actual animation name

world.add(aalking);

// Make aalking interactable
interactableObjects.push({
    interact: async (player: Player) => {
        // Play talking animation
        aalking.setAnimation("talking", 0, false);

        // Look at the player
        const lookDirection = new THREE.Vector3().subVectors(player.position, aalking.position).normalize();
        aalking.setOrientation(lookDirection);

        // Show dialog using Swal
        const { value: playerRequest } = await Swal.fire({
            title: 'Oh boy! Hi there, pal!',
            text: "What can I do for ya today?",
            input: 'text',
            inputPlaceholder: 'Tell Mickey what you want',
            showCancelButton: false,
            confirmButtonText: 'Tell Mickey'
        });

        if (playerRequest) {
            // Use Hugging Face Inference to generate a response
            const response = await GenerateResponse(`You are Mickey Mouse. Someone just told you: "${playerRequest}". Respond to them in Mickey's cheerful and friendly style, using his catchphrases and mannerisms.`);

            // Play talking animation again for the response
            aalking.setAnimation("talking", 0, false); 

            // Show a new dialog with the response
            await Swal.fire({
                title: `${response}`,
                text: '',
                showCancelButton: false,
                confirmButtonText: 'Thanks, Mickey!'
            });

            // Play idle animation
            aalking.setAnimation("idle", 0);
        }
        // Return to idle animation after the talking animation finishes
        aalking.mixer.addEventListener('finished', () => {
            aalking.setAnimation("idle", 0);
        });
    },
    position: aalking.position
});

addMethodListener(world, "update", () => {
    TWEEN.update();
});