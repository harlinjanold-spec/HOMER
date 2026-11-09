import React, { useState } from 'react';
import {
  Sparkles,
  HeartPulse,
  FileText,
  AlertTriangle,
  Send,
  ZapOff,
  CheckCircle2,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { ApiService } from '../services/api';

interface ScenarioPanelProps {
  patientId: string;
  onScenarioTriggered: (scenarioName: string, details: string) => void;
  onNetworkToggle: (online: boolean) => void;
  isNetworkOnline: boolean;
  offlineQueueCount: number;
  onFlushQueue: () => void;
}

export const ScenarioPanel: React.FC<ScenarioPanelProps> = ({
  patientId,
  onScenarioTriggered,
  onNetworkToggle,
  isNetworkOnline,
  offlineQueueCount,
  onFlushQueue,
}) => {
  const [loadingScenario, setLoadingScenario] = useState<string | null>(null);

  const trigger = async (scenarioId: string, name: string) => {
    setLoadingScenario(scenarioId);
    try {
      const res = await ApiService.triggerScenario(scenarioId, patientId);
      onScenarioTriggered(name, res.message || res.description || 'Scenario activated successfully.');
    } catch (e) {
      console.error('Error triggering scenario:', e);
    } finally {
      setLoadingScenario(null);
    }
  };

  return (
    <div className="bg-[#0b0f19] border border-slate-800/90 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Clinical Scenario Validation
            </h3>
            <p className="text-[10px] text-slate-400">Automated Protocol Stress-Testing</p>
          </div>
        </div>
      </div>

      {/* Network Resilience Status Bar */}
      <div className="bg-[#060911] p-3 rounded-xl border border-slate-800/90 mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-2 h-2 rounded-full ${
              isNetworkOnline ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-rose-500 animate-ping'
            }`}
          />
          <span className="text-xs font-mono font-semibold text-slate-200">
            {isNetworkOnline ? 'Wi-Fi: HEALTHY' : 'Wi-Fi: SEVERED [OFFLINE]'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {offlineQueueCount > 0 && (
            <span className="text-[10px] bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded-full border border-amber-800/80 font-mono">
              Buffered: {offlineQueueCount}
            </span>
          )}
          <button
            onClick={() => onNetworkToggle(!isNetworkOnline)}
            className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border transition ${
              isNetworkOnline
                ? 'bg-rose-950/60 hover:bg-rose-900 text-rose-300 border-rose-800/70'
                : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border-emerald-800/70'
            }`}
          >
            {isNetworkOnline ? 'Simulate Disconnect' : 'Restore Connection'}
          </button>
          {!isNetworkOnline && offlineQueueCount > 0 && (
            <button
              onClick={onFlushQueue}
              className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-slate-950 flex items-center gap-1 shadow-sm"
            >
              <RefreshCw className="w-3 h-3" /> Replay
            </button>
          )}
        </div>
      </div>

      {/* Scenario Buttons Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Scenario 1 */}
        <button
          onClick={() => trigger('normal_life', 'SCENARIO 1: Normal Daily Life')}
          disabled={loadingScenario !== null}
          className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-left border border-slate-800 hover:border-slate-700 transition active:scale-[0.98]"
        >
          <div className="p-1 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 mt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-bold text-slate-200 text-[11px]">1. Baseline Homeostasis</div>
            <div className="text-[9px] text-slate-400">Normal vitals, steps, restful sleep</div>
          </div>
        </button>

        {/* Scenario 2 */}
        <button
          onClick={() => trigger('health_risk', 'SCENARIO 2: Acute Decompensation')}
          disabled={loadingScenario !== null}
          className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-left border border-slate-800 hover:border-slate-700 transition active:scale-[0.98]"
        >
          <div className="p-1 rounded-md bg-rose-950/80 text-rose-400 border border-rose-800/60 mt-0.5">
            <HeartPulse className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-bold text-slate-200 text-[11px]">2. Hypertensive Crisis</div>
            <div className="text-[9px] text-slate-400">BP 168/98 + Tachycardia 104 bpm</div>
          </div>
        </button>

        {/* Scenario 3 */}
        <button
          onClick={() => trigger('caregiver_note', 'SCENARIO 3: Caregiver Observation')}
          disabled={loadingScenario !== null}
          className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-left border border-slate-800 hover:border-slate-700 transition active:scale-[0.98]"
        >
          <div className="p-1 rounded-md bg-sky-950/80 text-sky-400 border border-sky-800/60 mt-0.5">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-bold text-slate-200 text-[11px]">3. Clinical Note NLP</div>
            <div className="text-[9px] text-slate-400">Pedal edema & dyspnea note parsed</div>
          </div>
        </button>

        {/* Scenario 4 */}
        <button
          onClick={() => trigger('caregiver_escalation', 'SCENARIO 4: Critical Fall Escalation')}
          disabled={loadingScenario !== null}
          className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-left border border-slate-800 hover:border-slate-700 transition active:scale-[0.98]"
        >
          <div className="p-1 rounded-md bg-amber-950/80 text-amber-400 border border-amber-800/60 mt-0.5">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-bold text-slate-200 text-[11px]">4. Emergency Fall Alert</div>
            <div className="text-[9px] text-slate-400">Slippers impact + Nurse auto-page</div>
          </div>
        </button>

        {/* Scenario 5 */}
        <button
          onClick={() => trigger('remote_reminder', 'SCENARIO 5: Remote Adherence Alert')}
          disabled={loadingScenario !== null}
          className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-left border border-slate-800 hover:border-slate-700 transition active:scale-[0.98]"
        >
          <div className="p-1 rounded-md bg-indigo-950/80 text-indigo-400 border border-indigo-800/60 mt-0.5">
            <Send className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-bold text-slate-200 text-[11px]">5. Pillbox Tele-Reminder</div>
            <div className="text-[9px] text-slate-400">Command Centre flashes dispenser LED</div>
          </div>
        </button>

        {/* Scenario 6 */}
        <button
          onClick={() => trigger('power_failure', 'SCENARIO 6: Grid Power Outage')}
          disabled={loadingScenario !== null}
          className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-left border border-slate-800 hover:border-slate-700 transition active:scale-[0.98]"
        >
          <div className="p-1 rounded-md bg-amber-950/80 text-amber-400 border border-amber-800/60 mt-0.5">
            <ZapOff className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-bold text-slate-200 text-[11px]">6. Power Failure Test</div>
            <div className="text-[9px] text-slate-400">Mains lost; wearables stay active</div>
          </div>
        </button>
      </div>
    </div>
  );
};
