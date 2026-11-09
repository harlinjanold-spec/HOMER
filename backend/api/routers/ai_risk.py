from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.ai_engine.risk_engine import AIRiskEngine

router = APIRouter(prefix="/api/ai", tags=["ai_risk"])


@router.post("/evaluate/{patient_id}")
async def evaluate_risk(patient_id: str, db: Session = Depends(get_db)):
    """Trigger AI contextual risk evaluation for patient based on vitals, baseline, activity, and caregiver notes."""
    try:
        assessment = await AIRiskEngine.evaluate_patient_risk(db, patient_id)
        return assessment
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/predictive-trends/{patient_id}")
def get_predictive_trends(
    patient_id: str,
    metric: str = Query("heart_rate", pattern="^(heart_rate|blood_pressure_sys|spo2|temperature)$"),
    db: Session = Depends(get_db),
):
    """Fetch 24h & 48h trend projections with uncertainty confidence intervals."""
    return AIRiskEngine.get_predictive_trends(db, patient_id, metric)
