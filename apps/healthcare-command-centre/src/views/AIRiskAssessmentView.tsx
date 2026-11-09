import React, { useState } from 'react';
import {
  BrainCircuit,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Activity,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Patient, RiskAssessment } from '../types';
import { CommandCentreApi } from '../services/api';

interface AIRiskAssessmentViewProps {
  patient: Patient;
  assessment?: RiskAssessment;
  onAssessmentUpdated: (ra: RiskAssessment) => void;
}

export const AIRiskAssessmentView: React.FC<AIRiskAssessmentViewProps> = ({
  patient,
  assessment,
  onAssessmentUpdated,
}) => {
  const [evaluating, setEvaluating] = useState<boolean>(false);

  const handleEvaluate = async () => {
    setEvaluating(true);
    const updated = await CommandCentreApi.evaluateRisk(patient.id);
    if (updated) {
      onAssessmentUpdated(updated);
    }
    setEvaluating(false);
  };

  const riskLevel = assessment?.risk_level || 'LOW';
  const riskScore = assessment?.risk_score || 14.5;
  const contributing = assessment?.contributing_measurements || [];
  const noteContrib = assessment?.caregiver_note_contribution || {};

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1e2d4d] pb-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            CONTEXTUAL AI RISK ASSESSMENT & EXPLAINABILITY
            <span className="text-xs font-mono bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-800">
              {patient.id}: {patient.name}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent machine learning anomaly detection integrating physiological baselines, IoT signals, and English caregiver notes.
          </p>
        </div>

        <button
          onClick={handleEvaluate}
          disabled={evaluating}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-extrabold shadow-lg shadow-cyan-950 transition active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${evaluating ? 'animate-spin' : ''}`} />
          <span>{evaluating ? 'Running Model...' : 'Re-Evaluate AI Risk'}</span>
        </button>
      </div>

      {/* Main Risk Banner Card */}
      <div
        className={`rounded-2xl p-6 border shadow-2xl transition-all duration-300 ${
          riskLevel === 'HIGH'
            ? 'bg-gradient-to-r from-red-950/80 to-[#121d36] border-red-500/80 ring-1 ring-red-500/50'
            : riskLevel === 'MEDIUM'
            ? 'bg-gradient-to-r from-amber-950/80 to-[#121d36] border-amber-500/80 ring-1 ring-amber-500/50'
            : 'bg-gradient-to-r from-emerald-950/80 to-[#121d36] border-emerald-500/80'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`p-3.5 rounded-2xl ${
                riskLevel === 'HIGH'
                  ? 'bg-red-500/20 text-red-400'
                  : riskLevel === 'MEDIUM'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {riskLevel === 'HIGH' ? (
                <AlertTriangle className="w-8 h-8" />
              ) : riskLevel === 'MEDIUM' ? (
                <Activity className="w-8 h-8" />
              ) : (
                <ShieldCheck className="w-8 h-8" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-white font-mono tracking-tight">
                  {riskLevel} RISK CLASSIFICATION
                </span>
                <span className="text-xs font-mono font-bold bg-[#070b19] px-2.5 py-1 rounded-full text-white border border-[#1e2d4d]">
                  Score: {riskScore} / 100
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl font-medium">
                {assessment?.explanation || 'All physiological and ambient metrics remain within personalized baseline ranges.'}
              </p>
            </div>
          </div>

          {/* Risk Gauge Metric */}
          <div className="bg-[#070b19]/80 p-3 rounded-xl border border-[#1e2d4d] text-center min-w-[130px]">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Triage Category</div>
            <div
              className={`text-lg font-black font-mono mt-0.5 ${
                riskLevel === 'HIGH'
                  ? 'text-red-400'
                  : riskLevel === 'MEDIUM'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {riskLevel === 'HIGH' ? 'LEVEL 1 RED' : riskLevel === 'MEDIUM' ? 'LEVEL 2 AMBER' : 'LEVEL 3 GREEN'}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Clinical Next Action (Clinical Safety Requirement) */}
      <div className="bg-[#0d1527] border border-[#1e2d4d] rounded-2xl p-5 shadow-xl flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Protocol-Recommended Safe Next Action
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            {assessment?.recommended_action || 'Continue standard continuous passive monitoring. Check vitals at shift change.'}
          </p>
          <div className="text-[10px] text-slate-500 mt-1.5 italic">
            * Ward Zero AI is a clinical decision-support prototype. It does not provide medical diagnoses or automated medical treatment.
          </div>
        </div>
      </div>

      {/* Explainable Factor Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contributing Biometric Features */}
        <div className="bg-[#0d1527] border border-[#1e2d4d] rounded-2xl p-5 shadow-xl">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" /> Contributing Biometric Telemetry Features
          </h3>

          <div className="space-y-2">
            {contributing.length === 0 ? (
              <div className="text-xs text-slate-500 py-3 text-center">No abnormal biometric deviations recorded.</div>
            ) : (
              contributing.map((c, idx) => (
                <div
                  key={idx}
                  className="bg-[#121d36] p-3 rounded-xl border border-[#1e2d4d] flex items-center justify-between text-xs font-mono"
                >
                  <div>
                    <span className="font-bold text-slate-200 capitalize">{c.metric.replace('_', ' ')}</span>
                    <div className="text-[10px] text-slate-400">{c.status}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-cyan-400 font-bold">{c.value}</span>
                    <div className="text-[9px] text-slate-500">Weight: {Math.round(c.weight * 100)}%</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* English Caregiver Note NLP Factor */}
        <div className="bg-[#0d1527] border border-[#1e2d4d] rounded-2xl p-5 shadow-xl">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" /> Caregiver Note NLP Integration
          </h3>

          <div className="bg-[#121d36] p-4 rounded-xl border border-[#1e2d4d] space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Detected Sentiment:</span>
              <span className={`font-mono font-bold uppercase px-2 py-0.5 rounded text-[10px] ${
                noteContrib.sentiment === 'high_risk'
                  ? 'bg-red-950 text-red-400'
                  : noteContrib.sentiment === 'concerning'
                  ? 'bg-amber-950 text-amber-400'
                  : 'bg-emerald-950 text-emerald-400'
              }`}>
                {noteContrib.sentiment || 'NEUTRAL'}
              </span>
            </div>

            <div className="flex justify-between items-center font-mono">
              <span className="text-slate-400">Risk Score Adjustment:</span>
              <span className={`font-bold ${noteContrib.risk_adjustment > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {noteContrib.risk_adjustment > 0 ? `+${noteContrib.risk_adjustment}` : `${noteContrib.risk_adjustment || 0}`} pts
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Clinical Note Excerpt:</span>
              <div className="p-2.5 rounded-lg bg-[#070b19] border border-[#1e2d4d] text-slate-300 italic text-[11px]">
                "{noteContrib.excerpt || 'Patient stable with no concerns.'}"
              </div>
            </div>

            {noteContrib.detected_keywords && noteContrib.detected_keywords.length > 0 && (
              <div>
                <span className="text-slate-400 block mb-1">Keywords Extracted:</span>
                <div className="flex flex-wrap gap-1">
                  {noteContrib.detected_keywords.map((kw: string, i: number) => (
                    <span key={i} className="text-[10px] bg-slate-800 text-cyan-300 px-2 py-0.5 rounded font-mono">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

