export {};









// #region Global Variables
const world = new World();
let player: Player;
// #endregion



// IMPORTANT: Always use function AutoScaleInMeters(model: any, approximateSizeInMeters: number) to scale the model
// IMPORTANT: Always use function expose(variable: any, name: string) to expose the parameters to GUI
// IMPORTANT: Assign animation names like this: animationsMapping.idle = Idle animation name from glb etc...

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


class RocketLauncher extends BaseObject {
    constructor(model: THREE.Group, public shootDelay: number = 1000, public lastShootTime: number = 0) {
        super(model, 0.1);
    }

    public shoot(): void {
        if (Date.now() - this.lastShootTime > this.shootDelay) {
            this.lastShootTime = Date.now();
            this.shootBullet();
        }
    }

    shootBullet(): void {
        const bullet = new Bullet(this.parent);
        bullet.position.copy(this.getWorldPosition(new THREE.Vector3()));
        const direction = this.getWorldDirection(new THREE.Vector3()).normalize()
        bullet.direction.copy(direction);
        world.add(bullet);
        bullet.velocity = bullet.direction;
    }
}


class Bullet extends THREE.Object3D {
    direction: THREE.Vector3 = new THREE.Vector3();
    raycaster: THREE.Raycaster = new THREE.Raycaster();
    maxDistance: number = 100;    
    distanceTraveled: number = 0;
    velocity: THREE.Vector3 = new THREE.Vector3();
    shooter: THREE.Object3D;
    explodeTimer: number = 0;
    speed: number = 20;

    constructor(shooter: THREE.Object3D) {
        super();
        this.shooter = shooter;
        const bulletGeometry = new THREE.SphereGeometry(0.1);
        const bulletMaterial = new THREE.MeshBasicMaterial({ color: 'red' });
        const bulletMesh = new THREE.Mesh(bulletGeometry, bulletMaterial);
        this.add(bulletMesh);
    }

    update(timeStep: number) {
        const oldPosition = this.position.clone();
        this.position.add(this.velocity.clone().multiplyScalar(timeStep*this.speed));

        const distanceThisFrame = oldPosition.distanceTo(this.position);
        this.distanceTraveled += distanceThisFrame;

        if (this.distanceTraveled >= this.maxDistance) {
            world.remove(this);
            return;
        }

        this.explodeTimer += timeStep;
        if (this.explodeTimer > 2) {
            this.explode();
            world.remove(this);
            return;
        }

        this.raycaster.set(oldPosition, this.direction.normalize());
        const intersects = this.raycaster.intersectObjects(world.graphicsWorld.children, true);

        for (const intersect of intersects) {
            if (intersect.distance < distanceThisFrame && !this.isPartOfShooter(intersect.object)) {
                this.explode();
                world.remove(this);
                return;
            }
        }
    }

    isPartOfShooter(object: THREE.Object3D): boolean {
        let current = object;
        while (current) {
            if (current === this.shooter) {
                return true;
            }
            current = current.parent;
        }
        return false;
    }

    handleCollision(object: THREE.Object3D) {
        console.log("Hit object:", object);
        world.remove(this);
    }

    explode(): void {
        console.log("explode");
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0xff5500, transparent: true, opacity: 0.8 });
        const explosion = new THREE.Mesh(geometry, material);
        explosion.position.copy(this.position);
        world.graphicsWorld.add(explosion);

        const animateDuration = 500;

        new TWEEN.Tween(explosion.scale)
            .to({ x: 4, y: 4, z: 4 }, animateDuration)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(() => {
                explosion.material.opacity = 0.8 * (1 - (explosion.scale.x / 4));
            })
            .onComplete(() => {
                world.graphicsWorld.remove(explosion);
            })
            .start();
    }
}


main();
async function main() {
    await world.initialize('build/assets/world.glb');
    // #region Player Setup
    const playerModel = await loadAsync('build/assets/boxman.glb');
    expose(playerModel.scene, "player");
    AutoScaleInMeters(playerModel.scene, 1.7);
    player = new Player(playerModel);
    expose(player.moveSpeed, "player speed");
    player.setPosition(0, 0, -5);
    world.add(player);
    player.takeControl();
    // #endregion Player Setup

    // #region  Car Setup
    let acarModel = await new GLTFLoader().loadAsync("build/assets/car.glb");
    AutoScaleInMeters(acarModel.scene, 5);
    let acar = new MyCar(acarModel);
    world.add(acar);
    acar.setPosition(0.57, -0.53, -3.45);
    addMethodListener(acar, acar.handleMouseButton, (event: MouseEvent, code: string, pressed: boolean) => {
        if (event.button === 0 && pressed) { // Check for left mouse button
            rocketLauncher.shoot();
        }
    });
    // #endregion Car Setup

    // #region Rocket Launcher Setup
    const rocketLauncherModel = await loadAsync('build/assets/rocketlauncher.glb');
    expose(rocketLauncherModel.scene, "carRocketLauncher");
    AutoScaleInMeters(rocketLauncherModel.scene, 0.5);
    const rocketLauncher = new RocketLauncher(rocketLauncherModel.scene);
    // Add rocket launcher to car rooftop
    rocketLauncher.setPosition(0, 0.9, 0.1); // Adjust position on rooftop 
    //world.add(rocketLauncher);
    //rocketLauncher.updateWorldMatrix(true,true);
    acar.add(rocketLauncher);
    
    // #endregion Rocket Launcher Setup
}
