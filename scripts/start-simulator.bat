@echo off
echo ========================================================
echo  Starting App 1 - Ward Zero Virtual Home Simulator
echo  URL: http://localhost:5173
echo ========================================================
cd /d "%~dp0..\apps\home-simulator"
call npm run dev
pause
