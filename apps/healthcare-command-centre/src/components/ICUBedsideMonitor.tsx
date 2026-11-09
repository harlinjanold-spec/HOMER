import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Square, Activity, Heart, Wind, ShieldAlert, Check } from 'lucide-react';
import { Patient } from '../types';

interface ICUBedsideMonitorProps {
  patient: Patient;
  isFrozen?: boolean;
  onClose?: () => void;
  onTriggerAlarm?: () => void;
}

export const ICUBedsideMonitor: React.FC<ICUBedsideMonitorProps> = ({
  patient,
  isFrozen = false,
  onClose,
  onTriggerAlarm,
}) => {
  // NIBP Controls State
  const [cycleTime, setCycleTime] = useState<string>('15 min');
  const [isAutoCycling, setIsAutoCycling] = useState<boolean>(true);
  const [volumeLevel, setVolumeLevel] = useState<number>(3); // 0 to 4
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [displayFormat, setDisplayFormat] = useState<string>('Sys/Dia (Mean)');
  const [inflationLimits, setInflationLimits] = useState<string>('AUTO');
  const [isCyclingActive, setIsCyclingActive] = useState<boolean>(false);

  // Live Vitals derived from patient data with subtle physiological variance
  const [vitals, setVitals] = useState({
    hr: patient.baseline_hr_min + 4,
    spo2: patient.baseline_spo2_min || 97,
    bpSys: patient.baseline_bp_sys,
    bpDia: patient.baseline_bp_dia,
    bpMean: Math.round(patient.baseline_bp_dia + (patient.baseline_bp_sys - patient.baseline_bp_dia) / 3),
    cvp: 13,
    paSys: 25,
    paDia: 10,
    paMean: 16,
    etCo2: 38,
    fiCo2: 2,
    resp: 16,
  });

  // Dynamic variance simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setVitals((v) => ({
        ...v,
        hr: Math.max(50, Math.min(130, v.hr + Math.floor(Math.random() * 3) - 1)),
        spo2: Math.max(94, Math.min(99, v.spo2 + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0))),
        resp: Math.max(12, Math.min(22, v.resp + (Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0))),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Continuous Canvas Waveform Sweep Renderers
  const ecgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const plethCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const artCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cvpCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (isFrozen) return;

    let animId: number;
    let xPos = 0;
    const speed = 2; // px per frame

    // P-Q-R-S-T generator
    let ecgCycle = 0;
    const cycleLength = 70; // frames per beat (~60-70 bpm)

    const draw = () => {
      const ecg = ecgCanvasRef.current;
      const pleth = plethCanvasRef.current;
      const art = artCanvasRef.current;
      const cvp = cvpCanvasRef.current;

      const containerWidth = ecg?.parentElement?.clientWidth || 560;
      if (ecg && ecg.width !== containerWidth) ecg.width = containerWidth;
      if (pleth && pleth.width !== containerWidth) pleth.width = containerWidth;
      if (art && art.width !== containerWidth) art.width = containerWidth;
      if (cvp && cvp.width !== containerWidth) cvp.width = containerWidth;

      // 1. ECG Canvas (Neon Green)
      if (ecg) {
        const ctx = ecg.getContext('2d');
        if (ctx) {
          const w = ecg.width;
          const h = ecg.height;
          const baseline = h * 0.55;

          // Clear slice ahead of sweep line (erase bar)
          ctx.fillStyle = '#000000';
          ctx.fillRect(xPos, 0, 14, h);

          // Calculate current ECG voltage
          ecgCycle = (ecgCycle + 1) % cycleLength;
          let y = baseline;
          const t = ecgCycle / cycleLength;

          if (t > 0.12 && t < 0.22) {
            // P wave
            y -= Math.sin(((t - 0.12) / 0.1) * Math.PI) * 7;
          } else if (t >= 0.26 && t < 0.29) {
            // Q wave
            y += 4;
          } else if (t >= 0.29 && t < 0.35) {
            // R spike
            y -= Math.sin(((t - 0.29) / 0.06) * Math.PI) * 28;
          } else if (t >= 0.35 && t < 0.38) {
            // S dip
            y += 7;
          } else if (t > 0.5 && t < 0.68) {
            // T wave
            y -= Math.sin(((t - 0.5) / 0.18) * Math.PI) * 11;
          }

          ctx.strokeStyle = '#00ff44';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(xPos, y);
          ctx.lineTo(xPos + speed, y);
          ctx.stroke();
        }
      }

      // 2. Pleth / SpO2 Canvas (Cyan)
      if (pleth) {
        const ctx = pleth.getContext('2d');
        if (ctx) {
          const w = pleth.width;
          const h = pleth.height;
          const baseline = h * 0.75;

          ctx.fillStyle = '#000000';
          ctx.fillRect(xPos, 0, 14, h);

          // Pulsatile plethysmograph wave
          const t = ecgCycle / cycleLength;
          let y = baseline;
          if (t > 0.25 && t < 0.85) {
            const pt = (t - 0.25) / 0.6;
            y -= Math.sin(pt * Math.PI) * (h * 0.65) * (1 - pt * 0.25);
          }

          ctx.strokeStyle = '#00e5ff';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(xPos, y);
          ctx.lineTo(xPos + speed, y);
          ctx.stroke();
        }
      }

      // 3. Arterial Pressure Canvas (Red with dicrotic notch)
      if (art) {
        const ctx = art.getContext('2d');
        if (ctx) {
          const h = art.height;
          const baseline = h * 0.78;

          ctx.fillStyle = '#000000';
          ctx.fillRect(xPos, 0, 14, h);

          const t = ecgCycle / cycleLength;
          let y = baseline;
          if (t > 0.28 && t < 0.52) {
            // Systolic upstroke
            const st = (t - 0.28) / 0.24;
            y -= Math.sin(st * Math.PI) * (h * 0.68);
          } else if (t >= 0.52 && t < 0.6) {
            // Dicrotic notch
            y -= 14 + Math.sin(((t - 0.52) / 0.08) * Math.PI) * 4;
          } else if (t >= 0.6 && t < 0.88) {
            // Diastolic runoff
            const dt = (t - 0.6) / 0.28;
            y -= 14 * (1 - dt);
          }

          ctx.strokeStyle = '#ff3b30';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(xPos, y);
          ctx.lineTo(xPos + speed, y);
          ctx.stroke();
        }
      }

      // 4. CVP / PA Canvas (Blue & Yellow)
      if (cvp) {
        const ctx = cvp.getContext('2d');
        if (ctx) {
          const h = cvp.height;
          ctx.fillStyle = '#000000';
          ctx.fillRect(xPos, 0, 14, h);

          // CVP respiratory oscillation
          const yCvp = h * 0.5 + Math.sin(xPos * 0.04) * 8 + Math.sin(xPos * 0.12) * 3;
          ctx.strokeStyle = '#00b0ff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(xPos, yCvp);
          ctx.lineTo(xPos + speed, yCvp);
          ctx.stroke();

          // PA wave (yellow)
          const yPa = h * 0.65 + Math.sin(xPos * 0.06) * 11;
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(xPos, yPa);
          ctx.lineTo(xPos + speed, yPa);
          ctx.stroke();
        }
      }

      xPos = (xPos + speed) % (ecgCanvasRef.current?.width || 560);
      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [isFrozen]);

  return (
    <div className="w-full bg-[#52637a] border-4 border-[#6b7c96] rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row font-sans select-none">
      {/* ================= LEFT CONSOLE: NIBP & ALARMS CONTROLLER ================= */}
      <div className="w-full md:w-80 bg-[#7a8ba3] border-b md:border-b-0 md:border-r-4 border-[#414f62] p-3 flex flex-col justify-between shrink-0">
        <div>
          {/* Header Title */}
          <div className="bg-[#4d5c70] text-slate-100 px-3 py-1.5 rounded-md font-bold text-xs tracking-tight shadow-inner border-b border-white/20 mb-3 flex items-center justify-between">
            <span className="truncate">Non-Invasive Blood Pressure</span>
            <span className="text-[10px] font-mono bg-slate-900/60 px-1.5 py-0.5 rounded text-cyan-300">NIBP</span>
          </div>

          {/* Top Row: Alarms & NIBP Auto Start */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={onTriggerAlarm}
              className="clinical-btn h-9 text-xs font-bold text-slate-900 flex items-center justify-center gap-1.5 active:translate-y-0.5 transition"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />
              <span>Alarms</span>
            </button>

            <button
              onClick={() => setIsAutoCycling(!isAutoCycling)}
              className={`clinical-btn h-9 text-xs font-bold flex items-center justify-center gap-1.5 active:translate-y-0.5 transition ${
                isAutoCycling ? 'bg-[#3b82f6] text-white border-blue-400' : 'text-slate-900'
              }`}
            >
              <span>{isAutoCycling ? 'Cycling ON' : 'Cycling OFF'}</span>
            </button>
          </div>

          {/* Volume Speaker Wedge Display */}
          <div className="bg-[#5c6e86] p-2.5 rounded-lg border-t border-l border-[#3a4756] border-r border-b border-[#8294ad] mb-3 shadow-inner">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-200 mb-1.5">
              <span className="flex items-center gap-1">
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-300" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-300" />}
                Completed NIBP Volume
              </span>
              <div className="flex items-center gap-1 bg-[#334155] px-2 py-0.5 rounded font-mono text-cyan-300">
                <button
                  onClick={() => setVolumeLevel((v) => Math.max(0, v - 1))}
                  className="hover:text-white px-1"
                >
                  ◀
                </button>
                <span>{volumeLevel}</span>
                <button
                  onClick={() => setVolumeLevel((v) => Math.min(4, v + 1))}
                  className="hover:text-white px-1"
                >
                  ▶
                </button>
              </div>
            </div>

            {/* Wedge Volume Bars */}
            <div className="flex items-end gap-1 h-5 pt-1">
              {[1, 2, 3, 4].map((lvl) => (
                <div
                  key={lvl}
                  onClick={() => setVolumeLevel(lvl)}
                  className={`flex-1 rounded-sm cursor-pointer transition ${
                    volumeLevel >= lvl && !isMuted ? 'bg-[#38bdf8]' : 'bg-[#334155]'
                  }`}
                  style={{ height: `${lvl * 25}%` }}
                />
              ))}
            </div>
          </div>

          {/* Display Sys/Dia Format & Inflation Limits */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between text-xs bg-[#5c6e86] px-2.5 py-1.5 rounded-md border border-[#485669]">
              <span className="text-[11px] font-bold text-slate-200">Display Format:</span>
              <select
                value={displayFormat}
                onChange={(e) => setDisplayFormat(e.target.value)}
                className="bg-[#243040] text-cyan-300 font-mono font-bold text-[11px] px-2 py-0.5 rounded border border-slate-700 cursor-pointer"
              >
                <option value="Sys/Dia (Mean)">Sys/Dia (Mean)</option>
                <option value="Sys/Dia">Sys/Dia</option>
                <option value="Mean Only">Mean Only</option>
              </select>
            </div>

            <div className="flex items-center justify-between text-xs bg-[#5c6e86] px-2.5 py-1.5 rounded-md border border-[#485669]">
              <span className="text-[11px] font-bold text-slate-200">Inflation Limits:</span>
              <select
                value={inflationLimits}
                onChange={(e) => setInflationLimits(e.target.value)}
                className="bg-[#243040] text-cyan-300 font-mono font-bold text-[11px] px-2 py-0.5 rounded border border-slate-700 cursor-pointer"
              >
                <option value="AUTO">AUTO</option>
                <option value="ADULT 160">ADULT 160</option>
                <option value="ADULT 180">ADULT 180</option>
                <option value="PEDIATRIC 120">PEDIATRIC 120</option>
              </select>
            </div>
          </div>

          {/* Cycle Time Selection List */}
          <div className="bg-[#5c6e86] p-2.5 rounded-lg border-t border-l border-[#3a4756] border-r border-b border-[#8294ad] shadow-inner mb-3">
            <div className="text-[11px] font-bold text-slate-200 mb-1.5">Cycle Time</div>
            <div className="space-y-1">
              {['15 min', '3 min', '4 min', '5 min', '10 min'].map((time) => {
                const isSelected = cycleTime === time;
                return (
                  <button
                    key={time}
                    onClick={() => setCycleTime(time)}
                    className={`w-full text-left px-2.5 py-1 rounded text-xs font-mono font-bold transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-white text-slate-950 shadow-sm border border-slate-300'
                        : 'text-slate-200 hover:bg-[#47566b]'
                    }`}
                  >
                    <span>{time}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Actions: Start Manual NIBP & Close */}
        <div className="space-y-2 pt-2 border-t border-[#485669]">
          <button
            onClick={() => {
              setIsCyclingActive(true);
              setTimeout(() => setIsCyclingActive(false), 3000);
            }}
            className={`clinical-btn w-full h-10 text-xs font-black flex items-center justify-center gap-2 active:translate-y-0.5 transition ${
              isCyclingActive
                ? 'bg-emerald-600 text-white border-emerald-400'
                : 'text-slate-900 hover:bg-[#8ca0ba]'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-700" />
            <span>{isCyclingActive ? 'Measuring Cuff Pressure...' : 'Start Manual NIBP'}</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="w-full text-center py-1 text-xs text-slate-300 hover:text-white font-bold"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* ================= RIGHT CONSOLE: MULTI-CHANNEL CRT/OLED BLACK MONITOR ================= */}
      <div className="flex-1 bg-[#000000] p-3 flex flex-col justify-between overflow-hidden">
        {/* Patient Clinical Info Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-[#1b2533] text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="text-white font-bold text-sm tracking-wide">{patient.name}</span>
            <span className="text-slate-400">ID: <strong className="text-cyan-300">{patient.id}</strong></span>
            <span className="text-slate-400">{patient.age}y • Bed 4A-12</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-600 text-[10px] font-bold">
              MONITORING ACTIVE
            </span>
            <span className="text-slate-400 font-mono">{new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
          </div>
        </div>

        {/* ---------------- 1. ECG CHANNEL (NEON GREEN) ---------------- */}
        <div className="h-28 flex items-center border-b border-[#141b24] py-1">
          {/* Waveform Canvas */}
          <div className="flex-1 h-full relative">
            <div className="absolute top-1 left-1 flex items-center gap-2 text-[10px] font-mono text-[#00ff44] opacity-80">
              <span className="font-bold">ECG II</span>
              <span>1 mV</span>
            </div>
            <canvas ref={ecgCanvasRef} width={520} height={100} className="w-full h-full" />
          </div>

          {/* Digital Telemetry Box */}
          <div className="w-48 pl-3 border-l border-[#1b2533] text-right flex flex-col justify-between h-full font-mono">
            <div className="flex justify-between items-start">
              <span className="text-xs text-[#00ff44] font-bold uppercase tracking-wider">HR /min</span>
              <span className="text-[10px] text-slate-400">PVC 0/min</span>
            </div>
            <div className="text-5xl font-black text-[#00ff44] tracking-tight leading-none drop-shadow-[0_0_12px_rgba(0,255,68,0.4)]">
              {vitals.hr}
            </div>
            <div className="text-[10px] text-[#00ff44]/80 flex justify-between">
              <span>ST mm</span>
              <span>V1 0.4 • V2 0.4</span>
            </div>
          </div>
        </div>

        {/* ---------------- 2. SpO2 / PLETH CHANNEL (CYAN) ---------------- */}
        <div className="h-24 flex items-center border-b border-[#141b24] py-1">
          {/* Waveform Canvas */}
          <div className="flex-1 h-full relative">
            <div className="absolute top-1 left-1 flex items-center gap-2 text-[10px] font-mono text-[#00e5ff] opacity-80">
              <span className="font-bold">Pleth 2</span>
            </div>
            <canvas ref={plethCanvasRef} width={520} height={85} className="w-full h-full" />
          </div>

          {/* Digital Telemetry Box */}
          <div className="w-48 pl-3 border-l border-[#1b2533] text-right flex flex-col justify-between h-full font-mono">
            <div className="flex justify-between items-start">
              <span className="text-xs text-[#00e5ff] font-bold uppercase tracking-wider">SpO2 %</span>
              <span className="text-[10px] text-slate-400">Pulse {vitals.hr}</span>
            </div>
            <div className="text-5xl font-black text-[#00e5ff] tracking-tight leading-none drop-shadow-[0_0_12px_rgba(0,229,255,0.4)]">
              {vitals.spo2}
            </div>
            <div className="text-[10px] text-[#00e5ff]/80 flex justify-between">
              <span>Perfusion</span>
              <span>2.4 Normal</span>
            </div>
          </div>
        </div>

        {/* ---------------- 3. NIBP CHANNEL (WHITE) & ART 1 (RED) ---------------- */}
        <div className="h-24 flex items-center border-b border-[#141b24] py-1">
          {/* Arterial Waveform Canvas */}
          <div className="flex-1 h-full relative">
            <div className="absolute top-1 left-1 flex items-center gap-2 text-[10px] font-mono text-[#ff3b30] opacity-80">
              <span className="font-bold">Art 1</span>
              <span>200/100/0</span>
            </div>
            <canvas ref={artCanvasRef} width={520} height={85} className="w-full h-full" />
          </div>

          {/* Dual Digital Boxes: NIBP & Arterial */}
          <div className="w-48 pl-3 border-l border-[#1b2533] text-right flex flex-col justify-between h-full font-mono">
            {/* NIBP White Box */}
            <div className="flex justify-between items-center text-[10px] text-slate-300">
              <span className="font-bold text-white">NIBP mmHg</span>
              <span className="text-slate-400">Manual</span>
            </div>
            <div className="text-2xl font-black text-white tracking-tight leading-none">
              {vitals.bpSys}/{vitals.bpDia}{' '}
              <span className="text-sm text-slate-300 font-bold">({vitals.bpMean})</span>
            </div>

            {/* Art 1 Red Box */}
            <div className="flex justify-between items-center pt-1 border-t border-[#1b2533] text-[10px]">
              <span className="text-[#ff3b30] font-bold">Art 1 mmHg</span>
              <span className="text-[#ff3b30] font-black text-sm">
                120/82 <span className="text-xs font-normal">(97)</span>
              </span>
            </div>
          </div>
        </div>

        {/* ---------------- 4. CVP (BLUE), PA (YELLOW) & ETCO2 (WHITE) ---------------- */}
        <div className="h-24 flex items-center py-1">
          {/* Multi-Pressure Tracing Canvas */}
          <div className="flex-1 h-full relative">
            <div className="absolute top-1 left-1 flex items-center gap-3 text-[10px] font-mono">
              <span className="text-[#00b0ff] font-bold">CVP (13)</span>
              <span className="text-[#facc15] font-bold">PA 25/10 (16)</span>
            </div>
            <canvas ref={cvpCanvasRef} width={520} height={85} className="w-full h-full" />
          </div>

          {/* Tertiary Vitals Panel */}
          <div className="w-48 pl-3 border-l border-[#1b2533] text-right flex flex-col justify-between h-full font-mono text-[11px]">
            <div className="flex justify-between text-[#00b0ff]">
              <span>CVP mmHg:</span>
              <strong className="text-sm">({vitals.cvp})</strong>
            </div>
            <div className="flex justify-between text-[#facc15]">
              <span>PA mmHg:</span>
              <strong className="text-sm">{vitals.paSys}/{vitals.paDia} ({vitals.paMean})</strong>
            </div>
            <div className="flex justify-between text-white border-t border-[#1b2533] pt-1">
              <span className="text-slate-400">CO2 mmHg:</span>
              <span>ET <strong className="text-yellow-400">{vitals.etCo2}</strong> • FI {vitals.fiCo2}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
