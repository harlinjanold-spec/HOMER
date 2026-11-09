@echo off
echo ========================================================
echo  Starting App 2 - Ward Zero Healthcare Command Centre
echo  URL: http://localhost:5174
echo ========================================================
cd /d "%~dp0..\apps\healthcare-command-centre"
call npm run dev
pause
