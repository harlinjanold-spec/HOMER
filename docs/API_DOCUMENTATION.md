# WARD ZERO – REST API & WEBSOCKET SPECIFICATION

Base URL: `http://localhost:8000/api`  
Interactive OpenAPI Swagger Docs: `http://localhost:8000/docs`  
WebSocket Endpoint: `ws://localhost:8000/ws?client={simulator|command-centre}`

---

## 1. Patients API (`/api/patients`)

### `GET /api/patients`
Retrieves all registered synthetic patients.
- **Response `200 OK`**: Array of `PatientOut` objects (`PAT-001`, `PAT-002`, `PAT-003`, `PAT-004`).

### `GET /api/patients/{patient_id}`
Retrieves individual patient profile and clinical baseline thresholds.

### `PUT /api/patients/{patient_id}/baseline`
Updates baseline thresholds for a specific patient.
- **Request Body**: `PatientBaseline` object.

---

## 2. Telemetry Ingestion API (`/api/telemetry`)

### `POST /api/telemetry/events`
Idempotently ingest a single telemetry reading from App 1 Virtual Home Simulator.
- **Request Body**:
```json
{
  "event_id": "EVT-001-HR",
  "patient_id": "PAT-001",
  "device_id": "DEV-PAT-001-DRESS",
  "sensor_id": "SEN-PAT-001-DRESS-HEART_RATE",
  "source": "simulation",
  "measurement": "heart_rate",
  "value": 78.5,
  "unit": "BPM",
  "quality": "valid",
  "timestamp": "2026-11-09T10:00:00Z"
}
```
- **Response**: `{"status": "ingested"}` or `{"status": "duplicate_ignored"}`.

### `POST /api/telemetry/batch`
Batch ingestion endpoint for buffered offline events during network recovery.
- **Request Body**: `{"events": [...]}`
- **Response**: `{"total_submitted": 25, "ingested_count": 25, "duplicate_count": 0}`.

### `GET /api/telemetry/history`
Query historical time-series for Recharts live charts.
- **Query Params**: `patient_id` (required), `measurement` (optional), `hours` (1 to 72).

---

## 3. Patient Digital Twin API (`/api/digital-twin`)

### `GET /api/digital-twin/{patient_id}`
Returns complete unified digital twin synthesizing:
- Latest vitals per sensor
- Baseline comparison deltas
- Provenance breakdown counts (`simulation`, `manual`, `derived`, `laboratory`)
- Mobility and sleep metrics
- Active alerts and recent observations
- Latest AI risk assessment

---

## 4. Contextual AI Risk Engine API (`/api/ai`)

### `POST /api/ai/evaluate/{patient_id}`
Triggers AI risk assessment. Evaluates multivariate vital signs using Scikit-Learn IsolationForest, compares against personal baselines, incorporates caregiver English notes sentiment, and returns:
```json
{
  "id": "RA-20261109120000-PAT-001",
  "patient_id": "PAT-001",
  "risk_level": "LOW",
  "risk_score": 14.5,
  "contributing_measurements": [...],
  "baseline_comparison": {...},
  "caregiver_note_contribution": {...},
  "explanation": "All physiological and ambient metrics remain within baseline...",
  "recommended_action": "Maintain standard passive continuous monitoring.",
  "timestamp": "2026-11-09T12:00:00Z"
}
```

### `GET /api/ai/predictive-trends/{patient_id}`
Returns 24h & 48h autoregressive trend forecasts with confidence intervals, model limitations, and feature lists.

---

## 5. Alerts & Escalation API (`/api/alerts`)

### `GET /api/alerts`
List alerts with optional filtering (`patient_id`, `status`, `priority`).

### `POST /api/alerts`
Create new alert. Automatically sets status to `NEW` and triggers WebSocket broadcast.

### `POST /api/alerts/{alert_id}/acknowledge`
Acknowledge alert by caregiver ID. Status becomes `ACKNOWLEDGED`. Cancels escalation countdown.

### `POST /api/alerts/{alert_id}/assign`
Assign alert to a specific caregiver. Status becomes `IN_PROGRESS`.

### `POST /api/alerts/{alert_id}/resolve`
Resolve alert with mandatory resolution notes. Status becomes `RESOLVED`.

### `POST /api/alerts/escalate-check`
Checks for unacknowledged alerts that passed escalation timeout and reassigns them to emergency escalation lead `CG-004 Samuel Thorne`.

---

## 6. Remote Commands API (`/api/commands`)

### `POST /api/commands`
Queue remote command from App 2 Command Centre targeting App 1 Simulator:
```json
{
  "patient_id": "PAT-001",
  "target_device": "DEV-PAT-001-PILLBOX",
  "command_type": "MEDICATION_REMINDER",
  "parameters": {"medication": "Lisinopril 10mg", "chime": true}
}
```

### `POST /api/commands/{command_id}/deliver`
App 1 acknowledges delivery (status -> `DELIVERED`).

### `POST /api/commands/confirm`
App 1 confirms execution on the virtual device (status -> `EXECUTED`).

---

## 7. Reliability & Fault Lab API (`/api/reliability`)

### `POST /api/reliability/faults/inject`
Inject simulated faults: `WIFI_DISCONNECT`, `POWER_OUTAGE`, `LOW_BATTERY`, `SENSOR_FAULT`.

### `POST /api/reliability/faults/{fault_id}/recover`
Recover fault, restore devices online, and trigger synchronization.

### `GET /api/reliability/audit-logs`
Audit log history for clinical governance.

