@echo off
echo ========================================================
echo  Starting Ward Zero Shared Backend (FastAPI + SQLite)
echo  Endpoint: http://localhost:8000
echo  API Docs: http://localhost:8000/docs
echo  WebSocket: ws://localhost:8000/ws
echo ========================================================
cd /d "%~dp0.."
call backend\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
pause
