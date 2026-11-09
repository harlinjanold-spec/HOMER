type MessageHandler = (data: any) => void;

export class CommandCentreWebSocket {
  private static ws: WebSocket | null = null;
  private static handlers: Map<string, Set<MessageHandler>> = new Map();
  private static isConnected: boolean = false;
  private static reconnectTimer: any = null;

  static connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.ws = new WebSocket('ws://localhost:8000/ws?client=command-centre');

      this.ws.onopen = () => {
        this.isConnected = true;
        console.log('[Command Centre WS] Connected to Ward Zero Backend');
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
          console.error('[Command Centre WS] Error parsing message:', e);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        console.log('[Command Centre WS] Disconnected. Reconnecting in 3s...');
        this.emit('connection_status', { connected: false });
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.error('[Command Centre WS] Error:', err);
      };
    } catch {
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

  static getIsConnected(): boolean {
    return this.isConnected;
  }
}

