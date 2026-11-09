from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.database.connection import get_db
from backend.database.models import Alert
from backend.models.schemas import (
    AlertOut,
    AlertCreate,
    AlertAcknowledgeRequest,
    AlertAssignRequest,
    AlertResolveRequest,
)
from backend.alerts.alert_engine import AlertEngine

router = APIRouter(prefix="/api/alerts", tags=["alerts"])


@router.get("", response_model=List[AlertOut])
def get_alerts(
    patient_id: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """List alerts with optional filtering by patient, status, or priority."""
    query = db.query(Alert)
    if patient_id:
        query = query.filter(Alert.patient_id == patient_id)
    if status:
        query = query.filter(Alert.status == status)
    if priority:
        query = query.filter(Alert.priority == priority)
    return query.order_by(desc(Alert.created_at)).all()


@router.post("", response_model=AlertOut)
async def create_alert(alert_in: AlertCreate, db: Session = Depends(get_db)):
    """Create a new alert and trigger real-time notification."""
    alert = await AlertEngine.create_alert(db, alert_in)
    return alert


@router.post("/{alert_id}/acknowledge", response_model=AlertOut)
async def acknowledge_alert(
    alert_id: str,
    req: AlertAcknowledgeRequest,
    db: Session = Depends(get_db),
):
    """Acknowledge alert by caregiver (advances status from NEW/DELIVERED to ACKNOWLEDGED)."""
    alert = await AlertEngine.acknowledge_alert(db, alert_id, req.caregiver_id, req.notes)
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")
    return alert


@router.post("/{alert_id}/assign", response_model=AlertOut)
async def assign_alert(
    alert_id: str,
    req: AlertAssignRequest,
    db: Session = Depends(get_db),
):
    """Assign alert to another caregiver (advances status to IN_PROGRESS)."""
    alert = await AlertEngine.assign_alert(db, alert_id, req.caregiver_id)
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")
    return alert


@router.post("/{alert_id}/resolve", response_model=AlertOut)
async def resolve_alert(
    alert_id: str,
    req: AlertResolveRequest,
    db: Session = Depends(get_db),
):
    """Mark alert as resolved with required resolution notes."""
    alert = await AlertEngine.resolve_alert(db, alert_id, req.caregiver_id, req.resolution_notes)
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")
    return alert


@router.post("/escalate-check")
async def check_escalations(db: Session = Depends(get_db)):
    """Trigger background check for unacknowledged alerts that need escalation."""
    escalated = await AlertEngine.check_and_escalate_alerts(db)
    return {"escalated_count": len(escalated), "alert_ids": [a.id for a in escalated]}

