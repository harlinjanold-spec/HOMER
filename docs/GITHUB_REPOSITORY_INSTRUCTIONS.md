# WARD ZERO — GITHUB REPOSITORY & SUBMISSION INSTRUCTIONS
## Codebase Organization, Clean Setup, and Hackathon Evaluation Guide

---

## 1. Repository Overview

This repository houses the complete, self-contained codebase for **Ward Zero (Operation Ward Zero Hackathon Submission)**. It is organized as a unified monorepo containing two decoupled frontend applications and a shared asynchronous Python backend.

### Repository Layout
```
d:\HOMER\
├── .gitignore                         # Comprehensive ignore file for Python, Node, and builds
├── README.md                          # Master project documentation, quickstart & architecture
├── package.json                       # Monorepo root workspace configuration (npm workspaces)
├── package-lock.json                  # Root lockfile
├── pytest.ini                         # Backend test suite configuration
├── ward_zero.db                       # Pre-seeded SQLite database (4 patients, 44 devices, 768+ events)
│
├── apps/
│   ├── home-simulator/               # APP 1: 2D Interactive Virtual Home Simulator (Vite, React 18, TS)
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.js
│   │   ├── src/
│   │   │   ├── components/            # Floorplan, PatientAvatar, 11 IoT Widgets, Modals
│   │   │   ├── services/              # API client, WebSocket listener, IndexedDB offline buffer
│   │   │   └── types/                 # Strict TypeScript schemas
│   │   └── dist/                      # Production build output
│   │
│   └── healthcare-command-centre/    # APP 2: Clinical Healthcare Command Centre (Vite, React 18, TS)
│       ├── package.json
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       ├── src/
│       │   ├── components/            # Navigation, Live Charts, Risk Breakdown, Audit Views
│       │   ├── services/              # API client, WebSocket hub, Command dispatcher
│       │   └── types/                 # Clinical schemas
│       └── dist/                      # Production build output
│
├── backend/                           # SHARED BACKEND (FastAPI, Python 3.13)
│   ├── main.py                        # Application entry point, CORS, WebSocket endpoint (/ws)
│   ├── requirements.txt               # Pinned Python dependencies
│   ├── database/
│   │   ├── connection.py              # SQLAlchemy engine & session factory
│   │   ├── models.py                  # ORM models (Patients, Devices, Telemetry, Alerts, etc.)
│   │   └── seed_data.py               # Automated synthetic data generation script
│   ├── api/
│   │   ├── websocket_manager.py       # Bi-directional real-time connection hub
│   │   └── routers/                   # REST endpoints (patients, telemetry, ai_risk, alerts, etc.)
│   ├── telemetry/                     # Idempotent ingestion, deduplication, quality classification
│   ├── digital_twin/                  # Patient Digital Twin state manager & provenance engine
│   ├── ai_engine/                     # Scikit-Learn IsolationForest ML, 3-tier risk, clinical NLP
│   ├── alerts/                        # Auditable alert state machine & escalation watchdog
│   ├── commands/                      # Remote command dispatcher & execution verifier
│   ├── reliability/                   # Injected failure controller & resilience benchmarks
│   └── tests/
│       ├── test_backend.py            # Unit & integration test suite (9 tests)
│       └── test_e2e_acceptance.py     # Verification of all 23 non-negotiable criteria
│
├── datasets/synthetic/                # Synthetic patient records & IoT sensor catalog
│   ├── patients_dataset.json
│   └── iot_devices_schema.json
│
├── docs/                              # Complete engineering documentation suite (12 docs)
│   ├── SYSTEM_ARCHITECTURE.md
│   ├── DATA_FLOW.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_DOCUMENTATION.md
│   ├── INSTALLATION_AND_SETUP.md
│   ├── SIMULATION_USAGE_INSTRUCTIONS.md
│   ├── AI_ML_METHODOLOGY.md
│   ├── RELIABILITY_AND_FAULT_REPORT.md
│   ├── CLINICAL_SAFETY_AND_LIMITATIONS.md
│   ├── TECHNICAL_REPORT.md
│   ├── DEMONSTRATION_VIDEO_SCRIPT.md
│   └── GITHUB_REPOSITORY_INSTRUCTIONS.md
│
└── scripts/                           # Automated Windows/POSIX launcher scripts
    ├── start-all.bat                  # One-click launcher for all 3 services
    ├── start-backend.bat              # Standalone FastAPI launcher
    ├── start-simulator.bat            # Standalone App 1 launcher
    ├── start-command-centre.bat       # Standalone App 2 launcher
    └── run-tests.bat                  # Automated test verification runner
```

---

## 2. Preparing the Repository for Git Commit

### 2.1 Recommended `.gitignore` File
Ensure the root `.gitignore` excludes temporary artifacts, caches, and local virtual environments while preserving configuration files and seed scripts:

```gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
backend/.venv/
.pytest_cache/
.coverage

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
apps/*/node_modules/
apps/*/dist/

# Operating System & IDEs
.DS_Store
Thumbs.db
.vscode/
.idea/
*.swp
*.swo

# Environment files
.env
.env.local
```

### 2.2 Git Initialization & Initial Commit
Execute the following commands from the project root (`d:\HOMER`):

```bash
# Initialize git repository
git init

# Add all project source files, docs, and configs
git add .

# Create initial master commit
git commit -m "feat: complete functional prototype for Operation Ward Zero hackathon submission"

# Create release tag
git tag -a v1.0.0-hackathon-final -m "Ward Zero Final Hackathon Submission Prototype"
```

---

## 3. Remote Repository Setup (GitHub)

1. Create a new repository on GitHub: `ward-zero` (Public or Private depending on hackathon submission rules).
2. Link your local repository to the remote origin:
   ```bash
   git remote add origin https://github.com/<your-org-or-username>/ward-zero.git
   git branch -M main
   git push -u origin main --tags
   ```

---

## 4. Evaluator Quickstart Instructions

Judges and evaluators can clone and run the entire suite in minutes:

### Step 1: Clone Repository
```bash
git clone https://github.com/<your-org-or-username>/ward-zero.git
cd ward-zero
```

### Step 2: Install Dependencies
```bash
# Install root Node workspaces
npm install

# Setup Python backend virtual environment
cd backend
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
python -m database.seed_data
cd ..
```

### Step 3: Run the Complete System
- **On Windows**: Double-click or run `scripts\start-all.bat`.
- **On Linux/macOS**:
  - Terminal 1: `cd backend && source .venv/bin/activate && uvicorn main:app --port 8000 --reload`
  - Terminal 2: `npm run dev --workspace=@wardzero/home-simulator`
  - Terminal 3: `npm run dev --workspace=@wardzero/healthcare-command-centre`

### Step 4: Verify Tests
```bash
# Windows:
scripts\run-tests.bat

# Linux/macOS:
cd backend && pytest && python tests/test_e2e_acceptance.py
```

Open your browser:
- **App 1 (Simulator)**: `http://localhost:5173`
- **App 2 (Command Centre)**: `http://localhost:5174`
- **Backend Swagger API**: `http://localhost:8000/docs`

