import * as CANNON from 'cannon-es';
import { Vehicle } from './Vehicle';
import { IControllable } from '../interfaces/IControllable';
import { EntityType } from '../enums/EntityType';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
export declare class Car extends Vehicle implements IControllable {
    entityType: EntityType;
    drive: string;
    get speed(): number;
    private _speed;
    private steeringWheel;
    private airSpinTimer;
    private steeringSimulator;
    private gear;
    private shiftTimer;
    private timeToShift;
    private canTiltForwards;
    private characterWantsToExit;
    constructor(gltf: GLTF);
    noDirectionPressed(): boolean;
    update(timeStep: number): void;
    shiftUp(): void;
    shiftDown(): void;
    physicsPreStep(body: CANNON.Body, car: Car): void;
    onInputChange(): void;
    inputReceiverInit(): void;
    readCarData(gltf: GLTF): void;
}
