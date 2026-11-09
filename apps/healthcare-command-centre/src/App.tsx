import React, { useState, useEffect } from 'react';
import { TopNav, NavTab } from './components/TopNav';
import { BottomFunctionBar } from './components/BottomFunctionBar';
import { CommandCentreOverview } from './views/CommandCentreOverview';
import { PatientDirectoryView } from './views/PatientDirectoryView';
import { LiveMonitoringView } from './views/LiveMonitoringView';
import { VirtualHomeMonitorView } from './views/VirtualHomeMonitorView';
import { DigitalTwinView } from './views/DigitalTwinView';
import { AIRiskAssessmentView } from './views/AIRiskAssessmentView';
import { PredictiveAnalyticsView } from './views/PredictiveAnalyticsView';
import { NurseStationView } from './views/NurseStationView';
import { CaregiverManagementView } from './views/CaregiverManagementView';
import { EmergencyAlertsView } from './views/EmergencyAlertsView';
import { DeviceManagementView } from './views/DeviceManagementView';
import { ReliabilityLabView } from './views/ReliabilityLabView';

import { Patient, Alert, VirtualDevice, Caregiver, RiskAssessment, CaregiverObservation } from './types';
import { CommandCentreApi } from './services/api';
import { CommandCentreWebSocket } from './services/websocket';
import { AlertCircle, CheckCircle, Bell } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('PAT-001');

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [devices, setDevices] = useState<VirtualDevice[]>([]);
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [latestAssessments, setLatestAssessments] = useState<Record<string, RiskAssessment>>({});
  const [observations, setObservations] = useState<CaregiverObservation[]>([]);

  const [isWsConnected, setIsWsConnected] = useState<boolean>(false);
  const [isFrozen, setIsFrozen] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'warn' | 'alert' } | null>(null);

  const showToast = (message: string, type: 'info' | 'warn' | 'alert' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // 1. Initial Data Fetch
  const refreshAllData = async () => {
    const [pList, aList, dList, cList] = await Promise.all([
      CommandCentreApi.getPatients(),
      CommandCentreApi.getAlerts(),
      CommandCentreApi.getDevices(),
      CommandCentreApi.getCaregivers(),
    ]);

    setPatients(pList);
    setAlerts(aList);
    setDevices(dList);
    setCaregivers(cList);

    // Fetch initial AI assessments for all patients
    const assessmentsMap: Record<string, RiskAssessment> = {};
    for (const p of pList) {
      const twin = await CommandCentreApi.getDigitalTwin(p.id);
      if (twin?.latest_risk) {
        assessmentsMap[p.id] = twin.latest_risk;
      }
    }
    setLatestAssessments(assessmentsMap);
  };

  useEffect(() => {
    refreshAllData();

    // Connect WebSocket
    CommandCentreWebSocket.connect();

    const unsubConn = CommandCentreWebSocket.on('connection_status', (data: any) => {
      setIsWsConnected(data.connected);
    });

    const unsubAlert = CommandCentreWebSocket.on('alert_created', (newAlert: Alert) => {
      setAlerts((prev) => [newAlert, ...prev]);
      showToast(`🚨 New ${newAlert.priority} Alert: ${newAlert.title}`, 'alert');
    });

    const unsubAlertUp = CommandCentreWebSocket.on('alert_updated', (updated: Alert) => {
      setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    });

    const unsubEscalate = CommandCentreWebSocket.on('alert_escalated', (escalated: Alert) => {
      setAlerts((prev) => prev.map((a) => (a.id === escalated.id ? escalated : a)));
      showToast(`⚠️ Auto-Escalation: Alert ${escalated.id} escalated to Level ${escalated.escalation_level}`, 'warn');
    });

    const unsubRisk = CommandCentreWebSocket.on('risk_assessment_update', (ra: RiskAssessment) => {
      setLatestAssessments((prev) => ({ ...prev, [ra.patient_id]: ra }));
      if (ra.risk_level === 'HIGH') {
        showToast(`⚠️ AI Risk Update: ${ra.patient_id} flagged HIGH RISK (${ra.risk_score})`, 'alert');
      }
    });

    const unsubCmd = CommandCentreWebSocket.on('remote_command_confirmed', (cmd: any) => {
      showToast(`✅ Command ${cmd.command_type} confirmed EXECUTED by Home Simulator!`, 'info');
    });

    return () => {
      unsubConn();
      unsubAlert();
      unsubAlertUp();
      unsubEscalate();
      unsubRisk();
      unsubCmd();
    };
  }, []);

  // Handlers for Alert Workflow
  const handleAcknowledgeAlert = async (alertId: string, notes?: string) => {
    const updated = await CommandCentreApi.acknowledgeAlert(alertId, 'CG-001', notes || 'Acknowledged in Command Centre');
    if (updated) {
      setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      showToast(`Alert ${alertId} marked ACKNOWLEDGED`, 'info');
    }
  };

  const handleAssignAlert = async (alertId: string, caregiverId: string) => {
    const updated = await CommandCentreApi.assignAlert(alertId, caregiverId);
    if (updated) {
      setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      showToast(`Alert assigned to ${caregiverId}`, 'info');
    }
  };

  const handleResolveAlert = async (alertId: string, resolutionNotes: string) => {
    const updated = await CommandCentreApi.resolveAlert(alertId, 'CG-001', resolutionNotes);
    if (updated) {
      setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      showToast(`Alert ${alertId} marked RESOLVED`, 'info');
    }
  };

  const handleEscalationCheck = async () => {
    const res = await CommandCentreApi.triggerEscalationCheck();
    if (res && res.escalated_count > 0) {
      showToast(`Escalated ${res.escalated_count} unacknowledged alert(s) to emergency lead CG-004.`, 'warn');
      const updatedAlerts = await CommandCentreApi.getAlerts();
      setAlerts(updatedAlerts);
    } else {
      showToast('All alerts within response window. No escalations needed.', 'info');
    }
  };

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];
  const unacknowledgedAlerts = alerts.filter((a) => ['NEW', 'DELIVERED'].includes(a.status));
  const highRiskCount = Object.values(latestAssessments).filter((r) => r.risk_level === 'HIGH').length;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#2b3644] text-slate-100 select-none overflow-hidden font-sans">
      {/* Top Clinical Navigation Bar with all tabs on the top */}
      <TopNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        patients={patients}
        selectedPatientId={selectedPatientId}
        onSelectPatient={(id) => setSelectedPatientId(id)}
        unacknowledgedAlerts={unacknowledgedAlerts}
        highRiskCount={highRiskCount}
        onEscalateCheck={handleEscalationCheck}
        isWsConnected={isWsConnected}
      />

      {/* Main Content View (100% Full Width) */}
      <main className="flex-1 bg-[#242f3d] overflow-hidden">
        {selectedPatient && (
            <>
              {activeTab === 'overview' && (
                <CommandCentreOverview
                  patients={patients}
                  selectedPatient={selectedPatient}
                  isFrozen={isFrozen}
                  alerts={alerts}
                  devices={devices}
                  caregivers={caregivers}
                  latestAssessments={latestAssessments}
                  onSelectPatient={(id) => setSelectedPatientId(id)}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}

              {activeTab === 'patients' && (
                <PatientDirectoryView
                  patients={patients}
                  latestAssessments={latestAssessments}
                  onSelectPatient={(id) => setSelectedPatientId(id)}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}

              {activeTab === 'monitoring' && (
                <LiveMonitoringView patient={selectedPatient} />
              )}

              {activeTab === 'home_monitor' && (
                <VirtualHomeMonitorView
                  patient={selectedPatient}
                  devices={devices}
                  onCommandDispatched={(msg) => showToast(msg, 'info')}
                />
              )}

              {activeTab === 'digital_twin' && (
                <DigitalTwinView patient={selectedPatient} />
              )}

              {activeTab === 'ai_risk' && (
                <AIRiskAssessmentView
                  patient={selectedPatient}
                  assessment={latestAssessments[selectedPatient.id]}
                  onAssessmentUpdated={(ra) => {
                    setLatestAssessments((prev) => ({ ...prev, [ra.patient_id]: ra }));
                    showToast(`AI Risk evaluated: ${ra.risk_level} (${ra.risk_score})`, 'info');
                  }}
                />
              )}

              {activeTab === 'predictive' && (
                <PredictiveAnalyticsView patient={selectedPatient} />
              )}

              {activeTab === 'nurse_station' && (
                <NurseStationView
                  patients={patients}
                  alerts={alerts}
                  caregivers={caregivers}
                  devices={devices}
                  latestAssessments={latestAssessments}
                  onSelectPatient={(id) => setSelectedPatientId(id)}
                  onAcknowledgeAlert={handleAcknowledgeAlert}
                  onResolveAlert={(id) => handleResolveAlert(id, 'Resolved at Virtual Nurse Station')}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}

              {activeTab === 'caregivers' && (
                <CaregiverManagementView
                  patient={selectedPatient}
                  caregivers={caregivers}
                  observations={observations}
                  onObservationAdded={(obs) => {
                    setObservations((prev) => [obs, ...prev]);
                    showToast('Clinical note parsed and AI risk updated!', 'info');
                    refreshAllData();
                  }}
                />
              )}

              {activeTab === 'alerts' && (
                <EmergencyAlertsView
                  alerts={alerts}
                  caregivers={caregivers}
                  onAcknowledgeAlert={handleAcknowledgeAlert}
                  onAssignAlert={handleAssignAlert}
                  onResolveAlert={handleResolveAlert}
                  onEscalateCheck={handleEscalationCheck}
                />
              )}

              {activeTab === 'devices' && (
                <DeviceManagementView
                  devices={devices}
                  patients={patients}
                  onDeviceUpdated={refreshAllData}
                  onCommandDispatched={(msg) => showToast(msg, 'info')}
                />
              )}

              {activeTab === 'reliability' && (
                <ReliabilityLabView
                  patient={selectedPatient}
                  onFaultInjected={(msg) => {
                    showToast(msg, 'warn');
                    refreshAllData();
                  }}
                />
              )}
            </>
          )}
        </main>

      {/* ================= BOTTOM CLINICAL FUNCTION BAR (ICU KEYPAD) ================= */}
      <BottomFunctionBar
        onNavigateTab={(tab) => setActiveTab(tab)}
        isFrozen={isFrozen}
        onFreezeSnapshot={() => {
          setIsFrozen((prev) => !prev);
          showToast(
            !isFrozen
              ? '❄️ Waveforms Frozen (Telemetry Snapshot Captured)'
              : '▶️ Waveforms Resumed (Live ICU Sweep Active)',
            'info'
          );
        }}
        onTriggerNIBP={() => {
          showToast(
            `🩸 Initiating NIBP Cuff Inflation for ${selectedPatient?.name || 'Patient'} (Target 160 mmHg)...`,
            'info'
          );
        }}
      />

      {/* Floating System Toast */}
      {toast && (
        <div
          className={`fixed bottom-5 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold shadow-2xl border transition-all animate-bounce ${
            toast.type === 'alert'
              ? 'bg-red-950 text-red-200 border-red-500'
              : toast.type === 'warn'
              ? 'bg-amber-950 text-amber-200 border-amber-500'
              : 'bg-[#121d36] text-cyan-300 border-cyan-500'
          }`}
        >
          {toast.type === 'alert' && <AlertCircle className="w-4 h-4 text-red-400" />}
          {toast.type === 'warn' && <Bell className="w-4 h-4 text-amber-400" />}
          {toast.type === 'info' && <CheckCircle className="w-4 h-4 text-cyan-400" />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

