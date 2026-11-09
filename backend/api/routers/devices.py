from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.database.models import VirtualDevice, Sensor
from backend.models.schemas import VirtualDeviceOut, DeviceUpdate

router = APIRouter(prefix="/api/devices", tags=["devices"])


@router.get("", response_model=List[VirtualDeviceOut])
def get_all_devices(patient_id: Optional[str] = None, db: Session = Depends(get_db)):
    """Fetch virtual devices, optionally filtered by patient ID."""
    query = db.query(VirtualDevice)
    if patient_id:
        query = query.filter(VirtualDevice.patient_id == patient_id)
    return query.all()


@router.get("/{device_id}", response_model=VirtualDeviceOut)
def get_device(device_id: str, db: Session = Depends(get_db)):
    """Fetch device details including registered sensors."""
    device = db.query(VirtualDevice).filter(VirtualDevice.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail=f"Device {device_id} not found")
    return device


@router.patch("/{device_id}", response_model=VirtualDeviceOut)
def update_device(device_id: str, update: DeviceUpdate, db: Session = Depends(get_db)):
    """Update virtual device status, battery level, or room position."""
    device = db.query(VirtualDevice).filter(VirtualDevice.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail=f"Device {device_id} not found")

    if update.status is not None:
        device.status = update.status
    if update.battery_pct is not None:
        device.battery_pct = update.battery_pct
    if update.is_active is not None:
        device.is_active = update.is_active
    if update.room is not None:
        device.room = update.room

    db.commit()
    db.refresh(device)
    return device

