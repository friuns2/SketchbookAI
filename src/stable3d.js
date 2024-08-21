const input = document.createElement('input');
    input.type = 'text';
    document.body.appendChild(input);
    
    const downloadButton = document.createElement('button');
    downloadButton.textContent = 'Generate 3D Model';
    document.body.appendChild(downloadButton);
    
    downloadButton.addEventListener('click', async () => {
        const v = input.value || 'trump';
        input.value = '';
        const glbUrl = await GenerateGLB(v);
        if (glbUrl) loadModel({ glbUrl, pos: new THREE.Vector3(), mass: 0 });
        else console.error('Failed to generate GLB URL');
    });


async function GenerateGLB(input) {
    
    const prompt = input + ',Full-shot ,Full-length ,entire 3d model, object only, realism, Uncropped, stand alone, white background';
    const hf = new HfInference('YOUR_HUGGINGFACE_TOKEN_HERE');

    const generatedImageBlob = await hf.textToImage({
        model: 'black-forest-labs/FLUX.1-schnell',
        inputs: prompt
    });
    let hash = Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 11);

    const formData = new FormData();
    formData.append('files', generatedImageBlob, 'generated_image.png');

    let filePaths = await fetch("https://stabilityai-stable-fast-3d.hf.space/upload?upload_id=" + hash, {
        method: "POST",
        body: formData,
        headers: {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9,ru;q=0.8",
            "cache-control": "no-cache",
            "pragma": "no-cache",
            "priority": "u=1, i",
            "sec-ch-ua": "\"Not)A;Brand\";v=\"99\", \"Google Chrome\";v=\"127\", \"Chromium\";v=\"127\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin"
        },
        referrer: "https://stabilityai-stable-fast-3d.hf.space/?__theme=light",
        referrerPolicy: "strict-origin-when-cross-origin",
        mode: "cors",
        credentials: "include"
    }).then(a => a.json());



    await fetch("https://stabilityai-stable-fast-3d.hf.space/queue/join?__theme=light", {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9,ru;q=0.8",
            "cache-control": "no-cache",
            "content-type": "application/json",
            "pragma": "no-cache",
            "priority": "u=1, i",
            "sec-ch-ua": "\"Not)A;Brand\";v=\"99\", \"Google Chrome\";v=\"127\", \"Chromium\";v=\"127\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin"
        },
        "referrer": "https://stabilityai-stable-fast-3d.hf.space/?__theme=light",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": JSON.stringify({
            data: [
                "Remove Background",
                {
                    path: filePaths[0],
                    url: "https://stabilityai-stable-fast-3d.hf.space/file=" + filePaths[0],
                    orig_name: filePaths[0].split("/").pop(),
                    size: formData.get('files').size,
                    mime_type: "image/png",
                    meta: {
                        _type: "gradio.FileData"
                    }
                },
                null,
                0.85
            ],
            event_data: null,
            fn_index: 5,
            trigger_id: 10,
            session_hash: hash
        }),
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    }).then(a => a.json());

    const response = await fetch("https://stabilityai-stable-fast-3d.hf.space/queue/data?session_hash=" + hash, {
        headers: {
            "accept": "text/event-stream",
            "accept-language": "en-US,en;q=0.9,ru;q=0.8",
            "cache-control": "no-cache",
            "pragma": "no-cache",
            "priority": "u=1, i",
            "sec-ch-ua": "\"Not)A;Brand\";v=\"99\", \"Google Chrome\";v=\"127\", \"Chromium\";v=\"127\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin"
        }
    }).then(a => a.text());
    console.log(response);


    fetch("https://stabilityai-stable-fast-3d.hf.space/queue/join?__theme=light", {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9,ru;q=0.8",
            "cache-control": "no-cache",
            "content-type": "application/json",
            "pragma": "no-cache",
            "priority": "u=1, i",
            "sec-ch-ua": "\"Not)A;Brand\";v=\"99\", \"Google Chrome\";v=\"127\", \"Chromium\";v=\"127\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin"
        },
        "referrer": "https://stabilityai-stable-fast-3d.hf.space/?__theme=light",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": JSON.stringify({
            data: [
                "Run",
                {
                    path: filePaths[0],
                    url: "https://stabilityai-stable-fast-3d.hf.space/file=" + filePaths[0],
                    orig_name: filePaths[0].split("/").pop(),
                    size: formData.get('files').size,
                    mime_type: "image/png",
                    meta: { _type: "gradio.FileData" }
                },
                null,
                0.85
            ],
            event_data: null,
            fn_index: 5,
            trigger_id: 10,
            session_hash: hash
        }),
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    }).then(a => a.text());



    const response2 = await fetch("https://stabilityai-stable-fast-3d.hf.space/queue/data?session_hash=" + hash, {
        headers: {
            "accept": "text/event-stream",
            "accept-language": "en-US,en;q=0.9,ru;q=0.8",
            "cache-control": "no-cache",
            "pragma": "no-cache",
            "priority": "u=1, i",
            "sec-ch-ua": "\"Not)A;Brand\";v=\"99\", \"Google Chrome\";v=\"127\", \"Chromium\";v=\"127\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin"
        }
    }).then(a => a.text());
    const glbUrl = response2.match(/\"url\":\"(.*?\.glb)\"/)?.[1];
    if (glbUrl) {
        console.log('Extracted GLB URL:', glbUrl);
        return glbUrl;
    } else {
        console.error('Failed to extract GLB URL');
    }
    console.log(response2);
}

