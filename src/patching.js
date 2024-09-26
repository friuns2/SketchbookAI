

var defaultMaterial = new CANNON.Material('defaultMaterial');
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
function PatchClone() {
    THREE.Object3D.prototype.clone = (function (originalClone) {
        return function () {

            let oldClone = this.clone;
            this.clone = originalClone;
            let clone = SkeletonUtils.clone(this);
            if (this.userData.isGLTF) {
                let folder;
                let originalSize = clone.scale.length();
               
                if (!gui.__folders[clone.name]) {
                    clone.size = 1;
                    folder = gui.addFolder(clone.name);
                    folder.visible = folder.add(clone, 'visible').name('Visible');
                    folder.size = folder.add(clone, 'size').min(0.001).step(0.001).name('Size');
                    folder.posx = folder.add(clone.position, 'x', -10, 10).name('X Offset').step(0.01);
                    folder.posy = folder.add(clone.position, 'y', -10, 10).name('Y Offset').step(0.01);
                    folder.posz = folder.add(clone.position, 'z', -10, 10).name('Z Offset').step(0.01);
                    folder.rotx = folder.add(clone.rotation, 'x', -Math.PI, Math.PI).name('X Rotation').step(0.01);
                    folder.roty = folder.add(clone.rotation, 'y', -Math.PI, Math.PI).name('Y Rotation').step(0.01);
                    
                    // Add button to replace GLB model
                    folder.add({
                        replaceModel: () => {
                            const fileName = clone.userData.filePath.split('/').pop().split('.')[0];
                            picker.openModelPicker(fileName, async (downloadUrl) => {
                                const response = await fetch(downloadUrl);
                                const arrayBuffer = await response.arrayBuffer();
                                navigator.serviceWorker.controller.postMessage({
                                    action: 'uploadFiles',
                                    files: [{ name: clone.userData.filePath, buffer: arrayBuffer }]
                                });
                                gltfCache.delete(clone.userData.filePath);
                                THREE.Cache.remove(clone.userData.filePath);
                                await new Promise(resolve => setTimeout(resolve, 100));                                
                                chat.switchVariant(chat.currentVariant);
                            });
                        }
                    }, 'replaceModel').name('Replace Model');
                } else {
                    folder = gui.__folders[clone.name];
                }

                // Load values from localStorage
                const storedVisible = localStorage.getItem(`${clone.name}_visible`);
                if (storedVisible !== null) {
                    clone.visible = storedVisible === 'true';
                }
                const storedSize = localStorage.getItem(`${clone.name}_size`);
                if (storedSize !== null) {
                    clone.size = parseFloat(storedSize);
                    clone.scale.setScalar(originalSize * clone.size);
                }
                const storedPosX = localStorage.getItem(`${clone.name}_posx`);
                if (storedPosX !== null) {
                    clone.position.x = parseFloat(storedPosX);
                }
                const storedPosY = localStorage.getItem(`${clone.name}_posy`);
                if (storedPosY !== null) {
                    clone.position.y = parseFloat(storedPosY);
                }
                const storedPosZ = localStorage.getItem(`${clone.name}_posz`);
                if (storedPosZ !== null) {
                    clone.position.z = parseFloat(storedPosZ);
                }
                const storedRotX = localStorage.getItem(`${clone.name}_rotx`);
                if (storedRotX !== null) {
                    clone.rotation.x = parseFloat(storedRotX);
                }
                const storedRotY = localStorage.getItem(`${clone.name}_roty`);
                if (storedRotY !== null) {
                    clone.rotation.y = parseFloat(storedRotY);
                }

                folder.visible.onChange((value) => {
                    clone.visible = value;
                    localStorage.setItem(`${clone.name}_visible`, value);
                });
                folder.size.onChange((value) => {
                    clone.scale.setScalar(originalSize * value);
                    localStorage.setItem(`${clone.name}_size`, value);
                });
                folder.posx.onChange((value) => {
                    clone.position.x = value;
                    localStorage.setItem(`${clone.name}_posx`, value);
                });
                folder.posy.onChange((value) => {
                    clone.position.y = value;
                    localStorage.setItem(`${clone.name}_posy`, value);
                });
                folder.posz.onChange((value) => {
                    clone.position.z = value;
                    localStorage.setItem(`${clone.name}_posz`, value);
                });
                folder.rotx.onChange((value) => {
                    clone.rotation.x = value;
                    localStorage.setItem(`${clone.name}_rotx`, value);
                });
                folder.roty.onChange((value) => {
                    clone.rotation.y = value;
                    localStorage.setItem(`${clone.name}_roty`, value);
                });
            }

            this.clone = clone.clone = oldClone;
            return clone;
        };
    })(THREE.Object3D.prototype.clone);
}
CANNON.Body.prototype.addEventListener = (function(originalAddEventListener) {
    return function(type, listener) {
        let animationFrameId;
        originalAddEventListener.call(this, type, ()=>{
            cancelAnimationFrame(animationFrameId);
            animationFrameId = requestAnimationFrame(() => {
                listener.apply(this, arguments);
            });
        });
        
    };
})(CANNON.Body.prototype.addEventListener);

class GLTFMaterialsPbrSpecularGlossinessExtension {
    constructor(parser) {
        this.parser = parser;
        this.name = 'KHR_materials_pbrSpecularGlossiness';
    }

    extendMaterialParams(materialIndex, materialParams) {
        const parser = this.parser;
        const materialDef = parser.json.materials[materialIndex];

        if (!materialDef.extensions || !materialDef.extensions[this.name]) {
            return Promise.resolve();
        }

        const pbrSpecularGlossiness = materialDef.extensions[this.name];

        materialParams.color = new THREE.Color(1, 1, 1);
        materialParams.opacity = (pbrSpecularGlossiness.diffuseFactor !== undefined) ? pbrSpecularGlossiness.diffuseFactor[3] : 1.0;

        materialParams.roughness = 1.0 - (pbrSpecularGlossiness.glossinessFactor !== undefined ? pbrSpecularGlossiness.glossinessFactor : 1.0);
        materialParams.metalness = 0.0;

        return Promise.all([
            pbrSpecularGlossiness.diffuseTexture !== undefined ?
                parser.assignTexture(materialParams, 'map', pbrSpecularGlossiness.diffuseTexture) :
                Promise.resolve(),
            pbrSpecularGlossiness.specularGlossinessTexture !== undefined ?
                parser.assignTexture(materialParams, 'glossinessMap', pbrSpecularGlossiness.specularGlossinessTexture) :
                Promise.resolve()
        ]);
    }
}



const gltfCache = new Map();
(function GLTFLoader_LoadCache() {
    const originalLoad = GLTFLoader.prototype.load;
    THREE.Cache.enabled=true;
    
    
    GLTFLoader.prototype.load = function (url, onLoad, onProgress, onError) {
        if(!this.registered)
        {
            this.registered=true;
            this.register(parser => new GLTFMaterialsPbrSpecularGlossinessExtension(parser));
        }

        if (gltfCache.has(url)) {
            const gltf = gltfCache.get(url);
            if (onLoad) onLoad(Utils.cloneGltf(gltf));
            return;
        }

        originalLoad.call(this, url,
            (gltf) => {
                gltf.scene.name = url;
                gltf.userData.isGLTF = true;
                gltf.userData.filePath = url;
                gltfCache.set(url, gltf);
                if (onLoad) onLoad(Utils.cloneGltf(gltf));
            },
            onProgress,
            onError
        );
    };
})();

var glbFiles = {};

(function GLTFLoader_LoadNotFound() {
    const originalLoad = GLTFLoader.prototype.load;
    GLTFLoader.prototype.load = function (url, onLoad, onProgress, onError) {
        originalLoad.call(this, url, (gltf) => {

          //  const animations = gltf.animations?.length>0 ? `\nAnimation names:`+gltf.animations.map(animation => animation.name).join(', ') : '';
            let content = 
                GetSpawnGLBCode(gltf,url);
                //Object3DToHierarchy(gltf) + (animations || '');

            if (!/(airplane|boxman|car|heli|world|airplane|notfound)\.glb/.test(url))
                glbFiles[url] = { name: url, content: content };
            // Enable shadows for the loaded model
            gltf.scene.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
            // Call the original onLoad with the modified gltf
            if (onLoad) onLoad(gltf);

        }, onProgress, (error) => {            
            
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