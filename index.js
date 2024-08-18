Object.assign(globalThis, Sketchbook);
const world = new World('build/assets/world.glb');
        
world.loadingManager.loadGLTF('build/assets/boxman.glb', (model) =>
{
    let player = new Character(model);
    
    let worldPos = new THREE.Vector3();
    
    player.setPosition(worldPos.x, worldPos.y, worldPos.z);
    
//	let forward = Utils.getForward(this.object);
    //player.setOrientation(forward, true);
    
    world.add(player);
    player.takeControl();

document.addEventListener('click', () => {
    let player = world.characters[0];
    // Load the Soldier model
    new GLTFLoader().load('https://stabilityai-stable-fast-3d.hf.space/file=/tmp/gradio/04a7cf6cfac4ad7d71902609cb64582147b696ce/tmpyuyd4xq_.glb', (gltf) => {
        let soldier = gltf.scene;
      //  soldier.scale.set(0.1, 0.1, 0.1); // Scale down the soldier model

        let boxCollider = new BoxCollider({
            mass: 1,
            position: new THREE.Vector3(player.position.x, player.position.y, player.position.z),
            size: new THREE.Vector3(0.1, 0.1, 0.1),
            friction: 0.3
        });

        soldier.position.copy(boxCollider.body.position);
        world.graphicsWorld.add(soldier);
        world.physicsWorld.add(boxCollider.body);

        // Update the soldier's position in the render loop
        world.registerUpdatable({
            updateOrder: 0,
            update: (timestep) => {
                soldier.position.copy(Utils.threeVector(boxCollider.body.position));
                soldier.quaternion.copy(Utils.threeQuat(boxCollider.body.quaternion));
            }
        });
    });
});







});

