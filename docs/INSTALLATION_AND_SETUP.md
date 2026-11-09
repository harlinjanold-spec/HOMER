# WARD ZERO – INSTALLATION & SETUP GUIDE

## 1. System Requirements

- **Operating System**: Windows 10/11, macOS, or Linux.
- **Node.js**: v18.0.0 or later (v20+ recommended).
- **Python**: v3.10, v3.11, v3.12, or v3.13.
- **Package Managers**: `npm` (bundled with Node.js) and `pip` (bundled with Python).

---

## 2. Quick Automated Launch (Windows)

To launch all components simultaneously in independent terminal windows:
```powershell
scripts\start-all.bat
```
This automatically launches:
1. `http://localhost:8000` — Shared Python FastAPI Backend & WebSocket server.
2. `http://localhost:5173` — App 1: Ward Zero Virtual Home Simulator.
3. `http://localhost:5174` — App 2: Ward Zero Healthcare Command Centre.

---

## 3. Manual Step-by-Step Setup

### Step 3.1: Python Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
# source .venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt

# Seed synthetic database
python -m backend.database.seed_data

# Start backend server
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
Verify backend is online at `http://localhost:8000/docs`.

### Step 3.2: Frontend Dependencies Setup
From the repository root:
```bash
npm install
```
This installs dependencies across both frontend workspaces (`apps/home-simulator` and `apps/healthcare-command-centre`).

### Step 3.3: Launch App 1 – Virtual Home Simulator
In a separate terminal:
```bash
npm run dev:sim
```
Open your browser to: `http://localhost:5173`

### Step 3.4: Launch App 2 – Healthcare Command Centre
In another separate terminal:
```bash
npm run dev:cmd
```
Open your browser to: `http://localhost:5174`

---

## 4. Running Automated Tests

Run the full automated test suite:
```powershell
scripts\run-tests.bat
```
Or directly via pytest:
```bash
backend\.venv\Scripts\pytest.exe backend\tests -v
backend\.venv\Scripts\python.exe backend\tests\test_e2e_acceptance.py
```
Both test suites will execute and verify all 23 non-negotiable hackathon criteria.

