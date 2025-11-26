import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Car } from './Car';
export declare class MyCar extends Car {
    constructor(gltf: GLTF);
    readVehicleData(gltf: GLTF): boolean;
    private initCar;
}
