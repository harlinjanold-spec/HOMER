from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.database.connection import get_db
from backend.database.models import Caregiver, CaregiverObservation, AuditLog
from backend.models.schemas import (
    CaregiverOut,
    CaregiverObservationCreate,
    CaregiverObservationOut,
)
from backend.ai_engine.risk_engine import AIRiskEngine
from backend.api.websocket_manager import ws_manager

router = APIRouter(prefix="/api/caregivers", tags=["caregivers"])


@router.get("", response_model=List[CaregiverOut])
def get_all_caregivers(db: Session = Depends(get_db)):
    """List all registered caregivers and availability statuses."""
    return db.query(Caregiver).all()


@router.get("/{caregiver_id}", response_model=CaregiverOut)
def get_caregiver(caregiver_id: str, db: Session = Depends(get_db)):
    cg = db.query(Caregiver).filter(Caregiver.id == caregiver_id).first()
    if not cg:
        raise HTTPException(status_code=404, detail=f"Caregiver {caregiver_id} not found")
    return cg


@router.post("/observations", response_model=CaregiverObservationOut)
async def add_observation(obs_in: CaregiverObservationCreate, db: Session = Depends(get_db)):
    """Add a caregiver observation note in English. Automatically triggers NLP keyword parsing & AI risk re-evaluation."""
    now = datetime.utcnow()
    obs_id = f"OBS-{now.strftime('%Y%m%d%H%M%S')}"

    # Analyze English note
    nlp_result = AIRiskEngine.analyze_caregiver_note(obs_in.note_text)

    obs = CaregiverObservation(
        id=obs_id,
        patient_id=obs_in.patient_id,
        caregiver_id=obs_in.caregiver_id,
        note_text=obs_in.note_text,
        language=obs_in.language,
        sentiment=nlp_result["sentiment"],
        clinical_keywords=", ".join(nlp_result["detected_keywords"]),
        timestamp=now,
    )
    db.add(obs)

    audit = AuditLog(
        event_type="CAREGIVER_NOTE_ADDED",
        actor=obs_in.caregiver_id,
        patient_id=obs_in.patient_id,
        description=f"Caregiver added clinical note: '{obs_in.note_text[:80]}...'. Detected sentiment: {nlp_result['sentiment']}.",
    )
    db.add(audit)
    db.commit()
    db.refresh(obs)

    # Re-evaluate AI risk with the new note incorporated
    await AIRiskEngine.evaluate_patient_risk(db, obs_in.patient_id)

    # Broadcast new note to all connected clients
    await ws_manager.broadcast({
        "type": "caregiver_observation_added",
        "data": {
            "id": obs.id,
            "patient_id": obs.patient_id,
            "caregiver_id": obs.caregiver_id,
            "note_text": obs.note_text,
            "sentiment": obs.sentiment,
            "clinical_keywords": obs.clinical_keywords,
            "timestamp": obs.timestamp.isoformat(),
        }
    })

    return obs


@router.get("/observations/{patient_id}", response_model=List[CaregiverObservationOut])
def get_patient_observations(patient_id: str, db: Session = Depends(get_db)):
    """Fetch all caregiver observation notes recorded for a patient."""
    return (
        db.query(CaregiverObservation)
        .filter(CaregiverObservation.patient_id == patient_id)
        .order_by(desc(CaregiverObservation.timestamp))
        .all()
    )

