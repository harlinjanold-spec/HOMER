# WARD ZERO – AI/ML METHODOLOGY DOCUMENTATION

## 1. Contextual Risk Assessment Architecture

Rather than relying on isolated threshold alerts (which cause alert fatigue in traditional hospitals), Ward Zero employs a **multi-dimensional contextual scoring model**:

```
[Physiological Telemetry]  ──► Weight: 45% (HR, BP sys/dia, SpO2, Temp, Resp)
[Mobility & Sleep Baselines] ─► Weight: 25% (Daily steps delta, bed restlessness)
[Device & Sensor Quality]   ─► Weight: 15% (Data staleness, disconnection penalty)
[Caregiver NLP Sentiment]   ──► Weight: 15% (English clinical observation keywords)
                                       │
                                       ▼
                       [Composite Risk Score: 0 - 100]
                                       │
                 ┌─────────────────────┼─────────────────────┐
                 ▼                     ▼                     ▼
          LOW RISK (<35)      MEDIUM RISK (35-64)    HIGH RISK (>=65)
          Level 3 Green         Level 2 Amber          Level 1 Red
```

## 2. Machine Learning Anomaly Detection (IsolationForest)

In addition to deterministic clinical rules, the AI engine processes multivariate physiological time-series using **Scikit-Learn's `IsolationForest`**:
- **Feature Vector**: Triplet of continuous telemetry: $[HR_t, BP_{sys, t}, SpO2_t]$
- **Contamination Factor**: $0.15$
- **Objective**: Identify subtle multi-parameter drift where individual parameters might hover near normal limits, but their combined trajectory constitutes a non-linear anomaly.
- **Score Conversion**: The anomaly decision function yields an anomaly penalty contributing up to $+20$ points to the composite risk score.

## 3. Natural Language Processing for Caregiver Notes

Per hackathon requirements, the system parses unstructured English caregiver observations:
- **Lexicon Categories**:
  - *High Risk*: `fall`, `chest pain`, `shortness of breath`, `dyspnea`, `syncope`, `unresponsive`, `collapse`. ($+20$ pts)
  - *Concerning*: `fatigue`, `tiredness`, `poor sleep`, `dizziness`, `lightheaded`, `headache`, `reduced appetite`, `unsteady`. ($+10$ pts)
  - *Positive/Stable*: `cheerful`, `good`, `stable`, `normal`, `improving`, `active`. ($-5$ pts)
- **Extracted Feature Representation**: The parser outputs sentiment label, clinical keywords array, and point adjustment directly into the explainable risk assessment JSON.

## 4. Predictive Deterioration Forecasting (24h & 48h Horizon)

To address pre-symptomatic deterioration:
- **Model**: Autoregressive polynomial trend fitting over historical 48-hour circadian telemetry.
- **Confidence Bounds**: Calculates $88\%$ confidence intervals ($\pm 4.5$ units for 24h, $\pm 8.0$ units for 48h).
- **Clinical Safety Constraints**: Transparently labelled as exploratory mathematical forecasting. Boundaries prevent impossible physiological values (e.g., HR bounded $55-140$ BPM).

## 5. Explainability & Non-Diagnosis Guarantee

Per clinical safety standards:
1. Every risk assessment includes a human-readable `explanation` detailing exact contributing factors.
2. The system recommends **conservative operational care actions** (e.g. "Review trends in Nurse Station; check compliance"), never unsupported diagnostic conclusions (e.g. no claims of diagnosing stroke or myocardial infarction).

