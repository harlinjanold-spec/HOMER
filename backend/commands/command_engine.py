import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.database.models import RemoteCommand, AuditLog
from backend.models.schemas import RemoteCommandCreate, RemoteCommandConfirm
from backend.api.websocket_manager import ws_manager

logger = logging.getLogger("ward_zero.commands")


class CommandEngine:
    @staticmethod
    async def queue_command(db: Session, cmd_in: RemoteCommandCreate) -> RemoteCommand:
        """Queue a remote command sent from Command Centre (App 2) targeting Simulator (App 1)."""
        now = datetime.utcnow()
        cmd_id = f"CMD-{now.strftime('%Y%m%d%H%M%S')}-{cmd_in.command_type[:4]}"

        cmd = RemoteCommand(
            id=cmd_id,
            patient_id=cmd_in.patient_id,
            target_device=cmd_in.target_device,
            command_type=cmd_in.command_type,
            parameters=json.dumps(cmd_in.parameters),
            status="QUEUED",
            created_at=now,
        )
        db.add(cmd)

        audit = AuditLog(
            event_type="COMMAND_QUEUED",
            actor="command_centre",
            patient_id=cmd.patient_id,
            description=f"Command {cmd.command_type} queued for device {cmd.target_device}.",
        )
        db.add(audit)
        db.commit()
        db.refresh(cmd)

        serialized = CommandEngine._serialize_command(cmd)

        # Broadcast to all clients (specifically App 1 simulator)
        await ws_manager.broadcast({
            "type": "remote_command_queued",
            "data": serialized,
        })

        return cmd

    @staticmethod
    async def mark_delivered(db: Session, command_id: str) -> Optional[RemoteCommand]:
        cmd = db.query(RemoteCommand).filter(RemoteCommand.id == command_id).first()
        if not cmd:
            return None
        cmd.status = "DELIVERED"
        cmd.delivered_at = datetime.utcnow()
        db.commit()
        db.refresh(cmd)

        await ws_manager.broadcast({
            "type": "remote_command_delivered",
            "data": CommandEngine._serialize_command(cmd),
        })
        return cmd

    @staticmethod
    async def confirm_execution(db: Session, confirm_in: RemoteCommandConfirm) -> Optional[RemoteCommand]:
        """App 1 confirms that command was executed or failed."""
        cmd = db.query(RemoteCommand).filter(RemoteCommand.id == confirm_in.command_id).first()
        if not cmd:
            return None

        now = datetime.utcnow()
        cmd.status = confirm_in.status  # EXECUTED or FAILED
        cmd.executed_at = now
        cmd.error_message = confirm_in.error_message

        audit = AuditLog(
            event_type="COMMAND_EXECUTED" if confirm_in.status == "EXECUTED" else "COMMAND_FAILED",
            actor="home_simulator",
            patient_id=cmd.patient_id,
            description=f"Command {cmd.id} ({cmd.command_type}) confirmation from simulator: {confirm_in.status}. Error: {confirm_in.error_message or 'None'}",
        )
        db.add(audit)
        db.commit()
        db.refresh(cmd)

        # Broadcast confirmation back to App 2
        await ws_manager.broadcast({
            "type": "remote_command_confirmed",
            "data": CommandEngine._serialize_command(cmd),
        })

        return cmd

    @staticmethod
    def _serialize_command(cmd: RemoteCommand) -> Dict[str, Any]:
        return {
            "id": cmd.id,
            "patient_id": cmd.patient_id,
            "target_device": cmd.target_device,
            "command_type": cmd.command_type,
            "parameters": cmd.parameters,
            "status": cmd.status,
            "error_message": cmd.error_message,
            "created_at": cmd.created_at.isoformat(),
            "delivered_at": cmd.delivered_at.isoformat() if cmd.delivered_at else None,
            "executed_at": cmd.executed_at.isoformat() if cmd.executed_at else None,
        }

