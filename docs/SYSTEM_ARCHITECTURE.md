# WARD ZERO – SYSTEM ARCHITECTURE

## 1. Executive Summary

**Ward Zero** is an Intelligent Virtual Home Hospital designed to bridge the chasm between hospital-grade clinical monitoring and the comfort of residential life. 

Central Philosophy:
> *"Healthcare should adapt to the patient's lifestyle, not force the patient to adapt to healthcare."*

Patients live normally in ordinary clothes, walking in smart slippers, resting on their usual mattress, drinking from a smart water bottle, and using their home bathroom—while an unobtrusive virtual hospital ward operates continuously in the background.

```
+---------------------------------------------------------------------------------------+
|                                    WARD ZERO SYSTEM                                   |
+---------------------------------------------------------------------------------------+
|                                                                                       |
|   +------------------------------------+    +-------------------------------------+   |
|   |   APP 1: VIRTUAL HOME SIMULATOR    |    | APP 2: HEALTHCARE COMMAND CENTRE    |   |
|   |         (Port 5173 - React)        |    |         (Port 5174 - React)         |   |
|   |                                    |    |                                     |   |
|   |  - 2D SVG Interactive Floorplan    |    |  - Multi-Patient Clinical Triage    |   |
|   |  - Dynamic Patient Avatar          |    |  - Unified Patient Digital Twin     |   |
|   |  - 11 Everyday Smart Objects       |    |  - Explainable Contextual AI        |   |
|   |  - Sensor Simulation Engine        |    |  - Recharts Live Biometrics         |   |
|   |  - Keyboard & Joystick Navigation  |    |  - Virtual Nurse Station            |   |
|   |  - Local Offline Queue (IndexedDB) |    |  - Caregiver Roster & English Notes |   |
|   |  - Remote Command Execution Engine |    |  - Alert Escalation Engine          |   |
|   +-----------------+------------------+    +------------------+------------------+   |
|                     |                                          |                      |
|                     | Telemetry / Commands                     | Telemetry / Audits   |
|                     | HTTP REST / WebSockets                   | HTTP REST / WebSockets|
|                     v                                          v                      |
|   +-------------------------------------------------------------------------------+   |
|   |                       SHARED BACKEND (FastAPI + SQLite)                       |   |
|   |                              (Port 8000 - Python)                             |   |
|   |                                                                               |   |
|   |  +--------------------+  +--------------------+  +-------------------------+  |   |
|   |  | Telemetry Engine   |  | Digital Twin Svc   |  | AI Contextual Engine    |  |   |
|   |  | - Idempotency      |  | - Provenance       |  | - IsolationForest ML    |  |   |
|   |  | - Deduplication    |  | - Baseline Delta   |  | - English NLP Parser    |  |   |
|   |  | - Quality Check    |  | - Activity/Sleep   |  | - Explainability Card   |  |   |
|   |  +--------------------+  +--------------------+  +-------------------------+  |   |
|   |                                                                               |   |
|   |  +--------------------+  +--------------------+  +-------------------------+  |   |
|   |  | Alert & Escalation |  | Command Dispatcher|  | Reliability / Fault Lab |  |   |
|   |  | - Auditable States |  | - App 2 -> App 1   |  | - Wi-Fi / Power Cut     |  |   |
|   |  | - Auto-Timer       |  | - Execution Verify |  | - Recovery & Sync       |  |   |
|   |  +--------------------+  +--------------------+  +-------------------------+  |   |
|   +---------------------------------------+---------------------------------------+   |
|                                           |                                           |
|                                           v                                           |
|   +-------------------------------------------------------------------------------+   |
|   |                       RELATIONAL PERSISTENCE (SQLite DB)                      |   |
|   |        Patients • Devices • Sensors • TelemetryEvents • Caregivers • Alerts   |   |
|   +-------------------------------------------------------------------------------+   |
+---------------------------------------------------------------------------------------+
```

## 2. Core Architectural Pillars

### 2.1 Two Strictly Independent Applications
Per hackathon rules, App 1 and App 2 run as completely decoupled Vite/React single-page applications:
1. **App 1 (Home Simulator)**: Consumer-grade bright, warm flat-vector illustration simulating patient daily living, keyboard locomotion, and smart home actuators.
2. **App 2 (Healthcare Command Centre)**: Professional dark navy medical hospital dashboard designed for clinical teams, remote triage, and patient digital twins.

### 2.2 Bidirectional Event Bus
Communication flows bidirectionally between both apps:
- **App 1 -> Backend -> App 2**: Telemetry packets, step counts, water drinking, medication ingestion, fall deceleration spikes, and hardware disconnections.
- **App 2 -> Backend -> App 1**: Remote pillbox medication reminders, remote sensor reconfiguration, device power reboots, and simulated emergency calls. Commands transition strictly through `QUEUED -> DELIVERED -> EXECUTED` with verified client confirmation.

### 2.3 Idempotent Telemetry Ingestion
Every telemetry packet carries a unique `event_id`. If a retransmitted packet arrives after network recovery, the engine rejects duplicate insertion while preserving original event provenance and timestamps.

