const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash-lite";
const DEFAULT_EMBEDDING_MODEL = "gemini-embedding-001";
const DEFAULT_COLLECTION = "mohith_portfolio";
const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY_ITEMS = 6;
const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_REQUESTS = 12;

export default {
    async fetch(request, env) {
        const origin = request.headers.get("Origin") || "";
        const corsHeaders = getCorsHeaders(origin, env);

        if (request.method === "OPTIONS") {
            return new Response(null, { status: 204, headers: corsHeaders });
        }

        const url = new URL(request.url);

        if (url.pathname === "/health") {
            return json({ ok: true }, 200, corsHeaders);
        }

        if (url.pathname !== "/chat" || request.method !== "POST") {
            return json({ error: "Not found" }, 404, corsHeaders);
        }

        if (!isOriginAllowed(origin, env)) {
            return json({ error: "Origin is not allowed" }, 403, corsHeaders);
        }

        const rateLimitResult = await checkRateLimit(request, env);
        if (!rateLimitResult.allowed) {
            return json({ error: "Too many requests. Please try again in a minute." }, 429, corsHeaders);
        }

        try {
            const payload = await request.json();
            const message = String(payload.message || "").trim();

            if (!message) {
                return json({ error: "Message is required" }, 400, corsHeaders);
            }

            if (message.length > MAX_MESSAGE_LENGTH) {
                return json({ error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.` }, 400, corsHeaders);
            }

            requireEnv(env, ["GEMINI_API_KEY", "QDRANT_URL", "QDRANT_API_KEY"]);

            const history = normalizeHistory(payload.history);
            const queryEmbedding = await embedText(message, env);
            const matches = await searchQdrant(queryEmbedding, env);
            const context = buildContext(matches);
            const answer = await generateAnswer(message, history, context, env);
            const sources = buildSources(matches);

            return json({ answer, sources }, 200, corsHeaders);
        } catch (error) {
            return json({ error: error.message || "The AI assistant failed to respond." }, 500, corsHeaders);
        }
    }
};

function getCorsHeaders(origin, env) {
    const headers = {
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Vary": "Origin"
    };

    if (isOriginAllowed(origin, env)) {
        headers["Access-Control-Allow-Origin"] = origin;
    }

    return headers;
}

function isOriginAllowed(origin, env) {
    const allowedOrigin = env.ALLOWED_ORIGIN || "https://mohith4w5.github.io";
    const allowLocalhost = env.ALLOW_LOCALHOST === "true";

    if (origin === allowedOrigin) {
        return true;
    }

    return allowLocalhost && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

async function checkRateLimit(request, env) {
    if (!env.RATE_LIMITER) {
        return { allowed: true };
    }

    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const key = `chat:${ip}`;
    const current = Number(await env.RATE_LIMITER.get(key) || "0");

    if (current >= RATE_LIMIT_MAX_REQUESTS) {
        return { allowed: false };
    }

    await env.RATE_LIMITER.put(key, String(current + 1), { expirationTtl: RATE_LIMIT_WINDOW_SECONDS });
    return { allowed: true };
}

function requireEnv(env, keys) {
    const missing = keys.filter((key) => !env[key]);

    if (missing.length > 0) {
        throw new Error(`Missing Worker secret or variable: ${missing.join(", ")}`);
    }
}

function normalizeHistory(history) {
    if (!Array.isArray(history)) {
        return [];
    }

    return history
        .filter((entry) => entry && (entry.role === "user" || entry.role === "assistant"))
        .map((entry) => ({
            role: entry.role,
            content: String(entry.content || "").slice(0, MAX_MESSAGE_LENGTH)
        }))
        .slice(-MAX_HISTORY_ITEMS);
}

async function embedText(text, env) {
    const model = env.EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODEL;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${env.GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: `models/${model}`,
            content: {
                parts: [{ text }]
            }
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || "Gemini embedding request failed.");
    }

    const values = data.embedding?.values;

    if (!Array.isArray(values) || values.length === 0) {
        throw new Error("Gemini did not return an embedding.");
    }

    return values;
}

async function searchQdrant(vector, env) {
    const collection = env.QDRANT_COLLECTION || DEFAULT_COLLECTION;
    const qdrantUrl = env.QDRANT_URL.replace(/\/$/, "");
    const response = await fetch(`${qdrantUrl}/collections/${collection}/points/search`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "api-key": env.QDRANT_API_KEY
        },
        body: JSON.stringify({
            vector,
            limit: 5,
            with_payload: true
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.status?.error || data.error || "Qdrant search failed.");
    }

    return Array.isArray(data.result) ? data.result : [];
}

function buildContext(matches) {
    if (matches.length === 0) {
        return "No relevant portfolio facts were retrieved.";
    }

    return matches
        .map((match, index) => {
            const payload = match.payload || {};
            return [
                `Source ${index + 1}: ${payload.title || "Portfolio knowledge"}`,
                `URL: ${payload.url || "https://mohith4w5.github.io/portfolio"}`,
                `Fact: ${payload.text || ""}`
            ].join("\n");
        })
        .join("\n\n");
}

async function generateAnswer(message, history, context, env) {
    const model = env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
    const contents = [
        ...history.map((entry) => ({
            role: entry.role === "assistant" ? "model" : "user",
            parts: [{ text: entry.content }]
        })),
        {
            role: "user",
            parts: [{ text: `Visitor question: ${message}\n\nRetrieved portfolio facts:\n${context}` }]
        }
    ];

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            systemInstruction: {
                parts: [{
                    text: [
                        "You are Mohith's portfolio AI assistant.",
                        "Answer only from the retrieved portfolio facts provided by the system.",
                        "If the facts do not answer the question, say the portfolio does not mention that yet and suggest contacting Mohith.",
                        "Do not invent education details, grades, internships, project results, or contact methods.",
                        "Use concise, professional language. Speak about Mohith in third person or as his assistant, not as Mohith."
                    ].join(" ")
                }]
            },
            contents,
            generationConfig: {
                maxOutputTokens: 220,
                temperature: 0.35
            }
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || "Gemini answer request failed.");
    }

    const answer = data.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim();

    return answer || "The portfolio does not mention that yet. Please contact Mohith for the latest details.";
}

function buildSources(matches) {
    const seen = new Set();

    return matches
        .map((match) => match.payload || {})
        .filter((payload) => payload.title || payload.url)
        .filter((payload) => {
            const key = `${payload.title || ""}:${payload.url || ""}`;

            if (seen.has(key)) {
                return false;
            }

            seen.add(key);
            return true;
        })
        .slice(0, 3)
        .map((payload) => ({
            title: payload.title || "Portfolio source",
            url: payload.url || "https://mohith4w5.github.io/portfolio"
        }));
}

function json(body, status, headers = {}) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            "Content-Type": "application/json",
            ...headers
        }
    });
}
