import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from backend.database.models import FaultSimulation, VirtualDevice, Sensor, AuditLog
from backend.models.schemas import FaultSimulationCreate
from backend.api.websocket_manager import ws_manager

logger = logging.getLogger("ward_zero.reliability")


class FaultEngine:
    @staticmethod
    async def inject_fault(db: Session, fault_in: FaultSimulationCreate) -> FaultSimulation:
        """Inject a simulated hardware, network, or power failure."""
        now = datetime.utcnow()
        fault_id = f"FAULT-{now.strftime('%Y%m%d%H%M%S')}-{fault_in.fault_type[:6]}"

        fault = FaultSimulation(
            id=fault_id,
            fault_type=fault_in.fault_type,
            target_patient_id=fault_in.target_patient_id,
            target_device_id=fault_in.target_device_id,
            is_active=True,
            injected_at=now,
            notes=fault_in.notes or f"Simulated {fault_in.fault_type} injected.",
        )
        db.add(fault)

        # Apply realistic failure consequences to devices/sensors
        if fault_in.fault_type == "POWER_OUTAGE":
            # Mains-powered devices lose power immediately; battery-powered stay on
            mains_devices = (
                db.query(VirtualDevice)
                .filter(VirtualDevice.patient_id == fault_in.target_patient_id, VirtualDevice.power_source == "mains")
                .all()
            )
            for d in mains_devices:
                d.status = "offline"
                d.is_active = False

        elif fault_in.fault_type == "WIFI_DISCONNECT":
            # All devices for this patient lose network connectivity
            all_devices = db.query(VirtualDevice).filter(VirtualDevice.patient_id == fault_in.target_patient_id).all()
            for d in all_devices:
                d.status = "offline"

        elif fault_in.fault_type == "LOW_BATTERY":
            # Target device or first battery device drops to critical 5%
            target = None
            if fault_in.target_device_id:
                target = db.query(VirtualDevice).filter(VirtualDevice.id == fault_in.target_device_id).first()
            if not target:
                target = db.query(VirtualDevice).filter(VirtualDevice.patient_id == fault_in.target_patient_id, VirtualDevice.power_source == "battery").first()
            if target:
                target.battery_pct = 4.5
                target.status = "low_battery"

        elif fault_in.fault_type in ["SENSOR_FAULT", "CONTROLLER_OFFLINE"]:
            if fault_in.target_device_id:
                target = db.query(VirtualDevice).filter(VirtualDevice.id == fault_in.target_device_id).first()
                if target:
                    target.status = "fault"
                    target.is_active = False
                    for s in target.sensors:
                        s.status = "fault"

        audit = AuditLog(
            event_type="FAULT_INJECTED",
            actor="reliability_lab",
            patient_id=fault_in.target_patient_id,
            description=f"Fault {fault_in.fault_type} injected into patient {fault_in.target_patient_id}. Target device: {fault_in.target_device_id or 'All'}.",
        )
        db.add(audit)
        db.commit()
        db.refresh(fault)

        # Broadcast fault injection to App 1 and App 2
        await ws_manager.broadcast({
            "type": "fault_injected",
            "data": {
                "id": fault.id,
                "fault_type": fault.fault_type,
                "target_patient_id": fault.target_patient_id,
                "target_device_id": fault.target_device_id,
                "is_active": fault.is_active,
                "injected_at": fault.injected_at.isoformat(),
            }
        })

        return fault

    @staticmethod
    async def recover_fault(db: Session, fault_id: str) -> Optional[FaultSimulation]:
        """Recover from an active simulated failure and restore normal states."""
        fault = db.query(FaultSimulation).filter(FaultSimulation.id == fault_id).first()
        if not fault:
            return None

        now = datetime.utcnow()
        fault.is_active = False
        fault.recovered_at = now

        # Restore affected devices to online
        devices = db.query(VirtualDevice).filter(VirtualDevice.patient_id == fault.target_patient_id).all()
        for d in devices:
            d.status = "online"
            d.is_active = True
            if d.battery_pct < 20.0:
                d.battery_pct = 95.0
            for s in d.sensors:
                s.status = "active"

        audit = AuditLog(
            event_type="FAULT_RECOVERED",
            actor="reliability_lab",
            patient_id=fault.target_patient_id,
            description=f"Fault {fault.fault_type} (ID: {fault.id}) marked recovered. Devices and sensors restored to online state.",
        )
        db.add(audit)
        db.commit()
        db.refresh(fault)

        await ws_manager.broadcast({
            "type": "fault_recovered",
            "data": {
                "id": fault.id,
                "fault_type": fault.fault_type,
                "target_patient_id": fault.target_patient_id,
                "recovered_at": fault.recovered_at.isoformat(),
            }
        })

        return fault

    @staticmethod
    def get_active_faults(db: Session, patient_id: Optional[str] = None) -> List[FaultSimulation]:
        query = db.query(FaultSimulation).filter(FaultSimulation.is_active == True)
        if patient_id:
            query = query.filter(FaultSimulation.target_patient_id == patient_id)
        return query.order_by(FaultSimulation.injected_at.desc()).all()

