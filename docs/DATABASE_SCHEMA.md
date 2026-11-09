# WARD ZERO – DATABASE SCHEMA SPECIFICATION

The persistence layer uses SQLite for rapid local zero-dependency operation, architected with full PostgreSQL DDL compatibility.

## 1. Entity-Relationship Overview

```
 patients 1──< virtual_devices 1──< sensors
    │                   │
    1                   1
    ├──< telemetry_events
    ├──< alerts
    ├──< caregiver_observations >──1 caregivers
    ├──< risk_assessments
    └──< remote_commands
```

## 2. Table Specifications

### 2.1 `patients`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(50) | PRIMARY KEY | Patient Identifier (e.g. PAT-001) |
| `name` | VARCHAR(100) | NOT NULL | Patient Full Name |
| `age` | INTEGER | NOT NULL | Age in years |
| `gender` | VARCHAR(20) | DEFAULT 'Unspecified' | Gender |
| `living_arrangement` | VARCHAR(100) | | Residential living configuration |
| `room_config` | VARCHAR(50) | | Apartment floorplan configuration |
| `condition_summary` | TEXT | | Clinical conditions & background |
| `assigned_caregiver_id`| VARCHAR(50) | | Current primary assigned caregiver |
| `baseline_hr_min` | FLOAT | DEFAULT 60.0 | Personalized lower HR baseline |
| `baseline_hr_max` | FLOAT | DEFAULT 85.0 | Personalized upper HR baseline |
| `baseline_bp_sys` | FLOAT | DEFAULT 120.0 | Baseline resting systolic BP |
| `baseline_bp_dia` | FLOAT | DEFAULT 80.0 | Baseline resting diastolic BP |
| `baseline_spo2_min` | FLOAT | DEFAULT 95.0 | Minimum acceptable oxygen sat |
| `baseline_temp` | FLOAT | DEFAULT 36.8 | Baseline skin temperature (°C) |
| `baseline_resp` | FLOAT | DEFAULT 16.0 | Baseline respiratory rate (br/min)|
| `baseline_daily_steps` | INTEGER | DEFAULT 3500 | Daily target mobility steps |
| `baseline_daily_water_ml`| FLOAT | DEFAULT 2000.0 | Daily target hydration (ml) |
| `baseline_sleep_hours` | FLOAT | DEFAULT 7.5 | Target nocturnal sleep duration |

### 2.2 `virtual_devices`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(50) | PRIMARY KEY | Device identifier (e.g. DEV-PAT-001-SLIPPERS) |
| `patient_id` | VARCHAR(50) | FOREIGN KEY | Associated patient |
| `name` | VARCHAR(100) | NOT NULL | Device name |
| `device_type` | VARCHAR(50) | NOT NULL | slippers, dress, mattress, pillbox, etc. |
| `room` | VARCHAR(50) | | Bedroom, Living Room, Kitchen, Bathroom |
| `status` | VARCHAR(20) | DEFAULT 'online' | online, offline, fault, low_battery |
| `battery_pct` | FLOAT | DEFAULT 100.0 | Battery percentage (0-100) |
| `power_source` | VARCHAR(20) | | battery, mains |
| `firmware_ver` | VARCHAR(20) | | Simulated firmware version |
| `is_active` | BOOLEAN | DEFAULT TRUE | Power state |
| `last_heartbeat` | DATETIME | | Timestamp of last ping |

### 2.3 `telemetry_events`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `event_id` | VARCHAR(64) | PRIMARY KEY | Idempotent unique event hash |
| `patient_id` | VARCHAR(50) | INDEX | Patient ID |
| `device_id` | VARCHAR(50) | INDEX | Originating device |
| `sensor_id` | VARCHAR(50) | | Specific sensor transducer |
| `source` | VARCHAR(30) | | simulation, manual, derived, laboratory |
| `measurement` | VARCHAR(50) | INDEX | heart_rate, steps, spo2, etc. |
| `value` | FLOAT | NOT NULL | Numeric reading |
| `unit` | VARCHAR(20) | NOT NULL | Unit of measure (BPM, mmHg, etc.) |
| `quality` | VARCHAR(20) | | valid, questionable, fault, stale, delayed |
| `timestamp` | DATETIME | INDEX | Measurement creation timestamp |
| `ingested_at` | DATETIME | | Server ingestion timestamp |

### 2.4 `alerts`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(50) | PRIMARY KEY | Alert ID (e.g. ALT-001) |
| `alert_code` | VARCHAR(50) | NOT NULL | Protocol alert classification |
| `patient_id` | VARCHAR(50) | INDEX | Target patient |
| `title` | VARCHAR(150) | NOT NULL | Alert title |
| `description` | TEXT | NOT NULL | Detailed alert explanation |
| `category` | VARCHAR(50) | NOT NULL | vital_abnormal, fall_detected, etc. |
| `priority` | VARCHAR(20) | | LOW, MEDIUM, HIGH, CRITICAL |
| `status` | VARCHAR(30) | INDEX | NEW, ACKNOWLEDGED, IN_PROGRESS, RESOLVED |
| `triggering_data`| TEXT | | JSON telemetry payload snapshot |
| `assigned_caregiver_id` | VARCHAR(50) | | Caregiver assigned to respond |
| `escalation_level` | INTEGER | DEFAULT 0 | Escalation counter |
| `next_escalation_at` | DATETIME | | Auto-escalation timeout threshold |
| `acknowledged_by` | VARCHAR(50) | | Caregiver ID who acknowledged |
| `acknowledged_at` | DATETIME | | Timestamp of acknowledgment |
| `resolved_by` | VARCHAR(50) | | Caregiver ID who resolved |
| `resolved_at` | DATETIME | | Timestamp of resolution |
| `resolution_notes`| TEXT | | Clinical explanation of resolution |

### 2.5 `remote_commands`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(50) | PRIMARY KEY | Unique Command ID |
| `patient_id` | VARCHAR(50) | INDEX | Target patient |
| `target_device` | VARCHAR(50) | NOT NULL | Targeted virtual device |
| `command_type` | VARCHAR(50) | NOT NULL | MEDICATION_REMINDER, REBOOT, etc. |
| `parameters` | TEXT | | JSON payload of command parameters |
| `status` | VARCHAR(20) | INDEX | QUEUED, DELIVERED, EXECUTED, FAILED |
| `delivered_at` | DATETIME | | Time received by App 1 |
| `executed_at` | DATETIME | | Time confirmed executed by App 1 |

### 2.6 `risk_assessments`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(50) | PRIMARY KEY | Assessment ID |
| `patient_id` | VARCHAR(50) | INDEX | Evaluated patient |
| `risk_level` | VARCHAR(20) | NOT NULL | LOW, MEDIUM, HIGH |
| `risk_score` | FLOAT | NOT NULL | Composite risk score (0-100) |
| `contributing_measurements` | TEXT | | JSON array of weighted factors |
| `baseline_comparison` | TEXT | | JSON baseline delta values |
| `caregiver_note_contribution`| TEXT | | JSON sentiment & NLP score delta |
| `explanation` | TEXT | NOT NULL | Human-readable clinical summary |
| `recommended_action` | TEXT | NOT NULL | Conservative safe next steps |
| `timestamp` | DATETIME | INDEX | Evaluation timestamp |

