import { compile, Runtime, World } from "@rekarel/core";
import { selectedDirectoryHandle } from "./directoty";

function removeWhitespaces(str: string): string {
    return str.replace(/\s+/g, '');  // Regex to remove all whitespace characters
}

export async function evaluateFiles() {
    if (!selectedDirectoryHandle) {
        alert('Please select a directory first.');
        return;
    }

    const sourceText = (document.getElementById('source') as HTMLTextAreaElement).value;
    let program: ReturnType<typeof compile>[0] = null;
    try {
        program = compile(sourceText, false)[0]
    } catch(e) {
        alert("Compilation error")
        return;
    }

    const result = document.getElementById("result");
    result.innerHTML = "";

    try {
        // Function to recursively iterate through the directory
        async function iterateDirectory(directoryHandle: FileSystemDirectoryHandle) {
            for await (const entry of directoryHandle.values()) {
                if (entry.kind === 'file' && entry.name.endsWith('.in')) {
                    
                    const baseName = entry.name.slice(0, -3);

                    // Find the corresponding .out file
                    const outFileName = `${baseName}.out`;
                    const outFileHandle = await directoryHandle.getFileHandle(outFileName, { create: false }).catch(() => null);

                    if (!outFileHandle) {
                        result.innerHTML+=`<p><b>${entry.name}<b/>: No hay .out</p>`
                        continue;
                    }
                    const outFile = await outFileHandle.getFile();
                    const outFileContent = await outFile.text();
                    // Perform your action on the .in file here
                    const file = await entry.getFile();
                    const content = await file.text();
                    const xml = new DOMParser().parseFromString(content, 'text/xml')
                    const world = new World(1,1);
                    world.load(xml);
                    const runtime = world.runtime;
                    runtime.load(program);

                    runtime.start();
                    while (runtime.step()) {
                        //Eval code
                    }
                    if (runtime.state.error != null) {
                        result.innerHTML+=`<p><b>${entry.name}<b/>: Error de ejecución ${runtime.state.error}</p>`
                        continue;
                    } 
                    const finalState = world.output();
                    const simple_output = removeWhitespaces(outFileContent);
                    const simple_final = removeWhitespaces(finalState);
                    if (simple_final === simple_output)
                        result.innerHTML+=`<p><b>${entry.name}<b/>: Success</p>`
                    else 
                        result.innerHTML+=`<p><b>${entry.name}<b/>: Respuesta incorrecta</p>`
                    // You can add your custom action here
                    // Example action: console.log file name and content
                } else if (entry.kind === 'directory') {
                    continue;
                }
            }
        }

        // Start iterating through the directory
        await iterateDirectory(selectedDirectoryHandle);
    } catch (error) {
        console.error('Error iterating through files:', error);
    }
}