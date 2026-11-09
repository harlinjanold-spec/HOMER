from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


# Telemetry
class TelemetryEventCreate(BaseModel):
    event_id: str
    patient_id: str
    device_id: str
    sensor_id: str
    source: str = "simulation"  # simulation, manual, derived, laboratory
    measurement: str
    value: float
    unit: str
    timestamp: datetime
    quality: str = "valid"  # valid, questionable, fault, stale, delayed


class TelemetryBatchCreate(BaseModel):
    events: List[TelemetryEventCreate]


class TelemetryEventOut(BaseModel):
    event_id: str
    patient_id: str
    device_id: str
    sensor_id: str
    source: str
    measurement: str
    value: float
    unit: str
    quality: str
    timestamp: datetime
    ingested_at: datetime

    class Config:
        from_attributes = True


# Patient
class PatientBaseline(BaseModel):
    baseline_hr_min: float = 60.0
    baseline_hr_max: float = 85.0
    baseline_bp_sys: float = 120.0
    baseline_bp_dia: float = 80.0
    baseline_spo2_min: float = 95.0
    baseline_temp: float = 36.8
    baseline_resp: float = 16.0
    baseline_daily_steps: int = 3500
    baseline_daily_water_ml: float = 2000.0
    baseline_sleep_hours: float = 7.5


class PatientOut(BaseModel):
    id: str
    name: str
    age: int
    gender: str
    living_arrangement: str
    room_config: str
    condition_summary: str
    assigned_caregiver_id: Optional[str]
    baseline_hr_min: float
    baseline_hr_max: float
    baseline_bp_sys: float
    baseline_bp_dia: float
    baseline_spo2_min: float
    baseline_temp: float
    baseline_resp: float
    baseline_daily_steps: int
    baseline_daily_water_ml: float
    baseline_sleep_hours: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Device & Sensor
class SensorOut(BaseModel):
    id: str
    device_id: str
    patient_id: str
    measurement_type: str
    unit: str
    status: str
    last_value: Optional[float]
    last_reading_time: datetime

    class Config:
        from_attributes = True


class VirtualDeviceOut(BaseModel):
    id: str
    patient_id: str
    name: str
    device_type: str
    room: str
    status: str
    battery_pct: float
    power_source: str
    firmware_ver: str
    is_active: bool
    last_heartbeat: datetime
    sensors: List[SensorOut] = []

    class Config:
        from_attributes = True


class DeviceUpdate(BaseModel):
    status: Optional[str] = None
    battery_pct: Optional[float] = None
    is_active: Optional[bool] = None
    room: Optional[str] = None


# Caregiver
class CaregiverOut(BaseModel):
    id: str
    name: str
    role: str
    phone: str
    email: str
    status: str
    assigned_patients: str
    shift_hours: str
    response_time_avg_sec: float
    attendance_status: str
    visit_count: int

    class Config:
        from_attributes = True


class CaregiverObservationCreate(BaseModel):
    patient_id: str
    caregiver_id: str
    note_text: str
    language: str = "en"


class CaregiverObservationOut(BaseModel):
    id: str
    patient_id: str
    caregiver_id: str
    note_text: str
    language: str
    sentiment: str
    clinical_keywords: str
    timestamp: datetime

    class Config:
        from_attributes = True


# Alerts
class AlertCreate(BaseModel):
    patient_id: str
    device_id: Optional[str] = None
    sensor_id: Optional[str] = None
    title: str
    description: str
    category: str
    priority: str = "MEDIUM"  # LOW, MEDIUM, HIGH, CRITICAL
    triggering_data: Dict[str, Any] = {}
    assigned_caregiver_id: Optional[str] = None


class AlertAcknowledgeRequest(BaseModel):
    caregiver_id: str
    notes: Optional[str] = None


class AlertAssignRequest(BaseModel):
    caregiver_id: str


class AlertResolveRequest(BaseModel):
    caregiver_id: str
    resolution_notes: str


class AlertOut(BaseModel):
    id: str
    alert_code: str
    patient_id: str
    device_id: Optional[str]
    sensor_id: Optional[str]
    title: str
    description: str
    category: str
    priority: str
    status: str
    triggering_data: str
    assigned_caregiver_id: Optional[str]
    escalation_level: int
    next_escalation_at: Optional[datetime]
    acknowledged_by: Optional[str]
    acknowledged_at: Optional[datetime]
    resolved_by: Optional[str]
    resolved_at: Optional[datetime]
    resolution_notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Remote Commands
class RemoteCommandCreate(BaseModel):
    patient_id: str
    target_device: str
    command_type: str  # TOGGLE_POWER, CONFIGURE_SENSOR, MEDICATION_REMINDER, ACTIVATE_SCENARIO, REQUEST_READINGS, RESTART_DEVICE, CAREGIVER_INSTRUCTION, TRIGGER_SOS
    parameters: Dict[str, Any] = {}


class RemoteCommandConfirm(BaseModel):
    command_id: str
    patient_id: str
    status: str  # EXECUTED or FAILED
    error_message: Optional[str] = None


class RemoteCommandOut(BaseModel):
    id: str
    patient_id: str
    target_device: str
    command_type: str
    parameters: str
    status: str
    error_message: Optional[str]
    created_at: datetime
    delivered_at: Optional[datetime]
    executed_at: Optional[datetime]

    class Config:
        from_attributes = True


# AI Risk Assessment
class RiskAssessmentOut(BaseModel):
    id: str
    patient_id: str
    risk_level: str  # LOW, MEDIUM, HIGH
    risk_score: float
    contributing_measurements: List[Dict[str, Any]]
    baseline_comparison: Dict[str, Any]
    caregiver_note_contribution: Dict[str, Any]
    explanation: str
    recommended_action: str
    timestamp: datetime


class PredictiveTrendsOut(BaseModel):
    patient_id: str
    metric: str
    historical: List[Dict[str, Any]]
    forecast_24h: List[Dict[str, Any]]
    forecast_48h: List[Dict[str, Any]]
    confidence_interval: float
    contributing_features: List[str]
    model_limitations: str


# Digital Twin
class DigitalTwinOut(BaseModel):
    patient: PatientOut
    latest_vitals: Dict[str, Any]
    provenance_breakdown: Dict[str, int]
    activity_metrics: Dict[str, Any]
    sleep_metrics: Dict[str, Any]
    connected_devices_count: int
    offline_devices_count: int
    active_alerts_count: int
    recent_observations: List[CaregiverObservationOut]
    latest_risk: Optional[RiskAssessmentOut]
    last_updated: datetime


# Reliability / Fault
class FaultSimulationCreate(BaseModel):
    fault_type: str  # WIFI_DISCONNECT, POWER_OUTAGE, LOW_BATTERY, CONTROLLER_OFFLINE, SENSOR_FAULT, INVALID_READING, PACKET_DELAY
    target_patient_id: str
    target_device_id: Optional[str] = None
    notes: Optional[str] = None


class FaultSimulationOut(BaseModel):
    id: str
    fault_type: str
    target_patient_id: str
    target_device_id: Optional[str]
    is_active: bool
    injected_at: datetime
    recovered_at: Optional[datetime]
    notes: Optional[str]

    class Config:
        from_attributes = True

