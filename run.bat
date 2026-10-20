@echo off
setlocal
cd /d "%~dp0"

echo ============================================================
echo Starting AgriSense Platform
echo Intelligent Precision Agriculture ^& Crop Advisory System
echo ============================================================

if exist "%~dp0venv\Scripts\python.exe" (
    set "PYTHON_EXE=%~dp0venv\Scripts\python.exe"
) else if exist "%~dp0.venv\Scripts\python.exe" (
    set "PYTHON_EXE=%~dp0.venv\Scripts\python.exe"
) else (
    set "PYTHON_EXE=python"
)

echo [*] Launching Backend API on http://127.0.0.1:8000 ...
start "AgriSense Backend (FastAPI)" cmd /k "cd /d "%~dp0" && "%PYTHON_EXE%" -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [*] Launching Frontend Web Dashboard on http://127.0.0.1:5173 ...
start "AgriSense Frontend (Vite)" cmd /k "cd /d "%~dp0frontend" && npm run dev -- --host 127.0.0.1 --port 5173"

echo ============================================================
echo Services launched:
echo   - Backend API:   http://127.0.0.1:8000/docs
echo   - Web Dashboard: http://127.0.0.1:5173/
echo ============================================================
pause

