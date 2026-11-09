import React, { useState, useEffect } from 'react';
import { RoomName, DeviceState, AvatarState } from '../types';
import apartmentBg from '../assets/smart-apartment.jpg';

interface FloorplanProps {
  currentRoom: RoomName;
  devices: DeviceState[];
  onDeviceClick: (deviceType: string) => void;
  onFloorClick?: (x: number, y: number) => void;
  pillboxReminderActive?: boolean;
  avatarState?: AvatarState;
  avatarPos?: { x: number; y: number };
  avatarDirection?: 'up' | 'down' | 'left' | 'right';
  vitals?: {
    heartRate: number;
    spo2: number;
    temperature: number;
    respiratoryRate: number;
    steps: number;
    waterMl: number;
    sleepHours: number;
    weight: number;
  };
}

export const Floorplan: React.FC<FloorplanProps> = ({
  currentRoom,
  devices,
  onDeviceClick,
  onFloorClick,
  pillboxReminderActive = false,
  avatarState = 'standing',
  avatarPos = { x: 540, y: 350 },
  avatarDirection = 'right',
  vitals = {
    heartRate: 78,
    spo2: 97,
    temperature: 36.7,
    respiratoryRate: 16,
    steps: 2450,
    waterMl: 900,
    sleepHours: 6.5,
    weight: 68.5,
  },
}) => {
  // Natural Senior Stepping Gait Animation
  const [walkStep, setWalkStep] = useState<number>(0);

  useEffect(() => {
    if (avatarState === 'walking') {
      const timer = setInterval(() => {
        setWalkStep((s) => (s + 1) % 60);
      }, 50);
      return () => clearInterval(timer);
    } else {
      setWalkStep(0);
    }
  }, [avatarState]);

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('.badge-group') || target.closest('.device-hotspot')) {
      return;
    }
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (ctm) {
      const svgP = pt.matrixTransform(ctm.inverse());
      if (svgP.x >= 180 && svgP.x <= 900 && svgP.y >= 260 && svgP.y <= 520) {
        onFloorClick?.(Math.round(svgP.x), Math.round(svgP.y));
      }
    }
  };

  // Determine active standing sprite
  const getStandingSprite = () => {
    if (avatarDirection === 'left') return '/sprites/raghav_left.png';
    if (avatarDirection === 'up') return '/sprites/raghav_back.png';
    if (avatarDirection === 'down') return '/sprites/raghav_front.png';
    return '/sprites/raghav_hero.png'; // Right / 3/4 isometric hero pose
  };

  return (
    <svg
      viewBox="0 0 1024 576"
      className="w-full h-full select-none cursor-default"
      preserveAspectRatio="xMidYMid meet"
      onClick={handleSvgClick}
      style={{ background: '#0b1622' }}
    >
      <defs>
        {/* Neon Cyan Glow Filter */}
        <filter id="isoCyanGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Warning / Pillbox Alert Glow Filter */}
        <filter id="isoAlertGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Soft Drop Shadow for Overlays */}
        <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#000000" floodOpacity="0.6" />
        </filter>
      </defs>

      {/* ================= 1. MASTER 3D ISOMETRIC APARTMENT BACKGROUND ================= */}
      <image
        href={apartmentBg}
        x="0"
        y="0"
        width="1024"
        height="576"
        preserveAspectRatio="xMidYMid meet"
        style={{ imageRendering: 'auto' }}
        className="pointer-events-none"
      />

      {/* ================= 2. MAPPING INDICATOR POINTER LINES ================= */}
      {/* Bed Connector */}
      <line x1="335" y1="237" x2="335" y2="305" stroke="#00f0ff" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.65" pointerEvents="none" />
      <circle cx="335" cy="305" r="2.5" fill="#00f0ff" opacity="0.8" pointerEvents="none" />

      {/* Wardrobe Niche Connector */}
      <line x1="565" y1="97" x2="575" y2="175" stroke="#00f0ff" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.65" pointerEvents="none" />
      <circle cx="575" cy="175" r="2.5" fill="#00f0ff" opacity="0.8" pointerEvents="none" />

      {/* Smart Mirror Connector */}
      <line x1="710" y1="152" x2="685" y2="205" stroke="#00f0ff" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.65" pointerEvents="none" />
      <circle cx="685" cy="205" r="2.5" fill="#00f0ff" opacity="0.8" pointerEvents="none" />

      {/* Bathroom Connector */}
      <line x1="880" y1="132" x2="865" y2="195" stroke="#00f0ff" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.65" pointerEvents="none" />
      <circle cx="865" cy="195" r="2.5" fill="#00f0ff" opacity="0.8" pointerEvents="none" />

      {/* Pillbox Connector */}
      <line x1="415" y1="382" x2="415" y2="425" stroke="#00f0ff" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.65" pointerEvents="none" />
      <circle cx="415" cy="425" r="2.5" fill="#00f0ff" opacity="0.8" pointerEvents="none" />

      {/* Water Bottle Connector */}
      <line x1="535" y1="385" x2="495" y2="405" stroke="#00f0ff" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.65" pointerEvents="none" />
      <circle cx="495" cy="405" r="2.5" fill="#00f0ff" opacity="0.8" pointerEvents="none" />

      {/* Slippers Connector */}
      <line x1="705" y1="347" x2="695" y2="385" stroke="#00f0ff" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.65" pointerEvents="none" />
      <circle cx="695" cy="385" r="2.5" fill="#00f0ff" opacity="0.8" pointerEvents="none" />

      {/* Scale Connector */}
      <line x1="840" y1="352" x2="800" y2="380" stroke="#00f0ff" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.65" pointerEvents="none" />
      <circle cx="800" cy="380" r="2.5" fill="#00f0ff" opacity="0.8" pointerEvents="none" />

      {/* Robot Connector */}
      <line x1="895" y1="430" x2="840" y2="455" stroke="#00f0ff" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.65" pointerEvents="none" />
      <circle cx="840" cy="455" r="2.5" fill="#00f0ff" opacity="0.8" pointerEvents="none" />

      {/* ================= 3. INTERACTIVE 3D OBJECT HOTSPOTS ================= */}
      {/* Bed Hotspot (Full Queen Bed: Pillows, Headboard, Mattress) */}
      <rect
        x="180"
        y="190"
        width="260"
        height="200"
        fill="transparent"
        className="device-hotspot cursor-pointer"
        onClick={() => onDeviceClick('mattress')}
      />

      {/* Wardrobe Niche Hotspot */}
      <rect
        x="545"
        y="170"
        width="70"
        height="150"
        fill="transparent"
        className="device-hotspot cursor-pointer"
        onClick={() => onDeviceClick('dress')}
      />

      {/* Smart Mirror Hotspot */}
      <rect
        x="640"
        y="200"
        width="75"
        height="130"
        fill="transparent"
        className="device-hotspot cursor-pointer"
        onClick={() => onDeviceClick('mirror')}
      />

      {/* Bathroom Hotspot */}
      <rect
        x="800"
        y="230"
        width="160"
        height="170"
        fill="transparent"
        className="device-hotspot cursor-pointer"
        onClick={() => onDeviceClick('scale')}
      />

      {/* Pillbox Hotspot */}
      <circle
        cx="415"
        cy="435"
        r="28"
        fill="transparent"
        className="device-hotspot cursor-pointer"
        onClick={() => onDeviceClick('pillbox')}
      />

      {/* Water Bottle Hotspot */}
      <circle
        cx="485"
        cy="410"
        r="24"
        fill="transparent"
        className="device-hotspot cursor-pointer"
        onClick={() => onDeviceClick('water_bottle')}
      />

      {/* Slippers Hotspot */}
      <circle
        cx="690"
        cy="395"
        r="26"
        fill="transparent"
        className="device-hotspot cursor-pointer"
        onClick={() => onDeviceClick('slippers')}
      />

      {/* Scale Hotspot */}
      <circle
        cx="790"
        cy="385"
        r="26"
        fill="transparent"
        className="device-hotspot cursor-pointer"
        onClick={() => onDeviceClick('scale')}
      />

      {/* Robot Hotspot */}
      <circle
        cx="815"
        cy="460"
        r="30"
        fill="transparent"
        className="device-hotspot cursor-pointer"
        onClick={() => onDeviceClick('robot')}
      />

      {/* ================= 4. PATIENT AVATAR: RAGHAV MENON (ANIMATED CHARACTER SPRITES) ================= */}
      {avatarState === 'sleeping' ? (
        /* Sleeping in Queen Bed (Proportional Size Aligned to Left Pillow) */
        <g className="transition-opacity duration-500 pointer-events-none">
          {/* Subtle Smart Mattress Pressure & Bio-Sensor Glow */}
          <ellipse cx="270" cy="265" rx="36" ry="16" fill="#00f0ff" fillOpacity="0.14" filter="url(#isoCyanGlow)" />
          
          {/* High-Resolution Illustrated Sleeping Raghav on Queen Bed */}
          <image
            href="/sprites/raghav_sleeping_bed.png"
            x="222"
            y="222"
            width="92"
            height="74"
            preserveAspectRatio="xMidYMid meet"
          />
          
          {/* Animated Sleep Status Indicators floating from his head */}
          <text x="268" y="222" fill="#00f0ff" fontSize="11" fontWeight="bold" className="animate-pulse">z</text>
          <text x="278" y="210" fill="#38bdf8" fontSize="14" fontWeight="bold" className="animate-pulse">Z</text>
          <text x="290" y="196" fill="#67e8f9" fontSize="17" fontWeight="bold" className="animate-pulse">Z</text>
        </g>
      ) : avatarState === 'sitting' ? (
        /* Seated on Grey Living Room Sofa */
        <g transform="translate(235, 455)" className="transition-transform duration-300 pointer-events-none">
          <ellipse cx="0" cy="18" rx="16" ry="6" fill="#000" fillOpacity="0.4" />
          <image
            href="/sprites/raghav_sit.png"
            x="-22"
            y="-22"
            width="45"
            height="44"
            preserveAspectRatio="xMidYMid meet"
          />
        </g>
      ) : avatarState === 'drinking' ? (
        /* Drinking from Blue Smart Water Bottle */
        <g transform={`translate(${avatarPos.x}, ${avatarPos.y})`} className="pointer-events-none">
          <ellipse cx="0" cy="0" rx="16" ry="6" fill="#000" fillOpacity="0.4" />
          <image
            href="/sprites/raghav_drink_2.png"
            x="-20"
            y="-72"
            width="40"
            height="72"
            preserveAspectRatio="xMidYMid meet"
          />
        </g>
      ) : avatarState === 'taking_medicine' ? (
        /* Consuming Medication Dose */
        <g transform={`translate(${avatarPos.x}, ${avatarPos.y})`} className="pointer-events-none">
          <ellipse cx="0" cy="0" rx="16" ry="6" fill="#000" fillOpacity="0.4" />
          <image
            href="/sprites/raghav_med_3.png"
            x="-18"
            y="-72"
            width="36"
            height="72"
            preserveAspectRatio="xMidYMid meet"
          />
        </g>
      ) : avatarState === 'fallen' ? (
        /* Critical Fall Posture (Clean Pristine Official Asset Sprite) */
        <g
          transform={`translate(${avatarPos.x}, ${avatarPos.y})`}
          className="cursor-pointer group"
          onClick={() => onDeviceClick('fallen_patient')}
        >
          {/* Pulsating Red Alert Floor Halo */}
          <ellipse cx="0" cy="8" rx="46" ry="18" fill="#ef4444" fillOpacity="0.25" filter="url(#isoAlertGlow)" className="animate-pulse" />
          <ellipse cx="0" cy="8" rx="36" ry="14" fill="#000" fillOpacity="0.45" />

          {/* Clean Fallen Sprite (No Detached Pieces, No Artifacts) */}
          <image
            href="/sprites/raghav_fall_4.png"
            x="-35"
            y="-12"
            width="70"
            height="37"
            preserveAspectRatio="xMidYMid meet"
          />

          {/* Floating Emergency Badge */}
          <g transform="translate(0, -30)">
            <rect
              x="-58"
              y="-12"
              width="116"
              height="24"
              rx="12"
              fill="#b91c1c"
              fillOpacity="0.95"
              stroke="#ef4444"
              strokeWidth="1.8"
              filter="url(#isoAlertGlow)"
            />
            <text x="0" y="4.5" fill="#ffffff" fontSize="9.5" fontWeight="black" textAnchor="middle" pointerEvents="none">
              🚨 FALL DETECTED
            </text>
          </g>

          {/* Click to Assist Hint */}
          <text x="0" y="32" fill="#fca5a5" fontSize="8.5" textAnchor="middle" fontWeight="bold" pointerEvents="none" className="animate-pulse">
            Click to Assist to Feet (or press F)
          </text>
        </g>
      ) : avatarState === 'walking' ? (
        /* Animated High-Res Senior Stepping Gait (No Lines, No Jitter) */
        <g
          transform={`translate(${avatarPos.x}, ${avatarPos.y + Math.sin(walkStep * 0.45) * 2.5})`}
          className="pointer-events-none"
        >
          {/* Floor Shadow with subtle cadence pulsation */}
          <ellipse
            cx="0"
            cy={-Math.sin(walkStep * 0.45) * 2.5}
            rx={18 + Math.cos(walkStep * 0.45) * 1.5}
            ry="6"
            fill="#000"
            fillOpacity="0.45"
          />
          <g transform={`rotate(${Math.sin(walkStep * 0.45) * 2})`}>
            <image
              href={getStandingSprite()}
              x={avatarDirection === 'right' ? '-24' : avatarDirection === 'left' ? '-20' : '-19'}
              y="-76"
              width={avatarDirection === 'right' ? '48' : avatarDirection === 'left' ? '40' : '38'}
              height="76"
              preserveAspectRatio="xMidYMid meet"
            />
          </g>
        </g>
      ) : (
        /* Standing / Idle Hero Pose (Pristine High-Res Vector Quality) */
        <g
          transform={`translate(${avatarPos.x}, ${avatarPos.y})`}
          className="transition-transform duration-200 pointer-events-none"
        >
          {/* Floor Shadow */}
          <ellipse cx="0" cy="0" rx="18" ry="6" fill="#000" fillOpacity="0.45" />
          <image
            href={getStandingSprite()}
            x={avatarDirection === 'right' ? '-24' : avatarDirection === 'left' ? '-20' : '-19'}
            y="-76"
            width={avatarDirection === 'right' ? '48' : avatarDirection === 'left' ? '40' : '38'}
            height="76"
            preserveAspectRatio="xMidYMid meet"
          />
        </g>
      )}

      {/* ================= 5. THE 9 GLOWING DEVICE BADGES (NO JITTER / NO SHAKING) ================= */}
      {/* 1. SMART MATTRESS OVERLAY */}
      <g
        className="badge-group cursor-pointer group select-none"
        onClick={() => onDeviceClick('mattress')}
        transform="translate(335, 220)"
      >
        <rect
          x="-65"
          y="-17"
          width="130"
          height="34"
          rx="17"
          fill="#081827"
          fillOpacity="0.95"
          stroke="#00f0ff"
          strokeWidth="1.8"
          filter="url(#isoCyanGlow)"
          className="transition-colors duration-150 group-hover:stroke-cyan-300 group-hover:fill-[#0c2438]"
        />
        <rect x="-59" y="-11" width="22" height="22" rx="11" fill="#1e3a8a" pointerEvents="none" />
        <text x="-48" y="5" fontSize="11" textAnchor="middle" pointerEvents="none">🛏️</text>
        <text x="-26" y="-2" fill="#ffffff" fontSize="9.5" fontWeight="bold" pointerEvents="none">Smart Mattress</text>
        <circle cx="-22" cy="8" r="2.2" fill="#10b981" pointerEvents="none" />
        <text x="-16" y="11" fill="#94a3b8" fontSize="7.8" pointerEvents="none">Sleep • HR • Resp</text>
      </g>

      {/* 2. SMART DRESS OVERLAY */}
      <g
        className="badge-group cursor-pointer group select-none"
        onClick={() => onDeviceClick('dress')}
        transform="translate(565, 80)"
      >
        <rect
          x="-62"
          y="-17"
          width="124"
          height="34"
          rx="17"
          fill="#081827"
          fillOpacity="0.95"
          stroke="#00f0ff"
          strokeWidth="1.8"
          filter="url(#isoCyanGlow)"
          className="transition-colors duration-150 group-hover:stroke-cyan-300 group-hover:fill-[#0c2438]"
        />
        <rect x="-56" y="-11" width="22" height="22" rx="11" fill="#1e3a8a" pointerEvents="none" />
        <text x="-45" y="5" fontSize="11" textAnchor="middle" pointerEvents="none">👕</text>
        <text x="-23" y="-2" fill="#ffffff" fontSize="9.5" fontWeight="bold" pointerEvents="none">Smart Dress</text>
        <circle cx="-19" cy="8" r="2.2" fill="#10b981" pointerEvents="none" />
        <text x="-13" y="11" fill="#94a3b8" fontSize="7.8" pointerEvents="none">HR • SpO2 • Temp</text>
      </g>

      {/* 3. SMART MIRROR OVERLAY */}
      <g
        className="badge-group cursor-pointer group select-none"
        onClick={() => onDeviceClick('mirror')}
        transform="translate(750, 135)"
      >
        <rect
          x="-62"
          y="-17"
          width="124"
          height="34"
          rx="17"
          fill="#081827"
          fillOpacity="0.95"
          stroke="#00f0ff"
          strokeWidth="1.8"
          filter="url(#isoCyanGlow)"
          className="transition-colors duration-150 group-hover:stroke-cyan-300 group-hover:fill-[#0c2438]"
        />
        <rect x="-56" y="-11" width="22" height="22" rx="11" fill="#0284c7" pointerEvents="none" />
        <text x="-45" y="5" fontSize="11" textAnchor="middle" pointerEvents="none">📱</text>
        <text x="-23" y="-2" fill="#ffffff" fontSize="9.5" fontWeight="bold" pointerEvents="none">Smart Mirror</text>
        <circle cx="-19" cy="8" r="2.2" fill="#10b981" pointerEvents="none" />
        <text x="-13" y="11" fill="#94a3b8" fontSize="7.8" pointerEvents="none">Health • Reminders</text>
      </g>

      {/* 4. SMART BATHROOM OVERLAY */}
      <g
        className="badge-group cursor-pointer group select-none"
        onClick={() => onDeviceClick('scale')}
        transform="translate(910, 115)"
      >
        <rect
          x="-66"
          y="-17"
          width="132"
          height="34"
          rx="17"
          fill="#081827"
          fillOpacity="0.95"
          stroke="#00f0ff"
          strokeWidth="1.8"
          filter="url(#isoCyanGlow)"
          className="transition-colors duration-150 group-hover:stroke-cyan-300 group-hover:fill-[#0c2438]"
        />
        <rect x="-60" y="-11" width="22" height="22" rx="11" fill="#0369a1" pointerEvents="none" />
        <text x="-49" y="5" fontSize="11" textAnchor="middle" pointerEvents="none">🚽</text>
        <text x="-26" y="-2" fill="#ffffff" fontSize="9.5" fontWeight="bold" pointerEvents="none">Smart Bathroom</text>
        <circle cx="-22" cy="8" r="2.2" fill="#10b981" pointerEvents="none" />
        <text x="-16" y="11" fill="#94a3b8" fontSize="7.8" pointerEvents="none">Occupancy • Usage</text>
      </g>

      {/* 5. SMART PILLBOX OVERLAY */}
      <g
        className="badge-group cursor-pointer group select-none"
        onClick={() => onDeviceClick('pillbox')}
        transform="translate(415, 365)"
      >
        <rect
          x="-64"
          y="-17"
          width="128"
          height="34"
          rx="17"
          fill="#081827"
          fillOpacity="0.95"
          stroke={pillboxReminderActive ? '#ef4444' : '#00f0ff'}
          strokeWidth="1.8"
          filter={pillboxReminderActive ? 'url(#isoAlertGlow)' : 'url(#isoCyanGlow)'}
          className="transition-colors duration-150 group-hover:stroke-cyan-300 group-hover:fill-[#0c2438]"
        />
        <rect
          x="-58"
          y="-11"
          width="22"
          height="22"
          rx="11"
          fill={pillboxReminderActive ? '#881337' : '#065f46'}
          pointerEvents="none"
        />
        <text x="-47" y="5" fontSize="11" textAnchor="middle" pointerEvents="none">💊</text>
        <text x="-24" y="-2" fill="#ffffff" fontSize="9.5" fontWeight="bold" pointerEvents="none">Smart Pillbox</text>
        <circle cx="-20" cy="8" r="2.2" fill={pillboxReminderActive ? '#ef4444' : '#10b981'} pointerEvents="none" />
        <text x="-14" y="11" fill="#94a3b8" fontSize="7.8" pointerEvents="none">Schedule • Reminder</text>
      </g>

      {/* 6. SMART WATER BOTTLE OVERLAY */}
      <g
        className="badge-group cursor-pointer group select-none"
        onClick={() => onDeviceClick('water_bottle')}
        transform="translate(570, 375)"
      >
        <rect
          x="-66"
          y="-17"
          width="132"
          height="34"
          rx="17"
          fill="#081827"
          fillOpacity="0.95"
          stroke="#00f0ff"
          strokeWidth="1.8"
          filter="url(#isoCyanGlow)"
          className="transition-colors duration-150 group-hover:stroke-cyan-300 group-hover:fill-[#0c2438]"
        />
        <rect x="-60" y="-11" width="22" height="22" rx="11" fill="#0369a1" pointerEvents="none" />
        <text x="-49" y="5" fontSize="11" textAnchor="middle" pointerEvents="none">💧</text>
        <text x="-26" y="-2" fill="#ffffff" fontSize="9.5" fontWeight="bold" pointerEvents="none">Smart Water Bottle</text>
        <circle cx="-22" cy="8" r="2.2" fill="#10b981" pointerEvents="none" />
        <text x="-16" y="11" fill="#94a3b8" fontSize="7.8" pointerEvents="none">Intake • Volume</text>
      </g>

      {/* 7. SMART SLIPPERS OVERLAY */}
      <g
        className="badge-group cursor-pointer group select-none"
        onClick={() => onDeviceClick('slippers')}
        transform="translate(705, 330)"
      >
        <rect
          x="-62"
          y="-17"
          width="124"
          height="34"
          rx="17"
          fill="#081827"
          fillOpacity="0.95"
          stroke="#00f0ff"
          strokeWidth="1.8"
          filter="url(#isoCyanGlow)"
          className="transition-colors duration-150 group-hover:stroke-cyan-300 group-hover:fill-[#0c2438]"
        />
        <rect x="-56" y="-11" width="22" height="22" rx="11" fill="#0284c7" pointerEvents="none" />
        <text x="-45" y="5" fontSize="11" textAnchor="middle" pointerEvents="none">👟</text>
        <text x="-23" y="-2" fill="#ffffff" fontSize="9.5" fontWeight="bold" pointerEvents="none">Smart Slippers</text>
        <circle cx="-19" cy="8" r="2.2" fill="#10b981" pointerEvents="none" />
        <text x="-13" y="11" fill="#94a3b8" fontSize="7.8" pointerEvents="none">Steps • Gait • Fall</text>
      </g>

      {/* 8. SMART SCALE OVERLAY */}
      <g
        className="badge-group cursor-pointer group select-none"
        onClick={() => onDeviceClick('scale')}
        transform="translate(865, 335)"
      >
        <rect
          x="-60"
          y="-17"
          width="120"
          height="34"
          rx="17"
          fill="#081827"
          fillOpacity="0.95"
          stroke="#00f0ff"
          strokeWidth="1.8"
          filter="url(#isoCyanGlow)"
          className="transition-colors duration-150 group-hover:stroke-cyan-300 group-hover:fill-[#0c2438]"
        />
        <rect x="-54" y="-11" width="22" height="22" rx="11" fill="#047857" pointerEvents="none" />
        <text x="-43" y="5" fontSize="11" textAnchor="middle" pointerEvents="none">⚖️</text>
        <text x="-21" y="-2" fill="#ffffff" fontSize="9.5" fontWeight="bold" pointerEvents="none">Smart Scale</text>
        <circle cx="-17" cy="8" r="2.2" fill="#10b981" pointerEvents="none" />
        <text x="-11" y="11" fill="#94a3b8" fontSize="7.8" pointerEvents="none">Weight • BMI</text>
      </g>

      {/* 9. ASSISTIVE ROBOT OVERLAY */}
      <g
        className="badge-group cursor-pointer group select-none"
        onClick={() => onDeviceClick('robot')}
        transform="translate(925, 425)"
      >
        <rect
          x="-62"
          y="-17"
          width="124"
          height="34"
          rx="17"
          fill="#081827"
          fillOpacity="0.95"
          stroke="#00f0ff"
          strokeWidth="1.8"
          filter="url(#isoCyanGlow)"
          className="transition-colors duration-150 group-hover:stroke-cyan-300 group-hover:fill-[#0c2438]"
        />
        <rect x="-56" y="-11" width="22" height="22" rx="11" fill="#4338ca" pointerEvents="none" />
        <text x="-45" y="5" fontSize="11" textAnchor="middle" pointerEvents="none">🤖</text>
        <text x="-23" y="-2" fill="#ffffff" fontSize="9.5" fontWeight="bold" pointerEvents="none">Assistive Robot</text>
        <circle cx="-19" cy="8" r="2.2" fill="#10b981" pointerEvents="none" />
        <text x="-13" y="11" fill="#94a3b8" fontSize="7.8" pointerEvents="none">Reminders • Assist</text>
      </g>
    </svg>
  );
};
export default Floorplan;
