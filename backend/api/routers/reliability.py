from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.database.connection import get_db
from backend.database.models import FaultSimulation, AuditLog
from backend.models.schemas import FaultSimulationCreate, FaultSimulationOut
from backend.reliability.fault_engine import FaultEngine

router = APIRouter(prefix="/api/reliability", tags=["reliability"])


@router.post("/faults/inject", response_model=FaultSimulationOut)
async def inject_fault(fault_in: FaultSimulationCreate, db: Session = Depends(get_db)):
    """Inject a hardware, network, or sensor failure into the simulation environment."""
    fault = await FaultEngine.inject_fault(db, fault_in)
    return fault


@router.post("/faults/{fault_id}/recover", response_model=FaultSimulationOut)
async def recover_fault(fault_id: str, db: Session = Depends(get_db)):
    """Recover from an active fault and restore normal operational state."""
    fault = await FaultEngine.recover_fault(db, fault_id)
    if not fault:
        raise HTTPException(status_code=404, detail=f"Fault simulation {fault_id} not found")
    return fault


@router.get("/faults/active", response_model=List[FaultSimulationOut])
def get_active_faults(patient_id: Optional[str] = None, db: Session = Depends(get_db)):
    """Get all currently active injected faults."""
    return FaultEngine.get_active_faults(db, patient_id)


@router.get("/audit-logs")
def get_audit_logs(
    patient_id: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """Retrieve system audit logs for compliance, incident investigation, and transition tracking."""
    query = db.query(AuditLog)
    if patient_id:
        query = query.filter(AuditLog.patient_id == patient_id)
    logs = query.order_by(desc(AuditLog.timestamp)).limit(limit).all()
    return [
        {
            "id": l.id,
            "event_type": l.event_type,
            "actor": l.actor,
            "patient_id": l.patient_id,
            "description": l.description,
            "metadata_json": l.metadata_json,
            "timestamp": l.timestamp.isoformat(),
        }
        for l in logs
    ]

