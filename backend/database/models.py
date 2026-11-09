from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    Text,
    ForeignKey,
    Index,
)
from sqlalchemy.orm import relationship
from backend.database.connection import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(String(50), primary_key=True)  # e.g., PAT-001
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), default="Unspecified")
    living_arrangement = Column(String(100), default="Home Alone")
    room_config = Column(String(50), default="4-Room Apartment")
    condition_summary = Column(Text, default="Hypertension, mild arthritis")
    assigned_caregiver_id = Column(String(50), nullable=True)

    # Baselines
    baseline_hr_min = Column(Float, default=60.0)
    baseline_hr_max = Column(Float, default=85.0)
    baseline_bp_sys = Column(Float, default=120.0)
    baseline_bp_dia = Column(Float, default=80.0)
    baseline_spo2_min = Column(Float, default=95.0)
    baseline_temp = Column(Float, default=36.8)
    baseline_resp = Column(Float, default=16.0)
    baseline_daily_steps = Column(Integer, default=3500)
    baseline_daily_water_ml = Column(Float, default=2000.0)
    baseline_sleep_hours = Column(Float, default=7.5)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    devices = relationship("VirtualDevice", back_populates="patient", cascade="all, delete-orphan")
    telemetry = relationship("TelemetryEvent", back_populates="patient", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="patient", cascade="all, delete-orphan")
    observations = relationship("CaregiverObservation", back_populates="patient", cascade="all, delete-orphan")
    risk_assessments = relationship("RiskAssessment", back_populates="patient", cascade="all, delete-orphan")
    commands = relationship("RemoteCommand", back_populates="patient", cascade="all, delete-orphan")


class VirtualDevice(Base):
    __tablename__ = "virtual_devices"

    id = Column(String(50), primary_key=True)  # e.g., DEV-001-SLIPPERS
    patient_id = Column(String(50), ForeignKey("patients.id"), nullable=False)
    name = Column(String(100), nullable=False)
    device_type = Column(String(50), nullable=False)  # slippers, dress, mattress, pillbox, water_bottle, bathroom, scale, smartwatch, mirror, pir_sensor, robot, cardiac_monitor
    room = Column(String(50), default="Living Room")  # Bedroom, Living Room, Kitchen, Bathroom
    status = Column(String(20), default="online")  # online, offline, fault, low_battery
    battery_pct = Column(Float, default=100.0)
    power_source = Column(String(20), default="battery")  # battery, mains
    firmware_ver = Column(String(20), default="v1.4.2")
    is_active = Column(Boolean, default=True)
    last_heartbeat = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="devices")
    sensors = relationship("Sensor", back_populates="device", cascade="all, delete-orphan")


class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(String(50), primary_key=True)  # e.g., SEN-001-HR
    device_id = Column(String(50), ForeignKey("virtual_devices.id"), nullable=False)
    patient_id = Column(String(50), nullable=False)
    measurement_type = Column(String(50), nullable=False)  # heart_rate, ecg, spo2, blood_pressure_sys, blood_pressure_dia, temperature, respiration, step_count, foot_pressure, bed_occupancy, water_volume, weight, motion
    unit = Column(String(20), nullable=False)
    status = Column(String(20), default="active")  # active, fault, stale, disconnected
    last_value = Column(Float, nullable=True)
    last_reading_time = Column(DateTime, default=datetime.utcnow)

    device = relationship("VirtualDevice", back_populates="sensors")


class TelemetryEvent(Base):
    __tablename__ = "telemetry_events"

    event_id = Column(String(64), primary_key=True)  # UUID or deterministic EVT-ID for idempotency
    patient_id = Column(String(50), ForeignKey("patients.id"), nullable=False, index=True)
    device_id = Column(String(50), nullable=False, index=True)
    sensor_id = Column(String(50), nullable=False)
    source = Column(String(30), default="simulation")  # simulation, manual, derived, laboratory
    measurement = Column(String(50), nullable=False, index=True)
    value = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False)
    quality = Column(String(20), default="valid")  # valid, questionable, fault, stale, delayed
    timestamp = Column(DateTime, nullable=False, index=True)
    ingested_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="telemetry")

    __table_args__ = (
        Index("idx_patient_measurement_time", "patient_id", "measurement", "timestamp"),
    )


class Caregiver(Base):
    __tablename__ = "caregivers"

    id = Column(String(50), primary_key=True)  # e.g., CG-001
    name = Column(String(100), nullable=False)
    role = Column(String(50), default="Registered Nurse")
    phone = Column(String(30), default="+1-555-0199")
    email = Column(String(100), default="caregiver@wardzero.org")
    status = Column(String(20), default="available")  # available, on_shift, busy, off_duty
    assigned_patients = Column(Text, default="PAT-001")  # comma-separated IDs
    shift_hours = Column(String(50), default="08:00 - 20:00")
    response_time_avg_sec = Column(Float, default=45.0)
    attendance_status = Column(String(20), default="Present")
    visit_count = Column(Integer, default=12)
    created_at = Column(DateTime, default=datetime.utcnow)

    observations = relationship("CaregiverObservation", back_populates="caregiver")


class CaregiverObservation(Base):
    __tablename__ = "caregiver_observations"

    id = Column(String(50), primary_key=True)
    patient_id = Column(String(50), ForeignKey("patients.id"), nullable=False, index=True)
    caregiver_id = Column(String(50), ForeignKey("caregivers.id"), nullable=False)
    note_text = Column(Text, nullable=False)
    language = Column(String(10), default="en")
    sentiment = Column(String(20), default="neutral")  # positive, neutral, concerning, high_risk
    clinical_keywords = Column(Text, default="")  # comma-separated detected terms
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    patient = relationship("Patient", back_populates="observations")
    caregiver = relationship("Caregiver", back_populates="observations")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(50), primary_key=True)  # e.g., ALT-001
    alert_code = Column(String(50), nullable=False)
    patient_id = Column(String(50), ForeignKey("patients.id"), nullable=False, index=True)
    device_id = Column(String(50), nullable=True)
    sensor_id = Column(String(50), nullable=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)  # vital_abnormal, fall_detected, prolonged_immobility, device_failure, network_disconnect, missed_medication, stale_data
    priority = Column(String(20), default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    # Auditable lifecycle: NEW -> DELIVERED -> ACKNOWLEDGED -> ASSIGNED -> IN_PROGRESS -> RESOLVED
    status = Column(String(30), default="NEW", index=True)
    triggering_data = Column(Text, default="{}")  # JSON string of triggering readings

    assigned_caregiver_id = Column(String(50), nullable=True)
    escalation_level = Column(Integer, default=0)
    next_escalation_at = Column(DateTime, nullable=True)

    acknowledged_by = Column(String(50), nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
    resolved_by = Column(String(50), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    resolution_notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    patient = relationship("Patient", back_populates="alerts")


class RemoteCommand(Base):
    __tablename__ = "remote_commands"

    id = Column(String(50), primary_key=True)  # Command ID
    patient_id = Column(String(50), ForeignKey("patients.id"), nullable=False, index=True)
    target_device = Column(String(50), nullable=False)
    command_type = Column(String(50), nullable=False)  # TOGGLE_POWER, CONFIGURE_SENSOR, MEDICATION_REMINDER, ACTIVATE_SCENARIO, REQUEST_READINGS, RESTART_DEVICE, CAREGIVER_INSTRUCTION, TRIGGER_SOS
    parameters = Column(Text, default="{}")  # JSON
    # QUEUED -> DELIVERED -> EXECUTED / FAILED / EXPIRED
    status = Column(String(20), default="QUEUED", index=True)
    error_message = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    delivered_at = Column(DateTime, nullable=True)
    executed_at = Column(DateTime, nullable=True)

    patient = relationship("Patient", back_populates="commands")


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(String(50), primary_key=True)
    patient_id = Column(String(50), ForeignKey("patients.id"), nullable=False, index=True)
    risk_level = Column(String(20), nullable=False)  # LOW, MEDIUM, HIGH
    risk_score = Column(Float, nullable=False)  # 0.0 to 100.0
    contributing_measurements = Column(Text, default="[]")  # JSON list
    baseline_comparison = Column(Text, default="{}")  # JSON dict
    caregiver_note_contribution = Column(Text, default="{}")  # JSON dict
    explanation = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    patient = relationship("Patient", back_populates="risk_assessments")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_type = Column(String(50), nullable=False)
    actor = Column(String(100), default="system")
    patient_id = Column(String(50), nullable=True)
    description = Column(Text, nullable=False)
    metadata_json = Column(Text, default="{}")
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)


class FaultSimulation(Base):
    __tablename__ = "fault_simulations"

    id = Column(String(50), primary_key=True)
    fault_type = Column(String(50), nullable=False)  # WIFI_DISCONNECT, POWER_OUTAGE, LOW_BATTERY, CONTROLLER_OFFLINE, SENSOR_FAULT, INVALID_READING, PACKET_DELAY
    target_device_id = Column(String(50), nullable=True)
    target_patient_id = Column(String(50), nullable=False)
    is_active = Column(Boolean, default=True)
    injected_at = Column(DateTime, default=datetime.utcnow)
    recovered_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)

