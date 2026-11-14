@echo off
echo === Gestion RH - Commune Urbaine de Meknes ===
echo (Demarrez MySQL dans XAMPP avant de continuer)
if not exist backend\node_modules (cd backend && call npm install && cd ..)
if not exist frontend\node_modules (cd frontend && call npm install && cd ..)
start "API" cmd /k "cd backend && npm start"
start "WEB" cmd /k "cd frontend && npm run dev"
timeout /t 6 >nul
start http://localhost:3000
