# Clean Restart Script for MindTalk AI
# This ensures a complete fresh start with environment variables loaded

Write-Host "🛑 Stopping all Node processes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.Name -like "*node*"} | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "🧹 Clearing build caches..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .vinxi -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .output -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules/.vite -ErrorAction SilentlyContinue

Write-Host "✅ Checking .env file..." -ForegroundColor Green
if (Test-Path .env) {
    $khayaKey = Select-String -Path .env -Pattern "^KHAYA_API_KEY=" | Select-Object -First 1
    if ($khayaKey) {
        Write-Host "   ✓ KHAYA_API_KEY found in .env" -ForegroundColor Green
    } else {
        Write-Host "   ✗ KHAYA_API_KEY not found in .env!" -ForegroundColor Red
        Write-Host "   Add this line to .env:" -ForegroundColor Yellow
        Write-Host "   KHAYA_API_KEY=d9c617a58b7248ff8ef0995b97765f97" -ForegroundColor Cyan
        exit 1
    }
} else {
    Write-Host "   ✗ .env file not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Starting development server..." -ForegroundColor Green
Write-Host "   Watch for: [Transcription] KHAYA_API_KEY check: SET" -ForegroundColor Cyan
Write-Host ""

npm run dev
