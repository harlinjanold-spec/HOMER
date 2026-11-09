type MessageHandler = (data: any) => void;

export class SimulatorWebSocketService {
  private static ws: WebSocket | null = null;
  private static handlers: Map<string, Set<MessageHandler>> = new Map();
  private static isConnected: boolean = false;
  private static reconnectTimer: any = null;

  static connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.ws = new WebSocket('ws://localhost:8000/ws?client=simulator');

      this.ws.onopen = () => {
        this.isConnected = true;
        console.log('[Simulator WS] Connected to Ward Zero backend');
        this.emit('connection_status', { connected: true });
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type) {
            this.emit(msg.type, msg.data);
          }
          this.emit('*', msg);
        } catch (e) {
          console.error('[Simulator WS] Error parsing message:', e);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        console.log('[Simulator WS] Disconnected. Reconnecting in 3s...');
        this.emit('connection_status', { connected: false });
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.error('[Simulator WS] Error:', err);
      };
    } catch (e) {
      this.scheduleReconnect();
    }
  }

  private static scheduleReconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, 3000);
  }

  static on(eventType: string, handler: MessageHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);

    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }

  private static emit(eventType: string, data: any): void {
    const listeners = this.handlers.get(eventType);
    if (listeners) {
      listeners.forEach((fn) => fn(data));
    }
  }

  static send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  static getIsConnected(): boolean {
    return this.isConnected;
  }
}

