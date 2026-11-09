import React, { useState } from 'react';
import {
  Home,
  Send,
  Power,
  RotateCw,
  Bell,
  Sparkles,
  Wifi,
  Cpu,
  CheckCircle2,
} from 'lucide-react';
import { Patient, VirtualDevice } from '../types';
import { CommandCentreApi } from '../services/api';

interface VirtualHomeMonitorViewProps {
  patient: Patient;
  devices: VirtualDevice[];
  onCommandDispatched: (msg: string) => void;
}

export const VirtualHomeMonitorView: React.FC<VirtualHomeMonitorViewProps> = ({
  patient,
  devices,
  onCommandDispatched,
}) => {
  const [selectedDevice, setSelectedDevice] = useState<string>('DEV-PAT-001-PILLBOX');
  const [commandType, setCommandType] = useState<string>('MEDICATION_REMINDER');
  const [pillMedName, setPillMedName] = useState<string>('Lisinopril 10mg');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [recentCommands, setRecentCommands] = useState<any[]>([]);

  const handleDispatch = async () => {
    setIsSubmitting(true);
    try {
      const targetDev = selectedDevice.replace('PAT-001', patient.id);
      let params = {};
      if (commandType === 'MEDICATION_REMINDER') {
        params = { medication: pillMedName, compartment: 'Morning', chime: true };
      } else if (commandType === 'TOGGLE_POWER') {
        params = { power: 'reboot' };
      } else if (commandType === 'CONFIGURE_SENSOR') {
        params = { sampling_rate_hz: 2.0 };
      }

      const res = await CommandCentreApi.queueRemoteCommand(
        patient.id,
        targetDev,
        commandType,
        params
      );

      if (res) {
        onCommandDispatched(`Command ${res.command_type} queued for ${targetDev}`);
        setRecentCommands((prev) => [res, ...prev.slice(0, 9)]);
      }
    } catch (e) {
      console.error('Error queuing remote command:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const patientDevices = devices.filter((d) => d.patient_id === patient.id);

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            VIRTUAL HOME TWIN & REMOTE TELE-CONTROL
            <span className="text-xs font-mono bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-800">
              APP 2 → APP 1 BIDIRECTIONAL LINK
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor room telemetry and remotely trigger smart home healthcare actuators in real time.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Room Map & Device Statuses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#0d1527] border border-[#1e2d4d] rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Home className="w-4 h-4 text-cyan-400" /> 4-Room Smart Apartment Infrastructure
            </h3>

            {/* Room Cards Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div className="bg-[#121d36] p-3 rounded-xl border border-[#1e2d4d]">
                <div className="font-bold text-slate-200 mb-1 flex items-center justify-between">
                  <span>🛏️ Bedroom</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Sensors Active</span>
                </div>
                <div className="text-[11px] text-slate-400 space-y-1">
                  <div>• Smart Mattress (Pressure & Sleep)</div>
                  <div>• Smart Home Dress (ECG, Resp, Temp)</div>
                  <div>• Smart Digital Mirror (Wall UI)</div>
                  <div>• Smart Slippers (Gait & Falls)</div>
                </div>
              </div>

              <div className="bg-[#121d36] p-3 rounded-xl border border-[#1e2d4d]">
                <div className="font-bold text-slate-200 mb-1 flex items-center justify-between">
                  <span>🚿 Bathroom</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Sensors Active</span>
                </div>
                <div className="text-[11px] text-slate-400 space-y-1">
                  <div>• Smart Scale (Weight & BMI)</div>
                  <div>• Toilet Occupancy & Visit Timer</div>
                  <div>• Shower Humidity Sensor</div>
                </div>
              </div>

              <div className="bg-[#121d36] p-3 rounded-xl border border-[#1e2d4d]">
                <div className="font-bold text-slate-200 mb-1 flex items-center justify-between">
                  <span>🛋️ Living Room</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Sensors Active</span>
                </div>
                <div className="text-[11px] text-slate-400 space-y-1">
                  <div>• Assistive AI Robot Hub</div>
                  <div>• Smartwatch Charging Base</div>
                  <div>• mmWave Presence Sensor</div>
                  <div>• Smart Sofa Seating Sensor</div>
                </div>
              </div>

              <div className="bg-[#121d36] p-3 rounded-xl border border-[#1e2d4d]">
                <div className="font-bold text-slate-200 mb-1 flex items-center justify-between">
                  <span>🍳 Kitchen & Dining</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Sensors Active</span>
                </div>
                <div className="text-[11px] text-slate-400 space-y-1">
                  <div>• Smart Pillbox (Schedule & Lids)</div>
                  <div>• Smart Water Bottle (Volume & Drink)</div>
                  <div>• Refrigerator Door Magnet Sensor</div>
                </div>
              </div>
            </div>

            {/* Device Grid */}
            <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-2">
              Registered Virtual Healthcare Objects ({patientDevices.length})
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {patientDevices.map((d) => (
                <div
                  key={d.id}
                  className="bg-[#070b19] p-2.5 rounded-xl border border-[#1e2d4d] flex items-center justify-between text-xs"
                >
                  <div className="truncate">
                    <div className="font-bold text-slate-200 truncate">{d.name.split('(')[0]}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{d.room}</div>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono uppercase ${
                      d.status === 'online'
                        ? 'bg-emerald-950 text-emerald-400'
                        : 'bg-red-950 text-red-400'
                    }`}
                  >
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Bidirectional Remote Control Terminal */}
        <div className="space-y-4">
          <div className="bg-[#0d1527] border border-[#1e2d4d] rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Send className="w-4 h-4 text-cyan-400" /> Dispatch Remote Command (App 2 → App 1)
            </h3>

            <div className="space-y-3 text-xs">
              {/* Target Device */}
              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Target Smart Object</label>
                <select
                  value={selectedDevice}
                  onChange={(e) => setSelectedDevice(e.target.value)}
                  className="w-full bg-[#121d36] border border-[#1e2d4d] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value={`DEV-${patient.id}-PILLBOX`}>Smart Pillbox (Kitchen)</option>
                  <option value={`DEV-${patient.id}-MIRROR`}>Smart Digital Mirror (Bedroom)</option>
                  <option value={`DEV-${patient.id}-ROBOT`}>Assistive AI Robot (Living Room)</option>
                  <option value={`DEV-${patient.id}-SLIPPERS`}>Smart Slippers Hub</option>
                  <option value={`DEV-${patient.id}-MATTRESS`}>Smart Mattress</option>
                  <option value={`DEV-${patient.id}-DRESS`}>Smart Home Dress</option>
                </select>
              </div>

              {/* Command Type */}
              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Command Type</label>
                <select
                  value={commandType}
                  onChange={(e) => setCommandType(e.target.value)}
                  className="w-full bg-[#121d36] border border-[#1e2d4d] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="MEDICATION_REMINDER">MEDICATION_REMINDER (Trigger chime & visual alert)</option>
                  <option value="TOGGLE_POWER">TOGGLE_POWER (Reboot sensor module)</option>
                  <option value="CONFIGURE_SENSOR">CONFIGURE_SENSOR (Set telemetry sample rate)</option>
                  <option value="TRIGGER_SOS">TRIGGER_SOS (Simulate emergency assistance call)</option>
                </select>
              </div>

              {/* Medication parameter if reminder */}
              {commandType === 'MEDICATION_REMINDER' && (
                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Medication Prompt</label>
                  <input
                    type="text"
                    value={pillMedName}
                    onChange={(e) => setPillMedName(e.target.value)}
                    className="w-full bg-[#121d36] border border-[#1e2d4d] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleDispatch}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold shadow-lg shadow-cyan-950 transition active:scale-95"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Dispatching...' : 'Transmit Command to App 1'}
              </button>
            </div>
          </div>

          {/* Outbound Command Audit Trail */}
          <div className="bg-[#0d1527] border border-[#1e2d4d] rounded-2xl p-4 shadow-xl">
            <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-2">
              Recent Remote Command Transmissions
            </h4>
            <div className="space-y-1.5 text-[10px] font-mono">
              {recentCommands.length === 0 ? (
                <div className="text-slate-500 text-center py-3">No commands transmitted yet.</div>
              ) : (
                recentCommands.map((c) => (
                  <div
                    key={c.id}
                    className="bg-[#121d36] p-2 rounded-lg border border-[#1e2d4d] flex items-center justify-between"
                  >
                    <div>
                      <span className="text-cyan-400 font-bold">{c.command_type}</span>
                      <div className="text-slate-400 text-[9px]">{c.id}</div>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                        c.status === 'EXECUTED'
                          ? 'bg-emerald-950 text-emerald-400'
                          : c.status === 'DELIVERED'
                          ? 'bg-blue-950 text-blue-400'
                          : 'bg-amber-950 text-amber-400 animate-pulse'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

