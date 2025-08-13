# PowerShell script to start Chrome with CORS disabled
Write-Host "Starting Chrome with CORS disabled for development..." -ForegroundColor Green
Write-Host ""
Write-Host "This will open Chrome with web security disabled." -ForegroundColor Yellow
Write-Host "ONLY use this for development/testing!" -ForegroundColor Red
Write-Host ""

# Create temporary directory for Chrome
$tempDir = Join-Path $env:TEMP "chrome_dev"
if (!(Test-Path $tempDir)) {
    New-Item -ItemType Directory -Path $tempDir | Out-Null
}

# Start Chrome with CORS disabled
try {
    Start-Process "chrome.exe" -ArgumentList "--disable-web-security", "--user-data-dir=`"$tempDir`"", "--allow-running-insecure-content"
    Write-Host "Chrome started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Now open your auth.html file in this Chrome instance." -ForegroundColor Cyan
} catch {
    Write-Host "Error starting Chrome: $_" -ForegroundColor Red
    Write-Host "Make sure Chrome is installed and accessible." -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Press Enter to exit"
