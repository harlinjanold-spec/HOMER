import asyncio
from datetime import datetime
from backend.database.connection import SessionLocal
from backend.database.models import Patient, Alert, RemoteCommand, TelemetryEvent, VirtualDevice, FaultSimulation
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


def test_get_all_patients():
    """Test retrieving all synthetic patients."""
    db = SessionLocal()
    patients = get_all_patients(db)
    assert len(patients) >= 4
    ids = [p.id for p in patients]
    assert "PAT-001" in ids
    assert "PAT-002" in ids
    assert "PAT-003" in ids
    assert "PAT-004" in ids
    db.close()


def test_patient_isolation():
    """Verify that PAT-001 and PAT-002 data records are strictly isolated."""
    db = SessionLocal()
    p1 = get_patient("PAT-001", db)
    p2 = get_patient("PAT-002", db)
    assert p1.name == "Raghav Menon"
    assert p2.name == "Eleanor Vance"

    d1 = db.query(VirtualDevice).filter(VirtualDevice.patient_id == "PAT-001").all()
    d2 = db.query(VirtualDevice).filter(VirtualDevice.patient_id == "PAT-002").all()
    d1_ids = {d.id for d in d1}
    d2_ids = {d.id for d in d2}
    assert len(d1_ids) >= 11
    assert len(d2_ids) >= 11
    assert d1_ids.isdisjoint(d2_ids)
    db.close()


def test_telemetry_idempotency_and_deduplication():
    """Verify telemetry event ingestion and duplicate packet prevention."""
    db = SessionLocal()
    evt = TelemetryEventCreate(
        event_id=f"TEST-DEDUP-{datetime.utcnow().timestamp()}",
        patient_id="PAT-001",
        device_id="DEV-PAT-001-DRESS",
        sensor_id="SEN-PAT-001-DRESS-HEART_RATE",
        source="simulation",
        measurement="heart_rate",
        value=74.5,
        unit="BPM",
        quality="valid",
        timestamp=datetime.utcnow(),
    )
    res1 = asyncio.run(TelemetryIngestionService.ingest_event(db, evt))
    assert res1["status"] == "ingested"

    # Send duplicate
    res2 = asyncio.run(TelemetryIngestionService.ingest_event(db, evt))
    assert res2["status"] == "duplicate_ignored"
    db.close()


def test_digital_twin_aggregation():
    """Verify patient Digital Twin aggregates vitals, baseline comparison, and provenance."""
    db = SessionLocal()
    twin = DigitalTwinService.get_patient_digital_twin(db, "PAT-001")
    assert twin is not None
    assert twin["patient"]["id"] == "PAT-001"
    assert "latest_vitals" in twin
    assert "baseline_comparison" in twin
    assert "provenance_breakdown" in twin
    assert twin["connected_devices_count"] >= 10
    db.close()


def test_caregiver_note_and_risk_evaluation():
    """Verify caregiver English observation note triggers NLP parsing and updates AI risk."""
    note = "Patient reported unusual fatigue, poor sleep, and dizziness on waking."
    nlp = AIRiskEngine.analyze_caregiver_note(note)
    assert nlp["sentiment"] == "concerning"
    assert "fatigue" in nlp["detected_keywords"]

    # Evaluate AI risk
    db = SessionLocal()
    risk = asyncio.run(AIRiskEngine.evaluate_patient_risk(db, "PAT-002"))
    assert risk["risk_level"] in ["LOW", "MEDIUM", "HIGH"]
    assert "contributing_measurements" in risk
    assert "recommended_action" in risk
    assert "explanation" in risk
    db.close()


def test_alert_workflow_and_acknowledgment():
    """Verify auditable alert workflow: NEW -> ACKNOWLEDGED -> RESOLVED."""
    db = SessionLocal()
    alert_in = AlertCreate(
        patient_id="PAT-001",
        device_id="DEV-PAT-001-SLIPPERS",
        sensor_id="SEN-PAT-001-SLIPPERS-GAIT_VARIATION",
        title="Unsteady Gait Detected",
        description="Smart Slippers detected gait variability spike to 12.5%.",
        category="vital_abnormal",
        priority="MEDIUM",
        triggering_data={"gait_variation": 12.5},
    )
    alert = asyncio.run(AlertEngine.create_alert(db, alert_in))
    assert alert.status == "NEW"

    acked = asyncio.run(AlertEngine.acknowledge_alert(db, alert.id, "CG-001", "Checking patient video"))
    assert acked.status == "ACKNOWLEDGED"
    assert acked.acknowledged_by == "CG-001"

    resolved = asyncio.run(AlertEngine.resolve_alert(db, alert.id, "CG-001", "Patient stable after resting."))
    assert resolved.status == "RESOLVED"
    assert resolved.resolved_by == "CG-001"
    db.close()


def test_remote_command_execution():
    """Verify bidirectional remote command: QUEUED -> DELIVERED -> EXECUTED."""
    db = SessionLocal()
    cmd_in = RemoteCommandCreate(
        patient_id="PAT-001",
        target_device="DEV-PAT-001-PILLBOX",
        command_type="MEDICATION_REMINDER",
        parameters={"medication": "Aspirin 81mg", "chime": True},
    )
    cmd = asyncio.run(CommandEngine.queue_command(db, cmd_in))
    assert cmd.status == "QUEUED"

    delivered = asyncio.run(CommandEngine.mark_delivered(db, cmd.id))
    assert delivered.status == "DELIVERED"

    confirm_in = RemoteCommandConfirm(command_id=cmd.id, patient_id="PAT-001", status="EXECUTED")
    executed = asyncio.run(CommandEngine.confirm_execution(db, confirm_in))
    assert executed.status == "EXECUTED"
    db.close()


def test_fault_simulation_lab():
    """Verify fault simulation lab: Wi-Fi disconnect and recovery."""
    db = SessionLocal()
    fault_in = FaultSimulationCreate(
        fault_type="WIFI_DISCONNECT",
        target_patient_id="PAT-003",
        notes="Simulated Wi-Fi router failure in bedroom",
    )
    fault = asyncio.run(FaultEngine.inject_fault(db, fault_in))
    assert fault.is_active is True

    recovered = asyncio.run(FaultEngine.recover_fault(db, fault.id))
    assert recovered.is_active is False
    db.close()


def test_predictive_trends():
    """Verify 24h & 48h trend projections with uncertainty confidence intervals."""
    db = SessionLocal()
    trends = AIRiskEngine.get_predictive_trends(db, "PAT-001", "heart_rate")
    assert "forecast_24h" in trends
    assert len(trends["forecast_24h"]) == 6
    assert "forecast_48h" in trends
    assert len(trends["forecast_48h"]) == 6
    assert trends["confidence_interval"] > 0.0
    assert "model_limitations" in trends
    db.close()
