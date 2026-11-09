import {
  Patient,
  VirtualDevice,
  Alert,
  Caregiver,
  CaregiverObservation,
  RiskAssessment,
  DigitalTwin,
  RemoteCommand,
  AuditLog,
} from '../types';

const API_BASE = 'http://localhost:8000/api';

export class CommandCentreApi {
  // Patients
  static async getPatients(): Promise<Patient[]> {
    const res = await fetch(`${API_BASE}/patients`);
    return res.ok ? await res.json() : [];
  }

  static async getPatient(id: string): Promise<Patient | null> {
    const res = await fetch(`${API_BASE}/patients/${id}`);
    return res.ok ? await res.json() : null;
  }

  // Digital Twin
  static async getDigitalTwin(patientId: string): Promise<DigitalTwin | null> {
    const res = await fetch(`${API_BASE}/digital-twin/${patientId}`);
    return res.ok ? await res.json() : null;
  }

  // Devices
  static async getDevices(patientId?: string): Promise<VirtualDevice[]> {
    const url = patientId ? `${API_BASE}/devices?patient_id=${patientId}` : `${API_BASE}/devices`;
    const res = await fetch(url);
    return res.ok ? await res.json() : [];
  }

  static async updateDevice(deviceId: string, update: Partial<VirtualDevice>): Promise<VirtualDevice | null> {
    const res = await fetch(`${API_BASE}/devices/${deviceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    });
    return res.ok ? await res.json() : null;
  }

  // Telemetry History
  static async getTelemetryHistory(patientId: string, measurement?: string, hours: number = 24): Promise<any[]> {
    const mQuery = measurement ? `&measurement=${measurement}` : '';
    const res = await fetch(`${API_BASE}/telemetry/history?patient_id=${patientId}&hours=${hours}${mQuery}`);
    return res.ok ? await res.json() : [];
  }

  // Alerts Workflow
  static async getAlerts(patientId?: string, status?: string): Promise<Alert[]> {
    let url = `${API_BASE}/alerts`;
    const params = new URLSearchParams();
    if (patientId) params.append('patient_id', patientId);
    if (status) params.append('status', status);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url);
    return res.ok ? await res.json() : [];
  }

  static async acknowledgeAlert(alertId: string, caregiverId: string, notes?: string): Promise<Alert | null> {
    const res = await fetch(`${API_BASE}/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caregiver_id: caregiverId, notes }),
    });
    return res.ok ? await res.json() : null;
  }

  static async assignAlert(alertId: string, caregiverId: string): Promise<Alert | null> {
    const res = await fetch(`${API_BASE}/alerts/${alertId}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caregiver_id: caregiverId }),
    });
    return res.ok ? await res.json() : null;
  }

  static async resolveAlert(alertId: string, caregiverId: string, resolutionNotes: string): Promise<Alert | null> {
    const res = await fetch(`${API_BASE}/alerts/${alertId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caregiver_id: caregiverId, resolution_notes: resolutionNotes }),
    });
    return res.ok ? await res.json() : null;
  }

  static async triggerEscalationCheck(): Promise<any> {
    const res = await fetch(`${API_BASE}/alerts/escalate-check`, { method: 'POST' });
    return res.ok ? await res.json() : null;
  }

  // AI Risk Assessment & Forecasting
  static async evaluateRisk(patientId: string): Promise<RiskAssessment | null> {
    const res = await fetch(`${API_BASE}/ai/evaluate/${patientId}`, { method: 'POST' });
    return res.ok ? await res.json() : null;
  }

  static async getPredictiveTrends(patientId: string, metric: string = 'heart_rate'): Promise<any> {
    const res = await fetch(`${API_BASE}/ai/predictive-trends/${patientId}?metric=${metric}`);
    return res.ok ? await res.json() : null;
  }

  // Caregivers
  static async getCaregivers(): Promise<Caregiver[]> {
    const res = await fetch(`${API_BASE}/caregivers`);
    return res.ok ? await res.json() : [];
  }

  static async addCaregiverObservation(patientId: string, caregiverId: string, noteText: string): Promise<CaregiverObservation | null> {
    const res = await fetch(`${API_BASE}/caregivers/observations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_id: patientId,
        caregiver_id: caregiverId,
        note_text: noteText,
        language: 'en',
      }),
    });
    return res.ok ? await res.json() : null;
  }

  // Remote Commands (App 2 -> Backend -> App 1)
  static async queueRemoteCommand(patientId: string, targetDevice: string, commandType: string, parameters: any = {}): Promise<RemoteCommand | null> {
    const res = await fetch(`${API_BASE}/commands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_id: patientId,
        target_device: targetDevice,
        command_type: commandType,
        parameters,
      }),
    });
    return res.ok ? await res.json() : null;
  }

  static async getCommands(patientId?: string): Promise<RemoteCommand[]> {
    const url = patientId ? `${API_BASE}/commands?patient_id=${patientId}` : `${API_BASE}/commands`;
    const res = await fetch(url);
    return res.ok ? await res.json() : [];
  }

  // Reliability Lab & Audit Logs
  static async injectFault(faultType: string, patientId: string, deviceId?: string, notes?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/reliability/faults/inject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fault_type: faultType,
        target_patient_id: patientId,
        target_device_id: deviceId,
        notes,
      }),
    });
    return res.ok ? await res.json() : null;
  }

  static async recoverFault(faultId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/reliability/faults/${faultId}/recover`, { method: 'POST' });
    return res.ok ? await res.json() : null;
  }

  static async getActiveFaults(patientId?: string): Promise<any[]> {
    const url = patientId ? `${API_BASE}/reliability/faults/active?patient_id=${patientId}` : `${API_BASE}/reliability/faults/active`;
    const res = await fetch(url);
    return res.ok ? await res.json() : [];
  }

  static async getAuditLogs(patientId?: string): Promise<AuditLog[]> {
    const url = patientId ? `${API_BASE}/reliability/audit-logs?patient_id=${patientId}` : `${API_BASE}/reliability/audit-logs`;
    const res = await fetch(url);
    return res.ok ? await res.json() : [];
  }

  // Scenarios
  static async triggerScenario(scenarioId: string, patientId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/scenarios/trigger/${scenarioId}?patient_id=${patientId}`, {
      method: 'POST',
    });
    return res.ok ? await res.json() : null;
  }
}

