import { TelemetryPayload } from '../types';

const QUEUE_KEY = 'ward_zero_offline_telemetry_queue';

export class OfflineQueueService {
  static getQueue(): TelemetryPayload[] {
    try {
      const data = localStorage.getItem(QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static enqueue(event: TelemetryPayload): void {
    try {
      const queue = this.getQueue();
      // Cap local queue at 500 events to prevent browser storage overflow
      if (queue.length > 500) {
        queue.shift();
      }
      queue.push(event);
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.error('Failed to enqueue offline event:', e);
    }
  }

  static clearQueue(): void {
    localStorage.removeItem(QUEUE_KEY);
  }

  static getQueueLength(): number {
    return this.getQueue().length;
  }
}

