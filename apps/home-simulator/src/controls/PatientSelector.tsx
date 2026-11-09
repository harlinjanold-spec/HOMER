import React from 'react';
import { UserCheck } from 'lucide-react';
import { Patient } from '../types';

interface PatientSelectorProps {
  patients: Patient[];
  selectedPatientId: string;
  onSelectPatient: (patientId: string) => void;
}

export const PatientSelector: React.FC<PatientSelectorProps> = ({
  patients,
  selectedPatientId,
  onSelectPatient,
}) => {
  return (
    <div className="flex items-center gap-2.5 bg-[#0b0f19] border border-slate-800/90 rounded-xl px-3.5 py-1.5 shadow-sm">
      <div className="w-5 h-5 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
        <UserCheck className="w-3 h-3" />
      </div>
      <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">Patient:</span>
      <select
        value={selectedPatientId}
        onChange={(e) => onSelectPatient(e.target.value)}
        className="bg-[#060911] text-xs font-semibold text-slate-100 border border-slate-800 rounded-lg px-2.5 py-1 focus:outline-none focus:border-sky-400 cursor-pointer transition font-sans"
      >
        {patients.map((p) => (
          <option key={p.id} value={p.id} className="bg-[#0b0f19] text-slate-200">
            {p.id} • {p.name} ({p.age}y, {p.condition_summary.split(',')[0]})
          </option>
        ))}
      </select>
    </div>
  );
};
