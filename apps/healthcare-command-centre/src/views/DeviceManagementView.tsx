import React, { useState } from 'react';
import {
  Cpu,
  Power,
  RotateCw,
  Battery,
  BatteryCharging,
  Wifi,
  WifiOff,
  Filter,
} from 'lucide-react';
import { VirtualDevice, Patient } from '../types';
import { CommandCentreApi } from '../services/api';

interface DeviceManagementViewProps {
  devices: VirtualDevice[];
  patients: Patient[];
  onDeviceUpdated: () => void;
  onCommandDispatched: (msg: string) => void;
}

export const DeviceManagementView: React.FC<DeviceManagementViewProps> = ({
  devices,
  patients,
  onDeviceUpdated,
  onCommandDispatched,
}) => {
  const [filterPatient, setFilterPatient] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filtered = devices.filter((d) => {
    if (filterPatient !== 'ALL' && d.patient_id !== filterPatient) return false;
    if (filterStatus !== 'ALL' && d.status !== filterStatus) return false;
    return true;
  });

  const handleRestart = async (device: VirtualDevice) => {
    await CommandCentreApi.queueRemoteCommand(
      device.patient_id,
      device.id,
      'RESTART_DEVICE',
      { action: 'soft_reboot' }
    );
    onCommandDispatched(`Dispatched RESTART_DEVICE to ${device.id}`);
  };

  const handleToggleActive = async (device: VirtualDevice) => {
    const newStatus = device.status === 'online' ? 'offline' : 'online';
    await CommandCentreApi.updateDevice(device.id, {
      status: newStatus,
      is_active: newStatus === 'online',
    });
    onDeviceUpdated();
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1e2d4d] pb-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            VIRTUAL IoT DEVICE & INFRASTRUCTURE REGISTRY
            <span className="text-xs font-mono bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-800">
              {devices.length} REGISTERED HARDWARE OBJECTS
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor battery levels, firmware versions, heartbeat pings, and remote reboot controls.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between bg-[#0d1527] p-3 rounded-2xl border border-[#1e2d4d] text-xs gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400 font-semibold">Patient:</span>
          <select
            value={filterPatient}
            onChange={(e) => setFilterPatient(e.target.value)}
            className="bg-[#121d36] text-xs text-white border border-[#1e2d4d] rounded-xl px-2.5 py-1 focus:outline-none focus:border-cyan-400"
          >
            <option value="ALL">All Patients</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.id}: {p.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">Status:</span>
          {['ALL', 'online', 'offline', 'low_battery', 'fault'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-2.5 py-1 rounded-lg font-mono uppercase text-[10px] transition ${
                filterStatus === s ? 'bg-cyan-500 text-black font-bold' : 'bg-[#121d36] text-slate-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((d) => {
          const isOnline = d.status === 'online';

          return (
            <div
              key={d.id}
              className={`bg-[#0d1527] border rounded-2xl p-4 shadow-xl transition ${
                isOnline ? 'border-[#1e2d4d]' : 'border-red-500/60 ring-1 ring-red-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-cyan-400 font-bold bg-[#121d36] px-2 py-0.5 rounded">
                  {d.patient_id}
                </span>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full font-mono uppercase ${
                    isOnline
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-red-950 text-red-400 border border-red-800'
                  }`}
                >
                  {d.status}
                </span>
              </div>

              <div className="font-bold text-sm text-white mb-0.5">{d.name}</div>
              <div className="text-[10px] text-slate-400 font-mono mb-3">ID: {d.id}</div>

              {/* Specs */}
              <div className="bg-[#121d36] p-2.5 rounded-xl border border-[#1e2d4d] text-[11px] font-mono space-y-1 mb-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Room Location:</span>
                  <span className="text-slate-200">{d.room}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Power Source:</span>
                  <span className="text-slate-200 capitalize">{d.power_source}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Battery Reserve:</span>
                  <span className={d.battery_pct < 20 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {d.battery_pct}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Firmware:</span>
                  <span className="text-slate-300">{d.firmware_ver}</span>
                </div>
              </div>

              {/* Remote Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleRestart(d)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#182747] hover:bg-[#1e2d4d] text-cyan-300 text-xs font-bold border border-[#1e2d4d] transition"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Reboot</span>
                </button>

                <button
                  onClick={() => handleToggleActive(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    isOnline
                      ? 'bg-red-950/70 hover:bg-red-900 text-red-300 border border-red-800'
                      : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{isOnline ? 'Power Off' : 'Power On'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

