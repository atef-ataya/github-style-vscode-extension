# Monaco Editor Setup Guide

## Overview

This guide explains how to install and set up Monaco Editor for enhanced UI features in the GitHub Style Agent extension. Monaco Editor is the same code editor that powers VS Code, providing powerful features like syntax highlighting, code completion, and more.

## Installation

### Automatic Installation

We've provided scripts that automatically install Monaco Editor and update your project configuration:

**On Windows:**

Using PowerShell:
```powershell
.\install-monaco.ps1
```

Using Command Prompt:
```cmd
install-monaco.bat
```

**On macOS/Linux:**
```bash
chmod +x install-monaco.js
./install-monaco.js
```

**Using Node directly (all platforms):**
```bash
node install-monaco.js
```

This script will:
1. Install the Monaco Editor package
2. Update your package.json with necessary scripts
3. Configure the build process to include Monaco Editor files

### Manual Installation

If you prefer to install manually, follow these steps:

1. Install Monaco Editor:
   ```bash
   npm install monaco-editor
   ```

2. Update your package.json scripts:
   ```json
   "scripts": {
     "build:monaco": "copy /node_modules/monaco-editor/min/vs/loader.js ./out/vs/",
     "prebuild": "npm run clean && npm run build:monaco",
     "dev:enhanced": "npm run build && code --extensionDevelopmentPath=."
   }
   ```

3. Add Monaco Editor to your dependencies:
   ```json
   "dependencies": {
     "monaco-editor": "^latest"
   }
   ```

## Using Monaco Editor in Your Extension

The webviewContent.ts file already includes Monaco Editor integration. The key components are:

1. **Loading Monaco Editor**:
   ```typescript
   // Get URIs for Monaco Editor
   const monacoLoaderUri = webview.asWebviewUri(
     vscode.Uri.joinPath(extensionUri, 'node_modules', 'monaco-editor', 'min', 'vs', 'loader.js')
   );
   
   const monacoUri = webview.asWebviewUri(
     vscode.Uri.joinPath(extensionUri, 'node_modules', 'monaco-editor', 'min', 'vs')
   );
   ```

2. **Including the Monaco Loader in your HTML**:
   ```html
   <script src="${monacoLoaderUri}"></script>
   ```

3. **Initializing Monaco Editor**:
   ```javascript
   require.config({ paths: { vs: '${monacoUri.toString()}' } });
   require(['vs/editor/editor.main'], function() {
     const editor = monaco.editor.create(document.getElementById('editor-container'), {
       value: '// Your code here',
       language: 'javascript',
       theme: 'vs-dark',
       automaticLayout: true
     });
   });
   ```

## Enhanced UI Features

With Monaco Editor integrated, your extension now offers:

- **Professional Code Editing**: VS Code-like editing experience
- **Multi-file Tab Interface**: Work with multiple files simultaneously
- **Syntax Highlighting**: Support for all major programming languages
- **Project Scaffolding**: Create and manage project files
- **Export Options**: Professional download and export capabilities

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

## Verifying Installation

### Basic Verification

To verify that Monaco Editor is properly installed and configured, you can run the test script:

```bash
node test-monaco-setup.js
```

This script will check:
- If Monaco Editor is installed in node_modules
- If package.json has the correct dependencies and scripts
- If webviewContent.ts references Monaco Editor

### Testing in VS Code

To test if Monaco Editor is working correctly in your VS Code extension:

1. Build the extension:
   ```bash
   npm run build
   ```

2. Run the Monaco Editor test:
   ```bash
   npm run test:monaco
   ```

This test will verify:
- If Monaco Editor files are properly copied to the output directory
- If the extension's webview can load Monaco Editor

## Next Steps

After installation:

1. Run `npm run build` to build with Monaco Editor
2. Press F5 in VS Code to test the enhanced UI
3. Try generating a project template with the new interface
4. Check out the [Monaco Editor Usage Guide](./monaco-editor-usage.md) for detailed information on how to use Monaco Editor in your extension

## Resources

- [Monaco Editor Documentation](https://microsoft.github.io/monaco-editor/)
- [Monaco Editor GitHub Repository](https://github.com/microsoft/monaco-editor)