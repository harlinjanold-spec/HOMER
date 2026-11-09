import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from backend.database.models import (
    Patient,
    TelemetryEvent,
    VirtualDevice,
    Sensor,
    CaregiverObservation,
    Alert,
    RiskAssessment,
)


class DigitalTwinService:
    @staticmethod
    def get_patient_digital_twin(db: Session, patient_id: str) -> Optional[Dict[str, Any]]:
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            return None

        # 1. Latest Vitals for this patient
        vitals_list = [
            "heart_rate",
            "blood_pressure_sys",
            "blood_pressure_dia",
            "spo2",
            "temperature",
            "respiratory_rate",
            "steps",
            "daily_water_ml",
            "weight",
        ]

        latest_vitals = {}
        for m in vitals_list:
            last_event = (
                db.query(TelemetryEvent)
                .filter(TelemetryEvent.patient_id == patient_id, TelemetryEvent.measurement == m)
                .order_by(desc(TelemetryEvent.timestamp))
                .first()
            )
            if last_event:
                # Calculate if stale (older than 30 mins)
                is_stale = (datetime.utcnow() - last_event.timestamp).total_seconds() > 1800
                latest_vitals[m] = {
                    "value": last_event.value,
                    "unit": last_event.unit,
                    "source": last_event.source,
                    "quality": "stale" if is_stale else last_event.quality,
                    "timestamp": last_event.timestamp.isoformat(),
                    "device_id": last_event.device_id,
                }
            else:
                latest_vitals[m] = {
                    "value": None,
                    "unit": "",
                    "source": "missing",
                    "quality": "stale",
                    "timestamp": None,
                    "device_id": None,
                }

        # 2. Provenance Breakdown (count by source)
        provenance_query = (
            db.query(TelemetryEvent.source, func.count(TelemetryEvent.event_id))
            .filter(TelemetryEvent.patient_id == patient_id)
            .group_by(TelemetryEvent.source)
            .all()
        )
        provenance_breakdown = {src: count for src, count in provenance_query}
        if not provenance_breakdown:
            provenance_breakdown = {"simulation": 0, "manual": 0, "derived": 0, "laboratory": 0}

        # 3. Device counts
        devices = db.query(VirtualDevice).filter(VirtualDevice.patient_id == patient_id).all()
        connected_count = sum(1 for d in devices if d.status == "online")
        offline_count = sum(1 for d in devices if d.status != "online")

        # 4. Active alerts
        active_alerts_count = (
            db.query(Alert)
            .filter(Alert.patient_id == patient_id, Alert.status.in_(["NEW", "DELIVERED", "ACKNOWLEDGED", "ASSIGNED", "IN_PROGRESS"]))
            .count()
        )

        # 5. Recent observations (Caregiver notes)
        recent_obs = (
            db.query(CaregiverObservation)
            .filter(CaregiverObservation.patient_id == patient_id)
            .order_by(desc(CaregiverObservation.timestamp))
            .limit(5)
            .all()
        )

        # 6. Latest Risk Assessment
        latest_risk = (
            db.query(RiskAssessment)
            .filter(RiskAssessment.patient_id == patient_id)
            .order_by(desc(RiskAssessment.timestamp))
            .first()
        )
        risk_data = None
        if latest_risk:
            risk_data = {
                "id": latest_risk.id,
                "patient_id": latest_risk.patient_id,
                "risk_level": latest_risk.risk_level,
                "risk_score": latest_risk.risk_score,
                "contributing_measurements": json.loads(latest_risk.contributing_measurements or "[]"),
                "baseline_comparison": json.loads(latest_risk.baseline_comparison or "{}"),
                "caregiver_note_contribution": json.loads(latest_risk.caregiver_note_contribution or "{}"),
                "explanation": latest_risk.explanation,
                "recommended_action": latest_risk.recommended_action,
                "timestamp": latest_risk.timestamp.isoformat(),
            }

        # 7. Baseline Comparison Calculations
        current_hr = latest_vitals.get("heart_rate", {}).get("value")
        current_bp_sys = latest_vitals.get("blood_pressure_sys", {}).get("value")
        current_bp_dia = latest_vitals.get("blood_pressure_dia", {}).get("value")
        current_spo2 = latest_vitals.get("spo2", {}).get("value")
        current_temp = latest_vitals.get("temperature", {}).get("value")
        current_steps = latest_vitals.get("steps", {}).get("value") or 0

        baseline_comparison = {
            "heart_rate": {
                "current": current_hr,
                "baseline_range": f"{patient.baseline_hr_min} - {patient.baseline_hr_max} BPM",
                "delta": round(current_hr - patient.baseline_hr_max, 1) if current_hr and current_hr > patient.baseline_hr_max else (round(current_hr - patient.baseline_hr_min, 1) if current_hr and current_hr < patient.baseline_hr_min else 0.0),
                "is_abnormal": bool(current_hr and (current_hr < patient.baseline_hr_min or current_hr > patient.baseline_hr_max)),
            },
            "blood_pressure": {
                "current": f"{current_bp_sys}/{current_bp_dia}" if current_bp_sys and current_bp_dia else "N/A",
                "baseline": f"{patient.baseline_bp_sys}/{patient.baseline_bp_dia} mmHg",
                "sys_delta": round(current_bp_sys - patient.baseline_bp_sys, 1) if current_bp_sys else 0.0,
                "is_abnormal": bool(current_bp_sys and current_bp_sys > (patient.baseline_bp_sys + 15)),
            },
            "spo2": {
                "current": current_spo2,
                "baseline_min": f">= {patient.baseline_spo2_min}%",
                "is_abnormal": bool(current_spo2 and current_spo2 < patient.baseline_spo2_min),
            },
            "temperature": {
                "current": current_temp,
                "baseline": f"{patient.baseline_temp} °C",
                "is_abnormal": bool(current_temp and abs(current_temp - patient.baseline_temp) > 0.8),
            },
            "steps": {
                "current": current_steps,
                "baseline": patient.baseline_daily_steps,
                "achievement_pct": round((current_steps / patient.baseline_daily_steps) * 100, 1) if patient.baseline_daily_steps else 0,
            },
        }

        return {
            "patient": {
                "id": patient.id,
                "name": patient.name,
                "age": patient.age,
                "gender": patient.gender,
                "living_arrangement": patient.living_arrangement,
                "room_config": patient.room_config,
                "condition_summary": patient.condition_summary,
                "assigned_caregiver_id": patient.assigned_caregiver_id,
                "baseline_hr_min": patient.baseline_hr_min,
                "baseline_hr_max": patient.baseline_hr_max,
                "baseline_bp_sys": patient.baseline_bp_sys,
                "baseline_bp_dia": patient.baseline_bp_dia,
                "baseline_spo2_min": patient.baseline_spo2_min,
                "baseline_temp": patient.baseline_temp,
                "baseline_resp": patient.baseline_resp,
                "baseline_daily_steps": patient.baseline_daily_steps,
                "baseline_daily_water_ml": patient.baseline_daily_water_ml,
                "baseline_sleep_hours": patient.baseline_sleep_hours,
                "created_at": patient.created_at.isoformat(),
                "updated_at": patient.updated_at.isoformat(),
            },
            "latest_vitals": latest_vitals,
            "baseline_comparison": baseline_comparison,
            "provenance_breakdown": provenance_breakdown,
            "activity_metrics": {
                "steps": current_steps,
                "gait_speed_m_s": 0.95,
                "active_minutes": 42,
                "sedentary_hours": 5.2,
            },
            "sleep_metrics": {
                "last_duration_hours": patient.baseline_sleep_hours,
                "restlessness_index": 2.1,
                "bed_exit_count": 1,
            },
            "connected_devices_count": connected_count,
            "offline_devices_count": offline_count,
            "active_alerts_count": active_alerts_count,
            "recent_observations": [
                {
                    "id": obs.id,
                    "patient_id": obs.patient_id,
                    "caregiver_id": obs.caregiver_id,
                    "note_text": obs.note_text,
                    "language": obs.language,
                    "sentiment": obs.sentiment,
                    "clinical_keywords": obs.clinical_keywords,
                    "timestamp": obs.timestamp.isoformat(),
                }
                for obs in recent_obs
            ],
            "latest_risk": risk_data,
            "last_updated": datetime.utcnow().isoformat(),
        }

