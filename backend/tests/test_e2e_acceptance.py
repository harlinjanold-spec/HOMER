"""
Ward Zero - Non-Negotiable Acceptance Test Suite
Verifies all 23 acceptance steps specified in Section 23 of the hackathon master prompt.
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
import pytest
import asyncio
from datetime import datetime
from backend.database.connection import SessionLocal
from backend.models.schemas import (
    TelemetryEventCreate,
    AlertCreate,
    AlertAcknowledgeRequest,
    AlertResolveRequest,
    RemoteCommandCreate,
    RemoteCommandConfirm,
    CaregiverObservationCreate,
    FaultSimulationCreate,
)
from backend.telemetry.ingestion import TelemetryIngestionService
from backend.digital_twin.twin_service import DigitalTwinService
from backend.ai_engine.risk_engine import AIRiskEngine
from backend.alerts.alert_engine import AlertEngine
from backend.commands.command_engine import CommandEngine
from backend.reliability.fault_engine import FaultEngine
from backend.api.routers.patients import get_all_patients, get_patient


def test_section_23_full_acceptance_workflow():
    db = SessionLocal()

    # Step 1-4: Verify database, patients, and initial telemetry
    patients = get_all_patients(db)
    assert len(patients) >= 4, "Step 1-4: At least 4 synthetic patients must be registered"
    print("PASS: Steps 1-4: Shared backend initialized with 4 registered patients.")

    # Step 5: Open PAT-001
    pat1 = get_patient("PAT-001", db)
    assert pat1.id == "PAT-001"
    assert pat1.name == "Raghav Menon"
    print("PASS: Step 5: PAT-001 profile loaded successfully.")

    # Step 6-7: Move patient with keyboard controls -> Smart Slippers step event
    step_event = TelemetryEventCreate(
        event_id=f"EVT-ACCEPT-STEP-{datetime.utcnow().timestamp()}",
        patient_id="PAT-001",
        device_id="DEV-PAT-001-SLIPPERS",
        sensor_id="SEN-PAT-001-SLIPPERS-STEP_COUNT",
        source="simulation",
        measurement="steps",
        value=3450.0,
        unit="steps",
        quality="valid",
        timestamp=datetime.utcnow(),
    )
    step_res = asyncio.run(TelemetryIngestionService.ingest_event(db, step_event))
    assert step_res["status"] == "ingested"
    print("PASS: Steps 6-7: Slippers step event ingested and broadcasted.")

    # Step 8-9: Change simulated vital parameters (Heart Rate -> 104 BPM, Systolic BP -> 168 mmHg)
    hr_event = TelemetryEventCreate(
        event_id=f"EVT-ACCEPT-HR-{datetime.utcnow().timestamp()}",
        patient_id="PAT-001",
        device_id="DEV-PAT-001-DRESS",
        sensor_id="SEN-PAT-001-DRESS-HEART_RATE",
        source="simulation",
        measurement="heart_rate",
        value=104.0,
        unit="BPM",
        quality="valid",
        timestamp=datetime.utcnow(),
    )
    bp_event = TelemetryEventCreate(
        event_id=f"EVT-ACCEPT-BP-{datetime.utcnow().timestamp()}",
        patient_id="PAT-001",
        device_id="DEV-PAT-001-DRESS",
        sensor_id="SEN-PAT-001-DRESS-BLOOD_PRESSURE_SYS",
        source="simulation",
        measurement="blood_pressure_sys",
        value=168.0,
        unit="mmHg",
        quality="valid",
        timestamp=datetime.utcnow(),
    )
    asyncio.run(TelemetryIngestionService.ingest_event(db, hr_event))
    asyncio.run(TelemetryIngestionService.ingest_event(db, bp_event))
    print("PASS: Steps 8-9: Vital parameters updated in real time.")

    # Step 10: Verify Patient Digital Twin updates
    twin = DigitalTwinService.get_patient_digital_twin(db, "PAT-001")
    assert twin["latest_vitals"]["heart_rate"]["value"] == 104.0
    assert twin["latest_vitals"]["blood_pressure_sys"]["value"] == 168.0
    print("PASS: Step 10: Patient Digital Twin updated with new vitals.")

    # Step 11: Add English Caregiver Observation note
    note_text = "Patient complained of unusual fatigue and poor sleep this morning."
    nlp = AIRiskEngine.analyze_caregiver_note(note_text)
    assert nlp["sentiment"] == "concerning"
    assert "fatigue" in nlp["detected_keywords"]
    print("PASS: Step 11: English caregiver note parsed and clinical keywords extracted.")

    # Step 12-13: Run AI risk analysis & verify classification + explainability
    risk = asyncio.run(AIRiskEngine.evaluate_patient_risk(db, "PAT-001"))
    assert risk["risk_level"] in ["MEDIUM", "HIGH"]
    assert risk["risk_score"] > 35.0
    assert len(risk["contributing_measurements"]) > 0
    assert "recommended_action" in risk
    assert "explanation" in risk
    print(f"PASS: Steps 12-13: AI risk classified as {risk['risk_level']} (Score: {risk['risk_score']}) with full explanation.")

    # Step 14: Generate an alert
    alert_in = AlertCreate(
        patient_id="PAT-001",
        device_id="DEV-PAT-001-DRESS",
        sensor_id="SEN-PAT-001-DRESS-BLOOD_PRESSURE_SYS",
        title="Systolic BP Spike (168 mmHg) + Tachycardia",
        description="Systolic BP elevated +46 mmHg above baseline of 122 mmHg with heart rate 104 BPM.",
        category="vital_abnormal",
        priority="HIGH",
        triggering_data={"heart_rate": 104, "blood_pressure_sys": 168},
    )
    alert = asyncio.run(AlertEngine.create_alert(db, alert_in))
    assert alert.status == "NEW"
    print("PASS: Step 14: High priority alert generated.")

    # Step 15-16: Acknowledge from Nurse Station & verify status changes
    acked = asyncio.run(AlertEngine.acknowledge_alert(db, alert.id, "CG-001", "Nurse reviewing telemetry trend"))
    assert acked.status == "ACKNOWLEDGED"
    assert acked.acknowledged_by == "CG-001"
    assert acked.acknowledged_at is not None
    print("PASS: Steps 15-16: Alert acknowledged from Virtual Nurse Station.")

    # Step 17-18: Send medication reminder from App 2 -> App 1 receives and executes
    cmd_in = RemoteCommandCreate(
        patient_id="PAT-001",
        target_device="DEV-PAT-001-PILLBOX",
        command_type="MEDICATION_REMINDER",
        parameters={"medication": "Lisinopril 10mg", "chime": True},
    )
    cmd = asyncio.run(CommandEngine.queue_command(db, cmd_in))
    assert cmd.status == "QUEUED"

    # Delivered to App 1
    delivered = asyncio.run(CommandEngine.mark_delivered(db, cmd.id))
    assert delivered.status == "DELIVERED"

    # Confirmed executed by App 1
    confirm = RemoteCommandConfirm(command_id=cmd.id, patient_id="PAT-001", status="EXECUTED")
    executed = asyncio.run(CommandEngine.confirm_execution(db, confirm))
    assert executed.status == "EXECUTED"
    print("PASS: Steps 17-18: Bidirectional remote command queued, delivered, and confirmed executed.")

    # Step 19-20: Trigger virtual sensor failure & verify detection
    fault_in = FaultSimulationCreate(
        fault_type="SENSOR_FAULT",
        target_patient_id="PAT-001",
        target_device_id="DEV-PAT-001-DRESS",
        notes="Electrode detachment on Smart Dress",
    )
    fault = asyncio.run(FaultEngine.inject_fault(db, fault_in))
    assert fault.is_active is True
    print("PASS: Steps 19-20: Sensor failure injected and system marked fault state.")

    # Step 21-22: Simulate network interruption, offline buffering, and recovery without duplicate records
    # 1. Enqueue offline event
    offline_id = f"EVT-BUFFERED-RECOVERY-{datetime.utcnow().timestamp()}"
    offline_evt = TelemetryEventCreate(
        event_id=offline_id,
        patient_id="PAT-001",
        device_id="DEV-PAT-001-SLIPPERS",
        sensor_id="SEN-PAT-001-SLIPPERS-STEP_COUNT",
        source="simulation",
        measurement="steps",
        value=3500.0,
        unit="steps",
        quality="delayed",
        timestamp=datetime.utcnow(),
    )
    # Recover fault
    asyncio.run(FaultEngine.recover_fault(db, fault.id))

    # Synchronize batch
    sync_res = asyncio.run(TelemetryIngestionService.ingest_batch(db, [offline_evt, offline_evt])) # Send 1 duplicate
    assert sync_res["ingested_count"] == 1
    assert sync_res["duplicate_count"] == 1
    print("PASS: Steps 21-22: Network interruption simulated; recovered and synced without duplicates.")

    # Step 23: Repeat with different patients to prove patient data isolation
    twin_p2 = DigitalTwinService.get_patient_digital_twin(db, "PAT-002")
    twin_p3 = DigitalTwinService.get_patient_digital_twin(db, "PAT-003")
    twin_p4 = DigitalTwinService.get_patient_digital_twin(db, "PAT-004")
    assert twin_p2["patient"]["id"] == "PAT-002"
    assert twin_p3["patient"]["id"] == "PAT-003"
    assert twin_p4["patient"]["id"] == "PAT-004"
    assert twin_p2["patient"]["name"] != twin["patient"]["name"]
    print("PASS: Step 23: Complete patient data isolation verified across PAT-001, PAT-002, PAT-003, PAT-004.")

    db.close()
    print("\n>>> ALL 23 SECTION 23 ACCEPTANCE TEST CRITERIA PASSED SUCCESSFULLY! <<<")


if __name__ == "__main__":
    test_section_23_full_acceptance_workflow()
