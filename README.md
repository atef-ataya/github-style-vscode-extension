# 🧠 GitHub Style Agent — VS Code Extension + OpenAI Generator

[![GitHub stars](https://img.shields.io/github/stars/atef-ataya/github-style-vscode-extension?style=social)](https://github.com/atef-ataya/github-style-vscode-extension/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/atef-ataya/github-style-vscode-extension?style=social)](https://github.com/atef-ataya/github-style-vscode-extension/network/members)
[![GitHub issues](https://img.shields.io/github/issues/atef-ataya/github-style-vscode-extension)](https://github.com/atef-ataya/github-style-vscode-extension/issues)
[![GitHub license](https://img.shields.io/github/license/atef-ataya/github-style-vscode-extension)](https://github.com/atef-ataya/github-style-vscode-extension/blob/main/LICENSE)
[![Twitter](https://img.shields.io/twitter/url?style=social&url=https%3A%2F%2Fgithub.com%2Fatef-ataya%2Fgithub-style-vscode-extension)](https://twitter.com/intent/tweet?text=Check%20out%20this%20awesome%20GitHub%20Style%20Agent%20VS%20Code%20Extension:&url=https%3A%2F%2Fgithub.com%2Fatef-ataya%2Fgithub-style-vscode-extension)

A full-stack tool that scans your GitHub repositories, learns your personal coding style, and generates new code in your voice.

This is the actual agent featured in my [YouTube tutorial](https://youtu.be/J6atjuGCDS0) — complete with a backend analyzer and VS Code extension.

<p align="center">
  <img src="https://raw.githubusercontent.com/atef-ataya/github-style-vscode-extension/main/assets/github-style-agent-banner.png" alt="GitHub Style Agent Banner" width="800">
</p>

## 📚 Table of Contents

- [Features](#-features)
- [Technologies Used](#️-technologies-used)
- [Installation](#️-installation)
- [Getting Started](#-getting-started)
- [How It Works](#-how-it-works)
- [Contributing](#-contributing)
- [License](#-license)
- [Watch the Tutorial](#-watch-the-tutorial)

## 🚀 Features

* Analyzes your GitHub repositories
* Extracts coding patterns, structure, and naming conventions
* Builds a personal **style profile**
* Generates new apps using OpenAI (e.g. Express.js, CRUD APIs, etc.)
* Includes a working **VS Code extension UI** for easy prompting

## 🛠️ Technologies Used

* 🧠 AI-Powered Code Generation
* 🔆 TypeScript + Node.js
* ✨ OpenAI API
* 🖡️ GitHub REST API
* 🧹 VS Code Extension (Webview + Command palette)

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

## 🎮 Getting Started
### 💻 Run Locally in VS Code (To Learn *Your* Style)

Install the extension locally to analyze **your** GitHub repositories and generate code in **your** personal style.

#### 1. Clone the Repository

```bash
git clone https://github.com/atef-ataya/github-style-vscode-extension.git
cd github-style-vscode-extension
```

#### 2. Install Dependencies

```bash
npm install
```

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

#### 4. Run the Extension

1. Open the project in **VS Code**
2. Press `F5` to launch the **Extension Development Host**
3. In the new window, open the **Command Palette**
   `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
4. Type and select: `GitStyle: Open Panel`
5. The extension's UI will appear in the side panel — ready to use!

## 🧠 How It Works

1. **Repository Analysis**: The tool connects to GitHub and analyzes your repositories.
2. **Style Extraction**: It identifies patterns in your coding style, including naming conventions, formatting preferences, and architectural choices.
3. **Profile Creation**: A personalized style profile is created based on the analysis.
4. **Code Generation**: When you provide a prompt, the tool uses your style profile and OpenAI to generate code that matches your personal style.

For more detailed information, check out the [documentation](./docs/quick-start.md).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read our [Contributing Guidelines](./docs/CONTRIBUTING.md) for more details.

## 🧪 License

MIT — use freely, modify, share.

## 🎮 Watch the Tutorial

👉 [Watch on YouTube](https://youtu.be/J6atjuGCDS0)

---

<p align="center">
Made with ❤️ by <a href="https://github.com/atef-ataya">Atef Ataya</a>
</p>
