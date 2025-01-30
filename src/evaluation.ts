import { compile, Runtime, RuntimeErrorCodes, World } from "@rekarel/core";
import { selectedDirectoryHandle } from "./directoty";
const ERRORCODES = {
    WALL: 'Karel ha chocado con un muro!',
    WORLDUNDERFLOW: 'Karel intentó tomar zumbadores en una posición donde no había!',
    BAGUNDERFLOW: 'Karel intentó dejar un zumbador pero su mochila estaba vacía!',
    INSTRUCTION: 'Karel ha superado el límite de instrucciones!',
    STACK: 'La pila de karel se ha desbordado!',
};

function decodeRuntimeError(error: string):string {
    if (error === "INSTRUCTION") {
        return `Karel ha superado el límite de instrucciones!`;
    }
    if (error === "INSTRUCTION_LEFT") {
        return `Karel ha superado el límite de gira izquierda (turnleft)!`;
    }
    if (error === "INSTRUCTION_FORWARD") {
        return `Karel ha superado el límite de avanza (move)!`;
    }
    if (error === "INSTRUCTION_PICKBUZZER") {
        return `Karel ha superado el límite de coge-zumbador (pickbeeper)!`;    
    }
    if (error === "INSTRUCTION_LEAVEBUZZER") {
        return `Karel ha superado el límite de deja-zumbador (putbeeper)!`;
    }
    if (error === "STACK") {
        return `La pila de karel se ha desbordado!`
    }
    if (error === "CALLMEMORY") {
        return `Límite de parámetros superados.`;
    }
    if (error === "STACKMEMORY") {
        return `El límite de memoria del stack a sido superado.`
        +`<br>El costo de una función es igual al mayor entre uno y la cantidad de parámetros que usa.`;
    }
    if (error === "INTEGEROVERFLOW") {
        return `Se superó el límite superior numérico de 999,999,999.`;
    }
    if (error === "INTEGERUNDERFLOW") {
        return `Se superó el límite inferior numérico de -999,999,999.`;
    }
    if (error === "WORLDOVERFLOW") {
        return `Se superó el límite de zumbadores en una casilla, no debe haber más de 999,999,999 zumbadores.`;
    }
    if (error in ERRORCODES) {
        return ERRORCODES[error];
    } else {
        return `Karel tubo un error de ejecución desconocido: ${error}`
    }
}

function removeWhitespaces(str: string): string {
    return str.replace(/\s+/g, '');  // Regex to remove all whitespace characters
}

export async function evaluateFiles() {
    if (!selectedDirectoryHandle) {
        alert('Por favor, seleccione un directorio de casos primero.');
        return;
    }

    const sourceText = (document.getElementById('source') as HTMLTextAreaElement).value;
    let program: ReturnType<typeof compile>[0] = null;
    try {
        program = compile(sourceText, false)[0]
    } catch(e) {
        alert("Error de compilación")
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

                    while (runtime.step()) {
                        //Eval code
                    }
                    if (runtime.state.error != null) {
                        const errorType = RuntimeErrorCodes[runtime.state.error] >= 48? "Límite de instrucciones:": "Error de ejecución:"
                        result.innerHTML+=`<p><b>${entry.name}</b>: <span class="text-danger">${errorType} ${decodeRuntimeError(runtime.state.error)}</span></p>`
                        continue;
                    } 
                    const finalState = world.output();
                    const simple_output = removeWhitespaces(outFileContent);
                    const simple_final = removeWhitespaces(finalState);
                    if (simple_final === simple_output)
                        result.innerHTML+=`<p><b>${entry.name}</b>: <span class="text-success">Correcto</span></p>`
                    else 
                        result.innerHTML+=`<p><b>${entry.name}</b>: <span class="text-danger">Respuesta incorrecta</span></p>`
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
        console.error('Error al abrir los casos:', error);
    }
}