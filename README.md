# 🧠 GitHub Style Agent — VS Code Extension + OpenAI Generator

A full-stack tool that scans your GitHub repositories, learns your personal coding style, and generates new code in your voice.

This is the actual agent featured in my [YouTube tutorial](https://youtube.com/your-video-link) — complete with a backend analyzer and VS Code extension.

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

## 🧑‍💻 Usage

### Option A: Command Line (Code Analyzer)

```ts
import GitHubCodeAnalyzer from './src';

const analyzer = new GitHubCodeAnalyzer(process.env.GITHUB_TOKEN, process.env.GITHUB_USERNAME);

const run = async () => {
  const repos = await analyzer.getPersonalRepositories();
  const patterns = await analyzer.analyzeRepository(repos[0].name);

  const spec = 'Create a REST API with login and register';
  const code = await analyzer.generateCode(spec);
  console.log(code);
};

run();
```

### Option B: VS Code Extension

1. Open this project in VS Code
2. Open the Command Palette → "GitStyle: Open Panel"
3. Fill in your credentials
4. Describe what you want to build
5. Click **Analyze & Generate**

---

## 📸 Screenshots (Optional)

> Add these images to `/assets/screenshots/` and use this format:

```md
![Extension UI](assets/screenshots/extension-ui.png)
```

---

## 🧪 License

MIT — use freely, modify, share.

---

## 🎮 Watch the Full Tutorial

👉 [Watch on YouTube](https://youtube.com/your-video-link)

---
