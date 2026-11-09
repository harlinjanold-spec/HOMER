# WARD ZERO – DATA FLOW DOCUMENTATION

## 1. Upstream Telemetry Ingestion (App 1 → Backend → App 2)

```
[Virtual Sensors in App 1]
           │
           │ (1) User interaction or automatic timer tick
           ▼
[App 1 Sensor Simulation Engine]
           │
           │ (2) Generates JSON Telemetry Payload with UUID
           ▼
   Is Wi-Fi Online?
   ├── NO  ──► [Local Offline Buffer / IndexedDB] (stored with original timestamp)
   └── YES ──► POST /api/telemetry/events
                     │
                     ▼
             [FastAPI Backend]
                     │
                     ├── (3) Idempotency Check: Does event_id exist?
                     │       ├── YES: Return duplicate_ignored
                     │       └── NO: Insert into telemetry_events table
                     ├── (4) Update sensor & device heartbeats
                     ├── (5) Broadcast JSON over WebSocket (/ws)
                     │
                     ▼
             [App 2 Command Centre WebSocket Listener]
                     │
                     ├── (6) Update Live Recharts graphs
                     ├── (7) Update Digital Twin vitals
                     └── (8) Trigger AI Anomaly Risk Engine
```

## 2. Downstream Remote Command Dispatch (App 2 → Backend → App 1)

```
[Caregiver / Clinician in App 2 Command Centre]
           │
           │ (1) Click "Transmit Command" (e.g., MEDICATION_REMINDER)
           ▼
     POST /api/commands
           │
           ▼
    [FastAPI Backend]
           │
           ├── (2) Insert into remote_commands (Status: QUEUED)
           ├── (3) Write Audit Log: COMMAND_QUEUED
           ├── (4) Broadcast over WebSocket topic 'remote_command_queued'
           │
           ▼
    [App 1 Home Simulator WebSocket Listener]
           │
           ├── (5) POST /api/commands/{id}/deliver (Status: DELIVERED)
           ├── (6) Actuate visual hardware (Smart Pillbox flashes red LED, chimes)
           ├── (7) Patient takes medication (opens compartment)
           └── (8) POST /api/commands/confirm (Status: EXECUTED)
                     │
                     ▼
             [FastAPI Backend]
                     │
                     ├── (9) Update database status to EXECUTED
                     └── (10) Broadcast 'remote_command_confirmed' to App 2
                               │
                               ▼
                       [App 2 Command Centre]
                       Command status badge turns GREEN (EXECUTED)
```

## 3. Auditable Alert Escalation Workflow

```
[Alert Engine Triggered] (e.g. Critical Fall or High AI Risk)
           │
           ▼
         [NEW] ──► Push alert to Virtual Nurse Station (Assigned: CG-001)
           │
           │ (Caregiver opens alert in Nurse Station)
           ▼
    [ACKNOWLEDGED] (Records caregiver_id + acknowledged_at timestamp)
           │
           ├── (Caregiver reassigns to specialist)
           ▼
      [ASSIGNED] (Reassigned to target Caregiver ID)
           │
           ▼
    [IN_PROGRESS] (Caregiver actively reviewing telemetry)
           │
           │ (Caregiver enters mandatory resolution notes)
           ▼
      [RESOLVED] (Audit log committed, alert cleared from active triage)
```

