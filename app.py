from flask import Flask, render_template, redirect, url_for, request, jsonify
import requests
from datetime import datetime

app = Flask(__name__)
app.config["SECRET_KEY"] = "neural-ai-studio-dev-key"

OLLAMA_URL = "http://127.0.0.1:11434"
OLLAMA_MODEL = "qwen2.5:7b"
OLLAMA_GENERATE_URL = f"{OLLAMA_URL}/api/generate"
OLLAMA_TAGS_URL = f"{OLLAMA_URL}/api/tags"


def ollama_generate(prompt, system_prompt=None, temperature=0.7):
    """Send a prompt to Ollama and return generated text."""
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": temperature},
    }
    if system_prompt:
        payload["system"] = system_prompt

    try:
        response = requests.post(OLLAMA_GENERATE_URL, json=payload, timeout=180)
        if response.status_code != 200:
            return None, f"Ollama error: HTTP {response.status_code}"
        result = response.json().get("response", "").strip()
        if not result:
            return None, "Ollama returned an empty response."
        return result, None
    except requests.exceptions.ConnectionError:
        return None, "Could not connect to Ollama. Make sure Ollama is running."
    except requests.exceptions.Timeout:
        return None, "Ollama request timed out. The model may still be loading."
    except Exception as exc:
        return None, f"Unexpected error: {exc}"


@app.route("/")
def index(): return render_template("index.html")

@app.route("/login")
def login(): return render_template("login.html")

@app.route("/register")
def register(): return render_template("register.html")

@app.route("/chat")
def chat(): return render_template("chat.html")

@app.route("/enhancer")
def enhancer(): return render_template("enhancer.html")

@app.route("/writer")
def writer(): return render_template("writer.html")

@app.route("/translator")
def translator(): return render_template("translator.html")

@app.route("/image")
def image(): return render_template("image.html")

@app.route("/settings")
def settings(): return render_template("settings.html")

@app.route("/logout")
def logout(): return redirect(url_for("login"))


@app.route("/api/ollama/status", methods=["GET"])
def ollama_status():
    try:
        response = requests.get(OLLAMA_TAGS_URL, timeout=5)
        if response.status_code != 200:
            return jsonify({"online": False, "model": OLLAMA_MODEL, "message": "Ollama is not responding correctly."}), 503
        models = response.json().get("models", [])
        model_names = [model.get("name") for model in models]
        model_available = OLLAMA_MODEL in model_names
        return jsonify({
            "online": True,
            "model": OLLAMA_MODEL,
            "model_available": model_available,
            "models": model_names,
            "message": "Ollama is ready." if model_available else "Ollama is online but the selected model was not found.",
        })
    except Exception:
        return jsonify({"online": False, "model": OLLAMA_MODEL, "model_available": False, "models": [], "message": "Ollama is offline."}), 503


@app.route("/api/ollama/models", methods=["GET"])
def ollama_models():
    try:
        response = requests.get(OLLAMA_TAGS_URL, timeout=5)
        if response.status_code != 200:
            return jsonify({"success": False, "error": "Unable to connect to Ollama."}), 503
        models = [{"name": m.get("name"), "size": m.get("size"), "modified_at": m.get("modified_at")} for m in response.json().get("models", [])]
        return jsonify({"success": True, "models": models, "selected_model": OLLAMA_MODEL})
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


@app.route("/api/chat", methods=["POST"])
def api_chat():
    data = request.get_json(silent=True) or {}
    message = data.get("message", "").strip()
    if not message:
        return jsonify({"success": False, "error": "Message cannot be empty."}), 400

    system_prompt = """
You are Neural AI, an English-language AI assistant.
Give accurate, useful, natural answers.
If the user writes in another language, answer in that language unless they request English.
For coding requests, provide complete and runnable code.
Avoid unnecessary or irrelevant explanations.
"""
    answer, error = ollama_generate(message, system_prompt=system_prompt, temperature=0.7)
    if error:
        return jsonify({"success": False, "error": error}), 503
    return jsonify({"success": True, "response": answer, "model": OLLAMA_MODEL, "timestamp": datetime.now().isoformat()})


@app.route("/api/enhance", methods=["POST"])
def api_enhance():
    data = request.get_json(silent=True) or {}
    prompt = data.get("prompt", "").strip()
    if not prompt:
        return jsonify({"success": False, "error": "Please enter a prompt."}), 400

    system_prompt = """
You are a professional prompt engineering expert.
Transform the user's raw prompt into a professional, precise, structured prompt that can be used with AI models.
Do not change the user's main goal.
The final prompt must be clear, provide useful context, define the expected output, specify constraints, and be directly usable by an AI model.
Return only the final prompt.
"""
    enhanced_prompt, error = ollama_generate(
        f"Raw user prompt:\n\n{prompt}\n\nImprove this prompt professionally.",
        system_prompt=system_prompt, temperature=0.5
    )
    if error:
        return jsonify({"success": False, "error": error}), 503
    return jsonify({"success": True, "result": enhanced_prompt, "model": OLLAMA_MODEL})


@app.route("/api/write", methods=["POST"])
def api_write():
    data = request.get_json(silent=True) or {}
    text = data.get("text", "").strip()
    writer_type = data.get("type", "article")
    tone = data.get("tone", "professional")
    length = data.get("length", "medium")
    if not text:
        return jsonify({"success": False, "error": "Please enter a topic or starting text."}), 400

    type_map = {"article": "Article", "caption": "Social media caption", "blog": "Blog post", "story": "Story", "email": "Email"}
    tone_map = {"professional": "Professional", "friendly": "Friendly", "creative": "Creative", "formal": "Formal"}
    length_map = {"short": "Short", "medium": "Medium", "long": "Long"}
    selected_type = type_map.get(writer_type, writer_type)
    selected_tone = tone_map.get(tone, tone)
    selected_length = length_map.get(length, length)

    system_prompt = f"""
You are a professional English-language writer.
Content type: {selected_type}
Tone: {selected_tone}
Length: {selected_length}
The output must be natural, high-quality, and appropriate for the user's request.
Do not explain the writing process.
"""
    result, error = ollama_generate(
        f"Topic or starting text:\n\n{text}\n\nGenerate the final content.",
        system_prompt=system_prompt, temperature=0.8
    )
    if error:
        return jsonify({"success": False, "error": error}), 503
    return jsonify({"success": True, "result": result, "model": OLLAMA_MODEL})


@app.route("/api/translate", methods=["POST"])
def api_translate():
    data = request.get_json(silent=True) or {}
    text = data.get("text", "").strip()
    from_language = data.get("from", "en")
    to_language = data.get("to", "en")
    if not text:
        return jsonify({"success": False, "error": "Please enter text to translate."}), 400

    languages = {"fa": "Persian", "en": "English", "ar": "Arabic", "de": "German", "fr": "French"}
    source = languages.get(from_language, from_language)
    target = languages.get(to_language, to_language)
    if from_language == to_language:
        return jsonify({"success": True, "result": text, "model": OLLAMA_MODEL})

    system_prompt = f"""
You are a professional translator.
Source language: {source}
Target language: {target}
Translate the text accurately and naturally.
Rules:
- Preserve the original meaning.
- Use natural target-language structure.
- Do not add information.
- Do not provide explanations.
- Return only the final translation.
"""
    result, error = ollama_generate(text, system_prompt=system_prompt, temperature=0.2)
    if error:
        return jsonify({"success": False, "error": error}), 503
    return jsonify({"success": True, "result": result, "model": OLLAMA_MODEL})


@app.route("/api/image-prompt", methods=["POST"])
def api_image_prompt():
    data = request.get_json(silent=True) or {}
    description = data.get("description", "").strip()
    style = data.get("style", "realistic")
    ratio = data.get("ratio", "16:9")
    if not description:
        return jsonify({"success": False, "error": "Please enter an image description."}), 400

    styles = {"cinematic": "Cinematic", "realistic": "Photorealistic", "anime": "Anime", "3d": "3D Render", "digital": "Digital Art"}
    selected_style = styles.get(style, style)
    system_prompt = """
You are a professional image prompt engineer.
Create a highly detailed and professional image-generation prompt.
Include: subject, environment, composition, lighting, camera, details, materials, style, quality, and aspect ratio.
Write the prompt in English.
Return only the final prompt.
"""
    result, error = ollama_generate(
        f"Image description:\n{description}\n\nVisual style:\n{selected_style}\n\nAspect ratio:\n{ratio}\n\nCreate a professional image-generation prompt.",
        system_prompt=system_prompt, temperature=0.7
    )
    if error:
        return jsonify({"success": False, "error": error}), 503
    return jsonify({"success": True, "result": result, "model": OLLAMA_MODEL, "style": selected_style, "ratio": ratio})


@app.errorhandler(404)
def not_found(error):
    if request.path.startswith("/api/"):
        return jsonify({"success": False, "error": "API endpoint not found."}), 404
    return "Page not found", 404


@app.errorhandler(500)
def internal_error(error):
    if request.path.startswith("/api/"):
        return jsonify({"success": False, "error": "Internal server error."}), 500
    return "Internal server error", 500


if __name__ == "__main__":
    print("=" * 60)
    print("        NEURAL AI STUDIO")
    print("=" * 60)
    print("Flask      : http://127.0.0.1:5050")
    print(f"Ollama     : {OLLAMA_URL}")
    print(f"AI Model   : {OLLAMA_MODEL}")
    print("=" * 60)
    app.run(host="127.0.0.1", port=5050, debug=True)
