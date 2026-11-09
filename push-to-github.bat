@echo off
title Push Ward Zero to GitHub
cd /d "%~dp0"
echo ========================================================
echo        WARD ZERO GITHUB PUSH UTILITY
echo ========================================================
echo.
git remote -v
echo.
set /p REPO_URL="Enter your GitHub Repository URL (e.g. https://github.com/YourUsername/HOMER.git): "
if not "%REPO_URL%"=="" (
    git remote remove origin 2>nul
    git remote add origin %REPO_URL%
    echo Remote 'origin' configured to: %REPO_URL%
)
echo.
echo Pushing branch 'main' to GitHub (including video and executable)...
git branch -M main
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo  SUCCESS: Ward Zero has been uploaded to your GitHub!
    echo ========================================================
) else (
    echo.
    echo If authentication failed, Git Credential Manager will prompt
    echo you to sign in to your GitHub account in your browser.
)
echo.
pause
