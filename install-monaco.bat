@echo off
echo 📦 Installing Monaco Editor for enhanced UI...

echo Installing monaco-editor...
call npm install monaco-editor
if %ERRORLEVEL% neq 0 (
    echo ❌ Error installing Monaco Editor
    echo 🔄 Try manual installation:
    echo npm install monaco-editor
    exit /b 1
)

echo Updating package.json scripts...

node -e "const fs = require('fs'); const packagePath = './package.json'; const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8')); packageJson.scripts = { ...packageJson.scripts, 'build:monaco': 'copy /node_modules/monaco-editor/min/vs/loader.js ./out/vs/', 'prebuild': 'npm run clean && npm run build:monaco', 'dev:enhanced': 'npm run build && code --extensionDevelopmentPath=.' }; packageJson.dependencies = { ...packageJson.dependencies, 'monaco-editor': '^latest' }; fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));"

if %ERRORLEVEL% neq 0 (
    echo ❌ Error updating package.json
    exit /b 1
)

echo.
echo ✅ Monaco Editor installed successfully!

echo.
echo 🎨 Enhanced UI Features Added:
echo    • Monaco Editor (VS Code-like editing)
echo    • Multi-file tab interface
echo    • Syntax highlighting for all languages
echo    • Project scaffolding and file management
echo    • Professional download/export options

echo.
echo 🚀 Next Steps:
echo 1. npm run build         # Build with Monaco Editor
echo 2. Press F5 in VS Code   # Test the enhanced UI
echo 3. Try generating a project template!

exit /b 0