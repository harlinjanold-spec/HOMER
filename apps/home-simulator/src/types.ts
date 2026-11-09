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
}

export type AvatarState =
  | 'standing'
  | 'walking'
  | 'sitting'
  | 'sleeping'
  | 'drinking'
  | 'taking_medicine'
  | 'using_bathroom'
  | 'fallen';

export type RoomName = 'Bedroom' | 'Living Room' | 'Kitchen' | 'Bathroom';

export interface AvatarPosition {
  x: number; // 0 to 800 (SVG units)
  y: number; // 0 to 600
  direction: 'up' | 'down' | 'left' | 'right';
  currentRoom: RoomName;
  state: AvatarState;
}

export interface TelemetryPayload {
  event_id: string;
  patient_id: string;
  device_id: string;
  sensor_id: string;
  source: 'simulation' | 'manual' | 'derived' | 'laboratory';
  measurement: string;
  value: number;
  unit: string;
  quality: 'valid' | 'questionable' | 'fault' | 'stale' | 'delayed';
  timestamp: string;
}

export interface RemoteCommand {
  id: string;
  patient_id: string;
  target_device: string;
  command_type: string;
  parameters: string;
  status: string;
  created_at: string;
}

export interface DeviceState {
  id: string;
  name: string;
  device_type: string;
  room: RoomName;
  status: 'online' | 'offline' | 'fault' | 'low_battery';
  battery_pct: number;
  power_source: 'battery' | 'mains';
  is_active: boolean;
  highlighted?: boolean;
}

