import React from 'react';
import { AvatarPosition, AvatarState } from '../types';

interface PatientAvatarProps {
  position: AvatarPosition;
  patientName: string;
}

export const PatientAvatar: React.FC<PatientAvatarProps> = ({ position, patientName }) => {
  const { x, y, direction, state } = position;
  const isFallen = state === 'fallen';
  const isSleeping = state === 'sleeping';
  const isWalking = state === 'walking';

  return (
    <g
      transform={`translate(${x}, ${y})`}
      className="transition-transform duration-100 ease-linear pointer-events-none select-none"
    >
      {/* 1. Sleek Floating Biometric HUD Tag */}
      <g transform="translate(0, -42)">
        <rect
          x="-55"
          y="-12"
          width="110"
          height="22"
          rx="11"
          fill="#060911"
          fillOpacity="0.9"
          stroke={isFallen ? '#ef4444' : '#0ea5e9'}
          strokeWidth="1.5"
          className={isFallen ? 'animate-pulse' : ''}
        />
        {/* Pulsing Status Dot */}
        <circle
          cx="-44"
          cy="-1"
          r="3"
          fill={isFallen ? '#ef4444' : '#10b981'}
        />
        <text
          x="2"
          y="0"
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-[9.5px] font-mono font-bold fill-slate-100 tracking-tight"
        >
          {patientName.split(' ')[0]} • <span className={isFallen ? 'fill-red-400 font-extrabold' : 'fill-sky-400'}>{state.toUpperCase()}</span>
        </text>
      </g>

      {/* 2. Fallen State (Simulated Acute Fall) */}
      {isFallen && (
        <g transform="rotate(82)">
          {/* Radial Emergency Perimeter Rings */}
          <circle cx="0" cy="0" r="32" fill="#ef4444" fillOpacity="0.15" className="animate-ping" />
          <circle cx="0" cy="0" r="24" fill="#ef4444" fillOpacity="0.25" />
          {/* Prone Floor Shadow */}
          <ellipse cx="0" cy="8" rx="24" ry="10" fill="#000" fillOpacity="0.4" />
          {/* Torso in Smart Dress */}
          <rect x="-16" y="-10" width="32" height="22" rx="7" fill="#1e293b" stroke="#ef4444" strokeWidth="1.5" />
          {/* Head & Silver Hair */}
          <circle cx="-18" cy="1" r="10" fill="#fcd34d" />
          <path d="M-28 -4 Q-22 -12 -12 -6" stroke="#94a3b8" strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* Conductive Smart Fabric Sensors (Lit Red for Impact) */}
          <line x1="-10" y1="-8" x2="-10" y2="10" stroke="#ef4444" strokeWidth="1.5" />
          <line x1="6" y1="-8" x2="6" y2="10" stroke="#ef4444" strokeWidth="1.5" />
        </g>
      )}

      {/* 3. Sleeping State (Horizontal Rest) */}
      {isSleeping && (
        <g transform="rotate(90) translate(0, -10)">
          <ellipse cx="0" cy="4" rx="18" ry="8" fill="#000" fillOpacity="0.3" />
          {/* Body tucked under linens */}
          <rect x="-14" y="-8" width="28" height="26" rx="8" fill="#1e293b" stroke="#0ea5e9" strokeWidth="1.2" />
          <circle cx="0" cy="-16" r="10" fill="#fcd34d" />
          {/* Silver hair */}
          <path d="M-8 -24 Q0 -28 8 -24" stroke="#94a3b8" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Rhythmic Breathing Ring */}
          <circle cx="0" cy="5" r="12" fill="none" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.4" className="animate-pulse" />
        </g>
      )}

      {/* 4. Active Walking / Standing / Sitting / Interacting */}
      {!isFallen && !isSleeping && (
        <g>
          {/* Ambient Ground Contact Shadow */}
          <ellipse cx="0" cy="22" rx={isWalking ? 12 : 15} ry="5" fill="#000" fillOpacity="0.4" />

          {/* Smart Slippers (Feet with Footbed Pressure Feedback) */}
          <g>
            <ellipse
              cx={isWalking ? (direction === 'left' ? -7 : -3) : -6}
              cy={isWalking ? 20 : 21}
              rx="4.5"
              ry="3.5"
              fill="#0369a1"
              stroke="#38bdf8"
              strokeWidth="1"
            />
            <ellipse
              cx={isWalking ? (direction === 'right' ? 7 : 3) : 6}
              cy={isWalking ? 20 : 21}
              rx="4.5"
              ry="3.5"
              fill="#0369a1"
              stroke="#38bdf8"
              strokeWidth="1"
            />
          </g>

          {/* Legs in Loungewear */}
          <rect x="-8" y="10" width="5" height="11" rx="2" fill="#1e293b" />
          <rect x="3" y="10" width="5" height="11" rx="2" fill="#1e293b" />

          {/* Smart Dress / Loungewear Torso */}
          <rect
            x="-13"
            y="-12"
            width="26"
            height="24"
            rx="6"
            fill="#1e293b"
            stroke="#0ea5e9"
            strokeWidth="1.5"
          />

          {/* Integrated Conductive Textile Electrodes (Chest Leads Visual) */}
          <g stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.8">
            <line x1="-8" y1="-6" x2="-8" y2="6" />
            <line x1="8" y1="-6" x2="8" y2="6" />
            <circle cx="0" cy="0" r="2.5" fill="#0ea5e9" />
          </g>

          {/* Patient Arms */}
          <rect
            x="-17"
            y="-10"
            width="5"
            height="18"
            rx="2.5"
            fill="#334155"
            transform={direction === 'left' ? 'rotate(15 -14 -10)' : 'rotate(-5 -14 -10)'}
          />
          <rect
            x="12"
            y="-10"
            width="5"
            height="18"
            rx="2.5"
            fill="#334155"
            transform={direction === 'right' ? 'rotate(-15 14 -10)' : 'rotate(5 14 -10)'}
          />

          {/* Smartwatch on Left Wrist */}
          <circle cx="-15" cy="5" r="2.5" fill="#10b981" />

          {/* Patient Head & Neck */}
          <rect x="-3" y="-16" width="6" height="5" rx="1" fill="#fcd34d" />
          <circle cx="0" cy="-21" r="10" fill="#fcd34d" />

          {/* Mature Silver Hair */}
          <path
            d="M-9 -27 Q0 -34 9 -27"
            stroke="#cbd5e1"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Directional Visual Gaze */}
          <g>
            {direction === 'down' && (
              <>
                <circle cx="-3" cy="-21" r="1.2" fill="#0f172a" />
                <circle cx="3" cy="-21" r="1.2" fill="#0f172a" />
              </>
            )}
            {direction === 'left' && (
              <circle cx="-6" cy="-21" r="1.2" fill="#0f172a" />
            )}
            {direction === 'right' && (
              <circle cx="6" cy="-21" r="1.2" fill="#0f172a" />
            )}
            {direction === 'up' && (
              <path d="M-8 -21 Q0 -28 8 -21" fill="#cbd5e1" />
            )}
          </g>
        </g>
      )}
    </g>
  );
};
