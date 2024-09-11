let defaultMaterial = new CANNON.Material('defaultMaterial');
defaultMaterial.friction = 0.3;

// Extend CANNON.Body to include default material
CANNON.Body = (function(Body) {
    function ExtendedBody(options) {
        // Call the original constructor
        Body.call(this, options);
        
        // Set default material if not provided
        if (!this.material) {            
            this.material = defaultMaterial;
        }
    }
    
    // Inherit prototype methods
    ExtendedBody.prototype = Object.create(Body.prototype);
    ExtendedBody.prototype.constructor = ExtendedBody;

    return ExtendedBody;
})(CANNON.Body);

// Ensure prototype chain is maintained
CANNON.Body.prototype = Object.create(CANNON.Body.prototype);
CANNON.Body.prototype.constructor = CANNON.Body;


(function GLTFLoader_LoadCache() {
    const gltfCache = new Map();
    const originalLoad = GLTFLoader.prototype.load;
    
    const cloneGltf = (gltf) => ({
        ...gltf,
        animations: gltf.animations.map(a => ({ ...a })),
        original: gltf,
        scene: SkeletonUtils.SkeletonUtils.clone(gltf.scene)
    });

    GLTFLoader.prototype.load = function (url, onLoad, onProgress, onError) {
        if (gltfCache.has(url)) {
            const gltf = gltfCache.get(url);
            if (onLoad) onLoad(cloneGltf(gltf));
            return;
        }

        originalLoad.call(this, url,
            (gltf) => {
                gltfCache.set(url, gltf);
                if (onLoad) onLoad(cloneGltf(gltf));
            },
            onProgress,
            onError
        );
    };
})();

THREE.Cache.enabled=true;
var files = {};
(function GLTFLoader_LoadNotFound() {
    const originalLoad = GLTFLoader.prototype.load;
    GLTFLoader.prototype.load = function (url, onLoad, onProgress, onError) {
        originalLoad.call(this, url, (gltf) => {

          //  const animations = gltf.animations?.length>0 ? `\nAnimation names:`+gltf.animations.map(animation => animation.name).join(', ') : '';
            let content = 
                GetSpawnGLBCode(gltf,url);
                //Object3DToHierarchy(gltf) + (animations || '');

            if (!/(airplane|boxman|car|heli|world|airplane)\.glb/.test(url))
                files[url] = { name: url, content: content };
            // Call the original onLoad with the modified gltf
            if (onLoad) onLoad(gltf);

        }, onProgress, (error) => {            
            console.error(error);
            originalLoad.call(this, 'notfound.glb', onLoad, onProgress, onError);
            let variant = chat.currentVariant;
            const fileName = url.split('/').pop().split('.')[0];
            picker.openModelPicker(fileName, async (downloadUrl) => {
                const response = await fetch(downloadUrl);
                const arrayBuffer = await response.arrayBuffer();
                navigator.serviceWorker.controller.postMessage({
                    action: 'uploadFiles',
                    files: [{ name: url, buffer: arrayBuffer }]
                });
                await new Promise(resolve => setTimeout(resolve, 100));
                chat.switchVariant(variant);
            });
        });
    };
})();
/*

const originalFindByName = THREE.AnimationClip.findByName;
THREE.AnimationClip.findByName = (clipArray, name) => {
    const clip = originalFindByName(clipArray, name);
    if (clip === null && clipArray.length > 0) {
        let bestMatch = null;
        let bestScore = 0;
        for (let i = 0; i < clipArray.length; i++) {
            const score = getSimilarityScore(name, clipArray[i].name);
            if (score > bestScore && score > 0.4) {
                bestScore = score;
                bestMatch = clipArray[i];
            }
        }
        console.warn(`Animation clip "${name}" not found, returning the first clip as fallback.`);
        return bestMatch;
    }
    return clip;
};
*/