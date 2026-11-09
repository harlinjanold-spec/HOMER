import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  User,
  Wifi,
  Calendar,
  Pill,
  Droplet,
  Footprints,
  Bed,
  Bath,
  Sliders,
  Activity,
  Heart,
  Thermometer,
  Wind,
  ShieldAlert,
  BatteryCharging,
  ExternalLink,
  Pause,
  Play,
  RotateCcw,
  X,
  Stethoscope,
  TrendingDown,
  AlertTriangle,
  Radio,
  CheckCircle2,
} from 'lucide-react';

import { Floorplan } from './home-world/Floorplan';
import { SmartMirrorModal } from './devices/SmartMirrorModal';
import { AssistiveRobotModal } from './devices/AssistiveRobotModal';

import {
  Patient,
  AvatarPosition,
  AvatarState,
  RoomName,
  TelemetryPayload,
  RemoteCommand,
} from './types';
import { ApiService } from './services/api';
import { SimulatorWebSocketService } from './services/websocket';
import { OfflineQueueService } from './services/offlineQueue';

export const App: React.FC = () => {
  // 1. Patient State
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentPatientId, setCurrentPatientId] = useState<string>('PAT-001');
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);

  // 2. Avatar State (Raghav Menon in Isometric Apartment)
  const [position, setPosition] = useState<AvatarPosition>({
    x: 520,
    y: 390,
    direction: 'right',
    currentRoom: 'Living Room',
    state: 'standing',
  });
  const walkStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 3. Vitals & Sensors (Simulated Wearables)
  const [heartRate, setHeartRate] = useState<number>(78);
  const [spo2, setSpo2] = useState<number>(97);
  const [temperature, setTemperature] = useState<number>(36.7);
  const [bpSys, setBpSys] = useState<number>(131);
  const [bpDia, setBpDia] = useState<number>(76);
  const [respiratoryRate, setRespiratoryRate] = useState<number>(16);

  // 4. Device States & Activities
  const [steps, setSteps] = useState<number>(2450);
  const [waterMl, setWaterMl] = useState<number>(900);
  const [sleepHours, setSleepHours] = useState<number>(6.5);
  const [weight, setWeight] = useState<number>(68.5);
  const [pillboxReminderActive, setPillboxReminderActive] = useState<boolean>(false);

  // 5. Simulation Engine Control
  const [isSimulationRunning, setIsSimulationRunning] = useState<boolean>(true);
  const [activeLeftTab, setActiveLeftTab] = useState<string>('home');
  const [activeScenario, setActiveScenario] = useState<string>('normal');
  const [isScenariosDrawerOpen, setIsScenariosDrawerOpen] = useState<boolean>(false);

  // 6. Connectivity & Event Log
  const [isNetworkOnline, setIsNetworkOnline] = useState<boolean>(true);
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(0);
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState<string>('10 Nov 2026 | 02:30 PM');
  const [events, setEvents] = useState<Array<{ time: string; text: string }>>([
    { time: '2:30 PM', text: 'Patient active in Living Room' },
    { time: '2:15 PM', text: 'Water intake: +250 ml (Smart Bottle)' },
    { time: '1:00 PM', text: 'Steps updated: 2,450 (Smart Slippers)' },
    { time: '10:24 AM', text: 'Bathroom visit: weight 68.5 kg recorded' },
  ]);

  // 7. Modals & Notifications
  const [isMirrorOpen, setIsMirrorOpen] = useState<boolean>(false);
  const [isRobotOpen, setIsRobotOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'warn' | 'alert' } | null>(null);

  const showToast = (message: string, type: 'info' | 'warn' | 'alert' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const addEvent = (text: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    setEvents((prev) => [{ time: timeStr, text }, ...prev.slice(0, 8)]);
  };

  // Clock Update Effect
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      setCurrentTimeFormatted(`${dateStr} | ${timeStr}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  // Load Initial Patients & Connect WebSocket
  useEffect(() => {
    ApiService.getPatients().then((list) => {
      if (list && list.length > 0) {
        setPatients(list);
        const p1 = list.find((p) => p.id === currentPatientId) || list[0];
        setCurrentPatient(p1);
      }
    });

    // Connect WebSocket to Central Backend
    SimulatorWebSocketService.connect();

    // Listen for Remote Commands from Command Centre (App 2 -> App 1)
    const unsubCmd = SimulatorWebSocketService.on('remote_command_queued', async (cmd: RemoteCommand) => {
      showToast(`⚡ Command from Command Centre: ${cmd.command_type}`, 'warn');
      await ApiService.markCommandDelivered(cmd.id);

      if (cmd.command_type === 'MEDICATION_REMINDER') {
        setPillboxReminderActive(true);
        addEvent('Remote Medication Reminder triggered from Command Centre');
      } else if (cmd.command_type === 'TRIGGER_SOS') {
        handleFall();
      }

      setTimeout(async () => {
        await ApiService.confirmCommandExecution(cmd.id, cmd.patient_id, 'EXECUTED');
      }, 1000);
    });

    return () => {
      unsubCmd();
    };
  }, []);

  // Continuous Outbound Telemetry Stream Loop (App 1 -> Backend -> App 2)
  useEffect(() => {
    if (!isSimulationRunning) return;

    const interval = setInterval(() => {
      const now = new Date().toISOString();
      const payload: TelemetryPayload = {
        event_id: `EVT-SIM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        patient_id: currentPatientId,
        device_id: `DEV-${currentPatientId}-DRESS`,
        sensor_id: `SEN-${currentPatientId}-DRESS-HEART_RATE`,
        source: 'simulation',
        measurement: 'heart_rate',
        value: heartRate + Math.round((Math.random() - 0.5) * 2),
        unit: 'BPM',
        quality: 'valid',
        timestamp: now,
      };

      ApiService.sendTelemetry(payload);
      setOfflineQueueCount(OfflineQueueService.getQueueLength());
    }, 3500);

    return () => clearInterval(interval);
  }, [isSimulationRunning, heartRate, currentPatientId]);

  // Smooth Walk to Destination between Objects (Gentle Senior Pace: ~80-100 px/s)
  const walkTo = (targetX: number, targetY: number, onArrival?: () => void) => {
    const clampedX = Math.max(180, Math.min(880, targetX));
    const clampedY = Math.max(270, Math.min(520, targetY));

    if (position.state === 'sleeping' || position.state === 'fallen') {
      setPosition((p) => ({ ...p, state: 'standing' }));
    }

    const startX = position.x;
    const startY = position.y;
    const dist = Math.hypot(clampedX - startX, clampedY - startY);
    if (dist < 8) {
      onArrival?.();
      return;
    }

    // Calm, measured steps: ~4.5 pixels per step at 50ms interval (~90 px/s)
    const stepCount = Math.max(8, Math.round(dist / 4.5));
    let curStep = 0;

    const walkInterval = setInterval(() => {
      curStep++;
      const t = curStep / stepCount;
      const curX = Math.round(startX + (clampedX - startX) * t);
      const curY = Math.round(startY + (clampedY - startY) * t);

      let room: RoomName = 'Living Room';
      if (curX < 410 && curY < 440) room = 'Bedroom';
      else if (curX > 800 && curY < 430) room = 'Bathroom';

      const dir: 'up' | 'down' | 'left' | 'right' =
        Math.abs(clampedX - startX) > Math.abs(clampedY - startY)
          ? (clampedX >= startX ? 'right' : 'left')
          : (clampedY >= startY ? 'down' : 'up');

      setPosition({
        x: curX,
        y: curY,
        direction: dir,
        currentRoom: room,
        state: 'walking',
      });
      setSteps((s) => s + 1);

      if (curStep >= stepCount) {
        clearInterval(walkInterval);
        setPosition((p) => ({ ...p, state: 'standing' }));
        onArrival?.();
      }
    }, 50);
  };

  // Movement & Room Bounds Calculation (Calm Senior Pace: ~6-7px per keypress)
  const handleMove = (dx: number, dy: number, forcedDir?: 'up' | 'down' | 'left' | 'right') => {
    if (position.state === 'sleeping' || position.state === 'fallen') {
      setPosition((p) => ({ ...p, state: 'standing' }));
    }

    if (walkStopTimerRef.current) {
      clearTimeout(walkStopTimerRef.current);
    }

    setPosition((prev) => {
      const newX = Math.max(180, Math.min(880, prev.x + dx));
      const newY = Math.max(270, Math.min(520, prev.y + dy));

      let newRoom: RoomName = 'Living Room';
      if (newX < 410 && newY < 440) {
        newRoom = 'Bedroom';
      } else if (newX > 800 && newY < 430) {
        newRoom = 'Bathroom';
      }

      const dir = forcedDir || (dx < 0 ? 'left' : dx > 0 ? 'right' : dy < 0 ? 'up' : 'down');

      return {
        ...prev,
        x: newX,
        y: newY,
        direction: dir,
        currentRoom: newRoom,
        state: 'walking',
      };
    });

    setSteps((s) => s + 1);

    // After 220ms of key inactivity, return smoothly to standing posture
    walkStopTimerRef.current = setTimeout(() => {
      setPosition((p) => (p.state === 'walking' ? { ...p, state: 'standing' } : p));
    }, 220);
  };

  // Keyboard Handlers (W/A/S/D, Arrows, E, B, M, Q, U, F, Space, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const k = e.key.toLowerCase();
      if (k === 'w' || e.key === 'ArrowUp') {
        handleMove(0, -6, 'up');
      } else if (k === 's' || e.key === 'ArrowDown') {
        handleMove(0, 6, 'down');
      } else if (k === 'a' || e.key === 'ArrowLeft') {
        handleMove(-7, 0, 'left');
      } else if (k === 'd' || e.key === 'ArrowRight') {
        handleMove(7, 0, 'right');
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (position.state === 'fallen') {
          handleFall();
        } else {
          handleSitStand();
        }
      } else if (k === 'b') {
        handleSleepBed();
      } else if (k === 'm') {
        handleTakeMedicine();
      } else if (k === 'q') {
        handleDrinkWater(250);
      } else if (k === 'u') {
        handleUseBathroom();
      } else if (k === 'f') {
        handleFall();
      } else if (k === 'e') {
        handleInteractNearby();
      } else if (k === 'r') {
        handleDailyRoutine();
      } else if (e.key === 'Escape' || k === 'p') {
        setIsSimulationRunning((r) => !r);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
        if (walkStopTimerRef.current) {
          clearTimeout(walkStopTimerRef.current);
        }
        setPosition((p) => (p.state === 'walking' ? { ...p, state: 'standing' } : p));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [position]);

  // Actions
  const handleWalk = () => {
    handleMove(24, 12);
    addEvent('Patient walking across Living Room');
  };

  const handleSitStand = () => {
    const isSitting = position.state === 'sitting';
    setPosition((prev) => ({
      ...prev,
      state: isSitting ? 'standing' : 'sitting',
      x: isSitting ? prev.x : 380,
      y: isSitting ? prev.y : 510,
    }));
    addEvent(isSitting ? 'Patient stood up' : 'Patient seated on living room sofa');
    showToast(isSitting ? '🧍 Patient standing' : '🛋️ Patient seated on sofa', 'info');
  };

  const handleSleepBed = () => {
    const isSleeping = position.state === 'sleeping';
    if (!isSleeping) {
      walkTo(300, 370, () => {
        setPosition((prev) => ({
          ...prev,
          x: 295,
          y: 255,
          state: 'sleeping',
          currentRoom: 'Bedroom',
        }));
        setHeartRate(60);
        setRespiratoryRate(12);
        addEvent('Patient resting in bed (Smart Mattress occupied)');
        showToast('🛏️ In bed: Smart Mattress pressure sensors active', 'info');

        ApiService.sendTelemetry({
          event_id: `EVT-BED-${Date.now()}`,
          patient_id: currentPatientId,
          device_id: `DEV-${currentPatientId}-MATTRESS`,
          sensor_id: `SEN-${currentPatientId}-MATTRESS-OCCUPANCY`,
          source: 'simulation',
          measurement: 'bed_occupancy',
          value: 1,
          unit: 'state',
          quality: 'valid',
          timestamp: new Date().toISOString(),
        });
      });
    } else {
      setPosition((prev) => ({
        ...prev,
        state: 'standing',
        currentRoom: 'Bedroom',
        x: 300,
        y: 370,
        direction: 'right',
      }));
      setHeartRate(78);
      setRespiratoryRate(16);
      addEvent('Patient woke up and exited bed');
      showToast('🌅 Patient out of bed', 'info');
    }
  };

  const handleTakeMedicine = () => {
    walkTo(415, 435, () => {
      setPillboxReminderActive(false);
      addEvent('Medication confirmed: Lisinopril 10mg (Smart Pillbox)');
      showToast('💊 Dose consumed from Smart Pillbox', 'info');

      ApiService.sendTelemetry({
        event_id: `EVT-MED-${Date.now()}`,
        patient_id: currentPatientId,
        device_id: `DEV-${currentPatientId}-PILLBOX`,
        sensor_id: `SEN-${currentPatientId}-PILLBOX-DOSE`,
        source: 'simulation',
        measurement: 'medication_adherence',
        value: 1,
        unit: 'boolean',
        quality: 'valid',
        timestamp: new Date().toISOString(),
      });
    });
  };

  const handleDrinkWater = (amount = 250) => {
    walkTo(480, 425, () => {
      setWaterMl((w) => w + amount);
      addEvent(`Water intake: +${amount} ml (Smart Water Bottle)`);
      showToast(`💧 Ingested ${amount} ml from Smart Bottle (Total: ${waterMl + amount} ml)`, 'info');

      ApiService.sendTelemetry({
        event_id: `EVT-H2O-${Date.now()}`,
        patient_id: currentPatientId,
        device_id: `DEV-${currentPatientId}-BOTTLE`,
        sensor_id: `SEN-${currentPatientId}-BOTTLE-CAPACITIVE`,
        source: 'simulation',
        measurement: 'water_consumption',
        value: amount,
        unit: 'ml',
        quality: 'valid',
        timestamp: new Date().toISOString(),
      });
    });
  };

  const handleUseBathroom = () => {
    walkTo(790, 385, () => {
      setPosition((prev) => ({
        ...prev,
        currentRoom: 'Bathroom',
        state: 'standing',
      }));
      addEvent('Bathroom visit: Smart Scale tare calibrated');
      showToast(`⚖️ Smart Scale reading: ${weight} kg (BMI: 23.4 Normal)`, 'info');

      ApiService.sendTelemetry({
        event_id: `EVT-SCALE-${Date.now()}`,
        patient_id: currentPatientId,
        device_id: `DEV-${currentPatientId}-SCALE`,
        sensor_id: `SEN-${currentPatientId}-SCALE-LOADCELL`,
        source: 'simulation',
        measurement: 'body_weight',
        value: weight,
        unit: 'kg',
        quality: 'valid',
        timestamp: new Date().toISOString(),
      });
    });
  };

  const handleFall = () => {
    const isFallen = position.state === 'fallen';
    if (isFallen) {
      // Toggle: Safely assist patient back to feet
      setPosition((prev) => ({
        ...prev,
        state: 'standing',
      }));
      setHeartRate(78);
      addEvent('Patient safely assisted to feet (Fall resolved)');
      showToast('🧍 Raghav safely assisted back to his feet', 'info');
      return;
    }

    // Trigger fall right at current room and coordinate
    setPosition((prev) => ({
      ...prev,
      state: 'fallen',
    }));
    setHeartRate(114);
    addEvent(`🚨 CRITICAL FALL EVENT DETECTED (${position.currentRoom})`);
    showToast('🚨 FALL EVENT DETECTED! Emergency page dispatched to Nurse Station.', 'alert');

    ApiService.sendTelemetry({
      event_id: `EVT-FALL-${Date.now()}`,
      patient_id: currentPatientId,
      device_id: `DEV-${currentPatientId}-SLIPPERS`,
      sensor_id: `SEN-${currentPatientId}-SLIPPERS-GAIT_VARIATION`,
      source: 'simulation',
      measurement: 'fall_impact',
      value: 3.6,
      unit: 'g',
      quality: 'valid',
      timestamp: new Date().toISOString(),
    });
  };

  const handleInteractNearby = () => {
    if (position.x > 620 && position.x < 780 && position.y < 420) {
      setIsMirrorOpen(true);
    } else if (position.x > 840 && position.y > 400) {
      setIsRobotOpen(true);
    } else if (position.x < 420 && position.y < 460) {
      handleSleepBed();
    } else if (position.x > 850) {
      handleUseBathroom();
    } else {
      handleTakeMedicine();
    }
  };

  const handleDailyRoutine = () => {
    showToast('🤖 Executing Autonomous Daily Routine...', 'info');
    handleWalk();
    setTimeout(() => handleDrinkWater(250), 1200);
    setTimeout(() => handleTakeMedicine(), 2400);
    setTimeout(() => handleSitStand(), 3600);
  };

  // Scenario Triggers
  const handleScenario = async (scenId: string, name: string) => {
    setActiveScenario(scenId);
    if (scenId === 'normal') {
      setHeartRate(78);
      setSpo2(97);
      setTemperature(36.7);
      setBpSys(122);
      setBpDia(78);
      setRespiratoryRate(16);
      setPosition((p) => ({ ...p, state: 'standing', currentRoom: 'Living Room' }));
      addEvent('Scenario: Normal Daily Activity restored');
    } else if (scenId === 'reduced') {
      setHeartRate(64);
      setPosition((p) => ({ ...p, state: 'sitting', currentRoom: 'Living Room' }));
      addEvent('Scenario: Reduced Activity & Immobility triggered');
    } else if (scenId === 'deterioration') {
      setHeartRate(104);
      setBpSys(168);
      setBpDia(98);
      setSpo2(94);
      addEvent('Scenario: Gradual Health Deterioration active (Hypertension Spike)');
    } else if (scenId === 'fall') {
      handleFall();
    } else if (scenId === 'disconnect') {
      const nextOnline = !isNetworkOnline;
      setIsNetworkOnline(nextOnline);
      ApiService.setSimulatedNetwork(nextOnline);
      addEvent(nextOnline ? 'Wi-Fi Restored: Replaying buffered telemetry events' : 'Wi-Fi Cut: Switched to Local Offline Storage buffer');
    }
    showToast(`Scenario active: ${name}`, 'info');
  };

  const fallbackPatient: Patient = currentPatient || {
    id: 'PAT-001',
    name: 'Raghav Menon',
    age: 72,
    gender: 'Male',
    living_arrangement: 'Home',
    room_config: '4-Room Smart Apartment',
    condition_summary: 'Post-cardiac intervention recovery',
    assigned_caregiver_id: 'CG-001',
    baseline_hr_min: 60,
    baseline_hr_max: 95,
    baseline_bp_sys: 122,
    baseline_bp_dia: 78,
    baseline_spo2_min: 94,
    baseline_temp: 36.7,
    baseline_resp: 16,
    baseline_daily_steps: 3000,
    baseline_daily_water_ml: 1800,
    baseline_sleep_hours: 7.0,
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#071624] select-none font-sans text-slate-100">
      {/* ================= 1. THE 2.5D ISOMETRIC SMART HOME (FULL-SCREEN HERO) ================= */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center">
        <Floorplan
          currentRoom={position.currentRoom}
          devices={[]}
          onFloorClick={(x, y) => {
            walkTo(x, y);
            addEvent(`Patient walked to coordinate (${x}, ${y})`);
          }}
          onDeviceClick={(type) => {
            if (type === 'mirror') {
              walkTo(675, 335, () => setIsMirrorOpen(true));
            } else if (type === 'robot') {
              walkTo(815, 460, () => setIsRobotOpen(true));
            } else if (type === 'pillbox') {
              handleTakeMedicine();
            } else if (type === 'water_bottle') {
              handleDrinkWater(250);
            } else if (type === 'mattress') {
              handleSleepBed();
            } else if (type === 'scale') {
              handleUseBathroom();
            } else if (type === 'slippers') {
              walkTo(690, 395, () => {
                showToast('👟 Smart Slippers: 2,450 steps • Normal Gait (4.2%) • Battery 92%', 'info');
              });
            } else if (type === 'dress') {
              walkTo(565, 310, () => {
                showToast('👕 Smart Dress: 12-lead ECG contact 100% • Skin Temp 36.7 °C', 'info');
              });
            } else if (type === 'fallen_patient') {
              handleFall();
            }
          }}
          pillboxReminderActive={pillboxReminderActive}
          avatarState={position.state}
          avatarPos={{ x: position.x, y: position.y }}
          avatarDirection={position.direction}
          vitals={{
            heartRate,
            spo2,
            temperature,
            respiratoryRate,
            steps,
            waterMl,
            sleepHours,
            weight,
          }}
        />
      </div>

      {/* ================= 2. TOP-LEFT PROFILE CARD (MATCHING REFERENCE) ================= */}
      <div className="absolute top-5 left-6 z-20 flex items-center gap-3.5 px-4 py-2.5 rounded-2xl bg-[#081827]/85 backdrop-blur-md border border-[#00f0ff]/30 shadow-xl shadow-cyan-950/40">
        <div className="w-10 h-10 rounded-full bg-[#0d2a3f] border border-[#00f0ff] flex items-center justify-center text-cyan-300 shadow-sm">
          <User className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black text-white tracking-wide">PAT-001</span>
            <span className="text-slate-500 font-bold">|</span>
            <span className="text-xs font-semibold text-slate-200">Raghav Menon | 72 Y</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Monitored at Home • Post-Cardiac Recovery</span>
          </div>
        </div>
      </div>

      {/* ================= 3. TOP-RIGHT STATUS BAR (MATCHING REFERENCE) ================= */}
      <div className="absolute top-5 right-6 z-20 flex items-center gap-2.5">
        {/* Date & Time Pill */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#081827]/85 backdrop-blur-md border border-[#00f0ff]/25 text-xs font-semibold text-slate-200 shadow-lg">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono">{currentTimeFormatted}</span>
        </div>

        {/* Weather Pill */}
        <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#081827]/85 backdrop-blur-md border border-[#00f0ff]/25 text-xs font-semibold text-amber-300 shadow-lg">
          <span>⛅</span>
          <span>28 °C</span>
        </div>

        {/* Network & Battery Pill */}
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#081827]/85 backdrop-blur-md border border-[#00f0ff]/25 text-xs text-slate-200 shadow-lg">
          <button
            onClick={() => handleScenario('disconnect', 'Wi-Fi Disconnect')}
            title="Click to simulate Wi-Fi disconnect / local queue"
            className={`flex items-center gap-1.5 font-mono font-bold transition hover:opacity-80 ${
              isNetworkOnline ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span className="text-[10px]">{isNetworkOnline ? 'Online' : 'Offline'}</span>
          </button>
          <span className="text-slate-600">|</span>
          <span className="text-[11px] font-mono text-cyan-300 flex items-center gap-1">
            <BatteryCharging className="w-3.5 h-3.5" /> 98%
          </span>
        </div>

        {/* Open Command Centre Link */}
        <a
          href="http://localhost:5174"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0ea5e9]/20 hover:bg-[#0ea5e9]/30 border border-[#0ea5e9] text-xs font-bold text-cyan-300 shadow-lg transition hover:scale-105"
        >
          <span>Command Centre</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* ================= 4. LEFT NAVIGATION DOCK (MATCHING REFERENCE) ================= */}
      <div className="absolute left-6 top-28 z-20 flex flex-col items-center gap-2.5 p-2 rounded-2xl bg-[#081827]/85 backdrop-blur-md border border-[#00f0ff]/25 shadow-2xl shadow-cyan-950/50">
        {[
          {
            id: 'home',
            label: 'Home',
            icon: Home,
            action: () => {
              setPosition({ x: 520, y: 390, direction: 'right', currentRoom: 'Living Room', state: 'standing' });
              addEvent('View centered on Living Room');
            },
          },
          { id: 'sleep', label: 'Sleep', icon: Bed, action: handleSleepBed },
          { id: 'medication', label: 'Medication', icon: Pill, action: handleTakeMedicine },
          { id: 'hydration', label: 'Hydration', icon: Droplet, action: () => handleDrinkWater(250) },
          { id: 'bathroom', label: 'Bathroom', icon: Bath, action: handleUseBathroom },
          { id: 'activity', label: 'Activity', icon: Footprints, action: handleWalk },
          { id: 'scenarios', label: 'Scenarios', icon: Sliders, action: () => setIsScenariosDrawerOpen(!isScenariosDrawerOpen) },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeLeftTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveLeftTab(item.id);
                item.action();
              }}
              className={`w-16 h-14 flex flex-col items-center justify-center rounded-xl text-[10px] font-bold transition-all ${
                isActive
                  ? 'bg-[#00f0ff]/25 text-[#00f0ff] border border-[#00f0ff] shadow-md shadow-cyan-950/50'
                  : 'text-slate-400 hover:text-white hover:bg-[#0c2333]/80 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4 mb-1" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= 5. BOTTOM-LEFT: LIVE VITALS (WEARABLE) CARD (MATCHING REFERENCE) ================= */}
      <div className="absolute bottom-20 left-6 z-20 w-60 rounded-2xl bg-[#081827]/90 backdrop-blur-md border border-[#00f0ff]/30 p-3.5 shadow-2xl shadow-cyan-950/50">
        <div className="flex items-center gap-2 mb-2.5 text-xs font-bold text-white tracking-wide border-b border-[#0f3045] pb-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Live Vitals (Wearable)</span>
        </div>

        <div className="space-y-2.5">
          {/* 1. Heart Rate */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-rose-300 font-medium">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-slate-400 font-bold">HR</span>
              <span className="font-mono font-bold text-white tabular-nums ml-1">{heartRate}</span>
              <span className="text-[10px] text-slate-400">bpm</span>
            </div>
            {/* Live Animated ECG Waveform Sparkline */}
            <svg className="w-20 h-5" viewBox="0 0 80 20">
              <path
                d="M 0 10 L 15 10 L 20 2 L 25 18 L 30 10 L 45 10 L 50 2 L 55 18 L 60 10 L 80 10"
                fill="none"
                stroke="#10b981"
                strokeWidth="1.8"
                strokeLinecap="round"
                className="animate-pulse"
              />
            </svg>
          </div>

          {/* 2. SpO2 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-medium">
              <Droplet className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400 font-bold">SpO2</span>
              <span className="font-mono font-bold text-white tabular-nums ml-1">{spo2}</span>
              <span className="text-[10px] text-slate-400">%</span>
            </div>
            {/* Oxygen Saturation Waveform */}
            <svg className="w-20 h-5" viewBox="0 0 80 20">
              <path
                d="M 0 12 Q 10 4 20 12 T 40 12 T 60 12 T 80 12"
                fill="none"
                stroke="#00f0ff"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* 3. Skin Temperature */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400 font-bold">Temp</span>
              <span className="font-mono font-bold text-white tabular-nums ml-1">{temperature.toFixed(1)}</span>
              <span className="text-[10px] text-slate-400">°C</span>
            </div>
            {/* Temperature Trend Line */}
            <svg className="w-20 h-5" viewBox="0 0 80 20">
              <path
                d="M 0 10 Q 25 8 50 12 T 80 10"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.8"
              />
            </svg>
          </div>

          {/* 4. Respiratory Rate */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-purple-300 font-medium">
              <Wind className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-slate-400 font-bold">Resp</span>
              <span className="font-mono font-bold text-white tabular-nums ml-1">{respiratoryRate}</span>
              <span className="text-[10px] text-slate-400">/ min</span>
            </div>
            {/* Respiratory Sinusoidal Waveform */}
            <svg className="w-20 h-5" viewBox="0 0 80 20">
              <path
                d="M 0 10 Q 10 3 20 10 T 40 10 T 60 10 T 80 10"
                fill="none"
                stroke="#a855f7"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* ================= 6. BOTTOM BAR: FULL-WIDTH KEYCAP SHORTCUTS (MATCHING REFERENCE) ================= */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-[#081827]/90 backdrop-blur-md border border-[#00f0ff]/30 shadow-2xl shadow-cyan-950/60 text-xs font-semibold">
        {/* W A S D Move */}
        <div className="flex items-center gap-1">
          <span className="px-2 py-0.5 rounded-md bg-[#0f2d42] border border-[#00f0ff]/50 font-mono font-bold text-cyan-300 text-[11px] shadow-inner">W</span>
          <span className="px-2 py-0.5 rounded-md bg-[#0f2d42] border border-[#00f0ff]/50 font-mono font-bold text-cyan-300 text-[11px] shadow-inner">A</span>
          <span className="px-2 py-0.5 rounded-md bg-[#0f2d42] border border-[#00f0ff]/50 font-mono font-bold text-cyan-300 text-[11px] shadow-inner">S</span>
          <span className="px-2 py-0.5 rounded-md bg-[#0f2d42] border border-[#00f0ff]/50 font-mono font-bold text-cyan-300 text-[11px] shadow-inner">D</span>
          <span className="text-slate-300 ml-1">Move</span>
        </div>

        <span className="text-slate-700">|</span>

        {/* E Interact */}
        <button onClick={handleInteractNearby} className="flex items-center gap-1 hover:text-white transition">
          <span className="px-2 py-0.5 rounded-md bg-[#0f2d42] border border-[#00f0ff]/50 font-mono font-bold text-cyan-300 text-[11px]">E</span>
          <span className="text-slate-300">Interact</span>
        </button>

        <span className="text-slate-700">|</span>

        {/* B Sleep/Bed */}
        <button onClick={handleSleepBed} className="flex items-center gap-1 hover:text-white transition">
          <span className="px-2 py-0.5 rounded-md bg-[#0f2d42] border border-[#00f0ff]/50 font-mono font-bold text-cyan-300 text-[11px]">B</span>
          <span className="text-slate-300">Sleep/Bed</span>
        </button>

        <span className="text-slate-700">|</span>

        {/* M Medication */}
        <button onClick={handleTakeMedicine} className="flex items-center gap-1 hover:text-white transition">
          <span className="px-2 py-0.5 rounded-md bg-[#0f2d42] border border-[#00f0ff]/50 font-mono font-bold text-cyan-300 text-[11px]">M</span>
          <span className="text-slate-300">Medication</span>
        </button>

        <span className="text-slate-700">|</span>

        {/* Q Drink Water */}
        <button onClick={() => handleDrinkWater(250)} className="flex items-center gap-1 hover:text-white transition">
          <span className="px-2 py-0.5 rounded-md bg-[#0f2d42] border border-[#00f0ff]/50 font-mono font-bold text-cyan-300 text-[11px]">Q</span>
          <span className="text-slate-300">Drink Water</span>
        </button>

        <span className="text-slate-700">|</span>

        {/* U Bathroom */}
        <button onClick={handleUseBathroom} className="flex items-center gap-1 hover:text-white transition">
          <span className="px-2 py-0.5 rounded-md bg-[#0f2d42] border border-[#00f0ff]/50 font-mono font-bold text-cyan-300 text-[11px]">U</span>
          <span className="text-slate-300">Bathroom</span>
        </button>

        <span className="text-slate-700">|</span>

        {/* F Simulate Fall (Red Alert Keycap) */}
        <button onClick={handleFall} className="flex items-center gap-1 group transition">
          <span className="px-2 py-0.5 rounded-md bg-rose-950 border border-rose-500 font-mono font-black text-rose-300 text-[11px] group-hover:bg-rose-900 shadow-sm shadow-rose-950">F</span>
          <span className="text-rose-400 font-bold group-hover:text-rose-300">Simulate Fall</span>
        </button>

        <span className="text-slate-700">|</span>

        {/* ⏸ Pause / ▶ Resume */}
        <button
          onClick={() => setIsSimulationRunning(!isSimulationRunning)}
          className="flex items-center gap-1 text-slate-300 hover:text-white transition"
        >
          <span className="px-2 py-0.5 rounded-md bg-[#0f2d42] border border-slate-600 font-mono font-bold text-slate-200 text-[11px]">
            {isSimulationRunning ? '⏸' : '▶'}
          </span>
          <span>{isSimulationRunning ? 'Pause' : 'Resume'}</span>
        </button>
      </div>

      {/* ================= 7. SCENARIOS & CALIBRATION SLIDE-OVER DRAWER ================= */}
      {isScenariosDrawerOpen && (
        <div className="absolute top-0 right-0 h-full w-96 bg-[#081827]/95 backdrop-blur-xl border-l border-[#00f0ff]/30 p-5 z-40 shadow-2xl overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#0f3045] mb-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                Simulation Scenarios & Controls
              </h2>
            </div>
            <button
              onClick={() => setIsScenariosDrawerOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-2 mb-5">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Official Hackathon Scenarios
            </div>
            {[
              { id: 'normal', name: 'Normal Daily Activity', desc: 'Baseline vitals, regular movement' },
              { id: 'reduced', name: 'Reduced Activity & Immobility', desc: 'Low step count, prolonged stay' },
              { id: 'deterioration', name: 'Gradual Health Deterioration', desc: 'BP spike 168/98, HR 104 BPM' },
              { id: 'fall', name: 'Critical Fall Event', desc: 'Gait variability spike, 3.6g impact' },
              { id: 'disconnect', name: 'Connectivity / Power Failure', desc: 'Wi-Fi cut & local buffer sync' },
            ].map((scen) => (
              <button
                key={scen.id}
                onClick={() => handleScenario(scen.id, scen.name)}
                className={`w-full text-left p-2.5 rounded-xl border text-xs transition ${
                  activeScenario === scen.id
                    ? 'bg-[#00f0ff]/20 border-[#00f0ff] text-white shadow-md shadow-cyan-950/40'
                    : 'bg-[#0b2030] border-slate-700/80 text-slate-300 hover:border-cyan-500/60'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>{scen.name}</span>
                  {activeScenario === scen.id && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{scen.desc}</div>
              </button>
            ))}
          </div>

          {/* Manual Vitals Adjustments */}
          <div className="space-y-3 mb-5 border-t border-[#0f3045] pt-4">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Manual Vital Adjustments
            </div>

            {/* Heart Rate Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-rose-300">Heart Rate</span>
                <span className="font-mono text-white">{heartRate} BPM</span>
              </div>
              <input
                type="range"
                min="45"
                max="160"
                value={heartRate}
                onChange={(e) => setHeartRate(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-400"
              />
            </div>

            {/* Systolic BP Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-sky-300">Systolic BP</span>
                <span className="font-mono text-white">{bpSys} mmHg</span>
              </div>
              <input
                type="range"
                min="90"
                max="200"
                value={bpSys}
                onChange={(e) => setBpSys(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>

            {/* SpO2 Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-cyan-300">SpO2 Oxygen</span>
                <span className="font-mono text-white">{spo2} %</span>
              </div>
              <input
                type="range"
                min="80"
                max="100"
                value={spo2}
                onChange={(e) => setSpo2(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Skin Temperature Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-amber-300">Skin Temperature</span>
                <span className="font-mono text-white">{temperature.toFixed(1)} °C</span>
              </div>
              <input
                type="range"
                min="35"
                max="41"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          </div>

          {/* Outbound Telemetry Stream Log */}
          <div className="border-t border-[#0f3045] pt-4">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Event Activity Log</span>
              <span className="text-[10px] text-cyan-400 font-mono">Live</span>
            </div>
            <div className="space-y-1.5 text-[11px] font-mono max-h-40 overflow-y-auto">
              {events.map((ev, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-300 p-1.5 rounded-lg bg-[#0a1b2a]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span className="text-slate-400 shrink-0">{ev.time}</span>
                  <span className="truncate">{ev.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= 8. FLOATING TOAST NOTIFICATIONS ================= */}
      {notification && (
        <div
          className={`absolute top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold shadow-2xl backdrop-blur-md transition-all animate-bounce ${
            notification.type === 'alert'
              ? 'bg-rose-950/90 text-rose-200 border border-rose-500 shadow-rose-950/80'
              : notification.type === 'warn'
              ? 'bg-amber-950/90 text-amber-200 border border-amber-500 shadow-amber-950/80'
              : 'bg-[#081827]/90 text-cyan-200 border border-[#00f0ff]/50 shadow-cyan-950/80'
          }`}
        >
          {notification.type === 'alert' ? (
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          ) : notification.type === 'warn' ? (
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          ) : (
            <Activity className="w-4 h-4 text-cyan-400" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* ================= 9. INTERACTIVE DEVICE MODALS ================= */}
      {isMirrorOpen && (
        <SmartMirrorModal
          isOpen={isMirrorOpen}
          onClose={() => setIsMirrorOpen(false)}
          patient={fallbackPatient}
          heartRate={heartRate}
          bp={`${bpSys}/${bpDia}`}
          onTriggerSOS={handleFall}
        />
      )}

      {isRobotOpen && (
        <AssistiveRobotModal
          isOpen={isRobotOpen}
          onClose={() => setIsRobotOpen(false)}
          patient={fallbackPatient}
          heartRate={heartRate}
          onRequestCaregiver={() => showToast('📞 Caregiver CG-001 notified via Virtual Nurse Station', 'info')}
          onTriggerSOS={handleFall}
        />
      )}
    </div>
  );
};

export default App;
