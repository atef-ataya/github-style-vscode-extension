# Contributing to GitHub Style Agent

Thank you for your interest in contributing to the GitHub Style Agent VS Code Extension! We welcome contributions from the community.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- VS Code
- Git

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/github-style-vscode-extension.git
   cd github-style-vscode-extension
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your GitHub token, username, and OpenAI API key.

4. **Run the extension in development mode**
   - Open the project in VS Code
   - Press `F5` to launch the Extension Development Host
   - Test your changes in the new VS Code window

## How to Contribute

### Reporting Issues

- Use the [GitHub Issues](https://github.com/atef-ataya/github-style-vscode-extension/issues) page
- Search existing issues before creating a new one
- Provide detailed information including:
  - Steps to reproduce
  - Expected vs actual behavior
  - Environment details (OS, VS Code version, etc.)
  - Error messages or logs

### Submitting Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm test
   npm run lint
   ```

4. **Commit your changes**
   ```bash
   git commit -m "Add: brief description of your changes"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Use a clear, descriptive title
   - Explain what changes you made and why
   - Reference any related issues

## Code Style Guidelines

- Use TypeScript for new code
- Follow existing naming conventions
- Add JSDoc comments for public methods
- Use meaningful variable and function names
- Keep functions small and focused

## Testing

- Write unit tests for new functionality
- Ensure all existing tests pass
- Test the VS Code extension manually

## Documentation

- Update README.md if you add new features
- Add or update JSDoc comments
- Update relevant documentation in the `docs/` folder

## Questions?

If you have questions about contributing, feel free to:
- Open an issue for discussion
- Contact the maintainers

Thank you for contributing! 🎉