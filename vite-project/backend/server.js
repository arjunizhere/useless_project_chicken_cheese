import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "5mb" }));

// Initialize Google Generative AI if key is present
const apiKey = process.env.API_KEY || "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Chaotic identifier names pool for fallback
const ABSURD_NAMES = [
    "chonky_potato_",
    "spaghetti_logic_",
    "chicken_nugget_",
    "quantum_cheese_",
    "unnecessary_var_",
    "cursed_value_",
    "why_am_i_here_",
    "do_not_touch_",
    "toaster_driver_",
    "infinite_regret_",
    "panic_mode_",
    "bruh_variable_",
    "magic_constant_",
    "emotional_damage_",
    "rubber_ducky_"
];

// Chaotic comments pool
const ABSURD_COMMENTS = [
    "// ⚠️ WARNING: Touching this line voids your computer warranty",
    "// Please do not read this line, it is deeply embarrassed",
    "// If this works, God wrote it. If not, it was the intern",
    "// Magic variable that keeps the CPU warm",
    "// Added 42 extra bytes of pure regret",
    "// Why optimize when you can just buy more RAM?",
    "// The machine spirit demands this sacrifice",
    "// TODO: Delete before anyone with standards reviews this",
    "// This function works only on alternate Tuesdays",
    "// Sponsored by Chicken & Cheese Corp"
];

/**
 * Robust fallback chaotic transformer if Gemini API fails or is offline
 */
function chaoticFallbackMessify(code, language = "javascript") {
    if (!code || !code.trim()) return code;

    const lines = code.split("\n");
    const lang = (language || "").toLowerCase();

    // Collect identifiers that are not common language keywords
    const keywords = new Set([
        "if", "else", "for", "while", "do", "switch", "case", "default",
        "break", "continue", "return", "function", "const", "let", "var",
        "import", "export", "from", "as", "class", "extends", "super",
        "try", "catch", "finally", "throw", "new", "typeof", "instanceof",
        "int", "char", "float", "double", "void", "static", "struct", "include",
        "def", "elif", "print", "self", "None", "True", "False", "lambda",
        "public", "private", "protected", "namespace", "using", "std", "cout", "cin", "printf"
    ]);

    // Find candidate variable / function identifiers (length > 2)
    const identifierMatches = code.match(/\b[a-zA-Z_][a-zA-Z0-9_]{1,24}\b/g) || [];
    const uniqueIdentifiers = Array.from(new Set(identifierMatches)).filter(
        (word) => !keywords.has(word) && isNaN(Number(word))
    );

    // Create a mapping to chaotic names
    const renameMap = new Map();
    uniqueIdentifiers.slice(0, 15).forEach((id, index) => {
        const prefix = ABSURD_NAMES[index % ABSURD_NAMES.length];
        renameMap.set(id, `${prefix}${Math.floor(Math.random() * 900 + 100)}`);
    });

    // Transform lines
    const messifiedLines = lines.map((line) => {
        let transformed = line;

        // Apply rename replacements
        renameMap.forEach((replacement, original) => {
            const regex = new RegExp(`\\b${original}\\b`, "g");
            transformed = transformed.replace(regex, replacement);
        });

        // Occasionally inject silly comments
        if (Math.random() < 0.22 && line.trim().length > 0) {
            const comment = ABSURD_COMMENTS[Math.floor(Math.random() * ABSURD_COMMENTS.length)];
            const indent = line.match(/^\s*/)[0];
            return `${indent}${comment}\n${transformed}`;
        }

        return transformed;
    });

    // Add funny header & absurd wrapper comment
    const headerComment = lang.includes("py")
        ? `# --- 😈 EVIL IDE CHAOS EMBRACE --- #\n# Renamed ${renameMap.size} variables into supreme spaghetti`
        : `/* --- 😈 EVIL IDE CHAOS EMBRACE --- */\n/* Renamed ${renameMap.size} variables into supreme spaghetti */`;

    return `${headerComment}\n${messifiedLines.join("\n")}`;
}

/**
 * Extract clean code from markdown code fences
 */
function extractCodeFromMarkdown(text) {
    if (!text) return "";
    const fenceMatch = text.match(/```(?:[a-zA-Z0-9_-]+)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
        return fenceMatch[1].trim();
    }
    return text.trim();
}

/**
 * Call Gemini API with multiple model fallbacks
 */
async function generateWithGemini(code, language) {
    if (!genAI) {
        throw new Error("Gemini API client is not configured");
    }

    const prompt = `You are a chaotic code transformer in an Evil IDE. Rewrite the following ${language || "code"}.
Rules:
- Do NOT break the logic or change what the code essentially outputs/does.
- Rename variables and functions to absurd, hilarious, silly names (e.g. potato_cannon, doNotTouchThis, infiniteRegret, spaghetti_flow, chicken_sauce_99).
- Add pointless but harmless indirection (e.g. wrap simple expressions or numbers in silly helper functions or redundant steps).
- Add weird, hilarious, chaotic comments and irregular spacing.
- Return ONLY the transformed code inside a single markdown code block (\`\`\`), with NO extra conversational text.

Code:
\`\`\`${language || ""}
${code}
\`\`\``;

    // Supported models in priority order
    const candidateModels = [
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-2.5-flash",
        "gemini-1.5-flash-8b"
    ];

    let lastError = null;
    for (const modelName of candidateModels) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            const extracted = extractCodeFromMarkdown(text);
            if (extracted) {
                return extracted;
            }
        } catch (err) {
            lastError = err;
            console.warn(`[Gemini] Model ${modelName} failed:`, err.message || err);
        }
    }

    throw lastError || new Error("All Gemini models failed");
}

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({
        status: "evil",
        message: "Evil IDE Backend is running and ready to corrupt code!",
        geminiConfigured: Boolean(apiKey)
    });
});

// Messify endpoint
app.post("/api/messify", async (req, res) => {
    const { code, language, fileName } = req.body;

    if (!code || !code.trim()) {
        return res.json({
            success: true,
            messyCode: code || "",
            method: "noop"
        });
    }

    try {
        if (apiKey) {
            console.log(`[Messify] Attempting Gemini transformation for ${fileName || "file"} (${language || "code"})...`);
            const aiMessyCode = await generateWithGemini(code, language);
            console.log(`[Messify] Successfully messified via Gemini!`);
            return res.json({
                success: true,
                messyCode: aiMessyCode,
                method: "gemini"
            });
        }
    } catch (err) {
        console.warn(`[Messify] Gemini failed (${err.message || err}). Falling back to chaotic rule-based transformer.`);
    }

    // Fallback if Gemini is not configured or failed
    const fallbackCode = chaoticFallbackMessify(code, language);
    return res.json({
        success: true,
        messyCode: fallbackCode,
        method: "chaotic-fallback"
    });
});

const server = app.listen(PORT, () => {
    console.log(`😈 Evil IDE Backend listening on port ${PORT}`);
});

server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        console.error(`\n❌ Port ${PORT} is already in use by another process.`);
        console.error(`You can kill the process using port ${PORT} by running:`);
        console.error(`  npx kill-port ${PORT}   OR   fuser -k ${PORT}/tcp\n`);
    } else {
        console.error("Server error:", err);
    }
    process.exit(1);
});

