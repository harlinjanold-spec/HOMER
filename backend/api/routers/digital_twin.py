from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.digital_twin.twin_service import DigitalTwinService

router = APIRouter(prefix="/api/digital-twin", tags=["digital_twin"])


@router.get("/{patient_id}")
def get_patient_digital_twin(patient_id: str, db: Session = Depends(get_db)):
    """Fetch complete unified Patient Digital Twin combining vitals, baselines, observations, and device health."""
    twin = DigitalTwinService.get_patient_digital_twin(db, patient_id)
    if not twin:
        raise HTTPException(status_code=404, detail=f"Digital twin for patient {patient_id} not found")
    return twin

