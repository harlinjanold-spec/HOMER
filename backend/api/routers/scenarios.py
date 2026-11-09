import json
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.database.models import Patient, Alert, CaregiverObservation, AuditLog
from backend.models.schemas import TelemetryEventCreate, AlertCreate, RemoteCommandCreate
from backend.telemetry.ingestion import TelemetryIngestionService
from backend.ai_engine.risk_engine import AIRiskEngine
from backend.alerts.alert_engine import AlertEngine
from backend.commands.command_engine import CommandEngine
from backend.reliability.fault_engine import FaultEngine
from backend.models.schemas import FaultSimulationCreate
from backend.api.websocket_manager import ws_manager

router = APIRouter(prefix="/api/scenarios", tags=["scenarios"])


@router.post("/trigger/{scenario_id}")
async def trigger_scenario(scenario_id: str, patient_id: str = "PAT-001", db: Session = Depends(get_db)):
    """Trigger a reproducible demonstration scenario."""
    now = datetime.utcnow()

    if scenario_id == "normal_life":
        # 1. Normal daily life: normal vitals, good hydration, active steps
        events = [
            TelemetryEventCreate(
                event_id=f"EVT-SCEN-NORM-HR-{now.timestamp()}",
                patient_id=patient_id,
                device_id=f"DEV-{patient_id}-DRESS",
                sensor_id=f"SEN-{patient_id}-DRESS-HEART_RATE",
                source="simulation",
                measurement="heart_rate",
                value=72.0,
                unit="BPM",
                timestamp=now,
                quality="valid",
            ),
            TelemetryEventCreate(
                event_id=f"EVT-SCEN-NORM-BP-{now.timestamp()}",
                patient_id=patient_id,
                device_id=f"DEV-{patient_id}-DRESS",
                sensor_id=f"SEN-{patient_id}-DRESS-BLOOD_PRESSURE_SYS",
                source="simulation",
                measurement="blood_pressure_sys",
                value=122.0,
                unit="mmHg",
                timestamp=now,
                quality="valid",
            ),
            TelemetryEventCreate(
                event_id=f"EVT-SCEN-NORM-STEPS-{now.timestamp()}",
                patient_id=patient_id,
                device_id=f"DEV-{patient_id}-SLIPPERS",
                sensor_id=f"SEN-{patient_id}-SLIPPERS-STEP_COUNT",
                source="simulation",
                measurement="steps",
                value=3650.0,
                unit="steps",
                timestamp=now,
                quality="valid",
            ),
        ]
        for e in events:
            await TelemetryIngestionService.ingest_event(db, e)

        assessment = await AIRiskEngine.evaluate_patient_risk(db, patient_id)
        return {
            "scenario": "NORMAL_DAILY_LIFE",
            "patient_id": patient_id,
            "status": "triggered",
            "risk_assessment": assessment,
            "description": "Normal daily life telemetry injected. Patient active and vitals optimal.",
        }

    elif scenario_id == "health_risk":
        # 2. Health risk scenario: systolic blood pressure 168, heart rate 104, steps drastically reduced
        events = [
            TelemetryEventCreate(
                event_id=f"EVT-SCEN-RISK-HR-{now.timestamp()}",
                patient_id=patient_id,
                device_id=f"DEV-{patient_id}-DRESS",
                sensor_id=f"SEN-{patient_id}-DRESS-HEART_RATE",
                source="simulation",
                measurement="heart_rate",
                value=104.0,
                unit="BPM",
                timestamp=now,
                quality="valid",
            ),
            TelemetryEventCreate(
                event_id=f"EVT-SCEN-RISK-BP-{now.timestamp()}",
                patient_id=patient_id,
                device_id=f"DEV-{patient_id}-DRESS",
                sensor_id=f"SEN-{patient_id}-DRESS-BLOOD_PRESSURE_SYS",
                source="simulation",
                measurement="blood_pressure_sys",
                value=168.0,
                unit="mmHg",
                timestamp=now,
                quality="valid",
            ),
            TelemetryEventCreate(
                event_id=f"EVT-SCEN-RISK-STEPS-{now.timestamp()}",
                patient_id=patient_id,
                device_id=f"DEV-{patient_id}-SLIPPERS",
                sensor_id=f"SEN-{patient_id}-SLIPPERS-STEP_COUNT",
                source="simulation",
                measurement="steps",
                value=420.0,
                unit="steps",
                timestamp=now,
                quality="valid",
            ),
        ]
        for e in events:
            await TelemetryIngestionService.ingest_event(db, e)

        assessment = await AIRiskEngine.evaluate_patient_risk(db, patient_id)
        return {
            "scenario": "HEALTH_RISK",
            "patient_id": patient_id,
            "status": "triggered",
            "risk_assessment": assessment,
            "description": "Abnormal vitals injected (BP 168 mmHg, HR 104 BPM). AI engine classified HIGH risk.",
        }

    elif scenario_id == "caregiver_note":
        # 3. Caregiver note scenario
        note_text = "Patient complained of unusual fatigue, dizziness upon standing, and poor sleep this morning."
        nlp = AIRiskEngine.analyze_caregiver_note(note_text)
        obs = CaregiverObservation(
            id=f"OBS-SCEN-{now.strftime('%Y%m%d%H%M%S')}",
            patient_id=patient_id,
            caregiver_id="CG-001",
            note_text=note_text,
            language="en",
            sentiment=nlp["sentiment"],
            clinical_keywords=", ".join(nlp["detected_keywords"]),
            timestamp=now,
        )
        db.add(obs)
        db.commit()
        assessment = await AIRiskEngine.evaluate_patient_risk(db, patient_id)
        return {
            "scenario": "CAREGIVER_NOTE",
            "patient_id": patient_id,
            "note": note_text,
            "nlp_analysis": nlp,
            "updated_risk": assessment,
        }

    elif scenario_id == "caregiver_escalation":
        # 4. Caregiver escalation scenario
        alert_in = AlertCreate(
            patient_id=patient_id,
            device_id=f"DEV-{patient_id}-SLIPPERS",
            sensor_id=f"SEN-{patient_id}-SLIPPERS-GAIT_VARIATION",
            title="CRITICAL FALL EVENT: Impact 3.8g with Floor Immobility",
            description="Sudden vertical deceleration in Smart Slippers followed by persistent zero-motion on bedroom floor.",
            category="fall_detected",
            priority="CRITICAL",
            triggering_data={"impact_g": 3.8, "heart_rate": 112.0, "floor_time_sec": 40},
            assigned_caregiver_id="CG-001",
        )
        alert = await AlertEngine.create_alert(db, alert_in)
        # Fast-track next_escalation_at to 5 seconds from now for rapid judge demonstration
        alert.next_escalation_at = now + timedelta(seconds=5)
        db.commit()
        return {
            "scenario": "CAREGIVER_ESCALATION",
            "patient_id": patient_id,
            "alert_id": alert.id,
            "escalation_due_in_seconds": 5,
            "message": "Critical alert created. Will auto-escalate to CG-004 Samuel Thorne in 5 seconds if unacknowledged.",
        }

    elif scenario_id == "remote_reminder":
        # 5. Remote reminder scenario
        cmd_in = RemoteCommandCreate(
            patient_id=patient_id,
            target_device=f"DEV-{patient_id}-PILLBOX",
            command_type="MEDICATION_REMINDER",
            parameters={"medication": "Metoprolol 25mg", "compartment": "Morning", "chime": True},
        )
        cmd = await CommandEngine.queue_command(db, cmd_in)
        return {
            "scenario": "REMOTE_REMINDER",
            "patient_id": patient_id,
            "command_id": cmd.id,
            "status": cmd.status,
            "message": "Medication reminder dispatched from Command Centre. App 1 will receive and render alert on Smart Pillbox.",
        }

    elif scenario_id == "network_failure":
        # 6. Network failure simulation
        fault_in = FaultSimulationCreate(
            fault_type="WIFI_DISCONNECT",
            target_patient_id=patient_id,
            notes="Simulated residential Wi-Fi access point failure.",
        )
        fault = await FaultEngine.inject_fault(db, fault_in)
        return {
            "scenario": "NETWORK_FAILURE",
            "patient_id": patient_id,
            "fault_id": fault.id,
            "message": "Wi-Fi disconnection injected. App 1 will buffer telemetry locally in IndexedDB until reconnection.",
        }

    elif scenario_id == "power_failure":
        # 7. Power outage simulation
        fault_in = FaultSimulationCreate(
            fault_type="POWER_OUTAGE",
            target_patient_id=patient_id,
            notes="Virtual power blackout: mains devices offline, battery devices switch to battery reserve.",
        )
        fault = await FaultEngine.inject_fault(db, fault_in)
        return {
            "scenario": "POWER_FAILURE",
            "patient_id": patient_id,
            "fault_id": fault.id,
            "message": "Power outage injected. Smart Mattress and Mirror offline; Slippers and Watch running on battery.",
        }

    else:
        raise HTTPException(status_code=400, detail=f"Unknown scenario ID: {scenario_id}")

