import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const knowledgeDir = fileURLToPath(new URL("../knowledge", import.meta.url));
const collection = process.env.QDRANT_COLLECTION || "mohith_portfolio";
const embeddingModel = process.env.EMBEDDING_MODEL || "gemini-embedding-001";
const portfolioUrl = process.env.PORTFOLIO_URL || "https://mohith4w5.github.io/portfolio";

const requiredEnv = ["GEMINI_API_KEY", "QDRANT_URL", "QDRANT_API_KEY"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
    throw new Error(`Missing environment variables: ${missingEnv.join(", ")}`);
}

const geminiApiKey = process.env.GEMINI_API_KEY;
const qdrantUrl = process.env.QDRANT_URL.replace(/\/$/, "");
const qdrantApiKey = process.env.QDRANT_API_KEY;

const chunks = await loadKnowledgeChunks();

if (chunks.length === 0) {
    throw new Error("No knowledge chunks found. Add Markdown files to the knowledge directory.");
}

console.log(`Embedding ${chunks.length} knowledge chunks with ${embeddingModel}...`);

const vectors = [];

for (const chunk of chunks) {
    const vector = await embedText(chunk.text);
    vectors.push(vector);
}

await ensureCollection(vectors[0].length);
await upsertPoints(chunks, vectors);

console.log(`Upserted ${chunks.length} chunks into Qdrant collection "${collection}".`);

async function loadKnowledgeChunks() {
    const files = (await readdir(knowledgeDir))
        .filter((file) => file.endsWith(".md"))
        .sort();
    const chunks = [];

    for (const file of files) {
        const content = await readFile(join(knowledgeDir, file), "utf8");
        const sections = splitMarkdownSections(content);

        sections.forEach((section, index) => {
            chunks.push({
                id: deterministicId(`${file}:${index}:${section.title}`),
                title: section.title,
                url: `${portfolioUrl}#${slugify(section.title)}`,
                text: section.text,
                source: file
            });
        });
    }

    return chunks;
}

function splitMarkdownSections(markdown) {
    const lines = markdown.split(/\r?\n/);
    const sections = [];
    let currentTitle = "Portfolio Overview";
    let currentLines = [];

    for (const line of lines) {
        const heading = line.match(/^#{1,3}\s+(.+)$/);

        if (heading && currentLines.join("\n").trim()) {
            sections.push({
                title: currentTitle,
                text: currentLines.join("\n").trim()
            });
            currentLines = [];
        }

        if (heading) {
            currentTitle = heading[1].trim();
        } else {
            currentLines.push(line);
        }
    }

    if (currentLines.join("\n").trim()) {
        sections.push({
            title: currentTitle,
            text: currentLines.join("\n").trim()
        });
    }

    return sections.flatMap((section) => chunkSection(section));
}

function chunkSection(section) {
    const maxChars = 1200;

    if (section.text.length <= maxChars) {
        return [section];
    }

    const paragraphs = section.text.split(/\n{2,}/);
    const chunks = [];
    let buffer = "";

    for (const paragraph of paragraphs) {
        if ((buffer + "\n\n" + paragraph).trim().length > maxChars && buffer) {
            chunks.push({ title: section.title, text: buffer.trim() });
            buffer = paragraph;
        } else {
            buffer = `${buffer}\n\n${paragraph}`.trim();
        }
    }

    if (buffer) {
        chunks.push({ title: section.title, text: buffer.trim() });
    }

    return chunks;
}

async function embedText(text) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${embeddingModel}:embedContent?key=${geminiApiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: `models/${embeddingModel}`,
            content: {
                parts: [{ text }]
            }
        })
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || "Gemini embedding request failed.");
    }

    if (!Array.isArray(data.embedding?.values)) {
        throw new Error("Gemini did not return embedding values.");
    }

    return data.embedding.values;
}

async function ensureCollection(vectorSize) {
    const existsResponse = await fetch(`${qdrantUrl}/collections/${collection}`, {
        headers: { "api-key": qdrantApiKey }
    });

    if (existsResponse.ok) {
        return;
    }

    const createResponse = await fetch(`${qdrantUrl}/collections/${collection}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "api-key": qdrantApiKey
        },
        body: JSON.stringify({
            vectors: {
                size: vectorSize,
                distance: "Cosine"
            }
        })
    });
    const data = await createResponse.json();

    if (!createResponse.ok) {
        throw new Error(data.status?.error || data.error || "Failed to create Qdrant collection.");
    }
}

async function upsertPoints(chunks, vectors) {
    const points = chunks.map((chunk, index) => ({
        id: chunk.id,
        vector: vectors[index],
        payload: {
            title: chunk.title,
            url: chunk.url,
            text: chunk.text,
            source: chunk.source
        }
    }));

    const response = await fetch(`${qdrantUrl}/collections/${collection}/points?wait=true`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "api-key": qdrantApiKey
        },
        body: JSON.stringify({ points })
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.status?.error || data.error || "Qdrant upsert failed.");
    }
}

function deterministicId(value) {
    const hash = createHash("sha1").update(value).digest("hex");
    return [
        hash.slice(0, 8),
        hash.slice(8, 12),
        `4${hash.slice(13, 16)}`,
        `8${hash.slice(17, 20)}`,
        hash.slice(20, 32)
    ].join("-");
}

function slugify(value) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}
