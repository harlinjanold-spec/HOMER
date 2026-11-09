import json
import logging
from typing import List, Dict, Any
from fastapi import WebSocket

logger = logging.getLogger("ward_zero.websocket")


class ConnectionManager:
    def __init__(self):
        # Store active websocket connections
        self.active_connections: List[WebSocket] = []
        # Map app_name/client_id to websocket if registered
        self.client_roles: Dict[WebSocket, str] = {}

    async def connect(self, websocket: WebSocket, client_type: str = "unknown"):
        await websocket.accept()
        self.active_connections.append(websocket)
        self.client_roles[websocket] = client_type
        logger.info(f"WebSocket client connected: {client_type} (Total: {len(self.active_connections)})")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if websocket in self.client_roles:
            del self.client_roles[websocket]
        logger.info(f"WebSocket client disconnected (Remaining: {len(self.active_connections)})")

    async def broadcast(self, message: Dict[str, Any]):
        """Broadcast JSON message to all active clients."""
        text_data = json.dumps(message, default=str)
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_text(text_data)
            except Exception as e:
                logger.error(f"Error broadcasting to client: {e}")
                dead_connections.append(connection)
        for dead in dead_connections:
            self.disconnect(dead)

    async def send_to_role(self, role: str, message: Dict[str, Any]):
        """Send message specifically to simulator (App 1) or command-centre (App 2)."""
        text_data = json.dumps(message, default=str)
        dead_connections = []
        for connection, client_role in self.client_roles.items():
            if client_role == role or role == "all":
                try:
                    await connection.send_text(text_data)
                except Exception as e:
                    logger.error(f"Error sending to {role}: {e}")
                    dead_connections.append(connection)
        for dead in dead_connections:
            self.disconnect(dead)


ws_manager = ConnectionManager()

