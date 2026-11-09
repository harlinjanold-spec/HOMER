import React from 'react';
import {
  LayoutDashboard,
  Users,
  Activity,
  Home,
  Binary,
  BrainCircuit,
  TrendingUp,
  Stethoscope,
  HeartHandshake,
  AlertOctagon,
  Cpu,
  ShieldCheck,
  Shield,
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'patients'
  | 'monitoring'
  | 'home_monitor'
  | 'digital_twin'
  | 'ai_risk'
  | 'predictive'
  | 'nurse_station'
  | 'caregivers'
  | 'alerts'
  | 'devices'
  | 'reliability';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  unacknowledgedAlertsCount: number;
  highRiskCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  unacknowledgedAlertsCount,
  highRiskCount,
}) => {
  const navSections: Array<{
    title: string;
    items: Array<{ id: NavTab; label: string; icon: any; badge?: number; badgeColor?: string }>;
  }> = [
    {
      title: 'CLINICAL CENSUS',
      items: [
        { id: 'overview', label: 'Command Centre', icon: LayoutDashboard },
        { id: 'patients', label: 'Patient Directory', icon: Users },
        { id: 'monitoring', label: 'Live Monitoring', icon: Activity },
        { id: 'home_monitor', label: 'Virtual Home Monitor', icon: Home },
      ],
    },
    {
      title: 'BIOMETRIC AI & TWIN',
      items: [
        { id: 'digital_twin', label: 'Patient Digital Twin', icon: Binary },
        {
          id: 'ai_risk',
          label: 'AI Risk Engine',
          icon: BrainCircuit,
          badge: highRiskCount > 0 ? highRiskCount : undefined,
          badgeColor: 'bg-rose-500 text-white shadow-sm shadow-rose-950',
        },
        { id: 'predictive', label: 'Predictive Analytics', icon: TrendingUp },
        { id: 'nurse_station', label: 'Virtual Nurse Station', icon: Stethoscope },
      ],
    },
    {
      title: 'INFRASTRUCTURE & AUDIT',
      items: [
        { id: 'caregivers', label: 'Caregivers Roster', icon: HeartHandshake },
        {
          id: 'alerts',
          label: 'Emergency & Alerts',
          icon: AlertOctagon,
          badge: unacknowledgedAlertsCount > 0 ? unacknowledgedAlertsCount : undefined,
          badgeColor: 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-950',
        },
        { id: 'devices', label: 'IoT Infrastructure', icon: Cpu },
        { id: 'reliability', label: 'Reliability & Fault Lab', icon: ShieldCheck },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#0b0f19] border-r border-slate-800/90 flex flex-col justify-between select-none shadow-sm">
      <div className="overflow-y-auto">
        {/* App Branding */}
        <div className="h-16 border-b border-slate-800/90 px-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center font-black text-slate-950 text-sm shadow-md shadow-sky-950/60">
            W0
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider text-white">WARD ZERO</h1>
            <p className="text-[10px] text-sky-400 font-mono font-bold tracking-tight">CLINICAL COMMAND HUB</p>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="p-3 space-y-4">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-sky-500/15 via-sky-500/5 to-transparent text-sky-300 border-l-2 border-sky-400 font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`text-[9px] font-mono font-black px-1.5 py-0.2 rounded-full ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Hospital Ward Protocol Footer */}
      <div className="p-3.5 border-t border-slate-800/90 bg-[#060911]/80 text-[10px] text-slate-400 space-y-1 font-mono">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Shield className="w-3 h-3 text-sky-400" /> Protocol:
          </span>
          <span className="text-sky-400 font-bold">Standard v3.2</span>
        </div>
        <div className="flex items-center justify-between text-slate-500 text-[9px]">
          <span>CDS Framework:</span>
          <span className="text-emerald-400 font-bold">Non-Diagnostic</span>
        </div>
      </div>
    </aside>
  );
};
