// Declare a variable to store the directory handle globally
let selectedDirectoryHandle: FileSystemDirectoryHandle | null = null;

// Function to handle directory selection
async function handleDirectorySelection() {
    try {
        // Trigger the directory picker and store the directory handle
        selectedDirectoryHandle = await window.showDirectoryPicker();

        // Update the span with the directory name or path
        const pathSpan = document.getElementById('path') as HTMLSpanElement;
        pathSpan.textContent = selectedDirectoryHandle.name;
    } catch (error) {
        console.error('Error selecting directory:', error);
    }
}

export {selectedDirectoryHandle, handleDirectorySelection}