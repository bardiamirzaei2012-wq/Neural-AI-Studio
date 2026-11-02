# 🧠 Neural AI Studio


## ✨ Overview

**Neural AI Studio** is a web-based AI platform designed to provide a collection of intelligent tools through a unified and user-friendly interface.

Powered by **Flask** and **Ollama**, the platform runs AI models locally, allowing users to interact with AI without depending on external cloud-based AI APIs.

The project combines a modern dashboard, responsive interface, and multiple AI-powered features in one application.

## 🚀 Features

### 🤖 AI Chat Assistant
- Interactive AI-powered conversations.
- Local AI inference using Ollama.
- Natural language responses.
- Support for multiple languages.
- Conversation history interface.

### ✍️ AI Writer
- Generate articles and blog posts.
- Create social media captions.
- Write stories and emails.
- Customize writing tone and length.

### ⚡ AI Prompt Enhancer
- Transform simple prompts into professional prompts.
- Improve clarity and structure.
- Generate detailed instructions for AI models.

### 🌍 AI Translator
- Translate text between multiple languages.
- English, Persian, Arabic, German, and French.
- Natural and context-aware translations.

### 🎨 AI Image Prompt Generator
- Generate detailed image-generation prompts.
- Multiple visual styles:
  - Cinematic
  - Photorealistic
  - Anime
  - 3D Render
  - Digital Art
- Custom aspect ratios.

### ⚙️ User Interface & Settings
- Modern dashboard design.
- Dark and light themes.
- Responsive layout.
- Interactive navigation.
- Toast notifications.
- Local theme preferences.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Python | Core programming language |
| Flask | Backend web framework |
| Ollama | Local AI inference |
| Qwen 2.5 7B | Language model |
| HTML5 | Application structure |
| CSS3 | Styling and responsive design |
| JavaScript | Frontend interactions |
| Requests | HTTP communication |

## 📁 Project Structure

```text
Neural-AI-Studio/
│
├── app.py
│
├── static/
│   ├── css/
│   │   ├── style.css
│   │   └── old.css
│   │
│   ├── js/
│   │   └── app.js
│   │
│   └── images/
│       └── logo.png
│
└── templates/
    ├── base.html
    ├── index.html
    ├── chat.html
    ├── enhancer.html
    ├── writer.html
    ├── translator.html
    ├── image.html
    ├── settings.html
    ├── login.html
    └── register.html
```

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/Neural-AI-Studio.git

cd Neural-AI-Studio
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

Activate it:

**Windows:**
```bash
venv\Scripts\activate
```

**Linux / macOS:**
```bash
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install flask requests
```

### 4. Install Ollama

Download Ollama from:

https://ollama.com/

### 5. Download the AI model

```bash
ollama pull qwen2.5:7b
```

Make sure Ollama is running locally on port `11434`.

### 6. Run the application

```bash
python app.py
```

Open your browser:

```text
http://127.0.0.1:5050
```

## 🧠 AI Architecture

Neural AI Studio uses a local AI architecture:

```text
             User Interface
                   |
                   v
          HTML / CSS / JavaScript
                   |
                   v
              Flask API
                   |
                   v
             Ollama Server
              Port 11434
                   |
                   v
             Qwen 2.5 7B
                   |
                   v
          Generated AI Response
```

All AI generation requests are processed through the local Ollama server.

## 🔌 API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/chat` | POST | AI conversations |
| `/api/enhance` | POST | Prompt enhancement |
| `/api/write` | POST | AI content generation |
| `/api/translate` | POST | Text translation |
| `/api/image-prompt` | POST | Image prompt generation |
| `/api/ollama/status` | GET | Check Ollama status |
| `/api/ollama/models` | GET | Retrieve available models |

## 🔮 Future Improvements

- [ ] Real user authentication and account management.
- [ ] Persistent database integration.
- [ ] AI conversation management.
- [ ] Support for additional local AI models.
- [ ] Integration with image-generation models.
- [ ] Advanced AI settings and customization.
- [ ] File upload and document analysis.
- [ ] Improved security and API validation.

## 🔒 Privacy & Local Processing

Neural AI Studio is designed around local AI processing.

By using Ollama, AI requests can be processed on the user's own machine rather than being sent to a third-party AI API.

Note: The application currently uses a local development configuration and should be secured before public deployment.

## 👨‍💻 Developer

**Bardia Mirzaei**

AI & Software Development Enthusiast

- GitHub: [@bardiamirzaei2012-dev](https://github.com/bardiamirzaei2012-dev)
- Website: [bardiamirzaei.com](https://bardiamirzaei.com)

## 📄 License

This project is open-source. You can add an appropriate license to define how others may use, modify, and distribute it.

---

<p align="center">
  <strong>Neural AI Studio</strong>
  <br>
  Building a smarter digital experience with local artificial intelligence.
</p>
