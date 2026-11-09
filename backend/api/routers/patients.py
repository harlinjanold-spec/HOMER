from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.database.models import Patient
from backend.models.schemas import PatientOut, PatientBaseline

router = APIRouter(prefix="/api/patients", tags=["patients"])


@router.get("", response_model=List[PatientOut])
def get_all_patients(db: Session = Depends(get_db)):
    """Fetch all registered synthetic patient profiles."""
    return db.query(Patient).all()


@router.get("/{patient_id}", response_model=PatientOut)
def get_patient(patient_id: str, db: Session = Depends(get_db)):
    """Fetch a single patient profile by ID."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")
    return patient


@router.put("/{patient_id}/baseline", response_model=PatientOut)
def update_patient_baseline(patient_id: str, baseline: PatientBaseline, db: Session = Depends(get_db)):
    """Update individual clinical baseline values for a patient."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

    for k, v in baseline.model_dump().items():
        setattr(patient, k, v)

    db.commit()
    db.refresh(patient)
    return patient

