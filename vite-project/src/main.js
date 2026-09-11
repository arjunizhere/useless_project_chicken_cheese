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
        { token: "delimiter", foreground: "222222" },
        { token: "tag", foreground: "8a104e", fontStyle: "bold" },
        { token: "attribute.name", foreground: "18206f" },
        { token: "attribute.value", foreground: "005520" },
        { token: "meta.tag", foreground: "222222" },
        { token: "constant", foreground: "8a1212" },
        { token: "variable", foreground: "0b3c5d" }
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
const ideWindow = document.querySelector(".ide-window");
const closedOverlay = document.getElementById("closedOverlay");
const reopenButton = document.getElementById("reopenButton");
const emptyEditorOverlay = document.getElementById("emptyEditorOverlay");
const emptyNewBtn = document.getElementById("emptyNewBtn");
const emptyOpenBtn = document.getElementById("emptyOpenBtn");

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
   FILE & LANGUAGE MANAGEMENT (ALL LANGUAGES)
======================================================== */
const files = new Map();

const EXTENSION_MAP = {
    // Web & Scripts
    py: { id: "python", name: "Python", iconClass: "python-icon" },
    pyw: { id: "python", name: "Python", iconClass: "python-icon" },
    js: { id: "javascript", name: "JavaScript", iconClass: "js-icon" },
    mjs: { id: "javascript", name: "JavaScript", iconClass: "js-icon" },
    cjs: { id: "javascript", name: "JavaScript", iconClass: "js-icon" },
    jsx: { id: "javascript", name: "JavaScript React", iconClass: "js-icon" },
    ts: { id: "typescript", name: "TypeScript", iconClass: "js-icon" },
    tsx: { id: "typescript", name: "TypeScript React", iconClass: "js-icon" },
    html: { id: "html", name: "HTML", iconClass: "html-icon" },
    htm: { id: "html", name: "HTML", iconClass: "html-icon" },
    css: { id: "css", name: "CSS", iconClass: "css-icon" },
    scss: { id: "scss", name: "SCSS", iconClass: "css-icon" },
    less: { id: "less", name: "LESS", iconClass: "css-icon" },
    json: { id: "json", name: "JSON", iconClass: "js-icon" },

    // Systems & Native Languages
    c: { id: "c", name: "C", iconClass: "c-icon" },
    h: { id: "c", name: "C Header", iconClass: "c-icon" },
    cpp: { id: "cpp", name: "C++", iconClass: "c-icon" },
    cc: { id: "cpp", name: "C++", iconClass: "c-icon" },
    cxx: { id: "cpp", name: "C++", iconClass: "c-icon" },
    hpp: { id: "cpp", name: "C++ Header", iconClass: "c-icon" },
    hh: { id: "cpp", name: "C++ Header", iconClass: "c-icon" },
    java: { id: "java", name: "Java", iconClass: "c-icon" },
    cs: { id: "csharp", name: "C#", iconClass: "c-icon" },
    go: { id: "go", name: "Go", iconClass: "c-icon" },
    rs: { id: "rust", name: "Rust", iconClass: "c-icon" },
    php: { id: "php", name: "PHP", iconClass: "js-icon" },
    rb: { id: "ruby", name: "Ruby", iconClass: "python-icon" },
    swift: { id: "swift", name: "Swift", iconClass: "c-icon" },
    kt: { id: "kotlin", name: "Kotlin", iconClass: "c-icon" },
    sql: { id: "sql", name: "SQL", iconClass: "c-icon" },
    dart: { id: "dart", name: "Dart", iconClass: "c-icon" },
    r: { id: "r", name: "R", iconClass: "python-icon" },
    lua: { id: "lua", name: "Lua", iconClass: "c-icon" },

    // Scripts & Config
    sh: { id: "shell", name: "Shell Script", iconClass: "plaintext-icon" },
    bash: { id: "shell", name: "Bash", iconClass: "plaintext-icon" },
    zsh: { id: "shell", name: "Zsh", iconClass: "plaintext-icon" },
    bat: { id: "bat", name: "Batch", iconClass: "plaintext-icon" },
    cmd: { id: "bat", name: "Batch", iconClass: "plaintext-icon" },
    ps1: { id: "powershell", name: "PowerShell", iconClass: "plaintext-icon" },
    xml: { id: "xml", name: "XML", iconClass: "html-icon" },
    svg: { id: "xml", name: "SVG", iconClass: "html-icon" },
    yaml: { id: "yaml", name: "YAML", iconClass: "plaintext-icon" },
    yml: { id: "yaml", name: "YAML", iconClass: "plaintext-icon" },
    md: { id: "markdown", name: "Markdown", iconClass: "plaintext-icon" },
    markdown: { id: "markdown", name: "Markdown", iconClass: "plaintext-icon" },
    txt: { id: "plaintext", name: "Plain Text", iconClass: "plaintext-icon" },
    log: { id: "plaintext", name: "Log File", iconClass: "plaintext-icon" },
    ini: { id: "ini", name: "INI", iconClass: "plaintext-icon" },
    dockerfile: { id: "dockerfile", name: "Dockerfile", iconClass: "plaintext-icon" }
};

function getLanguageInfo(fileName) {
    const ext = fileName.includes(".") ? fileName.split(".").pop().toLowerCase() : "";
    if (EXTENSION_MAP[ext]) {
        return EXTENSION_MAP[ext];
    }

    // Dynamic fallback to Monaco's full language registry
    const dotExt = "." + ext;
    const allLangs = monaco.languages.getLanguages();
    const matched = allLangs.find((lang) => lang.extensions && lang.extensions.includes(dotExt));
    if (matched) {
        const name = (matched.aliases && matched.aliases[0]) || matched.id;
        return {
            id: matched.id,
            name: name.charAt(0).toUpperCase() + name.slice(1),
            iconClass: "c-icon"
        };
    }

    return { id: "plaintext", name: "Plain Text", iconClass: "plaintext-icon" };
}

let untitledCount = 1;

function createNewFileDialog() {
    const defaultName = `Untitled Document ${untitledCount++}`;
    const name = prompt("Enter file name (e.g. app.py, main.c, script.js, index.html, notes.txt):", defaultName);
    if (name === null) return; // User cancelled

    const finalName = name.trim() || defaultName;
    openOrCreateFile(finalName, "", null);
}

function createUntitledFile() {
    const fileName = `Untitled Document ${untitledCount++}`;
    openOrCreateFile(fileName, "", "Plain Text");
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

    if (currentFileIcon) {
        currentFileIcon.style.display = "";
        if (fileItem) {
            currentFileIcon.className = `file-icon ${fileItem.langInfo.iconClass}`;
        }
    }

    statusMessage.textContent = "Editing " + fileName;

    if (emptyEditorOverlay) {
        emptyEditorOverlay.style.display = "none";
    }

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

            const wasActive = tab.classList.contains("active");
            tab.remove();
            statusMessage.textContent = fileName + " closed";

            const remainingTabs = document.querySelectorAll(".tab");
            if (remainingTabs.length > 0) {
                if (wasActive) {
                    activateTab(remainingTabs[remainingTabs.length - 1]);
                }
            } else {
                // Bug fix 2: When closing the last tab, close it cleanly without opening a new file!
                currentFileName.textContent = "No file open";
                currentLanguage.textContent = "";
                languageStatus.textContent = "";
                statusMessage.textContent = "No file open";
                if (currentFileIcon) currentFileIcon.style.display = "none";
                if (lineStatus) lineStatus.textContent = "-";
                if (columnStatus) columnStatus.textContent = "-";

                const emptyModel = monaco.editor.createModel("", "plaintext");
                editor.setModel(emptyModel);
                editor.updateOptions({ readOnly: true });
                updateScrollThumb();

                if (emptyEditorOverlay) {
                    emptyEditorOverlay.style.display = "flex";
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
        ? (languageOverride === "Plain Text"
            ? { id: "plaintext", name: "Plain Text", iconClass: "plaintext-icon" }
            : { id: languageOverride.toLowerCase(), name: languageOverride, iconClass: "c-icon" })
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
   INITIALIZE DEFAULT DOCUMENT (LIKE GEDIT)
======================================================== */
createUntitledFile();

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
        createNewFileDialog();
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
   EMPTY STATE BUTTONS
======================================================== */
if (emptyNewBtn) {
    emptyNewBtn.addEventListener("click", function () {
        createNewFileDialog();
    });
}

if (emptyOpenBtn) {
    emptyOpenBtn.addEventListener("click", function () {
        fileInput.value = "";
        fileInput.click();
    });
}

/* ========================================================
   INTERACTIVE LANGUAGE SWITCHER
======================================================== */
function promptLanguageChange() {
    const activeTab = document.querySelector(".tab.active");
    if (!activeTab) return;

    const fileName = activeTab.dataset.file;
    const fileItem = files.get(fileName);
    if (!fileItem) return;

    const commonLanguages = "python, javascript, typescript, c, cpp, java, csharp, rust, go, html, css, json, sql, markdown, shell, plaintext";
    const chosen = prompt(`Change language syntax for "${fileName}"\nOptions: ${commonLanguages}`, fileItem.langInfo.id);

    if (!chosen || !chosen.trim()) return;

    const target = chosen.trim().toLowerCase();
    const langInfo = {
        id: target === "plain text" ? "plaintext" : target,
        name: target.charAt(0).toUpperCase() + target.slice(1),
        iconClass: target === "python" ? "python-icon" : (target.includes("js") ? "js-icon" : "c-icon")
    };

    monaco.editor.setModelLanguage(fileItem.model, langInfo.id);
    fileItem.langInfo = langInfo;
    activeTab.dataset.language = langInfo.name;

    currentLanguage.textContent = langInfo.name;
    languageStatus.textContent = langInfo.name;
    if (currentFileIcon) currentFileIcon.className = `file-icon ${langInfo.iconClass}`;
    const tabIcon = activeTab.querySelector(".file-icon");
    if (tabIcon) tabIcon.className = `file-icon ${langInfo.iconClass}`;

    statusMessage.textContent = `Language switched to ${langInfo.name}`;
}

currentLanguage.addEventListener("click", promptLanguageChange);
languageStatus.addEventListener("click", promptLanguageChange);

/* ========================================================
   CURSOR & STATUS BAR
======================================================== */
function updateCursorStatus() {
    const position = editor.getPosition();
    if (position && files.size > 0) {
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

    if (maxScroll <= 0 || files.size === 0) {
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
    if (files.size === 0) return;
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
    if (files.size === 0) return;
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
   WINDOW CLOSE & SHORTCUTS (BUG FIX 1)
======================================================== */
windowClose.addEventListener("click", function () {
    statusMessage.textContent = "Window closed";
    if (ideWindow) ideWindow.style.display = "none";
    if (closedOverlay) closedOverlay.style.display = "flex";
    try {
        window.close();
    } catch (e) {
        // Handled if browser blocks script window.close
    }
});

if (reopenButton) {
    reopenButton.addEventListener("click", function () {
        if (closedOverlay) closedOverlay.style.display = "none";
        if (ideWindow) ideWindow.style.display = "flex";
        editor.layout();
    });
}

// Default IDE Keyboard Shortcuts
document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        createNewFileDialog();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "o") {
        e.preventDefault();
        if (fileInput) {
            fileInput.value = "";
            fileInput.click();
        }
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "w") {
        e.preventDefault();
        const activeTab = document.querySelector(".tab.active");
        if (activeTab) {
            const closeBtn = activeTab.querySelector(".tab-close");
            if (closeBtn) closeBtn.click();
        }
    }
});