import * as monaco from "monaco-editor";
import "./style.css";

const editor = monaco.editor.create(document.getElementById("editor"), {
    value: `int main() {

  return 0;
}`,
    language: "c",
    theme: "vs-dark",
    automaticLayout: true,
    minimap: {
        enabled: false
    },
    fontSize: 16
});