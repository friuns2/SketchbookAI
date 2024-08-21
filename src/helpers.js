function loadModel({ glbUrl, pos }) {
    return new Promise((resolve, reject) => {
        new GLTFLoader().load(
            glbUrl,
            (gltf) => {
                gltf.scene.position.copy(pos);
                world.graphicsWorld.add(gltf.scene);
                resolve(gltf);
            },
            undefined,
            (error) => {
                console.error('Error loading model:', error);
                reject(error);
            }
        );
    });
}
function extendMethod(object, methodName, extension) {
    const originalMethod = object[methodName];
    object[methodName] = function(...args) {
        const result = originalMethod.apply(this, args);
        extension.apply(this, args);
        return result;
    };
}

