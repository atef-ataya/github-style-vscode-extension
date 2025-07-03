# 🧠 GitHub Style Agent — VS Code Extension + OpenAI Generator

A full-stack tool that scans your GitHub repositories, learns your personal coding style, and generates new code in your voice.

This is the actual agent featured in my [YouTube tutorial](https://youtu.be/J6atjuGCDS0) — complete with a backend analyzer and VS Code extension.

---

## 🚀 Features

* Analyzes your GitHub repositories
* Extracts coding patterns, structure, and naming conventions
* Builds a personal **style profile**
* Generates new apps using OpenAI (e.g. Express.js, CRUD APIs, etc.)
* Includes a working **VS Code extension UI** for easy prompting

---

## 🛠️ Technologies Used

* 🧠 [TRAE AI](https://trae.ai/) (Builder Agent)
* 🔆 TypeScript + Node.js
* ✨ OpenAI API
* 🖡️ GitHub REST API
* 🧹 VS Code Extension (Webview + Command palette)

---

## 🛠️ Installation

1. **Clone the repo**

```bash
git clone https://github.com/atef-ataya/github-style-vscode-extension.git
cd github-style-vscode-extension
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

```bash
cp .env.example .env
```

Open `.env` and fill in:

```env
GITHUB_TOKEN=ghp_yourTokenHere
GITHUB_USERNAME=your-github-username
OPENAI_API_KEY=sk-your-openai-key
MAX_REPOS_TO_ANALYZE=20
ANALYSIS_DEPTH=detailed
```

4. **Run the tool manually or inside VS Code**

---

## 🎮 Getting Started: Two Ways to Use

You can either test the concept directly in the **TRAE AI IDE** or run the full extension **locally in VS Code**.

---

### ⚡ Option 1: Demo Inside TRAE AI (No Setup Required)

This is the quickest way to see the agent’s capabilities. You can use my pre-trained agent that generates code based on my personal GitHub style.

1. Go to the TRAE AI IDE
2. Load the public **GitHub Style Agent** from the agent library
   👉 [Link to my public TRAE AI Agent](https://github.com/atef-ataya/github-style-vscode-extension.git)
3. Enter a prompt and watch it generate code that mimics my style

---

### 💻 Option 2: Run Locally in VS Code (To Learn *Your* Style)

Install the extension locally to analyze **your** GitHub repositories and generate code in **your** personal style.

---

#### 1. Clone the Repository

```bash
git clone https://github.com/atef-ataya/github-style-vscode-extension.git
cd github-style-vscode-extension
```

---

#### 2. Install Dependencies

```bash
npm install
```

---

#### 3. Configure Your Environment

First, copy the example `.env` file:

```bash
cp .env.example .env
```

Next, open `.env` and add your credentials:

```env
# Your GitHub Personal Access Token (with 'repo' scope)
GITHUB_TOKEN=ghp_yourTokenHere

# Your GitHub Username
GITHUB_USERNAME=your-github-username

# Your OpenAI API Key
OPENAI_API_KEY=sk-your-openai-key

# Optional Configuration
MAX_REPOS_TO_ANALYZE=20
ANALYSIS_DEPTH=detailed
```

---

#### 4. Run the Extension

1. Open the project in **VS Code**
2. Press `F5` to launch the **Extension Development Host**
3. In the new window, open the **Command Palette**
   `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
4. Type and select: `GitStyle: Open Panel`
5. The extension's UI will appear in the side panel — ready to use!

---

### 🧠 What Happens Next?

* The tool will analyze your repositories
* It will build a personal **style profile**
* You’ll get auto-generated code that looks like *you* wrote it

---

## 🧪 License

MIT — use freely, modify, share.

---

## 🎮 Watch the Full Tutorial

👉 [Watch on YouTube](https://youtu.be/J6atjuGCDS0)

---
