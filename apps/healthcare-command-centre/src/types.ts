export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  living_arrangement: string;
  room_config: string;
  condition_summary: string;
  assigned_caregiver_id?: string;
  baseline_hr_min: number;
  baseline_hr_max: number;
  baseline_bp_sys: number;
  baseline_bp_dia: number;
  baseline_spo2_min: number;
  baseline_temp: number;
  baseline_resp: number;
  baseline_daily_steps: number;
  baseline_daily_water_ml: number;
  baseline_sleep_hours: number;
  created_at: string;
  updated_at: string;
}

export interface VirtualDevice {
  id: string;
  patient_id: string;
  name: string;
  device_type: string;
  room: string;
  status: 'online' | 'offline' | 'fault' | 'low_battery';
  battery_pct: number;
  power_source: string;
  firmware_ver: string;
  is_active: boolean;
  last_heartbeat: string;
  sensors?: any[];
}

export interface Alert {
  id: string;
  alert_code: string;
  patient_id: string;
  device_id?: string;
  sensor_id?: string;
  title: string;
  description: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'NEW' | 'DELIVERED' | 'ACKNOWLEDGED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';
  triggering_data: string;
  assigned_caregiver_id?: string;
  escalation_level: number;
  next_escalation_at?: string;
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_by?: string;
  resolved_at?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Caregiver {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  status: 'available' | 'on_shift' | 'busy' | 'off_duty';
  assigned_patients: string;
  shift_hours: string;
  response_time_avg_sec: number;
  attendance_status: string;
  visit_count: number;
}

export interface CaregiverObservation {
  id: string;
  patient_id: string;
  caregiver_id: string;
  note_text: string;
  language: string;
  sentiment: string;
  clinical_keywords: string;
  timestamp: string;
}

export interface RiskAssessment {
  id: string;
  patient_id: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  risk_score: number;
  contributing_measurements: Array<{
    metric: string;
    value: any;
    status: string;
    weight: number;
  }>;
  baseline_comparison: Record<string, any>;
  caregiver_note_contribution: Record<string, any>;
  explanation: string;
  recommended_action: string;
  timestamp: string;
}

export interface DigitalTwin {
  patient: Patient;
  latest_vitals: Record<string, { value: number | null; unit: string; source: string; quality: string; timestamp: string }>;
  baseline_comparison: Record<string, any>;
  provenance_breakdown: Record<string, number>;
  activity_metrics: Record<string, any>;
  sleep_metrics: Record<string, any>;
  connected_devices_count: number;
  offline_devices_count: number;
  active_alerts_count: number;
  recent_observations: CaregiverObservation[];
  latest_risk?: RiskAssessment;
  last_updated: string;
}

export interface RemoteCommand {
  id: string;
  patient_id: string;
  target_device: string;
  command_type: string;
  parameters: string;
  status: 'QUEUED' | 'DELIVERED' | 'EXECUTED' | 'FAILED' | 'EXPIRED';
  error_message?: string;
  created_at: string;
  delivered_at?: string;
  executed_at?: string;
}

export interface AuditLog {
  id: number;
  event_type: string;
  actor: string;
  patient_id?: string;
  description: string;
  metadata_json: string;
  timestamp: string;
}

