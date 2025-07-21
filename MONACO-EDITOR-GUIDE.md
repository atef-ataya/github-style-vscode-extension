# Monaco Editor Integration Guide

## Overview

This guide provides a comprehensive overview of how to install, configure, and use Monaco Editor in the GitHub Style Agent VS Code extension. Monaco Editor is the same code editor that powers VS Code, providing powerful features like syntax highlighting, code completion, and more.

## Quick Start

### Installation

**On Windows:**

Using PowerShell:
```powershell
.\install-monaco.ps1
npm run build
```

Using Command Prompt:
```cmd
install-monaco.bat
npm run build
```

**On macOS/Linux:**
```bash
chmod +x install-monaco.js
./install-monaco.js
npm run build
```

**Using npm script (all platforms):**
```bash
npm run install:monaco
npm run build
```

### Verification

To verify the installation:
```bash
node test-monaco-setup.js
```

To test Monaco Editor in VS Code:
```bash
npm run test:monaco
```

## Documentation

For detailed information, refer to these guides:

1. [Monaco Editor Setup Guide](./docs/monaco-editor-setup.md) - Detailed installation and configuration instructions
2. [Monaco Editor Usage Guide](./docs/monaco-editor-usage.md) - How to use Monaco Editor in your extension

## Features

With Monaco Editor integrated, your extension now offers:

- **Professional Code Editing**: VS Code-like editing experience
- **Multi-file Tab Interface**: Work with multiple files simultaneously
- **Syntax Highlighting**: Support for all major programming languages
- **Project Scaffolding**: Create and manage project files
- **Export Options**: Professional download and export capabilities

## Project Structure

The Monaco Editor integration consists of these key files:

- **Installation Scripts**:
  - `install-monaco.js` - Node.js installation script
  - `install-monaco.ps1` - PowerShell installation script for Windows
  - `install-monaco.bat` - Batch file installation script for Windows

- **Test Scripts**:
  - `test-monaco-setup.js` - Verifies installation configuration
  - `test/monaco-test.js` - Tests Monaco Editor in VS Code
  - `test/runTest.js` - Runner for Monaco Editor tests

- **Documentation**:
  - `docs/monaco-editor-setup.md` - Setup guide
  - `docs/monaco-editor-usage.md` - Usage guide

- **Integration Files**:
  - `webviewContent.ts` - Contains Monaco Editor integration code

## Troubleshooting

### Common Issues

1. **Monaco Editor Not Loading**:
   - Ensure the build process correctly copies the Monaco files
   - Check browser console for path errors
   - Verify that the paths in webviewContent.ts are correct

2. **Styling Issues**:
   - Monaco Editor requires specific CSS settings to render properly
   - Ensure container elements have appropriate dimensions

3. **Build Errors**:
   - If you encounter errors during build, try running:
     ```bash
     npm run clean
     npm install
     npm run build
     ```

## Next Steps

After installation:

1. Run `npm run build` to build with Monaco Editor
2. Press F5 in VS Code to test the enhanced UI
3. Try generating a project template with the new interface

## Resources

- [Monaco Editor Documentation](https://microsoft.github.io/monaco-editor/)
- [Monaco Editor GitHub Repository](https://github.com/microsoft/monaco-editor)
- [Monaco Editor API Reference](https://microsoft.github.io/monaco-editor/api/index.html)
- [Monaco Editor Playground](https://microsoft.github.io/monaco-editor/playground.html)