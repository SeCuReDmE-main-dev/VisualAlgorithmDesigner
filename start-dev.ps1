# start-dev.ps1 — VAD Development Launcher
# Starts ReaAaS-N-backend (:3001) and ReaAaS-N-frontend (:5173) in parallel windows.
# Usage: .\start-dev.ps1
# Plan reference: Phase 0, Task #10

$root = $PSScriptRoot

Write-Host "Starting VAD development servers..." -ForegroundColor Cyan

# Backend — Express :3001
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "
  `$Host.UI.RawUI.WindowTitle = 'VAD Backend :3001';
  Set-Location '$root\ReaAaS-N-backend';
  Write-Host 'Installing backend dependencies...' -ForegroundColor Yellow;
  npm install --prefer-offline 2>&1 | Out-Null;
  Write-Host 'Starting backend on http://localhost:3001' -ForegroundColor Green;
  npm run dev
"

# Frontend — Vite :5173
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "
  `$Host.UI.RawUI.WindowTitle = 'VAD Frontend :5173';
  Set-Location '$root\ReaAaS-N-frontend';
  Write-Host 'Installing frontend dependencies...' -ForegroundColor Yellow;
  npm install --prefer-offline 2>&1 | Out-Null;
  Write-Host 'Starting frontend on http://localhost:5173' -ForegroundColor Green;
  npm run dev
"

Write-Host ""
Write-Host "Two terminal windows opened:" -ForegroundColor Cyan
Write-Host "  Backend  → http://localhost:3001" -ForegroundColor White
Write-Host "  Frontend → http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Health check: curl http://localhost:3001/api/health" -ForegroundColor DarkGray
