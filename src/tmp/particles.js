Object.assign(globalThis, THREE.QUARKS);
Object.assign(globalThis, THREE);
const clock = new THREE.Clock();
const batchSystem = new BatchedRenderer();
const texture = new TextureLoader().load("atlas.png");
// Particle system configuration
const muzzle = {
    duration: 1,
    looping: true,  // Changed to true to keep emitting particles
    startLife: new IntervalValue(0.1, 0.2),
    startSpeed: new ConstantValue(0),
    startSize: new IntervalValue(1, 5),
    startColor: new ConstantColor(new THREE.Vector4(1, 1, 1, 1)),
    worldSpace: false,

    maxParticle: 50,  // Increased max particles
    emissionOverTime: new ConstantValue(10),  // Continuous emission
    emissionBursts: [{
        time: 0,
        count: new ConstantValue(10),  // Increased initial burst
        cycle: 1,
        interval: 0.01,
        probability: 1,
    }],

    shape: new PointEmitter(),
    material: new MeshBasicMaterial({map: texture, blending: AdditiveBlending, transparent: true}),
    startTileIndex: new ConstantValue(91),
    uTileCount: 10,
    vTileCount: 10,
    renderOrder: 2,
    renderMode: RenderMode.Mesh
};

// Create particle system based on your configuration
const muzzle1 = new ParticleSystem(muzzle);  // Changed to const
// developers can customize how the particle system works by 
// using existing behavior or adding their own Behavior.
muzzle1.addBehavior(new ColorOverLife(new ColorRange(new THREE.Vector4(1, 0.3882312, 0.125, 1), new THREE.Vector4(1, 0.826827, 0.3014706, 1))));
muzzle1.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.95, 0.75, 0), 0]])));
// texture atlas animation
muzzle1.addBehavior(new FrameOverLife(new PiecewiseBezier([[new Bezier(91, 94, 97, 100), 0]])));
muzzle1.emitter.name = 'muzzle1';
muzzle1.emitter.position.x = 1;

batchSystem.addSystem(muzzle1);
// Create and setup Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Position camera
camera.position.z = 5;

// Add emitter to the scene
scene.add(muzzle1.emitter);
scene.add(batchSystem);

// Create a cube and add it to the scene
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Create OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    batchSystem.update(delta);
    
    muzzle1.update(delta);  // Added this line to update the particle system
    
    controls.update();
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});