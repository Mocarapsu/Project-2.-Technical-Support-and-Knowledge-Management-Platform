@echo off
title RIALSA - Plataforma Completa TI (Grupo Industrial Delnorte)
color 0A
cd /d "%~dp0"

echo ==============================================================
echo   INICIANDO PLATAFORMA INTEGRAL RIALSA GID
echo   1. Frontend React + Vite:   http://localhost:5173
echo   2. Microservicio IA RAG:    http://localhost:8000
echo ==============================================================
echo.

echo [1/2] Iniciando Microservicio de IA en segundo plano...
start "RIALSA_AI_SERVICE" /min cmd /c "python main.py"

echo [2/2] Iniciando Frontend React (Vite)...
start "RIALSA_FRONTEND" /min cmd /c "cd frontend && npm run dev -- --host --port 5173"

echo Esperando 3 segundos a que los servicios inicien...
timeout /t 3 /nobreak >nul

echo Abriendo navegador en http://localhost:5173/ ...
start http://localhost:5173/

echo.
echo ==============================================================
echo   PLATAFORMA EN LINEA
echo   - Web App: http://localhost:5173/
echo   - AI Docs: http://localhost:8000/docs
echo   (Puedes cerrar esta ventana, los servicios siguen activos)
echo ==============================================================
pause

