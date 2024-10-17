
import { selectedDirectoryHandle,handleDirectorySelection } from "./directoty";
import { evaluateFiles } from "./evaluation";


document.getElementById("path-btn").addEventListener("click", ()=> {
    handleDirectorySelection();
});

document.getElementById("eval-btn").addEventListener("click", ()=> {
    if (selectedDirectoryHandle == null) {
        alert("Fist select a file")
        return;
    }
    evaluateFiles().finally(()=> {
        document.getElementById("result").innerHTML+="<p><b>Termino</b></p>"
    })

})