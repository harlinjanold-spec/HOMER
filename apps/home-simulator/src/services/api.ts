import { TelemetryPayload, Patient, RemoteCommand } from '../types';
import { OfflineQueueService } from './offlineQueue';

const API_BASE = 'http://localhost:8000/api';

export class ApiService {
  private static isNetworkSimulatedOnline: boolean = true;

  static setSimulatedNetwork(online: boolean) {
    this.isNetworkSimulatedOnline = online;
  }

  static isOnline(): boolean {
    return this.isNetworkSimulatedOnline;
  }

  static async sendTelemetry(event: TelemetryPayload): Promise<{ success: boolean; status: string }> {
    // If simulated network failure is active, buffer event locally
    if (!this.isNetworkSimulatedOnline) {
      OfflineQueueService.enqueue({ ...event, quality: 'delayed' });
      return { success: true, status: 'buffered_offline' };
    }

    try {
      const res = await fetch(`${API_BASE}/telemetry/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();
      return { success: true, status: data.status || 'ingested' };
    } catch (e) {
      // In case of actual network failure, buffer locally
      OfflineQueueService.enqueue({ ...event, quality: 'delayed' });
      return { success: false, status: 'buffered_offline_error' };
    }
  }

  static async flushOfflineQueue(): Promise<{ ingested: number; duplicates: number }> {
    const queue = OfflineQueueService.getQueue();
    if (queue.length === 0) return { ingested: 0, duplicates: 0 };

    try {
      const res = await fetch(`${API_BASE}/telemetry/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: queue }),
      });

      if (!res.ok) throw new Error('Failed to flush offline batch');
      const data = await res.json();
      OfflineQueueService.clearQueue();
      return {
        ingested: data.ingested_count || 0,
        duplicates: data.duplicate_count || 0,
      };
    } catch (e) {
      console.error('Failed to flush offline queue:', e);
      return { ingested: 0, duplicates: 0 };
    }
  }

  static async getPatients(): Promise<Patient[]> {
    try {
      const res = await fetch(`${API_BASE}/patients`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }

  static async getPatient(patientId: string): Promise<Patient | null> {
    try {
      const res = await fetch(`${API_BASE}/patients/${patientId}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  static async markCommandDelivered(commandId: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/commands/${commandId}/deliver`, { method: 'POST' });
    } catch (e) {
      console.error('Error marking command delivered:', e);
    }
  }

  static async confirmCommandExecution(commandId: string, patientId: string, status: 'EXECUTED' | 'FAILED', errorMessage?: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/commands/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command_id: commandId,
          patient_id: patientId,
          status,
          error_message: errorMessage,
        }),
      });
    } catch (e) {
      console.error('Error confirming command execution:', e);
    }
  }

  static async triggerScenario(scenarioId: string, patientId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/scenarios/trigger/${scenarioId}?patient_id=${patientId}`, {
      method: 'POST',
    });
    return await res.json();
  }
}

