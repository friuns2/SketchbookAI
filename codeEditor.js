require.config({
    paths: {
        vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs',
    }
});

var codeEditor;

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
                        if (three && !className.includes("examples"))
                            code = "declare namespace THREE {" + code + "} "
                        await monaco.languages.typescript.typescriptDefaults.addExtraLib(code, `file:///${className}`);
                    };

                    await Promise.all(classNames.map(LoadClass));

                    
                    codeEditor = monaco.editor.create(document.getElementById('editorElement'), {
                    
                        language: 'typescript',
                        theme: 'vs-dark',
                        readOnly: globalThis.isMobile, // Make editor readonly if on mobile
                    });
                    SetCode(chat.variant.files[0].content);

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
            const code = codeEditor.getValue();
            chat.variant.files[0].content = code.replaceAll("export {};","");
            setTimeout(() => Eval(code), 100);
            this.toggleEditor();            
        }
    }
});

function SetCode(code) {
    codeEditor.setValue("export {};\n" + code.replace(/export |import .*?;/gs, ""));
}
