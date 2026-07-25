(function () {
    const script = document.currentScript;
    const endpoint = script?.dataset.endpoint || "";
    const storageKey = "mohith-ai-chat-history";
    const introMessage = "Hi, I'm Mohith's AI assistant. Ask me about his AI/ML projects, skills, resume, or contact info.";
    const historyLimit = 8;

    const isConfigured = endpoint && !endpoint.includes("YOUR_SUBDOMAIN");
    let history = loadHistory();

    const widget = document.createElement("section");
    widget.className = "ai-chat";
    widget.setAttribute("aria-label", "Mohith AI assistant");
    widget.innerHTML = `
        <button class="ai-chat__toggle" type="button" aria-expanded="false" aria-controls="aiChatPanel" title="Ask Mohith's AI">
            <span aria-hidden="true">AI</span>
            <span class="ai-chat__toggle-label">Ask AI</span>
        </button>
        <div class="ai-chat__panel" id="aiChatPanel" aria-hidden="true">
            <div class="ai-chat__header">
                <div>
                    <p class="ai-chat__eyebrow">Portfolio assistant</p>
                    <h2>Ask about Mohith</h2>
                </div>
                <button class="ai-chat__close" type="button" aria-label="Close AI chat">x</button>
            </div>
            <div class="ai-chat__messages" role="log" aria-live="polite"></div>
            <form class="ai-chat__form">
                <label class="ai-chat__label" for="aiChatInput">Ask a question</label>
                <div class="ai-chat__composer">
                    <input id="aiChatInput" class="ai-chat__input" name="message" type="text" maxlength="500" autocomplete="off" placeholder="Ask about projects, skills, or contact" />
                    <button class="ai-chat__send" type="submit">Send</button>
                </div>
                <p class="ai-chat__status" role="status"></p>
            </form>
        </div>
    `;

    document.body.appendChild(widget);

    const toggleButton = widget.querySelector(".ai-chat__toggle");
    const closeButton = widget.querySelector(".ai-chat__close");
    const panel = widget.querySelector(".ai-chat__panel");
    const messagesEl = widget.querySelector(".ai-chat__messages");
    const form = widget.querySelector(".ai-chat__form");
    const input = widget.querySelector(".ai-chat__input");
    const statusEl = widget.querySelector(".ai-chat__status");

    if (history.length === 0) {
        history.push({ role: "assistant", content: introMessage, sources: [] });
        saveHistory();
    }

    renderMessages();

    toggleButton.addEventListener("click", () => setOpen(!widget.classList.contains("ai-chat--open")));
    closeButton.addEventListener("click", () => setOpen(false));

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const message = input.value.trim();

        if (!message || form.classList.contains("ai-chat__form--loading")) {
            return;
        }

        if (!isConfigured) {
            setStatus("AI setup is almost ready. Replace the Worker URL in index.html after deploying Cloudflare Worker.");
            return;
        }

        if (window.location.protocol === "file:") {
            addMessage({ role: "user", content: message, sources: [] });
            input.value = "";
            addMessage({
                role: "assistant",
                content: "Open this portfolio from GitHub Pages or a local server, not directly as a file. For local testing, run `python -m http.server 8000` in the portfolio folder and open `http://127.0.0.1:8000`.",
                sources: []
            });
            return;
        }

        addMessage({ role: "user", content: message, sources: [] });
        input.value = "";
        setLoading(true);
        setStatus("Thinking...");

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message,
                    history: history
                        .filter((entry) => entry.role === "user" || entry.role === "assistant")
                        .slice(-historyLimit)
                        .map(({ role, content }) => ({ role, content }))
                })
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.error || "The AI assistant is unavailable right now.");
            }

            addMessage({
                role: "assistant",
                content: data.answer || "I could not find that in Mohith's portfolio knowledge base yet.",
                sources: Array.isArray(data.sources) ? data.sources : []
            });
            setStatus("");
        } catch (error) {
            addMessage({
                role: "assistant",
                content: error.message || "The AI assistant is unavailable right now. Please try again later.",
                sources: []
            });
            setStatus("");
        } finally {
            setLoading(false);
            input.focus();
        }
    });

    function setOpen(isOpen) {
        widget.classList.toggle("ai-chat--open", isOpen);
        panel.setAttribute("aria-hidden", String(!isOpen));
        toggleButton.setAttribute("aria-expanded", String(isOpen));

        if (isOpen) {
            input.focus();
        }
    }

    function addMessage(message) {
        history.push(message);
        history = history.slice(-12);
        saveHistory();
        renderMessages();
    }

    function renderMessages() {
        messagesEl.innerHTML = "";

        history.forEach((message) => {
            const bubble = document.createElement("article");
            bubble.className = `ai-chat__message ai-chat__message--${message.role}`;

            const text = document.createElement("p");
            text.textContent = message.content;
            bubble.appendChild(text);

            if (message.sources && message.sources.length > 0) {
                const sources = document.createElement("div");
                sources.className = "ai-chat__sources";
                message.sources.slice(0, 3).forEach((source) => {
                    const link = document.createElement("a");
                    link.href = source.url || "#";
                    link.target = "_blank";
                    link.rel = "noopener noreferrer";
                    link.textContent = source.title || "Source";
                    sources.appendChild(link);
                });
                bubble.appendChild(sources);
            }

            messagesEl.appendChild(bubble);
        });

        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function setLoading(isLoading) {
        form.classList.toggle("ai-chat__form--loading", isLoading);
        input.disabled = isLoading;
        form.querySelector(".ai-chat__send").disabled = isLoading;
    }

    function setStatus(message) {
        statusEl.textContent = message;
    }

    function loadHistory() {
        try {
            const saved = JSON.parse(sessionStorage.getItem(storageKey) || "[]");
            return Array.isArray(saved) ? saved : [];
        } catch {
            return [];
        }
    }

    function saveHistory() {
        sessionStorage.setItem(storageKey, JSON.stringify(history));
    }
})();
