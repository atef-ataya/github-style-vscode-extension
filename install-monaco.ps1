# PowerShell script to install Monaco Editor and update package.json

Write-Host "📦 Installing Monaco Editor for enhanced UI..." -ForegroundColor Cyan

try {
    # Install Monaco Editor
    Write-Host "Installing monaco-editor..." -ForegroundColor Yellow
    npm install monaco-editor
    
    # Update package.json scripts
    Write-Host "Updating package.json scripts..." -ForegroundColor Yellow
    
    $packagePath = "./package.json"
    $packageJson = Get-Content $packagePath -Raw | ConvertFrom-Json
    
    # Add enhanced scripts
    if (-not $packageJson.scripts.PSObject.Properties.Name.Contains("build:monaco")) {
        $packageJson.scripts | Add-Member -Name "build:monaco" -Value "copy /node_modules/monaco-editor/min/vs/loader.js ./out/vs/" -MemberType NoteProperty
    } else {
        $packageJson.scripts."build:monaco" = "copy /node_modules/monaco-editor/min/vs/loader.js ./out/vs/"
    }
    
    # Update prebuild script
    $packageJson.scripts.prebuild = "npm run clean && npm run build:monaco"
    
    # Add dev:enhanced script
    if (-not $packageJson.scripts.PSObject.Properties.Name.Contains("dev:enhanced")) {
        $packageJson.scripts | Add-Member -Name "dev:enhanced" -Value "npm run build && code --extensionDevelopmentPath=." -MemberType NoteProperty
    } else {
        $packageJson.scripts."dev:enhanced" = "npm run build && code --extensionDevelopmentPath=."
    }
    
    # Add monaco-editor dependency
    if (-not $packageJson.dependencies.PSObject.Properties.Name.Contains("monaco-editor")) {
        $packageJson.dependencies | Add-Member -Name "monaco-editor" -Value "^latest" -MemberType NoteProperty
    } else {
        $packageJson.dependencies."monaco-editor" = "^latest"
    }
    
    # Save updated package.json
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content $packagePath
    
    Write-Host "`n✅ Monaco Editor installed successfully!" -ForegroundColor Green
    Write-Host "`n🎨 Enhanced UI Features Added:" -ForegroundColor Cyan
    Write-Host "   • Monaco Editor (VS Code-like editing)" -ForegroundColor White
    Write-Host "   • Multi-file tab interface" -ForegroundColor White
    Write-Host "   • Syntax highlighting for all languages" -ForegroundColor White
    Write-Host "   • Project scaffolding and file management" -ForegroundColor White
    Write-Host "   • Professional download/export options" -ForegroundColor White
    
    Write-Host "`n🚀 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. npm run build         # Build with Monaco Editor" -ForegroundColor White
    Write-Host "2. Press F5 in VS Code   # Test the enhanced UI" -ForegroundColor White
    Write-Host "3. Try generating a project template!" -ForegroundColor White
    
} catch {
    Write-Host "`n❌ Error installing Monaco Editor: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n🔄 Try manual installation:" -ForegroundColor Yellow
    Write-Host "npm install monaco-editor" -ForegroundColor White
    exit 1
}