from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.database.connection import get_db
from backend.database.models import TelemetryEvent
from backend.models.schemas import TelemetryEventCreate, TelemetryBatchCreate, TelemetryEventOut
from backend.telemetry.ingestion import TelemetryIngestionService

router = APIRouter(prefix="/api/telemetry", tags=["telemetry"])


@router.post("/events")
async def ingest_single_event(event: TelemetryEventCreate, db: Session = Depends(get_db)):
    """Idempotently ingest a single telemetry event from App 1 Virtual Home Simulator."""
    result = await TelemetryIngestionService.ingest_event(db, event)
    return result


@router.post("/batch")
async def ingest_batch_events(batch: TelemetryBatchCreate, db: Session = Depends(get_db)):
    """Batch ingest telemetry events (e.g., buffered offline events after network recovery)."""
    result = await TelemetryIngestionService.ingest_batch(db, batch.events)
    return result


@router.get("/history", response_model=List[TelemetryEventOut])
def get_telemetry_history(
    patient_id: str,
    measurement: Optional[str] = None,
    hours: int = Query(24, ge=1, le=72),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """Retrieve historical time-series telemetry for charts and analytics."""
    since = datetime.utcnow() - timedelta(hours=hours)
    query = (
        db.query(TelemetryEvent)
        .filter(TelemetryEvent.patient_id == patient_id, TelemetryEvent.timestamp >= since)
    )
    if measurement:
        query = query.filter(TelemetryEvent.measurement == measurement)

    events = query.order_by(TelemetryEvent.timestamp.asc()).limit(limit).all()
    return events


@router.get("/latest")
def get_latest_readings(patient_id: str, db: Session = Depends(get_db)):
    """Get the most recent value for each measurement type for a patient."""
    measurements = [
        "heart_rate", "blood_pressure_sys", "blood_pressure_dia", "spo2",
        "temperature", "respiratory_rate", "steps", "daily_water_ml", "weight"
    ]
    latest = {}
    for m in measurements:
        evt = (
            db.query(TelemetryEvent)
            .filter(TelemetryEvent.patient_id == patient_id, TelemetryEvent.measurement == m)
            .order_by(desc(TelemetryEvent.timestamp))
            .first()
        )
        if evt:
            latest[m] = {
                "value": evt.value,
                "unit": evt.unit,
                "source": evt.source,
                "quality": evt.quality,
                "timestamp": evt.timestamp.isoformat(),
            }
    return latest

