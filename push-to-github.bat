@echo off
title Push Ward Zero to GitHub
cd /d "%~dp0"
echo ========================================================
echo        WARD ZERO GITHUB PUSH UTILITY
echo        Target Account: https://github.com/harlinjanold-spec
echo ========================================================
echo.

:: Ensure origin is set to user's repo
git remote remove origin 2>nul
git remote add origin https://github.com/harlinjanold-spec/HOMER.git

echo Configured Remote: https://github.com/harlinjanold-spec/HOMER.git
echo.
echo NOTE: Make sure you have created the empty repository "HOMER" 
echo at https://github.com/new before pushing!
echo.
echo Press any key to push branch 'main' (including 85MB video and executable)...
pause >nul
echo.
echo Uploading to GitHub... (This may take a moment for the 85MB video)
git branch -M main
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo  SUCCESS: Ward Zero has been uploaded to your GitHub!
    echo  View it at: https://github.com/harlinjanold-spec/HOMER
    echo ========================================================
) else (
    echo.
    echo If you see "Repository not found":
    echo 1. Open https://github.com/new in your browser.
    echo 2. Set repository name to "HOMER".
    echo 3. Click "Create repository".
    echo 4. Run this script again!
)
echo.
pause
