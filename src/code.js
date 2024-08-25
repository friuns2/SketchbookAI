

globalThis.world = new World('build/assets/world.glb');
await world.initialize();

GLTFLoader.prototype.loadAsync = async function (glbUrl) {
    return new Promise((resolve, reject) => {
        this.load(glbUrl, (gltf) => {
            AutoScale(gltf, 5);
            resolve(gltf);
        }, undefined, reject);
    });
};



let loader = new GLTFLoader();


let playerModel = await loader.loadAsync('build/assets/boxman.glb');
playerModel.animations.forEach(a => {
    if (a.name === "Idle") a.name = CAnims.idle;
    if (a.name === "Run") a.name = CAnims.run;
});

let player = new Character(playerModel);
player.setPosition(-2.82, 14.8, -2.88);
world.add(player);
player.takeControl();




let carModel = await loader.loadAsync('build/assets/car.glb');
carModel.initCar = function () {
    let car = this;
    car.setPosition(-2.37, 14.86, -4.03);

    // Set up seats
    car.seats = [
        new VehicleSeat(car, carModel.scene.getObjectByName('seat_1'), carModel),
        new VehicleSeat(car, carModel.scene.getObjectByName('seat_2'), carModel),
        new VehicleSeat(car, carModel.scene.getObjectByName('seat_3'), carModel),
        new VehicleSeat(car, carModel.scene.getObjectByName('seat_4'), carModel)
    ];

    // Connect seats
    car.seats[0].connectedSeats = [car.seats[1]];
    car.seats[1].connectedSeats = [car.seats[0]];
    car.seats[2].connectedSeats = [car.seats[3]];
    car.seats[3].connectedSeats = [car.seats[2]];

    // Set up wheels
    car.wheels = [
        new Wheel(carModel.scene.getObjectByName('wheel_fl')),
        new Wheel(carModel.scene.getObjectByName('wheel_fr')),
        new Wheel(carModel.scene.getObjectByName('Cylinder001')),
        new Wheel(carModel.scene.getObjectByName('wheel'))
    ];

    // Set wheel properties
    car.wheels[0].steering = true;
    car.wheels[0].drive = 'fwd';
    car.wheels[1].steering = true;
    car.wheels[1].drive = 'fwd';
    car.wheels[2].drive = 'rwd';
    car.wheels[3].drive = 'rwd';

    // Set up camera
    car.camera = car.getObjectByName('Empty');

    // Set up collision
    const bodyShape = new CANNON.Box(new CANNON.Vec3(.5, 0.2, 1));
    bodyShape.collisionFilterMask = ~CollisionGroups.TrimeshColliders;
    car.collision.addShape(bodyShape);

    const sphereShape = new CANNON.Sphere(0.5);
    sphereShape.collisionFilterGroup = CollisionGroups.TrimeshColliders;
    car.collision.addShape(sphereShape, new CANNON.Vec3(0, 0, 1.5));

    // Set up materials
    car.traverse((child) => {
        if (child.isMesh) {
            Utils.setupMeshProperties(child);

            if (child.material !== undefined) {
                car.materials.push(child.material);
            }
        }
    });
}
let car = new Car(carModel);

world.add(car);