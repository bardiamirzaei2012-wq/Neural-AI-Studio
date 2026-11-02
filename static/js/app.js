document.addEventListener("DOMContentLoaded", () => {

    initTheme();
    initSidebar();
    initNavigation();
    initPasswordToggle();
    initToastSystem();
    initAutoResize();
    initChat();
    initPromptEnhancer();
    initWriter();
    initTranslator();
    initImagePrompt();
    initSettings();
    initAuthForms();
    initCopyButtons();
    initClearButtons();
    initDemoActions();
    initKeyboardShortcuts();

});


/* =========================================
   THEME
========================================= */

function initTheme() {

    const toggle = document.getElementById("themeToggle");
    const text = document.getElementById("themeText");

    const savedTheme =
        localStorage.getItem("neural-ai-theme") || "dark";

    document.documentElement.setAttribute(
        "data-theme",
        savedTheme
    );

    updateThemeText(savedTheme);

    if (!toggle) return;

    toggle.addEventListener("click", () => {

        const current =
            document.documentElement.getAttribute("data-theme");

        const next =
            current === "dark"
                ? "light"
                : "dark";

        document.documentElement.setAttribute(
            "data-theme",
            next
        );

        localStorage.setItem(
            "neural-ai-theme",
            next
        );

        updateThemeText(next);

        showToast(
            next === "dark"
                ? "Dark mode enabled"
                : "Light mode enabled",
            "success"
        );

    });

}


function updateThemeText(theme) {

    const text =
        document.getElementById("themeText");

    if (!text) return;

    text.textContent =
        theme === "dark"
            ? "Dark Mode"
            : "Light Mode";

}


/* =========================================
   SIDEBAR
========================================= */

function initSidebar() {

    const menuButton =
        document.getElementById("mobileMenuBtn");

    const sidebar =
        document.querySelector(".sidebar");

    const overlay =
        document.querySelector(".sidebar-overlay");

    if (!menuButton || !sidebar) return;

    menuButton.addEventListener("click", () => {

        sidebar.classList.toggle("open");

        if (overlay) {
            overlay.classList.toggle("active");
        }

    });


    if (overlay) {

        overlay.addEventListener("click", () => {

            sidebar.classList.remove("open");
            overlay.classList.remove("active");

        });

    }

}


/* =========================================
   NAVIGATION
========================================= */

function initNavigation() {

    const currentPath =
        window.location.pathname;

    document
        .querySelectorAll(".nav-item")
        .forEach(link => {

            const href =
                link.getAttribute("href");

            if (
                href === currentPath ||
                (
                    currentPath === "/" &&
                    href === "/"
                )
            ) {

                link.classList.add("active");

            }

        });

}


/* =========================================
   PASSWORD
========================================= */

function initPasswordToggle() {

    document
        .querySelectorAll(".password-toggle")
        .forEach(button => {

            button.addEventListener("click", () => {

                const wrapper =
                    button.closest(".password-wrapper");

                if (!wrapper) return;

                const input =
                    wrapper.querySelector("input");

                const icon =
                    button.querySelector("i");

                if (!input || !icon) return;

                if (input.type === "password") {

                    input.type = "text";

                    icon.classList.remove(
                        "fa-eye"
                    );

                    icon.classList.add(
                        "fa-eye-slash"
                    );

                } else {

                    input.type = "password";

                    icon.classList.remove(
                        "fa-eye-slash"
                    );

                    icon.classList.add(
                        "fa-eye"
                    );

                }

            });

        });

}


/* =========================================
   TOAST
========================================= */

function initToastSystem() {

    window.showToast = function (
        message,
        type = "info"
    ) {

        let container =
            document.getElementById("toastContainer");

        if (!container) {

            container =
                document.createElement("div");

            container.id =
                "toastContainer";

            container.className =
                "toast-container";

            document.body.appendChild(container);

        }


        const toast =
            document.createElement("div");

        toast.className =
            `toast toast-${type}`;


        let icon =
            "fa-circle-info";

        if (type === "success") {
            icon = "fa-circle-check";
        }

        if (type === "error") {
            icon = "fa-circle-xmark";
        }

        if (type === "warning") {
            icon = "fa-triangle-exclamation";
        }


        toast.innerHTML = `
            <i class="fa-solid ${icon}"></i>
            <span>${escapeHTML(message)}</span>
        `;


        container.appendChild(toast);


        setTimeout(() => {

            toast.classList.add("hide");

            setTimeout(() => {
                toast.remove();
            }, 300);

        }, 2800);

    };

}


/* =========================================
   AUTO RESIZE
========================================= */

function initAutoResize() {

    document
        .querySelectorAll("textarea")
        .forEach(textarea => {

            textarea.addEventListener("input", () => {

                textarea.style.height = "auto";

                textarea.style.height =
                    `${Math.min(textarea.scrollHeight, 220)}px`;

            });

        });

}


/* =========================================
   CHAT - OLLAMA
========================================= */

function initChat() {

    const form =
        document.getElementById("chatForm");

    const input =
        document.getElementById("chatInput");

    const messages =
        document.getElementById("chatMessages");

    const modelSelect =
        document.getElementById("chatModel");

    const stopButton =
        document.getElementById("stopGeneration");

    const newChatButton =
        document.getElementById("newChat");

    const clearChatButton =
        document.getElementById("clearChat");

    if (!form || !input || !messages) return;


    let controller = null;
    let isGenerating = false;


    /* -----------------------------------------
       Restore saved messages
    ----------------------------------------- */

    loadChatHistory();


    /* -----------------------------------------
       Load Ollama models
    ----------------------------------------- */

    loadOllamaModels();


    /* -----------------------------------------
       Submit Chat
    ----------------------------------------- */

    form.addEventListener("submit", async event => {

        event.preventDefault();

        if (isGenerating) return;

        const text =
            input.value.trim();

        if (!text) return;


        const model =
            modelSelect?.value ||
            "qwen2.5:7b";


        addChatMessage(
            text,
            "user"
        );


        saveChatHistory();


        input.value = "";
        input.style.height = "auto";


        setGeneratingState(true);


        const assistantMessage =
            createAssistantMessage();


        controller =
            new AbortController();


        try {

            const response =
                await fetch("/api/chat", {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        message: text,

                        model: model

                    }),

                    signal: controller.signal

                });


            if (!response.ok) {

                let errorMessage =
                    "Failed to connect to the AI.";

                try {

                    const errorData =
                        await response.json();

                    errorMessage =
                        errorData.error ||
                        errorMessage;

                } catch (_) {}

                throw new Error(errorMessage);

            }


            const contentType =
                response.headers.get("content-type") || "";


            /*
             * JSON response
             */

            if (
                contentType.includes("application/json")
            ) {

                const data =
                    await response.json();

                if (!data.success) {

                    throw new Error(
                        data.error ||
                        "The AI returned an error."
                    );

                }

                updateAssistantMessage(
                    assistantMessage,
                    data.response || ""
                );

            }

            /*
             * Streaming response
             */

            else {

                await readStreamingResponse(
                    response,
                    assistantMessage
                );

            }


            saveChatHistory();


        } catch (error) {

            if (
                error.name === "AbortError"
            ) {

                updateAssistantMessage(
                    assistantMessage,
                    "Generation stopped."
                );

            } else {

                updateAssistantMessage(
                    assistantMessage,
                    `❌ ${error.message}`,
                    true
                );

                showToast(
                    error.message,
                    "error"
                );

            }

        } finally {

            controller = null;

            setGeneratingState(false);

            saveChatHistory();

        }

    });


    /* -----------------------------------------
       Stop generation
    ----------------------------------------- */

    if (stopButton) {

        stopButton.addEventListener("click", () => {

            if (controller) {

                controller.abort();

            }

        });

    }


    /* -----------------------------------------
       New Chat
    ----------------------------------------- */

    if (newChatButton) {

        newChatButton.addEventListener("click", () => {

            if (isGenerating) return;

            messages.innerHTML = "";

            localStorage.removeItem(
                "neural-ai-chat"
            );

            addWelcomeMessage();

            showToast(
                "New chat started.",
                "success"
            );

        });

    }


    /* -----------------------------------------
       Clear Chat
    ----------------------------------------- */

    if (clearChatButton) {

        clearChatButton.addEventListener("click", () => {

            if (isGenerating) return;

            messages.innerHTML = "";

            localStorage.removeItem(
                "neural-ai-chat"
            );

            addWelcomeMessage();

            showToast(
                "Chat cleared.",
                "success"
            );

        });

    }


    /* -----------------------------------------
       Suggestions
    ----------------------------------------- */

    document
        .querySelectorAll("[data-suggestion]")
        .forEach(button => {

            button.addEventListener("click", () => {

                const suggestion =
                    button.dataset.suggestion ||
                    button.textContent.trim();

                input.value =
                    suggestion;

                input.dispatchEvent(
                    new Event("input")
                );

                input.focus();

            });

        });


    /* -----------------------------------------
       Enter / Shift + Enter
    ----------------------------------------- */

    input.addEventListener("keydown", event => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            form.requestSubmit();

        }

    });


    /* -----------------------------------------
       Copy generated code
    ----------------------------------------- */

    messages.addEventListener("click", async event => {

        const copyButton =
            event.target.closest(".copy-code-btn");

        if (!copyButton) return;

        const code =
            copyButton
                .closest(".code-block")
                ?.querySelector("code");

        if (!code) return;

        try {

            await navigator.clipboard.writeText(
                code.innerText
            );

            const oldHTML =
                copyButton.innerHTML;

            copyButton.innerHTML =
                `<i class="fa-solid fa-check"></i> Copied`;

            setTimeout(() => {

                copyButton.innerHTML =
                    oldHTML;

            }, 1500);

            showToast(
                "Code copied.",
                "success"
            );

        } catch {

            showToast(
                "Failed to copy code.",
                "error"
            );

        }

    });


    /* -----------------------------------------
       Assistant action buttons
    ----------------------------------------- */

    messages.addEventListener("click", event => {

        const regenerate =
            event.target.closest(
                "[data-regenerate]"
            );

        if (regenerate) {

            const message =
                regenerate
                    .closest(".message.assistant");

            if (!message) return;

            const previousUser =
                message.previousElementSibling;

            if (
                previousUser &&
                previousUser.classList.contains("user")
            ) {

                const text =
                    previousUser
                        .querySelector(".message-text")
                        ?.innerText
                        .trim();

                if (text) {

                    input.value = text;

                    form.requestSubmit();

                }

            }

        }

    });


    /* -----------------------------------------
       Update model
    ----------------------------------------- */

    if (modelSelect) {

        modelSelect.addEventListener(
            "change",
            () => {

                showToast(
                    `Model changed to ${modelSelect.value}`,
                    "success"
                );

            }
        );

    }


    /* =========================================
       CHAT HELPER FUNCTIONS
    ========================================= */


    async function loadOllamaModels() {

        if (!modelSelect) return;

        try {

            const response =
                await fetch(
                    "/api/ollama/models"
                );

            if (!response.ok) return;

            const data =
                await response.json();

            const models =
                data.models ||
                data.data ||
                [];

            if (!Array.isArray(models)) return;

            const current =
                modelSelect.value;

            modelSelect.innerHTML = "";

            models.forEach(model => {

                const name =
                    typeof model === "string"
                        ? model
                        : model.name;

                if (!name) return;

                const option =
                    document.createElement("option");

                option.value = name;
                option.textContent = name;

                modelSelect.appendChild(option);

            });


            if (current) {

                const exists =
                    [...modelSelect.options]
                        .some(
                            option =>
                                option.value === current
                        );

                if (exists) {
                    modelSelect.value = current;
                }

            }


            if (!modelSelect.options.length) {

                const option =
                    document.createElement("option");

                option.value =
                    "qwen2.5:7b";

                option.textContent =
                    "qwen2.5:7b";

                modelSelect.appendChild(option);

            }

        } catch (error) {

            console.warn(
                "Could not load Ollama models:",
                error
            );

        }

    }


    async function readStreamingResponse(
        response,
        assistantMessage
    ) {

        if (!response.body) {

            throw new Error(
                "Streaming is not supported by this response."
            );

        }


        const reader =
            response.body.getReader();

        const decoder =
            new TextDecoder();

        let buffer = "";
        let fullText = "";


        while (true) {

            const {
                value,
                done
            } = await reader.read();


            if (done) break;


            buffer +=
                decoder.decode(
                    value,
                    {
                        stream: true
                    }
                );


            const lines =
                buffer.split("\n");

            buffer =
                lines.pop() || "";


            for (const line of lines) {

                const clean =
                    line.trim();

                if (!clean) continue;


                let data;

                try {

                    data =
                        JSON.parse(clean);

                } catch {

                    /*
                     * Some backends return
                     * plain text chunks.
                     */

                    fullText +=
                        clean;

                    updateAssistantMessage(
                        assistantMessage,
                        fullText
                    );

                    continue;

                }


                const chunk =
                    data.response ??
                    data.message?.content ??
                    data.content ??
                    data.token ??
                    data.text ??
                    "";


                if (chunk) {

                    fullText += chunk;

                    updateAssistantMessage(
                        assistantMessage,
                        fullText
                    );

                }


                if (
                    data.done === true ||
                    data.finished === true
                ) {

                    break;

                }

            }

        }


        if (buffer.trim()) {

            try {

                const data =
                    JSON.parse(
                        buffer.trim()
                    );

                const chunk =
                    data.response ??
                    data.message?.content ??
                    data.content ??
                    data.token ??
                    data.text ??
                    "";

                if (chunk) {

                    fullText += chunk;

                    updateAssistantMessage(
                        assistantMessage,
                        fullText
                    );

                }

            } catch (_) {}

        }


        if (!fullText.trim()) {

            updateAssistantMessage(
                assistantMessage,
                "The AI returned an empty response."
            );

        }

    }


    function createAssistantMessage() {

        const item =
            document.createElement("div");

        item.className =
            "message assistant";


        item.innerHTML = `

            <div class="message-header">

                <div class="avatar ai-avatar">
                    <i class="fa-solid fa-brain"></i>
                </div>

                <span class="sender">
                    Neural AI
                </span>

            </div>


            <div class="message-content">

                <div class="message-text generating">


                        <span></span>
                        <span></span>
                        <span></span>

                        <em>Thinking...</em>

                </div>

            </div>

        `;


        messages.appendChild(item);

        scrollChat();


        return item;

    }


    function updateAssistantMessage(
        item,
        text,
        isError = false
    ) {

        if (!item) return;


        const messageText =
            item.querySelector(
                ".message-text"
            );

        if (!messageText) return;


        messageText.classList.remove(
            "generating"
        );


        if (isError) {

            messageText.innerHTML =
                `<span class="error-message">
                    ${escapeHTML(text)}
                </span>`;

        } else {

            messageText.innerHTML =
                renderSimpleMarkdown(text);

        }


        addAssistantActions(item);

        scrollChat();

    }


    function addAssistantActions(item) {

        if (
            item.querySelector(
                ".assistant-actions"
            )
        ) return;


        const content =
            item.querySelector(
                ".message-content"
            );

        if (!content) return;


        const actions =
            document.createElement("div");

        actions.className =
            "assistant-actions";


        actions.innerHTML = `


             <button
                 type="button"
                 class="chat-action-btn"
                 data-copy-message
                 title="Copy response"
             >
                 <i class="fa-regular fa-copy"></i>
                 
             </button>

         `;


        actions
            .querySelector("[data-copy-message]")
            .addEventListener("click", async () => {

                const text =
                    item
                        .querySelector(".message-text")
                        ?.innerText
                        .trim();

                if (!text) return;

                try {

                    await navigator.clipboard.writeText(
                        text
                    );

                    showToast(
                        "Response copied.",
                        "success"
                    );

                } catch {

                    showToast(
                        "Failed to copy response.",
                        "error"
                    );

                }

            });


        content.appendChild(actions);

    }


    function addChatMessage(
        text,
        type
    ) {

        const item =
            document.createElement("div");

        item.className =
            `message ${type}`;


        if (type === "user") {

            item.innerHTML = `

                <div class="message-header">
                    <div class="avatar user-avatar">
                        <i class="fa-solid fa-user"></i>
                    </div>
                    
                    <span class="sender">
                        You
                    </span>

                    

                </div>


                <div class="message-content">

                    <div class="message-text">
                        ${escapeHTML(text)}
                    </div>

                </div>

            `;

        } else {

            item.innerHTML = `

                <div class="message-header">

                    <div class="avatar ai-avatar">
                        <i class="fa-solid fa-brain"></i>
                    </div>

                    <span class="sender">
                        Neural AI
                    </span>

                </div>


                <div class="message-content">

                    <div class="message-text">
                        ${renderSimpleMarkdown(text)}
                    </div>

                </div>

            `;

            addAssistantActions(item);

        }


        messages.appendChild(item);

        scrollChat();


        return item;

    }


    function addWelcomeMessage() {

        const item =
            document.createElement("div");

        item.className =
            "message assistant";


        item.innerHTML = `

            <div class="message-header">

                <div class="avatar ai-avatar">
                    <i class="fa-solid fa-brain"></i>
                </div>

                <span class="sender">
                    Neural AI
                </span>

            </div>


            <div class="message-content">

                <div class="message-text">

                    Hello! 👋
                    <br><br>

                    I am <strong>Neural AI</strong>.

                    <br><br>

                    Ask me anything about
                    programming, Python,
                    artificial intelligence,
                    robotics or your projects.

                </div>

            </div>

        `;


        messages.appendChild(item);

    }


    function setGeneratingState(
        state
    ) {

        isGenerating =
            state;


        if (stopButton) {

            stopButton.hidden =
                !state;

        }


        const sendButton =
            form.querySelector(
                ".send-btn"
            );


        if (sendButton) {

            sendButton.disabled =
                state;

        }


        input.disabled =
            state;


        if (!state) {

            input.disabled =
                false;

            input.focus();

        }

    }


    function scrollChat() {

        requestAnimationFrame(() => {

            messages.scrollTop =
                messages.scrollHeight;

        });

    }


    function saveChatHistory() {

        const items =
            messages.querySelectorAll(
                ".message"
            );

        const history = [];


        items.forEach(item => {

            const type =
                item.classList.contains("user")
                    ? "user"
                    : "assistant";

            const text =
                item.querySelector(
                    ".message-text"
                )?.innerText?.trim();


            if (!text) return;

            history.push({
                type,
                text
            });

        });


        localStorage.setItem(
            "neural-ai-chat",
            JSON.stringify(history)
        );

    }


    function loadChatHistory() {

        try {

            const saved =
                localStorage.getItem(
                    "neural-ai-chat"
                );

            if (!saved) {

                addWelcomeMessage();

                return;

            }


            const history =
                JSON.parse(saved);


            if (
                !Array.isArray(history) ||
                history.length === 0
            ) {

                addWelcomeMessage();

                return;

            }


            messages.innerHTML = "";


            history.forEach(message => {

                if (
                    message &&
                    message.text
                ) {

                    addChatMessage(
                        message.text,
                        message.type === "user"
                            ? "user"
                            : "assistant"
                    );

                }

            });

        } catch {

            messages.innerHTML = "";

            addWelcomeMessage();

        }

    }

}


/* =========================================
   SIMPLE MARKDOWN RENDERER
========================================= */

function renderSimpleMarkdown(text) {

    if (!text) return "";

    let html =
        escapeHTML(text);


    /*
     * Code blocks
     */

    html =
        html.replace(
            /```(\w+)?\n?([\s\S]*?)```/g,
            (match, language, code) => {

                const lang =
                    language || "code";

                return `

                    <div class="code-block">

                        <div class="code-header">

                            <span>
                                ${escapeHTML(lang)}
                            </span>

                            <button
                                type="button"
                                class="copy-code-btn"
                            >
                                <i class="fa-regular fa-copy"></i> 
                            </button>

                        </div>

                        <pre><code>${code.trim()}</code></pre>

                    </div>

                `;

            }
        );


    /*
     * Inline code
     */

    html =
        html.replace(
            /`([^`]+)`/g,
            "<code>$1</code>"
        );


    /*
     * Bold
     */

    html =
        html.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


    /*
     * Italic
     */

    html =
        html.replace(
            /\*(.*?)\*/g,
            "<em>$1</em>"
        );


    /*
     * Links
     */

    html =
        html.replace(
            /(https?:\/\/[^\s<]+)/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );


    /*
     * Line breaks
     */

    html =
        html.replace(
            /\n/g,
            "<br>"
        );


    return html;

}


/* =========================================
   PROMPT ENHANCER - OLLAMA
========================================= */

function initPromptEnhancer() {

    const form =
        document.getElementById("enhancerForm");

    const input =
        document.getElementById("enhancerInput");

    const result =
        document.getElementById("enhancerResult");

    if (!form || !input || !result) return;


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const value =
                input.value.trim();


            if (!value) {

                showToast(
                    "Please enter your prompt first.",
                    "error"
                );

                return;

            }


            const submitButton =
                form.querySelector(
                    'button[type="submit"]'
                );


            setAILoading(
                submitButton,
                true,
                "Improving..."
            );


            result.innerHTML = `

                <div class="result-content">

                    Analyzing and improving your prompt...

                </div>

            `;


            try {

                const response =
                    await fetch("/api/enhance", {

                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            prompt: value
                        })

                    });


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.error ||
                        "Failed to improve prompt."
                    );

                }


                result.innerHTML = `

                    <div class="result-content">

                        ${escapeHTML(data.result)}

                    </div>

                `;


                showToast(
                    "Prompt successfully improved.",
                    "success"
                );


            } catch (error) {

                result.innerHTML = `

                    <div class="result-content">

                        <span class="error">

                            ${escapeHTML(error.message)}

                        </span>

                    </div>

                `;


                showToast(
                    error.message,
                    "error"
                );


            } finally {

                setAILoading(
                    submitButton,
                    false
                );

            }

        }
    );

}


/* =========================================
   WRITER - OLLAMA
========================================= */

function initWriter() {

    const form =
        document.getElementById("writerForm");

    const input =
        document.getElementById("writerInput");

    const result =
        document.getElementById("writerResult");

    if (!form || !input || !result) return;


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const value =
                input.value.trim();


            if (!value) {

                showToast(
                    "Please enter a topic.",
                    "error"
                );

                return;

            }


            const type =
                document.getElementById(
                    "writerType"
                )?.value || "article";


            const tone =
                document.getElementById(
                    "writerTone"
                )?.value || "professional";


            const length =
                document.getElementById(
                    "writerLength"
                )?.value || "medium";


            const submitButton =
                form.querySelector(
                    'button[type="submit"]'
                );


            setAILoading(
                submitButton,
                true,
                "Writing..."
            );


            result.innerHTML = `

                <div class="result-content">

                    Neural AI is generating content...

                </div>

            `;


            try {

                const response =
                    await fetch("/api/write", {

                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({

                            text: value,
                            type: type,
                            tone: tone,
                            length: length

                        })

                    });


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.error ||
                        "Failed to generate content."
                    );

                }


                result.innerHTML = `

                    <div class="result-content">

                        ${escapeHTML(data.result)}

                    </div>

                `;


                showToast(
                    "Content generated successfully.",
                    "success"
                );


            } catch (error) {

                result.innerHTML = `

                    <div class="result-content">

                        <span class="error">

                            ${escapeHTML(error.message)}

                        </span>

                    </div>

                `;


                showToast(
                    error.message,
                    "error"
                );


            } finally {

                setAILoading(
                    submitButton,
                    false
                );

            }

        }
    );

}


/* =========================================
   TRANSLATOR - OLLAMA
========================================= */

function initTranslator() {

    const form =
        document.getElementById("translatorForm");

    const input =
        document.getElementById("translatorInput");

    const result =
        document.getElementById("translatorResult");

    const swap =
        document.getElementById("swapLanguages");


    if (!form || !input || !result) return;


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const value =
                input.value.trim();


            if (!value) {

                showToast(
                    "Please enter some text.",
                    "error"
                );

                return;

            }


            const from =
                document.getElementById(
                    "fromLanguage"
                )?.value || "fa";


            const to =
                document.getElementById(
                    "toLanguage"
                )?.value || "en";


            const submitButton =
                form.querySelector(
                    'button[type="submit"]'
                );


            setAILoading(
                submitButton,
                true,
                "Translating..."
            );


            result.innerHTML = `

                <div class="result-content">

                    Neural AI is translating...

                </div>

            `;


            try {

                const response =
                    await fetch("/api/translate", {

                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({

                            text: value,
                            from: from,
                            to: to

                        })

                    });


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.error ||
                        "Translation failed."
                    );

                }


                result.innerHTML = `

                    <div class="result-content">

                        ${escapeHTML(data.result)}

                    </div>

                `;


                showToast(
                    "Translation completed successfully.",
                    "success"
                );


            } catch (error) {

                result.innerHTML = `

                    <div class="result-content">

                        <span class="error">

                            ${escapeHTML(error.message)}

                        </span>

                    </div>

                `;


                showToast(
                    error.message,
                    "error"
                );


            } finally {

                setAILoading(
                    submitButton,
                    false
                );

            }

        }
    );


    if (swap) {

        swap.addEventListener(
            "click",
            () => {

                const from =
                    document.getElementById(
                        "fromLanguage"
                    );

                const to =
                    document.getElementById(
                        "toLanguage"
                    );


                if (!from || !to) return;


                const value =
                    from.value;


                from.value =
                    to.value;

                to.value =
                    value;

            }
        );

    }

}


/* =========================================
   IMAGE PROMPT - OLLAMA
========================================= */

function initImagePrompt() {

    const form =
        document.getElementById("imageForm");

    const input =
        document.getElementById("imageDescription");

    const result =
        document.getElementById("imageResult");


    if (!form || !input || !result) return;


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const value =
                input.value.trim();


            if (!value) {

                showToast(
                    "Please enter an image description.",
                    "error"
                );

                return;

            }


            const style =
                document.getElementById(
                    "imageStyle"
                )?.value || "cinematic";


            const ratio =
                document.getElementById(
                    "imageRatio"
                )?.value || "16:9";


            const submitButton =
                form.querySelector(
                    'button[type="submit"]'
                );


            setAILoading(
                submitButton,
                true,
                "Building Prompt..."
            );


            result.innerHTML = `

                <div class="result-content">

                    Neural AI is designing the image prompt...

                </div>

            `;


            try {

                const response =
                    await fetch("/api/image-prompt", {

                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({

                            description: value,
                            style: style,
                            ratio: ratio

                        })

                    });


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.error ||
                        "Failed to create image prompt."
                    );

                }


                result.innerHTML = `

                    <div class="result-content">

                        ${escapeHTML(data.result)}

                    </div>

                `;


                showToast(
                    "Image prompt generated successfully.",
                    "success"
                );


            } catch (error) {

                result.innerHTML = `

                    <div class="result-content">

                        <span class="error">

                            ${escapeHTML(error.message)}

                        </span>

                    </div>

                `;


                showToast(
                    error.message,
                    "error"
                );


            } finally {

                setAILoading(
                    submitButton,
                    false
                );

            }

        }
    );

}


/* =========================================
   AI LOADING HELPER
========================================= */

function setAILoading(
    button,
    loading,
    loadingText = "Processing..."
) {

    if (!button) return;


    if (loading) {

        if (!button.dataset.originalHTML) {

            button.dataset.originalHTML =
                button.innerHTML;

        }


        button.disabled = true;


        button.innerHTML = `

            <i class="fa-solid fa-spinner fa-spin"></i>

            ${loadingText}

        `;

    } else {

        button.disabled = false;


        if (button.dataset.originalHTML) {

            button.innerHTML =
                button.dataset.originalHTML;

        }

    }

}


/* =========================================
   SETTINGS
========================================= */

function initSettings() {

    const reset =
        document.getElementById(
            "resetSettings"
        );


    if (!reset) return;


    reset.addEventListener(
        "click",
        () => {

            document
                .querySelectorAll(
                    ".settings-list input[type='checkbox']"
                )
                .forEach(input => {

                    input.checked = true;

                });


            showToast(
                "Settings have been reset.",
                "success"
            );

        }
    );

}


/* =========================================
   AUTH
========================================= */

function initAuthForms() {

    const login =
        document.getElementById(
            "loginForm"
        );


    if (login) {

        login.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                showToast(
                    "Demo login successful.",
                    "success"
                );


                setTimeout(() => {

                    window.location.href = "/";

                }, 700);

            }
        );

    }


    const register =
        document.getElementById(
            "registerForm"
        );


    if (register) {

        register.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                showToast(
                    "Demo account created.",
                    "success"
                );


                setTimeout(() => {

                    window.location.href =
                        "/login";

                }, 800);

            }
        );

    }

}


/* =========================================
   COPY
========================================= */

function initCopyButtons() {

    document
        .querySelectorAll(
            "[data-copy-target]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const id =
                        button.dataset.copyTarget;

                    const target =
                        document.getElementById(id);


                    if (!target) return;


                    const text =
                        target.innerText.trim();


                    if (!text) {

                        showToast(
                            "Nothing to copy.",
                            "error"
                        );

                        return;

                    }


                    try {

                        await navigator.clipboard.writeText(
                            text
                        );


                        showToast(
                            "Text copied.",
                            "success"
                        );


                    } catch {

                        showToast(
                            "Failed to copy text.",
                            "error"
                        );

                    }

                }
            );

        });

}


/* =========================================
   CLEAR
========================================= */

function initClearButtons() {

    document
        .querySelectorAll(
            "[data-clear-target]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.clearTarget;

                    const target =
                        document.getElementById(id);


                    if (!target) return;


                    target.innerHTML = "";


                    if (
                        target.tagName === "TEXTAREA" ||
                        target.tagName === "INPUT"
                    ) {

                        target.value = "";

                    }


                    showToast(
                        "Cleared.",
                        "success"
                    );

                }
            );

        });

}


/* =========================================
   DEMO ACTIONS
========================================= */

function initDemoActions() {

    document
        .querySelectorAll(
            "[data-demo-action]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    showToast(
                        `${button.dataset.demoAction} is currently a demo.`,
                        "info"
                    );

                }
            );

        });

}


/* =========================================
   KEYBOARD SHORTCUTS
========================================= */

function initKeyboardShortcuts() {

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.ctrlKey &&
                event.key.toLowerCase() === "k"
            ) {

                const input =
                    document.getElementById(
                        "chatInput"
                    );


                if (input) {

                    event.preventDefault();

                    input.focus();

                }

            }


            if (
                event.ctrlKey &&
                event.shiftKey &&
                event.key.toLowerCase() === "l"
            ) {

                event.preventDefault();

                document
                    .getElementById("themeToggle")
                    ?.click();

            }

        }
    );

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}