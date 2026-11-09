# WARD ZERO – SIMULATION USAGE GUIDE

## 1. App 1 – Virtual Home Simulator Controls

Open `http://localhost:5173`.

### 1.1 Locomotion & Character States
- **W / Up Arrow**: Move patient avatar UP.
- **S / Down Arrow**: Move patient avatar DOWN.
- **A / Left Arrow**: Move patient avatar LEFT.
- **D / Right Arrow**: Move patient avatar RIGHT.
- **SPACE**: Toggle Sit / Stand pose.
- **B**: Sleep in bed / Wake up. Triggers Smart Mattress occupancy sensor.
- **K**: Drink water from Smart Water Bottle (deducts 250ml, logs hydration event).
- **M**: Interact with Smart Pillbox (opens morning dose compartment).
- **U**: Visit bathroom and weigh in on Smart Scale (logs weight event).
- **F**: Simulate sudden fall event (impact deceleration trigger, prone posture).
- **R**: Autonomous Daily Routine (patient wakes, walks to kitchen, drinks water, takes pill, and rests on living room sofa).
- **ESC**: Cancel any modal or reset avatar to standing pose.

### 1.2 On-Screen Touch Controls
For touchscreens or mouse interaction:
- Use the **Virtual D-Pad** in the right control panel to move the patient.
- Click any quick action button (`Sit/Stand`, `Sleep/Wake`, `Drink Water`, `Pillbox`, `Bathroom`, `Simulate Fall`).
- Click any physical object on the floorplan (Smart Mattress, Slippers, Pillbox, Water Bottle, Smart Scale, Digital Mirror, AI Robot) to trigger device interactions.

---

## 2. App 2 – Healthcare Command Centre Controls

Open `http://localhost:5174`.

### 2.1 Navigation Tabs
1. **Command Centre**: Global ward metrics (total patients, high/med/low risk, active alerts, device status).
2. **Patient Directory**: Searchable patient table with triage filters.
3. **Live Monitoring**: Real-time Recharts biometrics (Heart Rate, Blood Pressure, SpO2, Temperature, Respiratory Rate, Steps, Hydration).
4. **Virtual Home Monitor**: Real-time layout view of the patient's home, room occupancy, and remote command transmitter.
5. **Patient Digital Twin**: Unified view of vitals, baseline comparison deltas, data provenance attribution %, activity & sleep metrics.
6. **AI Risk Engine**: Mandatory 3-tier risk classification (LOW / MEDIUM / HIGH), risk score (0-100), contributing biometric features with weights, caregiver note NLP impact, and recommended clinical safe next actions.
7. **Predictive Analytics**: 24h & 48h autoregressive trend forecasts with confidence bands and documented model constraints.
8. **Virtual Nurse Station**: Multi-patient triage desk, alert review, and caregiver shift assignments.
9. **Caregiver Management**: English observation note logging with automatic NLP keyword extraction and immediate AI risk recalculation.
10. **Emergency & Alerts**: Full alert lifecycle: `NEW` → `DELIVERED` → `ACKNOWLEDGED` → `ASSIGNED` → `IN_PROGRESS` → `RESOLVED`.
11. **Device Registry**: 44 virtual IoT devices, battery indicators, online/offline status, remote reboot controls.
12. **Reliability & Fault Lab**: Chaos injection panel (Wi-Fi disconnect, power blackout, battery drain, sensor fault) and auditable incident logs.

---

## 3. Seven Official Demonstration Scenarios

To demonstrate the full end-to-end integration to hackathon judges:

### Scenario 1 – Normal Daily Life
1. In App 1, click **"1. Normal Daily Life"** in the Scenarios panel.
2. In App 2, navigate to **Live Monitoring**. Observe optimal vitals (HR 72, BP 122/78, SpO2 98%).
3. Observe AI Risk Engine classifying patient as **LOW RISK** (Score: 14.5).

### Scenario 2 – Health Risk Detection
1. In App 1, click **"2. Health Risk"**.
2. Notice vital sliders spike: Blood Pressure rises to 168 mmHg, Heart Rate to 104 BPM, Steps drop to 420.
3. In App 2, observe the risk card transition to **HIGH RISK** (Level 1 Red). An alert is automatically created.

### Scenario 3 – English Caregiver Note Integration
1. In App 2, navigate to **Caregiver Management**.
2. Type or click prompt: *"Patient complained of unusual fatigue and poor sleep today."*
3. Click **Submit Observation**.
4. In **AI Risk Engine**, see that the note was parsed, sentiment flagged as *concerning*, and keywords `fatigue`, `poor sleep` extracted, adjusting the patient's risk score.

### Scenario 4 – Critical Caregiver Escalation
1. In App 1, click **"4. Caregiver Escalation"** or press **F** on your keyboard.
2. App 1 registers a 3.8g fall event; avatar enters prone position.
3. In App 2, a **CRITICAL** alert appears in the Virtual Nurse Station assigned to `CG-001`.
4. Leave it unacknowledged for 5 seconds and click **Trigger Auto-Escalation Check** (or wait for the timer).
5. Watch the alert auto-escalate to Escalation Level 1 and reassign to emergency lead `CG-004 Samuel Thorne`.
6. Click **Acknowledge**, enter resolution notes, and click **Resolve**.

### Scenario 5 – Bidirectional Remote Medication Reminder
1. In App 2, navigate to **Virtual Home Monitor**.
2. Under "Dispatch Remote Command", select **Smart Pillbox** and **MEDICATION_REMINDER**.
3. Click **Transmit Command to App 1**.
4. Switch to App 1: watch the Smart Pillbox pulse with a red LED and chime!
5. In App 1, press **M** or click **Open Lid** → **Ingest & Close**.
6. Switch back to App 2: observe the command status change from `QUEUED` → `DELIVERED` → `EXECUTED`!

### Scenario 6 – Network Disconnection & Offline Buffer Sync
1. In App 1, click **"Simulate Wi-Fi Cut"**.
2. Move the patient around (press W/A/S/D).
3. Notice telemetry is NOT lost—it buffers into the local IndexedDB queue ("Buffered: X packets").
4. In App 1, click **"Restore Wi-Fi"** and **"Sync Queue"**.
5. The buffered packets transmit via `/api/telemetry/batch` and synchronize with the backend with 0 duplicate packets!

### Scenario 7 – Power Outage
1. In App 1, click **"6. Power Blackout"**.
2. In App 2 under **Device Registry**, observe mains-powered devices (Smart Mattress, Mirror) drop offline immediately, while battery-backed devices (Slippers, Watch) switch to battery reserve.

