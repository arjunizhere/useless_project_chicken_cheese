// Monaco Editor and Styles
import * as monaco from "monaco-editor";
import "./style.css";

/* ========================================================
   EVIL IDE CUSTOM THEME
======================================================== */
monaco.editor.defineTheme("evilTheme", {
    base: "vs",
    inherit: true,
    rules: [
        { token: "comment", foreground: "1a5b80", fontStyle: "italic" },
        { token: "keyword", foreground: "301050", fontStyle: "bold" },
        { token: "string", foreground: "005520" },
        { token: "number", foreground: "8a1212" },
        { token: "type", foreground: "0b3c5d", fontStyle: "bold" },
        { token: "function", foreground: "18206f" },
        { token: "identifier", foreground: "111111" },
        { token: "delimiter", foreground: "222222" }
    ],
    colors: {
        "editor.background": "#3bb0ed",
        "editor.foreground": "#111111",
        "editorLineNumber.foreground": "#19648b",
        "editorLineNumber.activeForeground": "#000000",
        "editorCursor.foreground": "#111111",
        "editor.selectionBackground": "#ffd75a77",
        "editor.inactiveSelectionBackground": "#ffd75a44",
        "editor.lineHighlightBackground": "#48b6ee55",
        "editorWhitespace.foreground": "#2e9cd1",
        "editorIndentGuide.background1": "#2e9cd1",
        "editorIndentGuide.activeBackground1": "#19648b"
    }
});

/* ========================================================
   DOM ELEMENTS
======================================================== */
const openButton = document.getElementById("openButton");
const openMenu = document.getElementById("openMenu");
const menuOpenFile = document.getElementById("menuOpenFile");
const menuOpenFolder = document.getElementById("menuOpenFolder");
const menuNewFile = document.getElementById("menuNewFile");
const fileInput = document.getElementById("fileInput");
const folderInput = document.getElementById("folderInput");

const tabBar = document.getElementById("tabBar");
const currentFileName = document.getElementById("currentFileName");
const currentLanguage = document.getElementById("currentLanguage");
const currentFileIcon = document.getElementById("currentFileIcon");

const editorArea = document.getElementById("editorArea");
const editorScrollbar = document.getElementById("editorScrollbar");
const scrollThumb = document.getElementById("scrollThumb");

const statusMessage = document.getElementById("statusMessage");
const lineStatus = document.getElementById("lineStatus");
const columnStatus = document.getElementById("columnStatus");
const languageStatus = document.getElementById("languageStatus");
const windowClose = document.getElementById("windowClose");

/* ========================================================
   MONACO INITIALIZATION
======================================================== */
const editorElement = document.getElementById("editor");

const editor = monaco.editor.create(editorElement, {
    theme: "evilTheme",
    fontSize: 14,
    lineHeight: 21,
    fontFamily: 'Consolas, "Courier New", monospace',
    padding: { top: 12, bottom: 12 },
    automaticLayout: true,
    minimap: { enabled: false },
    renderLineHighlight: "all",
    scrollBeyondLastLine: false,
    scrollbar: {
        vertical: "hidden",
        horizontal: "auto",
        useShadows: false
    }
});

/* ========================================================
   FILE & LANGUAGE MANAGEMENT
======================================================== */
const files = new Map();

function getLanguageInfo(fileName) {
    const ext = fileName.split(".").pop().toLowerCase();
    switch (ext) {
        case "py":
            return { id: "python", name: "Python", iconClass: "python-icon" };
        case "js":
        case "mjs":
            return { id: "javascript", name: "JavaScript", iconClass: "js-icon" };
        case "ts":
            return { id: "typescript", name: "TypeScript", iconClass: "js-icon" };
        case "html":
            return { id: "html", name: "HTML", iconClass: "html-icon" };
        case "css":
            return { id: "css", name: "CSS", iconClass: "css-icon" };
        case "json":
            return { id: "json", name: "JSON", iconClass: "js-icon" };
        case "c":
        case "h":
            return { id: "c", name: "C", iconClass: "c-icon" };
        case "cpp":
        case "cc":
            return { id: "cpp", name: "C++", iconClass: "c-icon" };
        default:
            return { id: "plaintext", name: "Plain Text", iconClass: "python-icon" };
    }
}

/* ========================================================
   TAB FUNCTIONS
======================================================== */
function activateTab(tab) {
    const tabs = document.querySelectorAll(".tab");
    tabs.forEach(function (t) {
        t.classList.remove("active");
    });

    tab.classList.add("active");

    const fileName = tab.dataset.file;
    const fileItem = files.get(fileName);

    currentFileName.textContent = fileName;

    const language = fileItem ? fileItem.langInfo.name : tab.dataset.language;
    currentLanguage.textContent = language;
    languageStatus.textContent = language;

    if (currentFileIcon && fileItem) {
        currentFileIcon.className = `file-icon ${fileItem.langInfo.iconClass}`;
    }

    statusMessage.textContent = "Editing " + fileName;

    if (fileItem && fileItem.model) {
        editor.setModel(fileItem.model);
        editor.updateOptions({ readOnly: false });
        updateCursorStatus();
        updateScrollThumb();
    }
}

function attachTabEvents(tab) {
    tab.addEventListener("click", function (event) {
        if (event.target.classList.contains("tab-close")) {
            return;
        }
        activateTab(tab);
    });

    const closeButton = tab.querySelector(".tab-close");
    if (closeButton) {
        closeButton.addEventListener("click", function (event) {
            event.stopPropagation();
            const fileName = tab.dataset.file;
            const fileItem = files.get(fileName);

            if (fileItem && fileItem.model) {
                fileItem.model.dispose();
                files.delete(fileName);
            }

            tab.remove();
            statusMessage.textContent = fileName + " closed";

            if (tab.classList.contains("active")) {
                const remainingTabs = document.querySelectorAll(".tab");
                if (remainingTabs.length > 0) {
                    activateTab(remainingTabs[0]);
                } else {
                    currentFileName.textContent = "No file open";
                    currentLanguage.textContent = "";
                    languageStatus.textContent = "";
                    statusMessage.textContent = "No file open";

                    const emptyModel = monaco.editor.createModel("", "plaintext");
                    editor.setModel(emptyModel);
                    editor.updateOptions({ readOnly: true });
                    updateScrollThumb();
                }
            }
        });
    }
}

function openOrCreateFile(fileName, content, languageOverride) {
    if (files.has(fileName)) {
        const existingTab = Array.from(document.querySelectorAll(".tab")).find(
            (t) => t.dataset.file === fileName
        );
        if (existingTab) activateTab(existingTab);
        return;
    }

    const langInfo = languageOverride
        ? { id: languageOverride.toLowerCase(), name: languageOverride, iconClass: "python-icon" }
        : getLanguageInfo(fileName);

    const model = monaco.editor.createModel(content, langInfo.id);
    files.set(fileName, { model, langInfo });

    const tab = document.createElement("div");
    tab.className = "tab";
    tab.dataset.file = fileName;
    tab.dataset.language = langInfo.name;

    tab.innerHTML = `
        <span class="file-icon ${langInfo.iconClass}">●</span>
        <span class="tab-name">${fileName}</span>
        <button class="tab-close" title="Close tab">×</button>
    `;

    tabBar.appendChild(tab);
    attachTabEvents(tab);
    activateTab(tab);
}

/* ========================================================
   INITIALIZE STARTER TABS & MODELS
======================================================== */
const initialMainPyContent = `print("Hello World")

def main():
    print("Evil IDE")

if __name__ == "__main__":
    main()
`;

const initialTestPyContent = `def test_evil():
    print("Running evil unit tests...")
    assert True, "Evil test passed!"

if __name__ == "__main__":
    test_evil()
`;

// Register initial models for existing HTML tabs
const initialTabs = document.querySelectorAll(".tab");
initialTabs.forEach(function (tab) {
    const fileName = tab.dataset.file;
    const langInfo = getLanguageInfo(fileName);
    const content = fileName === "main.py" ? initialMainPyContent : initialTestPyContent;
    const model = monaco.editor.createModel(content, langInfo.id);

    files.set(fileName, { model, langInfo });
    attachTabEvents(tab);
});

// Activate the first active tab
const firstActiveTab = document.querySelector(".tab.active") || initialTabs[0];
if (firstActiveTab) {
    activateTab(firstActiveTab);
}

/* ========================================================
   OPEN MENU ACTIONS
======================================================== */
openButton.addEventListener("click", function (event) {
    event.stopPropagation();
    openMenu.classList.toggle("show");
});

document.addEventListener("click", function () {
    openMenu.classList.remove("show");
});

if (menuNewFile) {
    menuNewFile.addEventListener("click", function () {
        openMenu.classList.remove("show");
        const name = prompt("Enter new file name:", "untitled.py");
        if (name && name.trim()) {
            openOrCreateFile(name.trim(), "", null);
        }
    });
}

if (menuOpenFile) {
    menuOpenFile.addEventListener("click", function () {
        openMenu.classList.remove("show");
        fileInput.value = "";
        fileInput.click();
    });
}

fileInput.addEventListener("change", function (e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        openOrCreateFile(file.name, event.target.result, null);
    };
    reader.readAsText(file);
});

if (menuOpenFolder) {
    menuOpenFolder.addEventListener("click", function () {
        openMenu.classList.remove("show");
        folderInput.value = "";
        folderInput.click();
    });
}

folderInput.addEventListener("change", function (e) {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    selectedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = function (event) {
            openOrCreateFile(file.name, event.target.result, null);
        };
        reader.readAsText(file);
    });
});

/* ========================================================
   CURSOR & STATUS BAR
======================================================== */
function updateCursorStatus() {
    const position = editor.getPosition();
    if (position) {
        lineStatus.textContent = `Ln ${position.lineNumber}`;
        columnStatus.textContent = `Col ${position.column}`;
    }
}

editor.onDidChangeCursorPosition(function () {
    updateCursorStatus();
});

editor.onDidChangeModelContent(function () {
    const activeTab = document.querySelector(".tab.active");
    if (activeTab) {
        statusMessage.textContent = "Editing " + activeTab.dataset.file;
    }
});

/* ========================================================
   CUSTOM SCROLLBAR SYNCHRONIZATION
======================================================== */
function updateScrollThumb() {
    const scrollHeight = editor.getScrollHeight();
    const layoutInfo = editor.getLayoutInfo();
    const clientHeight = layoutInfo ? layoutInfo.height : editorArea.clientHeight;
    const maxScroll = scrollHeight - clientHeight;

    if (maxScroll <= 0) {
        scrollThumb.style.transform = `translateY(0px)`;
        return;
    }

    const percentage = Math.max(0, Math.min(1, editor.getScrollTop() / maxScroll));
    const availableSpace = Math.max(0, editorScrollbar.clientHeight - scrollThumb.offsetHeight - 12);
    scrollThumb.style.transform = `translateY(${percentage * availableSpace}px)`;
}

editor.onDidScrollChange(function () {
    updateScrollThumb();
});

let isDragging = false;
let startY = 0;
let startScrollTop = 0;

scrollThumb.addEventListener("mousedown", function (e) {
    isDragging = true;
    startY = e.clientY;
    startScrollTop = editor.getScrollTop();
    document.body.style.userSelect = "none";
});

document.addEventListener("mousemove", function (e) {
    if (!isDragging) return;
    const deltaY = e.clientY - startY;
    const scrollHeight = editor.getScrollHeight();
    const layoutInfo = editor.getLayoutInfo();
    const clientHeight = layoutInfo ? layoutInfo.height : editorArea.clientHeight;
    const maxScroll = scrollHeight - clientHeight;
    const availableSpace = Math.max(1, editorScrollbar.clientHeight - scrollThumb.offsetHeight - 12);
    const scrollDelta = (deltaY / availableSpace) * maxScroll;
    editor.setScrollTop(startScrollTop + scrollDelta);
});

document.addEventListener("mouseup", function () {
    if (isDragging) {
        isDragging = false;
        document.body.style.userSelect = "";
    }
});

editorScrollbar.addEventListener("click", function (e) {
    if (e.target === scrollThumb) return;
    const rect = editorScrollbar.getBoundingClientRect();
    const clickY = e.clientY - rect.top - scrollThumb.offsetHeight / 2;
    const availableSpace = Math.max(1, editorScrollbar.clientHeight - scrollThumb.offsetHeight - 12);
    const percentage = Math.max(0, Math.min(1, clickY / availableSpace));
    const layoutInfo = editor.getLayoutInfo();
    const clientHeight = layoutInfo ? layoutInfo.height : editorArea.clientHeight;
    const maxScroll = editor.getScrollHeight() - clientHeight;
    editor.setScrollTop(percentage * maxScroll);
});

/* ========================================================
   WINDOW CLOSE
======================================================== */
windowClose.addEventListener("click", function () {
    statusMessage.textContent = "Close requested... You cannot escape Evil IDE 😈";
    console.log("Window close requested");
});