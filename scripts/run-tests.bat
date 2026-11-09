@echo off
echo ========================================================
echo  Running Ward Zero Automated Test Suites
echo ========================================================
cd /d "%~dp0\.."
echo [1/2] Running Pytest Unit & Integration Tests...
backend\.venv\Scripts\pytest.exe backend\tests -v
echo.
echo [2/2] Running 23-Step Non-Negotiable Acceptance Test...
backend\.venv\Scripts\python.exe backend\tests\test_e2e_acceptance.py
echo.
echo ========================================================
echo  All Tests Finished!
echo ========================================================
pause

