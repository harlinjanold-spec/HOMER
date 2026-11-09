import json
import random
from datetime import datetime, timedelta
from backend.database.connection import SessionLocal, Base, engine
from backend.database.models import (
    Patient,
    VirtualDevice,
    Sensor,
    TelemetryEvent,
    Caregiver,
    CaregiverObservation,
    Alert,
    RemoteCommand,
    RiskAssessment,
    AuditLog,
)


def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # If patients exist, already seeded
    if db.query(Patient).count() > 0:
        db.close()
        return

    print("Seeding Ward Zero database...")

    # 1. Caregivers
    caregivers = [
        Caregiver(
            id="CG-001",
            name="Priya Sharma, RN",
            role="Lead Virtual Ward Nurse",
            phone="+1-555-0101",
            email="priya.sharma@wardzero.org",
            status="available",
            assigned_patients="PAT-001,PAT-004",
            shift_hours="07:00 - 19:00",
            response_time_avg_sec=38.5,
            attendance_status="On Duty",
            visit_count=34,
        ),
        Caregiver(
            id="CG-002",
            name="David Chen, NP",
            role="Geriatric Clinical Specialist",
            phone="+1-555-0102",
            email="david.chen@wardzero.org",
            status="available",
            assigned_patients="PAT-002",
            shift_hours="08:00 - 20:00",
            response_time_avg_sec=42.0,
            attendance_status="On Duty",
            visit_count=29,
        ),
        Caregiver(
            id="CG-003",
            name="Ananya Patel, BSN",
            role="Telemetry & Devices Specialist",
            phone="+1-555-0103",
            email="ananya.patel@wardzero.org",
            status="available",
            assigned_patients="PAT-003",
            shift_hours="08:00 - 20:00",
            response_time_avg_sec=51.2,
            attendance_status="On Duty",
            visit_count=21,
        ),
        Caregiver(
            id="CG-004",
            name="Samuel Thorne, CC-RN",
            role="Emergency Escalation Lead",
            phone="+1-555-0104",
            email="samuel.thorne@wardzero.org",
            status="available",
            assigned_patients="PAT-004",
            shift_hours="19:00 - 07:00 (On-Call)",
            response_time_avg_sec=24.0,
            attendance_status="Standby",
            visit_count=45,
        ),
    ]
    for cg in caregivers:
        db.add(cg)
    db.commit()

    # 2. Patients
    patients = [
        Patient(
            id="PAT-001",
            name="Raghav Menon",
            age=72,
            gender="Male",
            living_arrangement="Living alone with family check-ins",
            room_config="4-Room Smart Apartment",
            condition_summary="Post-cardiac intervention recovery, stable essential hypertension, mild osteoarthritis.",
            assigned_caregiver_id="CG-001",
            baseline_hr_min=62.0,
            baseline_hr_max=78.0,
            baseline_bp_sys=122.0,
            baseline_bp_dia=78.0,
            baseline_spo2_min=96.5,
            baseline_temp=36.8,
            baseline_resp=15.5,
            baseline_daily_steps=3800,
            baseline_daily_water_ml=2100.0,
            baseline_sleep_hours=7.5,
        ),
        Patient(
            id="PAT-002",
            name="Eleanor Vance",
            age=68,
            gender="Female",
            living_arrangement="Home with assistive devices",
            room_config="4-Room Smart Apartment",
            condition_summary="Type 2 diabetes, nocturnal systolic hypertension, gradual decline in daytime mobility.",
            assigned_caregiver_id="CG-002",
            baseline_hr_min=68.0,
            baseline_hr_max=88.0,
            baseline_bp_sys=132.0,
            baseline_bp_dia=84.0,
            baseline_spo2_min=95.0,
            baseline_temp=36.7,
            baseline_resp=16.5,
            baseline_daily_steps=2200,
            baseline_daily_water_ml=1600.0,
            baseline_sleep_hours=6.5,
        ),
        Patient(
            id="PAT-003",
            name="Marcus Brody",
            age=79,
            gender="Male",
            living_arrangement="Suburban home with occasional remote monitoring",
            room_config="4-Room Smart Apartment",
            condition_summary="Chronic kidney disease stage 2, mild cognitive impairment, frequent sensor connectivity drops.",
            assigned_caregiver_id="CG-003",
            baseline_hr_min=64.0,
            baseline_hr_max=82.0,
            baseline_bp_sys=128.0,
            baseline_bp_dia=82.0,
            baseline_spo2_min=95.5,
            baseline_temp=36.6,
            baseline_resp=17.0,
            baseline_daily_steps=2800,
            baseline_daily_water_ml=1800.0,
            baseline_sleep_hours=7.0,
        ),
        Patient(
            id="PAT-004",
            name="Clara Oswald",
            age=81,
            gender="Female",
            living_arrangement="Living alone, high fall risk protocol active",
            room_config="4-Room Smart Apartment",
            condition_summary="History of syncopal falls, paroxysmal atrial fibrillation, unacknowledged alert test subject.",
            assigned_caregiver_id="CG-001",
            baseline_hr_min=65.0,
            baseline_hr_max=92.0,
            baseline_bp_sys=135.0,
            baseline_bp_dia=86.0,
            baseline_spo2_min=94.5,
            baseline_temp=36.9,
            baseline_resp=18.0,
            baseline_daily_steps=1800,
            baseline_daily_water_ml=1500.0,
            baseline_sleep_hours=6.0,
        ),
    ]
    for p in patients:
        db.add(p)
    db.commit()

    # 3. Virtual Devices and Sensors for each patient
    device_templates = [
        ("SLIPPERS", "Smart Slippers", "slippers", "Bedroom", "battery", 92.0, [
            ("foot_pressure", "kPa", 42.0),
            ("step_count", "steps", 3410.0),
            ("walking_speed", "m/s", 0.95),
            ("gait_variation", "%", 4.2),
        ]),
        ("DRESS", "Smart Home Dress", "dress", "Bedroom", "battery", 88.0, [
            ("heart_rate", "BPM", 72.0),
            ("ecg", "mV", 0.8),
            ("skin_temperature", "°C", 36.7),
            ("respiratory_rate", "br/min", 16.0),
        ]),
        ("MATTRESS", "Smart Mattress", "mattress", "Bedroom", "mains", 100.0, [
            ("bed_occupancy", "bool", 0.0),
            ("sleep_duration", "hours", 7.4),
            ("sleep_movement", "events/h", 2.1),
        ]),
        ("PILLBOX", "Smart Pillbox", "pillbox", "Kitchen", "battery", 95.0, [
            ("compartment_status", "status", 1.0),
            ("reminder_status", "status", 0.0),
        ]),
        ("BOTTLE", "Smart Water Bottle", "water_bottle", "Kitchen", "battery", 85.0, [
            ("water_volume", "ml", 450.0),
            ("daily_total_ml", "ml", 1850.0),
        ]),
        ("BATHROOM", "Smart Bathroom Hub", "bathroom", "Bathroom", "mains", 100.0, [
            ("room_occupancy", "bool", 0.0),
            ("visit_duration", "min", 4.5),
            ("visit_frequency", "visits/day", 5.0),
        ]),
        ("SCALE", "Smart Scale", "scale", "Bathroom", "battery", 90.0, [
            ("body_weight", "kg", 74.2),
            ("bmi", "kg/m²", 24.5),
        ]),
        ("WATCH", "Multifunctional Smartwatch", "smartwatch", "Living Room", "battery", 79.0, [
            ("heart_rate", "BPM", 74.0),
            ("spo2", "%", 98.0),
            ("steps", "steps", 3450.0),
        ]),
        ("MIRROR", "Smart Digital Mirror", "mirror", "Bedroom", "mains", 100.0, [
            ("health_summary_sync", "status", 1.0),
        ]),
        ("PIR", "Smart Sensor Network", "pir_sensor", "Living Room", "mains", 100.0, [
            ("pir_motion", "level", 1.0),
            ("ambient_temperature", "°C", 22.4),
            ("ambient_humidity", "%", 48.0),
        ]),
        ("ROBOT", "Assistive AI Robot", "robot", "Living Room", "battery", 84.0, [
            ("interaction_state", "status", 1.0),
        ]),
    ]

    for p in patients:
        for suffix, dev_name, dev_type, room, pwr, bat, s_list in device_templates:
            # For PAT-003, mark some devices offline or low battery to simulate connectivity failure
            dev_status = "online"
            bat_pct = bat
            if p.id == "PAT-003":
                if suffix in ["SLIPPERS", "WATCH"]:
                    dev_status = "offline"
                    bat_pct = 12.0
            elif p.id == "PAT-002":
                if suffix == "SCALE":
                    bat_pct = 28.0

            dev_id = f"DEV-{p.id}-{suffix}"
            device = VirtualDevice(
                id=dev_id,
                patient_id=p.id,
                name=f"{dev_name} ({p.id})",
                device_type=dev_type,
                room=room,
                status=dev_status,
                battery_pct=bat_pct,
                power_source=pwr,
                firmware_ver="v2.1.0",
                is_active=(dev_status != "offline"),
                last_heartbeat=datetime.utcnow(),
            )
            db.add(device)

            for s_type, s_unit, init_val in s_list:
                sen_id = f"SEN-{p.id}-{suffix}-{s_type.upper()}"
                sensor = Sensor(
                    id=sen_id,
                    device_id=dev_id,
                    patient_id=p.id,
                    measurement_type=s_type,
                    unit=s_unit,
                    status="active" if dev_status == "online" else "disconnected",
                    last_value=init_val,
                    last_reading_time=datetime.utcnow(),
                )
                db.add(sensor)

    db.commit()

    # 4. Generate 48-Hour Historical Synthetic Telemetry Time-Series
    now = datetime.utcnow()
    print("Generating 48-hour synthetic historical telemetry...")
    historical_events = []

    for p in patients:
        base_hr = p.baseline_hr_min + 6
        base_bp_s = p.baseline_bp_sys
        base_bp_d = p.baseline_bp_dia
        base_spo2 = p.baseline_spo2_min + 1.5
        base_temp = p.baseline_temp
        base_resp = p.baseline_resp

        # Every 2 hours over 48 hours = 24 points per metric
        for hours_ago in range(48, 0, -2):
            ts = now - timedelta(hours=hours_ago)

            # Add circadian rhythm & patient-specific variations
            hour_of_day = ts.hour
            is_night = (hour_of_day >= 23 or hour_of_day <= 6)

            hr_noise = random.uniform(-4, 4)
            if is_night:
                hr_noise -= 6

            # Specific patient traits:
            if p.id == "PAT-002" and hours_ago < 24:
                # PAT-002 has elevated nocturnal BP and climbing HR in the last 24h
                hr_noise += (24 - hours_ago) * 0.5
                bp_sys_val = base_bp_s + random.uniform(8, 22)
                bp_dia_val = base_bp_d + random.uniform(5, 12)
                spo2_val = max(92.0, base_spo2 - random.uniform(0.5, 2.0))
            elif p.id == "PAT-004" and hours_ago < 6:
                # PAT-004 has acute tachycardia in recent hours
                hr_noise += 25.0
                bp_sys_val = base_bp_s + random.uniform(-10, 15)
                bp_dia_val = base_bp_d + random.uniform(-5, 10)
                spo2_val = 94.0
            else:
                bp_sys_val = base_bp_s + random.uniform(-5, 5)
                bp_dia_val = base_bp_d + random.uniform(-3, 3)
                spo2_val = min(100.0, max(95.0, base_spo2 + random.uniform(-1, 1.5)))

            hr_val = round(max(50.0, base_hr + hr_noise), 1)
            temp_val = round(base_temp + random.uniform(-0.3, 0.3), 1)
            resp_val = round(base_resp + random.uniform(-1.5, 1.5), 1)
            water_val = round(min(2200.0, (24 - (hours_ago % 24)) * 90 + random.uniform(-50, 50)), 0)
            steps_val = round(max(0.0, (24 - (hours_ago % 24)) * 160 + random.uniform(-80, 80)), 0)

            measurements = [
                ("heart_rate", hr_val, "BPM", f"DEV-{p.id}-DRESS", f"SEN-{p.id}-DRESS-HEART_RATE"),
                ("blood_pressure_sys", round(bp_sys_val, 1), "mmHg", f"DEV-{p.id}-DRESS", f"SEN-{p.id}-DRESS-BLOOD_PRESSURE_SYS"),
                ("blood_pressure_dia", round(bp_dia_val, 1), "mmHg", f"DEV-{p.id}-DRESS", f"SEN-{p.id}-DRESS-BLOOD_PRESSURE_DIA"),
                ("spo2", round(spo2_val, 1), "%", f"DEV-{p.id}-WATCH", f"SEN-{p.id}-WATCH-SPO2"),
                ("temperature", temp_val, "°C", f"DEV-{p.id}-DRESS", f"SEN-{p.id}-DRESS-SKIN_TEMPERATURE"),
                ("respiratory_rate", resp_val, "br/min", f"DEV-{p.id}-DRESS", f"SEN-{p.id}-DRESS-RESPIRATORY_RATE"),
                ("daily_water_ml", water_val, "ml", f"DEV-{p.id}-BOTTLE", f"SEN-{p.id}-BOTTLE-DAILY_TOTAL_ML"),
                ("steps", steps_val, "steps", f"DEV-{p.id}-SLIPPERS", f"SEN-{p.id}-SLIPPERS-STEP_COUNT"),
            ]

            for m_name, m_val, m_unit, dev_id, sen_id in measurements:
                evt = TelemetryEvent(
                    event_id=f"EVT-HIST-{p.id}-{hours_ago}-{m_name}",
                    patient_id=p.id,
                    device_id=dev_id,
                    sensor_id=sen_id,
                    source="simulation",
                    measurement=m_name,
                    value=m_val,
                    unit=m_unit,
                    quality="valid",
                    timestamp=ts,
                    ingested_at=ts,
                )
                historical_events.append(evt)

    db.bulk_save_objects(historical_events)
    db.commit()

    # 5. Caregiver Observations
    observations = [
        CaregiverObservation(
            id="OBS-001",
            patient_id="PAT-001",
            caregiver_id="CG-001",
            note_text="Patient completed morning routine cheerfully. Hydration is on target. Morning walk completed without dizziness.",
            language="en",
            sentiment="positive",
            clinical_keywords="morning walk, good hydration, stable",
            timestamp=now - timedelta(hours=5),
        ),
        CaregiverObservation(
            id="OBS-002",
            patient_id="PAT-002",
            caregiver_id="CG-002",
            note_text="Patient complained of unusual fatigue and poor sleep this morning. Noted persistent headache on waking.",
            language="en",
            sentiment="concerning",
            clinical_keywords="fatigue, poor sleep, headache, waking",
            timestamp=now - timedelta(hours=3),
        ),
        CaregiverObservation(
            id="OBS-003",
            patient_id="PAT-003",
            caregiver_id="CG-003",
            note_text="Smart slippers and watch reported delayed sync. Caregiver called patient by landline to confirm well-being.",
            language="en",
            sentiment="neutral",
            clinical_keywords="delayed sync, connectivity, phone check",
            timestamp=now - timedelta(hours=7),
        ),
        CaregiverObservation(
            id="OBS-004",
            patient_id="PAT-004",
            caregiver_id="CG-001",
            note_text="Patient reported lightheadedness upon getting out of bed. Urged to use walker. Fall alert protocol engaged.",
            language="en",
            sentiment="high_risk",
            clinical_keywords="lightheadedness, fall risk, out of bed, syncope",
            timestamp=now - timedelta(hours=1),
        ),
    ]
    for obs in observations:
        db.add(obs)
    db.commit()

    # 6. Initial Seed Alerts demonstrating auditable workflow & escalation
    alerts = [
        Alert(
            id="ALT-001",
            alert_code="ALT-NORM-001",
            patient_id="PAT-001",
            device_id="DEV-PAT-001-PILLBOX",
            sensor_id="SEN-PAT-001-REMINDER_STATUS",
            title="Scheduled Medication Reminder: Morning ACE Inhibitor",
            description="Routine scheduled medication reminder for Lisinopril 10mg. Patient opened compartment at 08:14.",
            category="missed_medication",
            priority="LOW",
            status="RESOLVED",
            triggering_data=json.dumps({"medication": "Lisinopril 10mg", "scheduled": "08:00", "taken": "08:14"}),
            assigned_caregiver_id="CG-001",
            acknowledged_by="CG-001",
            acknowledged_at=now - timedelta(hours=6, minutes=45),
            resolved_by="CG-001",
            resolved_at=now - timedelta(hours=6, minutes=40),
            resolution_notes="Patient confirmed pill ingestion via Smart Mirror interface.",
            created_at=now - timedelta(hours=7),
        ),
        Alert(
            id="ALT-002",
            alert_code="ALT-TREND-002",
            patient_id="PAT-002",
            device_id="DEV-PAT-002-DRESS",
            sensor_id="SEN-PAT-002-BLOOD_PRESSURE_SYS",
            title="Nocturnal Systolic Blood Pressure Spike (154 mmHg)",
            description="Systolic BP elevated +22 mmHg above baseline of 132 mmHg over 3 consecutive night readings.",
            category="vital_abnormal",
            priority="HIGH",
            status="IN_PROGRESS",
            triggering_data=json.dumps({"baseline_sys": 132.0, "current_sys": 154.0, "measurement": "blood_pressure_sys"}),
            assigned_caregiver_id="CG-002",
            acknowledged_by="CG-002",
            acknowledged_at=now - timedelta(minutes=45),
            created_at=now - timedelta(hours=2),
        ),
        Alert(
            id="ALT-003",
            alert_code="ALT-CONN-003",
            patient_id="PAT-003",
            device_id="DEV-PAT-003-SLIPPERS",
            sensor_id="SEN-PAT-003-STEP_COUNT",
            title="Slippers Sensor Hub Offline & Telemetry Stale",
            description="No heartbeat packet received from DEV-PAT-003-SLIPPERS for over 180 minutes. Device marked offline.",
            category="device_failure",
            priority="MEDIUM",
            status="DELIVERED",
            triggering_data=json.dumps({"device": "DEV-PAT-003-SLIPPERS", "last_heartbeat_min_ago": 185}),
            assigned_caregiver_id="CG-003",
            created_at=now - timedelta(hours=3),
        ),
        Alert(
            id="ALT-004",
            alert_code="ALT-FALL-004",
            patient_id="PAT-004",
            device_id="DEV-PAT-004-SLIPPERS",
            sensor_id="SEN-PAT-004-GAIT_VARIATION",
            title="CRITICAL: Simulated Fall Event & Rapid Tachycardia (118 BPM)",
            description="Sudden vertical acceleration drop in Smart Slippers followed by 0 steps and sustained tachycardia.",
            category="fall_detected",
            priority="CRITICAL",
            status="NEW",
            triggering_data=json.dumps({"impact_g": 3.8, "heart_rate": 118.0, "floor_time_sec": 45}),
            assigned_caregiver_id="CG-001",
            escalation_level=1,
            next_escalation_at=now + timedelta(seconds=60),
            created_at=now - timedelta(seconds=45),
        ),
    ]
    for alt in alerts:
        db.add(alt)
    db.commit()

    # 7. Seed Initial Risk Assessments with Explainability
    assessments = [
        RiskAssessment(
            id="RA-001",
            patient_id="PAT-001",
            risk_level="LOW",
            risk_score=14.5,
            contributing_measurements=json.dumps([
                {"metric": "heart_rate", "value": 72.0, "status": "Normal within baseline", "weight": 0.1},
                {"metric": "blood_pressure", "value": "122/78", "status": "Optimal", "weight": 0.1},
                {"metric": "step_count", "value": 3410, "status": "Active mobility", "weight": 0.05},
            ]),
            baseline_comparison=json.dumps({
                "hr_deviation": "+2 BPM from baseline",
                "bp_deviation": "0 mmHg from baseline",
                "hydration_delta": "+50 ml from target",
            }),
            caregiver_note_contribution=json.dumps({
                "sentiment": "positive",
                "risk_adjustment": -5.0,
                "note_excerpt": "Morning routine cheerful, no dizziness",
            }),
            explanation="All physiological and ambient metrics remain within personalized baseline ranges. Normal mobility and prompt medication ingestion confirmed.",
            recommended_action="Continue routine virtual monitoring. Next scheduled vital check at 18:00.",
            timestamp=now - timedelta(hours=1),
        ),
        RiskAssessment(
            id="RA-002",
            patient_id="PAT-002",
            risk_level="HIGH",
            risk_score=78.2,
            contributing_measurements=json.dumps([
                {"metric": "blood_pressure_sys", "value": 154.0, "status": "Elevated above baseline (+22 mmHg)", "weight": 0.45},
                {"metric": "daily_steps", "value": 980, "status": "Severe mobility reduction (-55%)", "weight": 0.25},
                {"metric": "sleep_movement", "value": 5.4, "status": "Sleep fragmentation", "weight": 0.15},
            ]),
            baseline_comparison=json.dumps({
                "bp_deviation": "+22 mmHg systolic over baseline 132 mmHg",
                "steps_deviation": "-1220 steps below baseline 2200 steps",
            }),
            caregiver_note_contribution=json.dumps({
                "sentiment": "concerning",
                "risk_adjustment": +12.0,
                "note_excerpt": "Unusual fatigue, poor sleep, persistent headache on waking",
            }),
            explanation="Significant elevation in resting systolic blood pressure coupled with marked reduction in daytime mobility and caregiver-reported morning headache and fatigue.",
            recommended_action="Urgent caregiver video consultation. Check antihypertensive medication compliance and perform repeat BP measurement within 30 minutes.",
            timestamp=now - timedelta(minutes=40),
        ),
        RiskAssessment(
            id="RA-003",
            patient_id="PAT-003",
            risk_level="MEDIUM",
            risk_score=48.0,
            contributing_measurements=json.dumps([
                {"metric": "device_health", "value": "Offline (Slippers)", "status": "Telemetry missing >3h", "weight": 0.35},
                {"metric": "spo2", "value": 95.0, "status": "Borderline", "weight": 0.2},
            ]),
            baseline_comparison=json.dumps({
                "telemetry_gap": "Slippers data delayed 185 min",
                "vitals_staleness": "Watch vitals last updated 42 min ago",
            }),
            caregiver_note_contribution=json.dumps({
                "sentiment": "neutral",
                "risk_adjustment": +5.0,
                "note_excerpt": "Delayed sync detected; patient contacted via landline",
            }),
            explanation="Medium operational risk driven by telemetry stale state and device connectivity drops. Physiological readings prior to disconnection were stable.",
            recommended_action="Dispatch device reset command from Command Centre; schedule technician battery/Wi-Fi router check if offline continues.",
            timestamp=now - timedelta(hours=2),
        ),
        RiskAssessment(
            id="RA-004",
            patient_id="PAT-004",
            risk_level="HIGH",
            risk_score=94.5,
            contributing_measurements=json.dumps([
                {"metric": "fall_impact", "value": "3.8g vertical drop", "status": "Impact signature verified", "weight": 0.5},
                {"metric": "heart_rate", "value": 118.0, "status": "Tachycardia (+26 BPM above baseline)", "weight": 0.3},
                {"metric": "floor_time", "value": "45s without step event", "status": "Immobility confirmed", "weight": 0.2},
            ]),
            baseline_comparison=json.dumps({
                "hr_deviation": "+26 BPM above max baseline 92 BPM",
                "posture": "Horizontal floor position detected",
            }),
            caregiver_note_contribution=json.dumps({
                "sentiment": "high_risk",
                "risk_adjustment": +15.0,
                "note_excerpt": "Lightheadedness upon waking, fall alert protocol active",
            }),
            explanation="Critical emergency signature: Smart slippers registered sharp vertical deceleration followed by persistent zero-motion floor state and sustained tachycardia.",
            recommended_action="Immediate emergency escalation: activate Smart Mirror emergency speaker and notify escalation lead Samuel Thorne.",
            timestamp=now - timedelta(minutes=1),
        ),
    ]
    for ra in assessments:
        db.add(ra)
    db.commit()

    # 8. Initial Audit Logs
    logs = [
        AuditLog(event_type="SYSTEM_INIT", actor="system", description="Ward Zero Virtual Hospital System initialized successfully with 4 synthetic patients."),
        AuditLog(event_type="TELEMETRY_INGEST", actor="simulator", patient_id="PAT-001", description="Baseline telemetry stream established across 11 IoT healthcare devices."),
        AuditLog(event_type="ALERT_ESCALATION", actor="alert_engine", patient_id="PAT-004", description="Alert ALT-004 escalated to Level 1 due to 45s unacknowledged response timer."),
    ]
    for l in logs:
        db.add(l)
    db.commit()

    db.close()
    print("Database seeding completed successfully!")


if __name__ == "__main__":
    seed_database()
