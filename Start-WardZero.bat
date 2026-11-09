@echo off
title Ward Zero Healthcare Platform Launcher
cd /d "%~dp0"
echo ========================================================
echo        WARD ZERO HEALTHCARE PLATFORM LAUNCHER
echo ========================================================
echo.
echo Launching WardZero.exe (Simultaneous Dual-App Runtime)...
echo.
start "" "%~dp0WardZero.exe"
exit

