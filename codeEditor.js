require.config({
    paths: {
        vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs',
    }
});


new Vue({
    el: '#editorApp',
    data: {
        showEditor: false,
    },
    methods: {
        async toggleEditor() {
            this.showEditor = !this.showEditor;
            await new Promise(resolve => requestAnimationFrame(resolve));
            if (this.showEditor)
                require(['vs/editor/editor.main'], async function () {
                    let code = chat.variant.files[0].content.replace(/export |import .*?;/gs, ""); //(await fetch('src/code2.ts').then(r => r.text())).replace(/export |import .*?;/gs, ""),
                    
                    let classNames = await (fetch('paths.txt').then(r => r.text()));
                    classNames = classNames.replaceAll("\\", "/").replaceAll("\r", "");
                    classNames = classNames.split('\n');
                    classNames.push("src/helpers.js");
                    classNames.push("src/utils.js");
                    classNames.push("src/code.js");
                    const LoadClass = async (className) => {

                        let three = className.includes("node_modules/three/");
                        if (!className.includes("build/types/") && !three && !className.startsWith("src/")) return;
                        const text = await (await fetch(className)).text();
                        let code = text.replace(/export |import .*?;/gs, "");
                        //code = code.replaceAll("interface","class");
                        //let code = text.match(/export (?:declare )?(class [\s\S]*)/)?.[1] || text;
                        // if(className.includes("GLTFLoader"))debugger;
                        if (three)
                            code = "declare namespace THREE {" + code + "} "
                        await monaco.languages.typescript.typescriptDefaults.addExtraLib(code, `file:///${className}`);
                    };

                    await Promise.all(classNames.map(LoadClass));

                    globalThis.editor = monaco.editor.create(document.getElementById('editorElement'), {
                        value: "export {};\nlet GLTFLoader= THREE.GLTFLoader; \n" + code,
                        
                        language: 'typescript',
                        theme: 'vs-dark',
                    });
                    

                    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                        target: monaco.languages.typescript.ScriptTarget.ESNext,
                        module: monaco.languages.typescript.ModuleKind.ESNext,
                        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                        allowNonTsExtensions: true,
                    });

                    // Add Vue component for editor controls

                });
        },
        runCode() {
            ResetState();            
            const code = globalThis.editor.getValue();
            chat.variant.files[0].content = code;
            setTimeout(() => Eval(code), 100);
        }
    }
});