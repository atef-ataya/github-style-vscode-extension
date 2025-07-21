# Using Monaco Editor in Your Extension

## Overview

This guide explains how to use Monaco Editor in your VS Code extension to create a rich, VS Code-like editing experience within your webviews. Monaco Editor is the same code editor that powers VS Code itself, providing powerful features like syntax highlighting, code completion, and more.

## Basic Usage

Once you've installed Monaco Editor using the installation scripts, you can use it in your webviews. The `webviewContent.ts` file already includes the basic setup for Monaco Editor.

### Key Components

#### 1. Loading Monaco Editor

In your webview content generator function:

```typescript
// Get URIs for Monaco Editor
const monacoLoaderUri = webview.asWebviewUri(
  vscode.Uri.joinPath(extensionUri, 'node_modules', 'monaco-editor', 'min', 'vs', 'loader.js')
);

const monacoUri = webview.asWebviewUri(
  vscode.Uri.joinPath(extensionUri, 'node_modules', 'monaco-editor', 'min', 'vs')
);
```

#### 2. Including the Monaco Loader in your HTML

In your HTML template:

```html
<script src="${monacoLoaderUri}"></script>
```

#### 3. Initializing Monaco Editor

In your JavaScript code:

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

## Advanced Features

### Multi-File Editing

To implement a multi-file editing experience:

```javascript
// Create a tab container
const tabContainer = document.getElementById('tab-container');
const editorContainer = document.getElementById('editor-container');
let editors = {};
let currentFile = null;

// Function to add a new file tab
function addFileTab(filename, content, language) {
  // Create tab element
  const tab = document.createElement('div');
  tab.className = 'tab';
  tab.textContent = filename;
  tab.dataset.filename = filename;
  tabContainer.appendChild(tab);
  
  // Create editor instance (but don't render it yet)
  editors[filename] = {
    content: content,
    language: language,
    instance: null
  };
  
  // Add click event to switch tabs
  tab.addEventListener('click', () => switchTab(filename));
  
  // If this is the first tab, switch to it
  if (currentFile === null) {
    switchTab(filename);
  }
}

// Function to switch between tabs
function switchTab(filename) {
  // Update active tab styling
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.filename === filename);
  });
  
  // Save content of current editor if it exists
  if (currentFile && editors[currentFile].instance) {
    editors[currentFile].content = editors[currentFile].instance.getValue();
  }
  
  // Clear editor container
  editorContainer.innerHTML = '';
  
  // Create new editor instance if needed
  if (!editors[filename].instance) {
    const editorDiv = document.createElement('div');
    editorDiv.style.width = '100%';
    editorDiv.style.height = '100%';
    editorContainer.appendChild(editorDiv);
    
    editors[filename].instance = monaco.editor.create(editorDiv, {
      value: editors[filename].content,
      language: editors[filename].language,
      theme: 'vs-dark',
      automaticLayout: true
    });
  } else {
    // Reuse existing editor instance
    editorContainer.appendChild(editors[filename].instance.getDomNode());
    editors[filename].instance.layout();
  }
  
  currentFile = filename;
}
```

### Language Support

Monaco Editor supports many languages out of the box. To specify a language:

```javascript
monaco.editor.create(document.getElementById('editor-container'), {
  value: code,
  language: 'typescript', // or 'javascript', 'html', 'css', 'json', etc.
  theme: 'vs-dark'
});
```

### Themes

Monaco Editor comes with several built-in themes:

```javascript
// Available themes: 'vs' (light), 'vs-dark' (dark), 'hc-black' (high contrast)
monaco.editor.setTheme('vs-dark');
```

### Code Completion

Monaco Editor provides code completion for many languages. For TypeScript/JavaScript, you can enhance it by providing type definitions:

```javascript
// Add TypeScript definitions
monaco.languages.typescript.javascriptDefaults.addExtraLib(`
  declare class MyAPI {
    static method1(): string;
    static method2(param: number): void;
  }
`, 'myapi.d.ts');
```

### Code Formatting

To format code in the editor:

```javascript
editor.getAction('editor.action.formatDocument').run();
```

## Integrating with VS Code Extension

### Sending Code to VS Code

To send the code from Monaco Editor back to your VS Code extension:

```javascript
// In your webview script
const vscode = acquireVsCodeApi();

function sendCodeToVSCode() {
  const code = editor.getValue();
  vscode.postMessage({
    command: 'saveCode',
    code: code
  });
}

// Add a button to trigger this
document.getElementById('save-button').addEventListener('click', sendCodeToVSCode);
```

Then in your extension.ts file:

```typescript
panel.webview.onDidReceiveMessage(
  async (message) => {
    if (message.command === 'saveCode') {
      // Save the code to a file or process it
      const code = message.code;
      // Do something with the code...
    }
  },
  undefined,
  context.subscriptions
);
```

### Sending Data to Monaco Editor

To send data from your extension to Monaco Editor:

```typescript
// In your extension.ts
await panel.webview.postMessage({
  command: 'updateCode',
  code: 'const newCode = "Hello World";',
  language: 'javascript'
});
```

Then in your webview script:

```javascript
// Listen for messages from the extension
window.addEventListener('message', event => {
  const message = event.data;
  
  switch (message.command) {
    case 'updateCode':
      editor.setValue(message.code);
      monaco.editor.setModelLanguage(editor.getModel(), message.language);
      break;
  }
});
```

## Performance Considerations

1. **Lazy Loading**: Monaco Editor is quite large. Consider loading it only when needed.

2. **Memory Management**: Dispose of editor instances when they're no longer needed:
   ```javascript
   editor.dispose();
   ```

3. **Model Management**: For large files, consider using editor models efficiently:
   ```javascript
   // Create a model once
   const model = monaco.editor.createModel(code, 'javascript');
   
   // Use the model in an editor
   const editor = monaco.editor.create(element, {
     model: model
   });
   
   // Dispose when done
   model.dispose();
   ```

## Troubleshooting

### Common Issues

1. **Monaco Editor Not Loading**:
   - Check browser console for errors
   - Verify that the paths to Monaco Editor files are correct
   - Ensure the `out/vs` directory exists after building

2. **Editor Size Issues**:
   - Make sure the container element has a defined width and height
   - Use `automaticLayout: true` or call `editor.layout()` when container size changes

3. **WebView Content Security Policy**:
   - If you see CSP errors, ensure your webview configuration allows loading Monaco:
     ```typescript
     const panel = vscode.window.createWebviewPanel(
       'monacoEditor',
       'Monaco Editor',
       vscode.ViewColumn.One,
       {
         enableScripts: true,
         localResourceRoots: [
           vscode.Uri.joinPath(extensionUri, 'out'),
           vscode.Uri.joinPath(extensionUri, 'node_modules', 'monaco-editor')
         ]
       }
     );
     ```

## Resources

- [Monaco Editor API Documentation](https://microsoft.github.io/monaco-editor/api/index.html)
- [Monaco Editor Playground](https://microsoft.github.io/monaco-editor/playground.html)
- [Monaco Editor GitHub Repository](https://github.com/microsoft/monaco-editor)