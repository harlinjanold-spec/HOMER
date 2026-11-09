import json
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from backend.database.models import Alert, Caregiver, AuditLog
from backend.models.schemas import AlertCreate
from backend.api.websocket_manager import ws_manager

logger = logging.getLogger("ward_zero.alerts")

ESCALATION_TIMEOUT_SECONDS = 90  # Alert escalation threshold


class AlertEngine:
    @staticmethod
    async def create_alert(db: Session, alert_in: AlertCreate) -> Alert:
        """Create a new alert and broadcast via WebSocket."""
        now = datetime.utcnow()
        alert_id = f"ALT-{now.strftime('%Y%m%d%H%M%S')}"

        assigned_cg = alert_in.assigned_caregiver_id
        if not assigned_cg:
            # Pick first available caregiver
            cg = db.query(Caregiver).filter(Caregiver.status == "available").first()
            assigned_cg = cg.id if cg else "CG-001"

        alert = Alert(
            id=alert_id,
            alert_code=f"CODE-{alert_in.category.upper()}",
            patient_id=alert_in.patient_id,
            device_id=alert_in.device_id,
            sensor_id=alert_in.sensor_id,
            title=alert_in.title,
            description=alert_in.description,
            category=alert_in.category,
            priority=alert_in.priority,
            status="NEW",
            triggering_data=json.dumps(alert_in.triggering_data),
            assigned_caregiver_id=assigned_cg,
            escalation_level=0,
            next_escalation_at=now + timedelta(seconds=ESCALATION_TIMEOUT_SECONDS),
            created_at=now,
        )
        db.add(alert)

        # Audit log
        audit = AuditLog(
            event_type="ALERT_CREATED",
            actor="alert_engine",
            patient_id=alert.patient_id,
            description=f"Created {alert.priority} priority alert '{alert.title}' assigned to {assigned_cg}.",
        )
        db.add(audit)
        db.commit()
        db.refresh(alert)

        # Broadcast real-time
        await ws_manager.broadcast({
            "type": "alert_created",
            "data": AlertEngine._serialize_alert(alert),
        })

        return alert

    @staticmethod
    async def acknowledge_alert(db: Session, alert_id: str, caregiver_id: str, notes: Optional[str] = None) -> Optional[Alert]:
        """Caregiver acknowledges alert: status changes from NEW/DELIVERED to ACKNOWLEDGED."""
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if not alert:
            return None

        now = datetime.utcnow()
        alert.status = "ACKNOWLEDGED"
        alert.acknowledged_by = caregiver_id
        alert.acknowledged_at = now
        alert.next_escalation_at = None  # Cancel escalation timer once acknowledged

        audit = AuditLog(
            event_type="ALERT_ACKNOWLEDGED",
            actor=caregiver_id,
            patient_id=alert.patient_id,
            description=f"Caregiver {caregiver_id} acknowledged alert '{alert.title}'. Notes: {notes or 'None'}",
        )
        db.add(audit)
        db.commit()
        db.refresh(alert)

        await ws_manager.broadcast({
            "type": "alert_updated",
            "data": AlertEngine._serialize_alert(alert),
        })
        return alert

    @staticmethod
    async def assign_alert(db: Session, alert_id: str, caregiver_id: str) -> Optional[Alert]:
        """Assign alert to a specific caregiver: status -> ASSIGNED / IN_PROGRESS."""
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if not alert:
            return None

        alert.assigned_caregiver_id = caregiver_id
        alert.status = "IN_PROGRESS"

        audit = AuditLog(
            event_type="ALERT_ASSIGNED",
            actor=caregiver_id,
            patient_id=alert.patient_id,
            description=f"Alert '{alert.title}' assigned to caregiver {caregiver_id} and marked IN_PROGRESS.",
        )
        db.add(audit)
        db.commit()
        db.refresh(alert)

        await ws_manager.broadcast({
            "type": "alert_updated",
            "data": AlertEngine._serialize_alert(alert),
        })
        return alert

    @staticmethod
    async def resolve_alert(db: Session, alert_id: str, caregiver_id: str, resolution_notes: str) -> Optional[Alert]:
        """Resolve alert: status -> RESOLVED."""
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if not alert:
            return None

        now = datetime.utcnow()
        alert.status = "RESOLVED"
        alert.resolved_by = caregiver_id
        alert.resolved_at = now
        alert.resolution_notes = resolution_notes

        audit = AuditLog(
            event_type="ALERT_RESOLVED",
            actor=caregiver_id,
            patient_id=alert.patient_id,
            description=f"Caregiver {caregiver_id} resolved alert '{alert.title}'. Resolution: {resolution_notes}",
        )
        db.add(audit)
        db.commit()
        db.refresh(alert)

        await ws_manager.broadcast({
            "type": "alert_updated",
            "data": AlertEngine._serialize_alert(alert),
        })
        return alert

    @staticmethod
    async def check_and_escalate_alerts(db: Session) -> List[Alert]:
        """Check for unacknowledged alerts that exceeded their escalation timer."""
        now = datetime.utcnow()
        unacked = (
            db.query(Alert)
            .filter(
                Alert.status.in_(["NEW", "DELIVERED"]),
                Alert.next_escalation_at <= now,
            )
            .all()
        )

        escalated_alerts = []
        for alert in unacked:
            alert.escalation_level += 1
            # Next escalation caregiver: CG-004 (Emergency Escalation Lead)
            prev_cg = alert.assigned_caregiver_id
            alert.assigned_caregiver_id = "CG-004"
            alert.priority = "CRITICAL"
            alert.next_escalation_at = now + timedelta(seconds=120)

            audit = AuditLog(
                event_type="ALERT_AUTO_ESCALATED",
                actor="escalation_engine",
                patient_id=alert.patient_id,
                description=f"Alert '{alert.title}' auto-escalated to Level {alert.escalation_level} (reassigned from {prev_cg} to CG-004 Samuel Thorne) due to unacknowledged timer.",
            )
            db.add(audit)
            escalated_alerts.append(alert)

        if escalated_alerts:
            db.commit()
            for a in escalated_alerts:
                db.refresh(a)
                await ws_manager.broadcast({
                    "type": "alert_escalated",
                    "data": AlertEngine._serialize_alert(a),
                })

        return escalated_alerts

    @staticmethod
    def _serialize_alert(a: Alert) -> Dict[str, Any]:
        return {
            "id": a.id,
            "alert_code": a.alert_code,
            "patient_id": a.patient_id,
            "device_id": a.device_id,
            "sensor_id": a.sensor_id,
            "title": a.title,
            "description": a.description,
            "category": a.category,
            "priority": a.priority,
            "status": a.status,
            "triggering_data": a.triggering_data,
            "assigned_caregiver_id": a.assigned_caregiver_id,
            "escalation_level": a.escalation_level,
            "next_escalation_at": a.next_escalation_at.isoformat() if a.next_escalation_at else None,
            "acknowledged_by": a.acknowledged_by,
            "acknowledged_at": a.acknowledged_at.isoformat() if a.acknowledged_at else None,
            "resolved_by": a.resolved_by,
            "resolved_at": a.resolved_at.isoformat() if a.resolved_at else None,
            "resolution_notes": a.resolution_notes,
            "created_at": a.created_at.isoformat(),
            "updated_at": a.updated_at.isoformat(),
        }

