@echo off
title RIALSA AI Microservice - Salvador Rivera Delgado
color 0B
cd /d "%~dp0"

echo ==============================================================
echo   INICIANDO RIALSA AI RAG SERVICE (Salvador Rivera Delgado)
echo   Microservicio de IA: http://localhost:8000
echo   Portal Web (Frontend): http://localhost:5173
echo ==============================================================
echo.

python main.py
if errorlevel 1 (
    echo.
    echo ⚠️ Error detectado. Intentando liberar puerto 8000...
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do taskkill /f /pid %%a >nul 2>&1
    python main.py
)
pause
