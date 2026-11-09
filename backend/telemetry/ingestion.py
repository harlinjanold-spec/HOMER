import logging
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from backend.database.models import TelemetryEvent, Sensor, VirtualDevice, AuditLog
from backend.models.schemas import TelemetryEventCreate
from backend.api.websocket_manager import ws_manager

logger = logging.getLogger("ward_zero.telemetry")


class TelemetryIngestionService:
    @staticmethod
    async def ingest_event(db: Session, event_data: TelemetryEventCreate) -> Dict[str, Any]:
        """Idempotently ingest a single telemetry event."""
        # Check for existing event (Idempotency guarantee)
        existing = db.query(TelemetryEvent).filter(TelemetryEvent.event_id == event_data.event_id).first()
        if existing:
            logger.info(f"Duplicate event ignored: {event_data.event_id}")
            return {
                "status": "duplicate_ignored",
                "event_id": existing.event_id,
                "ingested_at": existing.ingested_at,
            }

        # Create record
        event = TelemetryEvent(
            event_id=event_data.event_id,
            patient_id=event_data.patient_id,
            device_id=event_data.device_id,
            sensor_id=event_data.sensor_id,
            source=event_data.source,
            measurement=event_data.measurement,
            value=event_data.value,
            unit=event_data.unit,
            quality=event_data.quality,
            timestamp=event_data.timestamp,
            ingested_at=datetime.utcnow(),
        )
        db.add(event)

        # Update sensor state if found
        sensor = db.query(Sensor).filter(Sensor.id == event_data.sensor_id).first()
        if sensor:
            sensor.last_value = event_data.value
            sensor.last_reading_time = event_data.timestamp
            if event_data.quality == "valid":
                sensor.status = "active"
            elif event_data.quality in ["fault", "questionable"]:
                sensor.status = event_data.quality

        # Update device heartbeat
        device = db.query(VirtualDevice).filter(VirtualDevice.id == event_data.device_id).first()
        if device:
            device.last_heartbeat = datetime.utcnow()
            if device.status == "offline" and event_data.quality == "valid":
                device.status = "online"

        db.commit()

        # Broadcast real-time update to App 2 via WebSocket
        await ws_manager.broadcast({
            "type": "telemetry_event",
            "data": {
                "event_id": event.event_id,
                "patient_id": event.patient_id,
                "device_id": event.device_id,
                "sensor_id": event.sensor_id,
                "source": event.source,
                "measurement": event.measurement,
                "value": event.value,
                "unit": event.unit,
                "quality": event.quality,
                "timestamp": event.timestamp.isoformat(),
            }
        })

        return {
            "status": "ingested",
            "event_id": event.event_id,
            "timestamp": event.timestamp,
        }

    @staticmethod
    async def ingest_batch(db: Session, events: List[TelemetryEventCreate]) -> Dict[str, Any]:
        """Ingest a batch of events (e.g. following network recovery)."""
        ingested_count = 0
        duplicate_count = 0

        for evt in events:
            res = await TelemetryIngestionService.ingest_event(db, evt)
            if res.get("status") == "ingested":
                ingested_count += 1
            else:
                duplicate_count += 1

        # Audit log batch sync
        if ingested_count > 0:
            audit = AuditLog(
                event_type="BATCH_TELEMETRY_SYNC",
                actor="simulator_offline_queue",
                patient_id=events[0].patient_id if events else None,
                description=f"Batch synchronized {ingested_count} buffered events. ({duplicate_count} duplicates skipped).",
            )
            db.add(audit)
            db.commit()

        return {
            "total_submitted": len(events),
            "ingested_count": ingested_count,
            "duplicate_count": duplicate_count,
        }

