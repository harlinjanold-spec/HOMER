@echo off
set SCRIPT_DIR=%~dp0
echo ========================================================
echo  Launching WARD ZERO - Virtual Home Hospital Monorepo
echo  1. Shared Backend        -> http://localhost:8000
echo  2. App 1 Home Simulator  -> http://localhost:5173
echo  3. App 2 Command Centre  -> http://localhost:5174
echo ========================================================

start "Ward Zero Backend" cmd /c "%SCRIPT_DIR%start-backend.bat"
ping -n 3 127.0.0.1 >nul
start "Ward Zero App 1 (Simulator)" cmd /c "%SCRIPT_DIR%start-simulator.bat"
ping -n 2 127.0.0.1 >nul
start "Ward Zero App 2 (Command Centre)" cmd /c "%SCRIPT_DIR%start-command-centre.bat"

echo All Ward Zero services launched in independent windows!
