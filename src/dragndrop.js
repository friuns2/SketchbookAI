(() => {

    document.body.addEventListener('dragover', (e) => {
        e.preventDefault();
        document.body.style.background = '#e1e1e1';
    });

    document.body.addEventListener('dragleave', () => {
        document.body.style.background = '';
    });

    document.body.addEventListener('drop', (e) => {
        e.preventDefault();
        document.body.style.background = '';
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.glb')) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const arrayBuffer = event.target.result;
                const fileName = file.name;


                navigator.serviceWorker.controller.postMessage({
                    action: 'uploadFiles',
                    files: [{ name: fileName, buffer: arrayBuffer }]
                });

                // Wait a bit for the service worker to process the file
                await new Promise(resolve => setTimeout(resolve, 100));

                const raycaster = new THREE.Raycaster();
                raycaster.setFromCamera(mouse, world.camera);
                const intersects = raycaster.intersectObjects(world.graphicsWorld.children, true);
                const intersectionPoint = intersects[0].point;
                Eval(chat.params.code, 'var model = await loadModel({ glbUrl: "' + fileName + '", pos: ' + JSON.stringify(intersectionPoint) + ' })');
                

            };
            reader.readAsArrayBuffer(file);
        } else if (file && file.name.endsWith('.js')) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {

                    await EvalWithDebug(chat.params.code, event.target.result);
                } catch (error) {
                    chat.lastError = error.message;
                }
            };
            reader.readAsText(file);
        } else if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => applyImageTexture(event.target.result);
            reader.readAsDataURL(file);
        } else {
            alert('Please drop a valid GLB, JS, or image file.');
        }
    });
    var mouse = new THREE.Vector2();

    // Update mouse position
    window.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });



    var applyImageTexture = (imageUrl) => {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, world.camera);
        const intersects = raycaster.intersectObjects(world.graphicsWorld.children, true);

        if (intersects.length > 0) {
            const intersectedObject = intersects[0].object;

            // Load the image as a texture
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(imageUrl, (texture) => {
                // Make the texture repeating
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(2, 2); // Adjust these values to control the repetition

                // Create a new material with the loaded texture
                const material = new THREE.MeshStandardMaterial({ map: texture });

                // Apply the new material to the intersected object
                intersectedObject.material = material;
            });
        } else {
            console.log("No object intersected for texture application");
        }
    };

    
})();