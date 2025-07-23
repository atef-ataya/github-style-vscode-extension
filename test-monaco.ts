import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('test.monaco', () => {
    const panel = vscode.window.createWebviewPanel(
      'testMonaco',
      'Monaco Test - SIMPLE',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(context.extensionUri, 'out'),
          context.extensionUri,
        ],
      }
    );

    const monacoLoaderUri = panel.webview.asWebviewUri(
      vscode.Uri.joinPath(context.extensionUri, 'out', 'vs', 'loader.js')
    );

    const monacoUri = panel.webview.asWebviewUri(
      vscode.Uri.joinPath(context.extensionUri, 'out', 'vs')
    );

    panel.webview.html = `<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body style="background:#1e1e1e;color:#fff;font-family:monospace;">
    <h1>Monaco Test</h1>
    <div id="status">Loading...</div>
    <div id="editor" style="width:100%;height:300px;border:1px solid #555;"></div>
    
    <script src="${monacoLoaderUri.toString()}"></script>
    <script>
        document.getElementById('status').innerHTML = 'Monaco script loaded, configuring...';
        require.config({ paths: { vs: '${monacoUri.toString()}' } });
        require(['vs/editor/editor.main'], function () {
            document.getElementById('status').innerHTML = 'SUCCESS! Monaco loaded.';
            monaco.editor.create(document.getElementById('editor'), {
                value: 'console.log("Monaco works!");',
                language: 'javascript',
                theme: 'vs-dark'
            });
        }, function(err) {
            document.getElementById('status').innerHTML = 'ERROR: ' + JSON.stringify(err);
        });
    </script>
</body>
</html>`;
  });
  context.subscriptions.push(disposable);
}
