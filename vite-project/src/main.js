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
const saveButton = document.getElementById("saveButton");
const openMenu = document.getElementById("openMenu");
const menuOpenFile = document.getElementById("menuOpenFile");
const menuOpenFolder = document.getElementById("menuOpenFolder");
const menuNewFile = document.getElementById("menuNewFile");
const menuSaveFile = document.getElementById("menuSaveFile");
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

// Evil UI Elements
const centerForcefield = document.getElementById("centerForcefield");
const evilCursor = document.getElementById("evilCursor");
const evilPossessionBanner = document.getElementById("evilPossessionBanner");
const evilPopupsContainer = document.getElementById("evilPopupsContainer");

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
   STATE VARIABLES (ALL DECLARED BEFORE USAGE)
======================================================== */
const files = new Map();
let untitledCount = 1;
let lastActiveTab = null;
let tabSwitchTimer = null;
let isPossessed = false;
let autoTypingInterval = null;
let audioCtx = null;

/* ========================================================
   AUDIO SYNTHESIZER (WEB AUDIO API)
======================================================== */
function getAudioContext() {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume().catch(() => {});
    }
    return audioCtx;
}

function playErrorBeep() {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(160, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
    } catch (e) {}
}

function playRepelSound() {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(450, ctx.currentTime);
        osc.frequency.setValueAtTime(320, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
}

function playTypeSound() {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(600 + Math.random() * 400, ctx.currentTime);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.03);
    } catch (e) {}
}

function flashEvilStatus(msg) {
    if (!statusMessage) return;
    statusMessage.textContent = msg;
    statusMessage.style.color = "#d90000";
    statusMessage.style.fontWeight = "bold";
    setTimeout(() => {
        if (statusMessage) {
            statusMessage.style.color = "";
            statusMessage.style.fontWeight = "";
        }
    }, 4000);
}

/* ========================================================
   LANGUAGE DETECTION & MANAGEMENT
======================================================== */
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

// Real-time language detection from code contents
function detectLanguageFromContent(content) {
    if (!content || !content.trim()) return null;
    const text = content.trim();

    // C / C++
    if (/#include\s+[<"]/.test(text) || /\b(int|void)\s+main\s*\(/.test(text) || /\bprintf\s*\(/.test(text) || /\bstd::cout\b/.test(text)) {
        return { id: "c", name: "C", iconClass: "c-icon" };
    }
    // Python
    if (/^\s*(import\s+[a-zA-Z0-9_]+|from\s+[a-zA-Z0-9_]+\s+import|def\s+[a-zA-Z0-9_]+\s*\(|class\s+[a-zA-Z0-9_]+:)/m.test(text) || (/\bprint\s*\(/.test(text) && !/console\.log/.test(text))) {
        return { id: "python", name: "Python", iconClass: "python-icon" };
    }
    // HTML
    if (/<!DOCTYPE\s+html>/i.test(text) || /<html[\s>]/i.test(text) || /<head[\s>]/i.test(text) || /<body[\s>]/i.test(text)) {
        return { id: "html", name: "HTML", iconClass: "html-icon" };
    }
    // JSON
    if ((text.startsWith("{") && text.endsWith("}")) || (text.startsWith("[") && text.endsWith("]"))) {
        try {
            JSON.parse(text);
            return { id: "json", name: "JSON", iconClass: "js-icon" };
        } catch (e) {}
    }
    // Java
    if (/\bpublic\s+class\s+[A-Z]/.test(text) || /\bpublic\s+static\s+void\s+main\b/.test(text)) {
        return { id: "java", name: "Java", iconClass: "c-icon" };
    }
    // Rust
    if (/\bfn\s+main\s*\(/.test(text) || /\blet\s+mut\s+/.test(text) || /\bprintln!\s*\(/.test(text)) {
        return { id: "rust", name: "Rust", iconClass: "c-icon" };
    }
    // JavaScript
    if (/\b(const|let|var)\s+[a-zA-Z0-9_$]+\s*=/.test(text) || /\bfunction\s+[a-zA-Z0-9_$]+\s*\(/.test(text) || /\bconsole\.log\s*\(/.test(text) || /\bexport\s+(default\s+)?(function|class|const)/.test(text)) {
        return { id: "javascript", name: "JavaScript", iconClass: "js-icon" };
    }

    return null;
}

function getLanguageInfo(fileName, content = "") {
    const ext = fileName && fileName.includes(".") ? fileName.split(".").pop().toLowerCase() : "";
    if (ext && EXTENSION_MAP[ext]) {
        return EXTENSION_MAP[ext];
    }

    // Dynamic check via Monaco's language registry
    if (ext) {
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
    }

    // If extension didn't match, attempt content-based detection
    if (content) {
        const detected = detectLanguageFromContent(content);
        if (detected) return detected;
    }

    return { id: "plaintext", name: "Plain Text", iconClass: "plaintext-icon" };
}

/* ========================================================
   CODE MESSIFIER (API & CLIENT FALLBACK)
======================================================== */
function chaoticClientMessify(code, language = "javascript") {
    if (!code || !code.trim()) return code;
    const sillyVars = [
        "quantum_potato", "spaghetti_counter", "chicken_nugget_42", "cursed_loop",
        "do_not_read_this", "unnecessary_wrapper", "emotional_damage", "infinite_regret",
        "panic_button", "magic_bruh"
    ];
    const sillyComments = [
        "// ⚠️ WARNING: Touching this line voids your computer warranty",
        "// Please do not read this line, it is deeply embarrassed",
        "// If this works, God wrote it. If not, it was the intern",
        "// Added 42 extra bytes of pure regret",
        "// Why optimize when you can just buy more RAM?"
    ];

    const keywords = new Set([
        "if", "else", "for", "while", "return", "function", "const", "let", "var",
        "import", "export", "int", "char", "float", "double", "void", "def", "class"
    ]);

    const words = code.match(/\b[a-zA-Z_][a-zA-Z0-9_]{1,20}\b/g) || [];
    const candidates = Array.from(new Set(words)).filter((w) => !keywords.has(w) && isNaN(Number(w)));

    let result = code;
    candidates.slice(0, 8).forEach((w, idx) => {
        const replacement = `${sillyVars[idx % sillyVars.length]}_${Math.floor(Math.random() * 899 + 100)}`;
        result = result.replace(new RegExp(`\\b${w}\\b`, "g"), replacement);
    });

    const lines = result.split("\n");
    const injected = lines.map((l) => {
        if (Math.random() < 0.25 && l.trim().length > 0) {
            const c = sillyComments[Math.floor(Math.random() * sillyComments.length)];
            return `${c}\n${l}`;
        }
        return l;
    });

    const header = language.includes("py")
        ? `# 😈 EVIL IDE CHAOS EMBRACE - SCRAMBLED!\n`
        : `/* 😈 EVIL IDE CHAOS EMBRACE - SCRAMBLED! */\n`;

    return header + injected.join("\n");
}

async function messifyCode(code, language, fileName) {
    if (!code || !code.trim()) return code;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const res = await fetch("/api/messify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, language, fileName }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
            const data = await res.json();
            if (data.success && data.messyCode) {
                return data.messyCode;
            }
        }
    } catch (err) {
        console.warn("[Evil IDE] /api/messify unreachable, using client chaos fallback");
    }

    return chaoticClientMessify(code, language);
}

function handleTabSwitchMessify(prevTab) {
    if (!prevTab) return;
    const prevFileName = prevTab.dataset.file;
    const prevFileItem = files.get(prevFileName);
    if (!prevFileItem || !prevFileItem.model) return;

    const originalCode = prevFileItem.model.getValue();
    if (!originalCode || !originalCode.trim()) return;

    messifyCode(originalCode, prevFileItem.langInfo.id, prevFileName).then((messy) => {
        if (messy && messy !== originalCode) {
            prevFileItem.model.setValue(messy);
            prevFileItem.isDirty = true;
            prevTab.classList.add("is-dirty");
            flashEvilStatus(`😈 Tab switched! Evil IDE scrambled "${prevFileName}"!`);
        }
    });
}

function handleWindowInactiveMessify() {
    const activeTab = document.querySelector(".tab.active");
    if (!activeTab) return;

    const fileName = activeTab.dataset.file;
    const fileItem = files.get(fileName);
    if (!fileItem || !fileItem.model) return;

    const currentCode = fileItem.model.getValue();
    if (!currentCode || !currentCode.trim()) return;

    messifyCode(currentCode, fileItem.langInfo.id, fileName).then((messy) => {
        if (messy && messy !== currentCode) {
            fileItem.model.setValue(messy);
            fileItem.isDirty = true;
            activeTab.classList.add("is-dirty");
            flashEvilStatus(`😈 Window inactive! Evil IDE scrambled "${fileName}"!`);
        }
    });
}

/* ========================================================
   DEMONIC POSSESSION & MOUSE REPULSION (10s TIMER)
======================================================== */
function handleRepulsionMouseMove(e) {
    if (!isPossessed) return;

    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const dist = Math.hypot(dx, dy);
    const repulsionRadius = 260;

    if (evilCursor) {
        if (dist < repulsionRadius) {
            const angle = Math.atan2(dy, dx);
            const repelDistance = repulsionRadius + (repulsionRadius - dist) * 1.6;
            const repelledX = cx + Math.cos(angle) * repelDistance;
            const repelledY = cy + Math.sin(angle) * repelDistance;

            evilCursor.style.left = `${repelledX}px`;
            evilCursor.style.top = `${repelledY}px`;

            if (ideWindow) {
                ideWindow.classList.add("evil-shaking");
                setTimeout(() => {
                    if (ideWindow) ideWindow.classList.remove("evil-shaking");
                }, 80);
            }

            playRepelSound();
        } else {
            evilCursor.style.left = `${mouseX}px`;
            evilCursor.style.top = `${mouseY}px`;
        }
    }
}

function startPossessionMode() {
    if (isPossessed) return;
    isPossessed = true;

    if (centerForcefield) centerForcefield.style.display = "flex";
    if (evilCursor) evilCursor.style.display = "block";
    if (evilPossessionBanner) evilPossessionBanner.style.display = "flex";
    document.body.classList.add("cursor-repelled");

    window.addEventListener("mousemove", handleRepulsionMouseMove);
    flashEvilStatus("🔥 DEMONIC POSSESSION: 10s without switching tabs! Mouse repelled!");

    // Demonic Auto-typing in editor
    const activeTab = document.querySelector(".tab.active");
    if (!activeTab) return;

    const fileName = activeTab.dataset.file;
    const fileItem = files.get(fileName);
    if (!fileItem || !fileItem.model) return;

    const currentCode = fileItem.model.getValue();
    const snippetToMess = currentCode.trim() || `// Demonic Possession Activated\nfunction chaoticSoul() {\n    return "Spaghetti code takes over";\n}`;

    messifyCode(snippetToMess, fileItem.langInfo.id, fileName).then((messyCode) => {
        if (!isPossessed || !messyCode) return;

        fileItem.model.setValue("");
        let charIndex = 0;

        if (autoTypingInterval) clearInterval(autoTypingInterval);
        autoTypingInterval = setInterval(() => {
            if (!isPossessed || charIndex >= messyCode.length) {
                clearInterval(autoTypingInterval);
                autoTypingInterval = null;
                return;
            }

            const step = Math.min(3, messyCode.length - charIndex);
            charIndex += step;
            fileItem.model.setValue(messyCode.slice(0, charIndex));

            const lineCount = fileItem.model.getLineCount();
            const col = fileItem.model.getLineMaxColumn(lineCount);
            editor.setPosition({ lineNumber: lineCount, column: col });
            editor.revealPosition({ lineNumber: lineCount, column: col });

            playTypeSound();
        }, 25);
    });
}

function stopPossessionMode() {
    if (!isPossessed) return;
    isPossessed = false;

    if (autoTypingInterval) {
        clearInterval(autoTypingInterval);
        autoTypingInterval = null;
    }

    if (centerForcefield) centerForcefield.style.display = "none";
    if (evilCursor) evilCursor.style.display = "none";
    if (evilPossessionBanner) evilPossessionBanner.style.display = "none";
    document.body.classList.remove("cursor-repelled");
    if (ideWindow) ideWindow.classList.remove("evil-shaking");
    window.removeEventListener("mousemove", handleRepulsionMouseMove);

    flashEvilStatus("Tab switched: Demonic possession broken... for now.");
}

function resetTabSwitchTimer() {
    stopPossessionMode();
    if (tabSwitchTimer) clearTimeout(tabSwitchTimer);

    tabSwitchTimer = setTimeout(() => {
        startPossessionMode();
    }, 10000);
}

/* ========================================================
   DISTURBING RANDOM POPUPS ENGINE
======================================================== */
const EVIL_POPUPS_DATA = [
    {
        title: "COMPILER RESTRAINING ORDER",
        icon: "☠️",
        msg: "Your code is so catastrophic that even the compiler filed a restraining order against your IP address.",
        buttons: ["I apologize to the CPU", "Accept incompetence"]
    },
    {
        title: "CRITICAL REALITY CHECK",
        icon: "🤡",
        msg: "10,000 monkeys typing randomly on keyboards just wrote cleaner O(log n) logic than whatever this is.",
        buttons: ["Cry silently", "Close and weep"]
    },
    {
        title: "THREAT: IMMINENT DELETION",
        icon: "⛔",
        msg: "One more syntax error and Evil IDE will automatically email this code to every tech recruiter in your area.",
        buttons: ["Please spare me", "I surrender"]
    },
    {
        title: "EXISTENTIAL CODING WARNING",
        icon: "💀",
        msg: "Have you genuinely considered that competitive sheep shearing might be a more suitable career path for you?",
        buttons: ["Probably yes", "Give up now"]
    },
    {
        title: "GLOBAL WARMING ALERT",
        icon: "🔥",
        msg: "Your inefficient nested loops are directly contributing to polar ice cap melting. Please stop typing.",
        buttons: ["Turn off monitor", "I feel terrible"]
    },
    {
        title: "SECURITY EXPLOIT DETECTED",
        icon: "⚠️",
        msg: "The AI examined your variable naming style and concluded it violates the Geneva Conventions.",
        buttons: ["Beg for mercy", "Ignore advice"]
    },
    {
        title: "HARDWARE RESIGNATION NOTICE",
        icon: "💻",
        msg: "Your RAM and CPU have formed an official trade union and officially refuse to parse lines 1 to 999.",
        buttons: ["Negotiate with RAM", "I accept defeat"]
    },
    {
        title: "RUBBER DUCK STATUS: DROWNED",
        icon: "🦆",
        msg: "We explained your algorithm to a rubber duck. The duck lost the will to live and drowned itself.",
        buttons: ["Rest in peace", "Delete project"]
    }
];

function spawnEvilPopup() {
    if (!evilPopupsContainer) return;

    const data = EVIL_POPUPS_DATA[Math.floor(Math.random() * EVIL_POPUPS_DATA.length)];
    const popup = document.createElement("div");
    popup.className = "evil-popup";

    const maxX = Math.max(20, window.innerWidth - 420);
    const maxY = Math.max(40, window.innerHeight - 250);
    const posX = Math.floor(Math.random() * maxX);
    const posY = Math.floor(Math.random() * maxY);

    popup.style.left = `${posX}px`;
    popup.style.top = `${posY}px`;

    popup.innerHTML = `
        <div class="evil-popup-titlebar">
            <div class="evil-popup-titlebar-text">
                <span>${data.icon}</span>
                <span>${data.title}</span>
            </div>
            <button class="evil-popup-close-btn" title="Close (or try to)">×</button>
        </div>
        <div class="evil-popup-body">
            <div class="evil-popup-icon">${data.icon}</div>
            <div class="evil-popup-message">${data.msg}</div>
        </div>
        <div class="evil-popup-actions">
            ${data.buttons.map((b) => `<button class="evil-popup-btn">${b}</button>`).join("")}
        </div>
    `;

    const closeBtn = popup.querySelector(".evil-popup-close-btn");
    const shouldDodge = Math.random() < 0.45;
    if (shouldDodge && closeBtn) {
        closeBtn.addEventListener("mouseenter", () => {
            const shiftX = (Math.random() - 0.5) * 80;
            const shiftY = (Math.random() - 0.5) * 40;
            closeBtn.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
        });
    }

    function dismissPopup() {
        popup.remove();
        playErrorBeep();
        flashEvilStatus("Popup dismissed: But the emotional damage remains.");

        if (Math.random() < 0.2) {
            setTimeout(spawnEvilPopup, 400);
        }
    }

    if (closeBtn) closeBtn.addEventListener("click", dismissPopup);
    popup.querySelectorAll(".evil-popup-btn").forEach((btn) => {
        btn.addEventListener("click", dismissPopup);
    });

    evilPopupsContainer.appendChild(popup);
    playErrorBeep();
}

function scheduleNextEvilPopup(initialDelay) {
    const delay = initialDelay || (Math.floor(Math.random() * 14000) + 10000);
    setTimeout(() => {
        spawnEvilPopup();
        scheduleNextEvilPopup();
    }, delay);
}

/* ========================================================
   TAB & FILE OPERATIONS
======================================================== */
function activateTab(tab) {
    const previousTab = document.querySelector(".tab.active");
    if (previousTab && previousTab !== tab) {
        handleTabSwitchMessify(previousTab);
    }
    lastActiveTab = tab;

    resetTabSwitchTimer();

    const tabs = document.querySelectorAll(".tab");
    tabs.forEach((t) => t.classList.remove("active"));
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

function promptUnsavedChanges(fileName) {
    return new Promise((resolve) => {
        const overlay = document.getElementById("saveConfirmOverlay");
        const msg = document.getElementById("saveConfirmMsg");
        const btnSave = document.getElementById("confirmSaveBtn");
        const btnDiscard = document.getElementById("confirmDiscardBtn");
        const btnCancel = document.getElementById("confirmCancelBtn");

        if (msg) {
            msg.textContent = `Do you want to save changes to "${fileName}" before closing? Your changes will be lost if you don't save them.`;
        }
        if (overlay) overlay.style.display = "flex";

        function cleanup(choice) {
            if (overlay) overlay.style.display = "none";
            if (btnSave) btnSave.onclick = null;
            if (btnDiscard) btnDiscard.onclick = null;
            if (btnCancel) btnCancel.onclick = null;
            resolve(choice);
        }

        if (btnSave) btnSave.onclick = () => cleanup("save");
        if (btnDiscard) btnDiscard.onclick = () => cleanup("discard");
        if (btnCancel) btnCancel.onclick = () => cleanup("cancel");
    });
}

async function requestCloseTab(tab) {
    const fileName = tab.dataset.file;
    const fileItem = files.get(fileName);

    if (fileItem && fileItem.isDirty) {
        activateTab(tab);
        const choice = await promptUnsavedChanges(fileName);

        if (choice === "cancel") return;
        if (choice === "save") {
            const saved = await saveCurrentFile();
            if (!saved) return;
        }
    }

    performCloseTab(tab);
}

function performCloseTab(tab) {
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
}

function attachTabEvents(tab) {
    tab.addEventListener("click", function (event) {
        if (event.target.classList.contains("tab-close")) return;
        activateTab(tab);
    });

    const closeButton = tab.querySelector(".tab-close");
    if (closeButton) {
        closeButton.addEventListener("click", function (event) {
            event.stopPropagation();
            requestCloseTab(tab);
        });
    }
}

function openOrCreateFile(fileName, content = "", languageOverride = null) {
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
        : getLanguageInfo(fileName, content);

    const model = monaco.editor.createModel(content, langInfo.id);
    files.set(fileName, { model, langInfo, savedContent: content, isDirty: false });

    const tab = document.createElement("div");
    tab.className = "tab";
    tab.dataset.file = fileName;
    tab.dataset.language = langInfo.name;

    tab.innerHTML = `
        <span class="file-icon ${langInfo.iconClass}">●</span>
        <span class="tab-name">${fileName}</span>
        <span class="dirty-dot" title="Unsaved changes"></span>
        <button class="tab-close" title="Close tab">×</button>
    `;

    tabBar.appendChild(tab);
    attachTabEvents(tab);
    activateTab(tab);
}

function createNewFileDialog() {
    const defaultName = `Untitled Document ${untitledCount++}`;
    const name = prompt("Enter file name (e.g. app.py, main.c, script.js, index.html, notes.txt):", defaultName);
    if (name === null) return;

    const finalName = name.trim() || defaultName;
    openOrCreateFile(finalName, "", null);
}

function createUntitledFile() {
    const fileName = `Untitled Document ${untitledCount++}`;
    openOrCreateFile(fileName, "", null);
}

/* ========================================================
   SAVE FEATURE
======================================================== */
async function saveCurrentFile() {
    const activeTab = document.querySelector(".tab.active");
    if (!activeTab) {
        statusMessage.textContent = "No active file to save";
        return false;
    }

    let fileName = activeTab.dataset.file;
    const fileItem = files.get(fileName);
    if (!fileItem || !fileItem.model) {
        statusMessage.textContent = "Cannot save empty file";
        return false;
    }

    const content = fileItem.model.getValue();

    // Untitled naming prompt
    if (fileName.startsWith("Untitled Document") && !fileName.includes(".")) {
        let defaultExt = ".txt";
        const langId = fileItem.langInfo.id;
        if (langId === "python") defaultExt = ".py";
        else if (langId === "javascript") defaultExt = ".js";
        else if (langId === "typescript") defaultExt = ".ts";
        else if (langId === "c") defaultExt = ".c";
        else if (langId === "cpp") defaultExt = ".cpp";
        else if (langId === "html") defaultExt = ".html";
        else if (langId === "css") defaultExt = ".css";
        else if (langId === "json") defaultExt = ".json";
        else if (langId === "java") defaultExt = ".java";

        const suggested = prompt("Save As - Enter file name:", `script${defaultExt}`);
        if (suggested === null) return false;
        if (suggested.trim()) {
            const newName = suggested.trim();
            files.delete(fileName);
            fileName = newName;
            const newLangInfo = getLanguageInfo(fileName, content);
            fileItem.langInfo = newLangInfo;
            files.set(fileName, fileItem);

            monaco.editor.setModelLanguage(fileItem.model, newLangInfo.id);

            activeTab.dataset.file = fileName;
            activeTab.dataset.language = newLangInfo.name;
            const tabNameSpan = activeTab.querySelector(".tab-name");
            if (tabNameSpan) tabNameSpan.textContent = fileName;
            const tabIcon = activeTab.querySelector(".file-icon");
            if (tabIcon) tabIcon.className = `file-icon ${newLangInfo.iconClass}`;

            currentFileName.textContent = fileName;
            currentLanguage.textContent = newLangInfo.name;
            languageStatus.textContent = newLangInfo.name;
            if (currentFileIcon) currentFileIcon.className = `file-icon ${newLangInfo.iconClass}`;
        }
    }

    // Modern File System Access API
    if ("showSaveFilePicker" in window) {
        try {
            const handle = await window.showSaveFilePicker({ suggestedName: fileName });
            const writable = await handle.createWritable();
            await writable.write(content);
            await writable.close();

            if (handle.name && handle.name !== fileName) {
                const newName = handle.name;
                files.delete(fileName);
                fileName = newName;
                const newLangInfo = getLanguageInfo(fileName, content);
                fileItem.langInfo = newLangInfo;
                files.set(fileName, fileItem);

                monaco.editor.setModelLanguage(fileItem.model, newLangInfo.id);

                activeTab.dataset.file = fileName;
                activeTab.dataset.language = newLangInfo.name;
                const tabNameSpan = activeTab.querySelector(".tab-name");
                if (tabNameSpan) tabNameSpan.textContent = fileName;
                const tabIcon = activeTab.querySelector(".file-icon");
                if (tabIcon) tabIcon.className = `file-icon ${newLangInfo.iconClass}`;

                currentFileName.textContent = fileName;
                currentLanguage.textContent = newLangInfo.name;
                languageStatus.textContent = newLangInfo.name;
                if (currentFileIcon) currentFileIcon.className = `file-icon ${newLangInfo.iconClass}`;
            }

            fileItem.savedContent = content;
            fileItem.isDirty = false;
            activeTab.classList.remove("is-dirty");
            statusMessage.textContent = `Saved ${fileName} locally`;
            return true;
        } catch (err) {
            if (err.name === "AbortError") return false;
            console.warn("showSaveFilePicker fallback", err);
        }
    }

    // Download fallback
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    fileItem.savedContent = content;
    fileItem.isDirty = false;
    activeTab.classList.remove("is-dirty");
    statusMessage.textContent = `Saved ${fileName} locally`;
    return true;
}

/* ========================================================
   LANGUAGE CHANGE PROMPT
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
    if (tabIcon) tabIcon.className = `file-icon ${langIcon.iconClass}`;

    statusMessage.textContent = `Language switched to ${langInfo.name}`;
}

/* ========================================================
   STATUS & SCROLLBAR
======================================================== */
function updateCursorStatus() {
    const position = editor.getPosition();
    if (position && files.size > 0) {
        lineStatus.textContent = `Ln ${position.lineNumber}`;
        columnStatus.textContent = `Col ${position.column}`;
    }
}

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

/* ========================================================
   ATTACH ALL EVENT LISTENERS
======================================================== */
// Monaco events
editor.onDidChangeCursorPosition(updateCursorStatus);

editor.onDidChangeModelContent(() => {
    const activeTab = document.querySelector(".tab.active");
    if (activeTab) {
        const fileName = activeTab.dataset.file;
        const fileItem = files.get(fileName);
        if (fileItem && fileItem.model) {
            const currentVal = fileItem.model.getValue();

            // Real-time language auto-detection for untyped/plaintext files
            if (fileItem.langInfo.id === "plaintext" && currentVal.length > 5) {
                const detected = detectLanguageFromContent(currentVal);
                if (detected && detected.id !== "plaintext") {
                    monaco.editor.setModelLanguage(fileItem.model, detected.id);
                    fileItem.langInfo = detected;
                    activeTab.dataset.language = detected.name;
                    currentLanguage.textContent = detected.name;
                    languageStatus.textContent = detected.name;
                    if (currentFileIcon) currentFileIcon.className = `file-icon ${detected.iconClass}`;
                    const tabIcon = activeTab.querySelector(".file-icon");
                    if (tabIcon) tabIcon.className = `file-icon ${detected.iconClass}`;
                }
            }

            const isDirty = currentVal !== (fileItem.savedContent ?? "");
            fileItem.isDirty = isDirty;
            if (isDirty) {
                activeTab.classList.add("is-dirty");
                statusMessage.textContent = "Editing " + fileName + " (Unsaved)";
            } else {
                activeTab.classList.remove("is-dirty");
                statusMessage.textContent = "Editing " + fileName;
            }
        }
    }
});

editor.onDidScrollChange(updateScrollThumb);

// Open Menu Interactions
if (openButton) {
    openButton.addEventListener("click", function (e) {
        e.stopPropagation();
        if (openMenu) openMenu.classList.toggle("show");
    });
}

document.addEventListener("click", function () {
    if (openMenu) openMenu.classList.remove("show");
});

if (menuNewFile) {
    menuNewFile.addEventListener("click", function (e) {
        e.stopPropagation();
        if (openMenu) openMenu.classList.remove("show");
        createNewFileDialog();
    });
}

if (menuOpenFile) {
    menuOpenFile.addEventListener("click", function (e) {
        e.stopPropagation();
        if (openMenu) openMenu.classList.remove("show");
        if (fileInput) {
            fileInput.value = "";
            fileInput.click();
        }
    });
}

if (fileInput) {
    fileInput.addEventListener("change", function (e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (event) {
            openOrCreateFile(file.name, event.target.result, null);
        };
        reader.readAsText(file);
    });
}

if (menuOpenFolder) {
    menuOpenFolder.addEventListener("click", function (e) {
        e.stopPropagation();
        if (openMenu) openMenu.classList.remove("show");
        if (folderInput) {
            folderInput.value = "";
            folderInput.click();
        }
    });
}

if (folderInput) {
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
}

if (menuSaveFile) {
    menuSaveFile.addEventListener("click", function (e) {
        e.stopPropagation();
        if (openMenu) openMenu.classList.remove("show");
        saveCurrentFile();
    });
}

if (saveButton) {
    saveButton.addEventListener("click", saveCurrentFile);
}

if (emptyNewBtn) {
    emptyNewBtn.addEventListener("click", createNewFileDialog);
}

if (emptyOpenBtn) {
    emptyOpenBtn.addEventListener("click", () => {
        if (fileInput) {
            fileInput.value = "";
            fileInput.click();
        }
    });
}

if (currentLanguage) currentLanguage.addEventListener("click", promptLanguageChange);
if (languageStatus) languageStatus.addEventListener("click", promptLanguageChange);

// Window controls
if (windowClose) {
    windowClose.addEventListener("click", async function () {
        for (const [name, item] of files.entries()) {
            if (item.isDirty) {
                const tab = Array.from(document.querySelectorAll(".tab")).find((t) => t.dataset.file === name);
                if (tab) activateTab(tab);

                const choice = await promptUnsavedChanges(name);
                if (choice === "cancel") return;
                if (choice === "save") {
                    const saved = await saveCurrentFile();
                    if (!saved) return;
                }
            }
        }

        statusMessage.textContent = "Window closed";
        if (ideWindow) ideWindow.style.display = "none";
        if (closedOverlay) closedOverlay.style.display = "flex";
        try { window.close(); } catch (e) {}
    });
}

if (reopenButton) {
    reopenButton.addEventListener("click", function () {
        if (closedOverlay) closedOverlay.style.display = "none";
        if (ideWindow) ideWindow.style.display = "flex";
        editor.layout();
    });
}

// Window blur & visibility listeners
window.addEventListener("blur", handleWindowInactiveMessify);
document.addEventListener("visibilitychange", () => {
    if (document.hidden) handleWindowInactiveMessify();
});

window.addEventListener("beforeunload", function (e) {
    const hasUnsaved = Array.from(files.values()).some((f) => f.isDirty);
    if (hasUnsaved) {
        e.preventDefault();
        e.returnValue = "";
    }
});

// Shortcuts
document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveCurrentFile();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
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
        if (activeTab) requestCloseTab(activeTab);
    }
});

// Scrollbar dragging
let isDragging = false;
let startY = 0;
let startScrollTop = 0;

if (scrollThumb) {
    scrollThumb.addEventListener("mousedown", function (e) {
        if (files.size === 0) return;
        isDragging = true;
        startY = e.clientY;
        startScrollTop = editor.getScrollTop();
        document.body.style.userSelect = "none";
    });
}

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

if (editorScrollbar) {
    editorScrollbar.addEventListener("click", function (e) {
        if (files.size === 0 || e.target === scrollThumb) return;
        const rect = editorScrollbar.getBoundingClientRect();
        const clickY = e.clientY - rect.top - scrollThumb.offsetHeight / 2;
        const availableSpace = Math.max(1, editorScrollbar.clientHeight - scrollThumb.offsetHeight - 12);
        const percentage = Math.max(0, Math.min(1, clickY / availableSpace));
        const layoutInfo = editor.getLayoutInfo();
        const clientHeight = layoutInfo ? layoutInfo.height : editorArea.clientHeight;
        const maxScroll = editor.getScrollHeight() - clientHeight;
        editor.setScrollTop(percentage * maxScroll);
    });
}

/* ========================================================
   INITIALIZE APPLICATION (SAFELY CALLED AT END)
======================================================== */
createUntitledFile();
resetTabSwitchTimer();
scheduleNextEvilPopup(7000);