# WARD ZERO — 3-MINUTE HACKATHON DEMONSTRATION VIDEO SCRIPT
## Operation Ward Zero: Hackathon Pitch & Live Prototype Walkthrough
### Duration: Exactly 3 Minutes (180 Seconds) | Format: Split-Screen Live Demo

---

## Screen Layout Setup Before Recording
- **Left Side of Screen (50% Width)**: App 1 — Virtual Home Simulator (`http://localhost:5173`)
- **Right Side of Screen (50% Width)**: App 2 — Healthcare Command Centre (`http://localhost:5174`)
- **Background Terminal / Console**: Backend running cleanly (`http://localhost:8000`)

---

## Timed Video Script & Action Cues

### Scene 1: Problem & Vision (0:00 – 0:30)
**Visual**: Camera on presenter for 5 seconds, then zoom to the dual split-screen layout showing both applications running live.
**Presenter (Voiceover)**:
> "Hospital beds are scarce, expensive, and intimidating for patients. But bringing hospital care into the home shouldn't mean turning a living room into an intensive care unit with tangled wires and beeping monitors.
> 
> Welcome to **Ward Zero: Invisible Healthcare. Intelligent Living.**
> 
> Our central philosophy is simple: *Healthcare should adapt to the patient's lifestyle, not force the patient to adapt to healthcare.*
> 
> As you see on screen, we have built two completely independent, live applications connected by a high-throughput Python backend: on the left, our **2D Virtual Home Simulator**; on the right, our clinical **Healthcare Command Centre**."

---

### Scene 2: The Invisible Home & Everyday IoT Devices (0:30 – 1:00)
**Visual**: Cursor focuses on App 1 (Left Screen). Presenter presses `W`, `A`, `S`, `D` to navigate the patient avatar (Raghav Menon, 72) from the bedroom into the living room and kitchen.
**Presenter (Voiceover)**:
> "Here in App 1, we simulate the daily routine of 72-year-old Raghav Menon. Notice there are no clunky medical carts. Instead, his monitoring is embedded into everyday objects:
> - His **Smart Loungewear Dress** continuously monitors ECG and respiration via conductive textile threads.
> - His **Smart Slippers** track balance, gait cadence, and foot pressure distribution.
> - His **Smart Mattress** measures ballistocardiographic heart rate and sleep restlessness without skin contact.
> - And his **Smart Pillbox and Water Bottle** monitor hydration and medication schedule adherence without requiring any manual data logging."

**Action**: Click on the Smart Dress widget to show the live ECG trace, then click the Smart Slippers to show the footbed pressure heatmap.

---

### Scene 3: Real-Time Bi-Directional Integration (1:00 – 1:35)
**Visual**: Split-screen focus. Move Raghav near the water bottle; press `SPACE` to drink. Simultaneously point to App 2 (Right Screen) updating in real time.
**Presenter (Voiceover)**:
> "Every action in the home immediately flows through our FastAPI ingestion pipeline into Raghav's unified Patient Digital Twin.
> 
> When Raghav drinks water or when we adjust the heart rate slider in the simulator, watch the Command Centre on the right: the live Recharts time-series stream updates with sub-second latency.
> 
> And our communication is strictly **bi-directional**: a clinician in the Command Centre can click 'Adjust Room Climate' or 'Trigger Audio Reminder', and App 1 instantly receives and visually executes the command in the home environment."

**Action**: In App 2, click the 'Trigger Voice Prompt' remote command button. In App 1, observe the Assistive Robot modal pop up with the clinician's reminder.

---

### Scene 4: Explainable AI Risk & Alert Escalation (1:35 – 2:15)
**Visual**: In App 1, press `F` on the keyboard to trigger a simulated fall event, or click the 'Simulate Fall' button.
**Presenter (Voiceover)**:
> "Now let's simulate a critical event: Raghav trips in the living room.
> 
> Immediately, our multi-modal sensor fusion engages:
> 1. Smart Slippers detect an impact acceleration spike above 2.8g.
> 2. Smart Dress confirms a sudden shift from vertical to horizontal posture.
> 3. Living room PIR confirms immobility.
> 
> Instantly, on the right, the Command Centre's AI Risk Engine elevates Raghav's risk from MEDIUM to HIGH with a composite score of 94. 
> 
> Notice the **explainability**: our AI doesn't just spit out a number; it itemizes the exact clinical drivers: prolonged horizontal immobility, tachypneic heart rate delta, and missed morning medication.
> 
> In the Nurse Station, a critical alert is generated. If unacknowledged within 120 seconds, our automated escalation engine pages the emergency charge nurse."

**Action**: In App 2, click 'Acknowledge Alert', assign it to Nurse Priya Sharma, and resolve it, showing the live transition in the auditable log.

---

### Scene 5: Reliability, Offline Buffering & Fault Recovery (2:15 – 2:45)
**Visual**: In App 1, click the **'Wi-Fi Disconnect (Offline)'** toggle switch. The status badge turns yellow/red: `OFFLINE`.
**Presenter (Voiceover)**:
> "Real homes lose internet. In an ordinary system, critical health telemetry is lost.
> 
> In Ward Zero, when Wi-Fi drops, our client-side resilience engine instantly diverts telemetry into a local **IndexedDB persistent buffer**.
> 
> Even with the network severed, Raghav's movements and vital changes are securely captured on the device.
> 
> Now, we toggle Wi-Fi back online. Watch the offline buffer drain: all queued telemetry is replayed in chronological order, and our backend's idempotent deduplication ensures zero corrupted data or duplicate alerts."

**Action**: Re-enable Wi-Fi. Observe the buffer count drain to zero and the Command Centre graphs synchronize smoothly.

---

### Scene 6: Conclusion & Impact (2:45 – 3:00)
**Visual**: Presenter returns on camera with the dual-screen system active in the background.
**Presenter**:
> "Ward Zero bridges the gap between acute clinical oversight and the comfort of home living. By combining everyday IoT, explainable AI, bi-directional telemetry, and military-grade resilience, we are delivering the future of hospital-at-home care today.
> 
> Invisible Healthcare. Intelligent Living. 
> 
> Thank you."

---

## Technical Checklist for Video Production
- [x] Backend running on port 8000 with seed data pre-loaded.
- [x] App 1 running on port 5173 with browser resolution set to 1920x1080 (left half: 960x1080).
- [x] App 2 running on port 5174 (right half: 960x1080).
- [x] Browser zoom set to 90% on both windows for optimal dashboard data density.
- [x] Audio recorded with dedicated cardioid microphone for clean narration.

