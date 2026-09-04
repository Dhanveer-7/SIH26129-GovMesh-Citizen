import React, { useState, useEffect } from 'react';
import { useDemo } from '../context/DemoContext';
import { Timeline } from '../components/Timeline';
import { 
  Search, AlertTriangle, AlertCircle, RefreshCw, Upload, CheckCircle2, 
  ArrowRight, FileText, LayoutList, History, ShieldAlert, Zap, Server, ChevronRight, Activity
} from 'lucide-react';
import { Modal } from '../components/Modal';
import api from '../services/api';

export const ApplicationTracking: React.FC = () => {
  const { 
    applications, setApplications, trackingState, triggerDemoState, uploadDocument, documents, activeAppId
  } = useDemo();

  const [searchId, setSearchId] = useState(activeAppId || 'GM-2026-000124');
  const [selectedAppId, setSelectedAppId] = useState(activeAppId || 'GM-2026-000124');
  const [isRetrying, setIsRetrying] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'departments' | 'audit'>('timeline');
  
  useEffect(() => {
    if (activeAppId) {
      setSelectedAppId(activeAppId);
      setSearchId(activeAppId);
    }
  }, [activeAppId]);

  // Synchronize live status with GovMesh Core cloud orchestrator
  useEffect(() => {
    let isMounted = true;
    async function syncLiveStatus() {
      if (!selectedAppId) return;
      try {
        const liveRes = await api.getGovMeshTransactionStatus(selectedAppId);
        if (isMounted && liveRes && (liveRes.success || liveRes.transaction)) {
          const liveTx = liveRes.transaction || liveRes;
          setApplications(prev => {
            const exists = prev.some(a => a.id === selectedAppId);
            if (!exists) {
              const newLiveApp = {
                id: selectedAppId,
                serviceId: liveTx.serviceCode || "address-update",
                serviceName: liveTx.serviceCode === 'LAND_RECORD_UPDATE' ? 'Land & Revenue Record Verification' : (liveTx.serviceCode === 'RATION_CARD_ADDRESS_UPDATE' ? 'Ration Card & Food Quota Sync' : (liveTx.serviceCode === 'GRAM_PANCHAYAT_ADDRESS_UPDATE' ? 'Gram Panchayat Resident Registry Update' : 'Cross-Department Address Synchronization')),
                workflowId: "DYNAMIC_WORKFLOW_V2",
                timestamp: liveTx.updatedAt || new Date().toISOString(),
                correlationId: liveTx.correlationId || `CORR-26-${selectedAppId}`,
                status: liveTx.status || 'COMPLETED',
                progressPercent: liveTx.progressPercent || 100,
                completedDepartments: liveTx.completedDepartments || (liveTx.steps ? liveTx.steps.filter((s: any) => s.status === 'SUCCESS').length : 3),
                totalDepartments: liveTx.totalDepartments || (liveTx.steps ? liveTx.steps.length : 3),
                steps: liveTx.steps?.map((s: any) => ({
                  departmentName: s.departmentName,
                  departmentCode: s.departmentCode,
                  protocol: s.protocol,
                  action: s.departmentCode === 'REVENUE' ? 'Verify/update address record' : (s.departmentCode === 'FOOD' ? 'Update eligible ration/PDS record' : 'Update local Gram Panchayat record'),
                  status: s.status,
                  remarks: s.remarks,
                  timestamp: s.timestamp
                })) || [],
                uploadedDocuments: []
              };
              return [newLiveApp, ...prev];
            }
            return prev.map(a => {
              if (a.id !== selectedAppId) return a;
              return {
                ...a,
                status: liveTx.status || a.status,
                progressPercent: liveTx.progressPercent !== undefined ? liveTx.progressPercent : a.progressPercent,
                completedDepartments: liveTx.completedDepartments !== undefined ? liveTx.completedDepartments : a.completedDepartments,
                totalDepartments: liveTx.totalDepartments !== undefined ? liveTx.totalDepartments : a.totalDepartments,
                steps: liveTx.steps?.map((s: any) => ({
                  departmentName: s.departmentName,
                  departmentCode: s.departmentCode,
                  protocol: s.protocol,
                  action: s.departmentCode === 'REVENUE' ? 'Verify/update address record' : (s.departmentCode === 'FOOD' ? 'Update eligible ration/PDS record' : 'Update local Gram Panchayat record'),
                  status: s.status,
                  remarks: s.remarks,
                  timestamp: s.timestamp
                })) || a.steps
              };
            });
          });
        }
      } catch (err) {
        console.warn('Could not sync live status:', err);
      }
    }
    syncLiveStatus();
    const interval = setInterval(syncLiveStatus, 4000);
    return () => { 
      isMounted = false; 
      clearInterval(interval);
    };
  }, [selectedAppId]);

  // Load audit trail when requested
  const fetchAuditLogs = async () => {
    try {
      const res = await api.getGovMeshAudit(selectedAppId);
      if (res && res.auditLogs) {
        setAuditLogs(res.auditLogs);
      }
    } catch (e) {
      console.warn('Failed to load audit logs:', e);
    }
  };

  const handleRetryFailed = async () => {
    setIsRetrying(true);
    try {
      const retryRes = await api.retryGovMeshTransaction(selectedAppId);
      if (retryRes && (retryRes.success || retryRes.transaction)) {
        const liveTx = retryRes.transaction || retryRes;
        setApplications(prev => prev.map(a => {
          if (a.id !== selectedAppId) return a;
          return {
            ...a,
            status: liveTx.status || a.status,
            progressPercent: liveTx.progressPercent !== undefined ? liveTx.progressPercent : a.progressPercent,
            completedDepartments: liveTx.completedDepartments !== undefined ? liveTx.completedDepartments : a.completedDepartments,
            steps: liveTx.steps?.map((s: any) => ({
              departmentName: s.departmentName,
              departmentCode: s.departmentCode,
              protocol: s.protocol,
              action: s.departmentCode === 'REVENUE' ? 'Verify/update address record' : (s.departmentCode === 'FOOD' ? 'Update eligible ration/PDS record' : 'Update local Gram Panchayat record'),
              status: s.status,
              remarks: s.remarks,
              timestamp: s.timestamp
            })) || a.steps
          };
        }));
      }
    } catch (err: any) {
      alert(`Retry error: ${err.message}`);
    } finally {
      setIsRetrying(false);
    }
  };

  const [correctedFile, setCorrectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchId.trim();
    if (!query) return;
    
    const exists = applications.find(app => app.id.toLowerCase() === query.toLowerCase());
    if (exists) {
      setSelectedAppId(exists.id);
      return;
    }

    try {
      const liveRes = await api.getGovMeshTransactionStatus(query);
      if (liveRes && (liveRes.success || liveRes.transaction)) {
        setSelectedAppId(query);
        return;
      }
    } catch (err) {
      console.warn('Search query error:', err);
    }
    
    alert("Application ID not found in registry. Try searching: GM-2026-000124 or GM-2026-000087");
  };

  const app = applications.find(a => a.id === selectedAppId) || applications[0];

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctedFile) return;

    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setCorrectedFile(null);
      triggerDemoState('ACTION_RESOLVED');
    }, 2000);
  };

  const hasFailedSteps = app.steps.some(s => s.status === 'FAILED' || s.status === 'RETRYING');

  return (
    <div className="space-y-6 py-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Unified Application Tracking</h1>
          <p className="text-xs text-slate-550 font-semibold mt-1">
            Real-time dynamic multi-department validation monitor. Direct two-way status aggregation.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          {(app.status === 'PARTIALLY_COMPLETED' || app.status === 'FAILED' || app.status === 'RETRY_REQUIRED' || hasFailedSteps) && (
            <button
              onClick={handleRetryFailed}
              disabled={isRetrying}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-gov-sm transition disabled:opacity-50"
              title="Selective Idempotent Retry for failed departments"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Retrying Failed...' : 'Retry Failed Registries'}</span>
            </button>
          )}

          <button
            onClick={() => {
              fetchAuditLogs();
              setShowAuditModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition shadow-gov-sm"
            title="Inspect Event-Driven Audit Ledger"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Search Tracker Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white border border-slate-200 p-4 rounded-xl shadow-gov-sm">
        <form onSubmit={handleSearch} className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Enter Application Tracking ID (e.g. GM-2026-000124)..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-gov-secondary bg-slate-50 focus:bg-white transition"
          />
        </form>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto shrink-0">
          {applications.map(a => (
            <button
              key={a.id}
              onClick={() => {
                setSelectedAppId(a.id);
                setSearchId(a.id);
              }}
              className={`px-3 py-1.5 rounded text-[10px] font-bold tracking-wider font-mono border transition ${
                selectedAppId === a.id
                  ? 'bg-gov-primary border-gov-primary text-white shadow-gov-sm'
                  : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
              }`}
            >
              {a.id}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Timeline and Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-gov-md space-y-6">
            
            {/* Metadata Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-800 uppercase tracking-wide">
                  {app.serviceName}
                </h3>
                <span className="text-[10px] text-slate-450 font-mono mt-0.5 block">
                  Application ID: {app.id} • Correlation ID: {app.correlationId}
                </span>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`inline-block text-[9px] px-2.5 py-1 rounded font-bold uppercase tracking-wider ${
                    app.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-200' :
                    app.status === 'PARTIALLY_COMPLETED' ? 'bg-indigo-100 text-indigo-800 font-bold border border-indigo-200' :
                    app.status === 'RETRYING' ? 'bg-amber-100 text-amber-800 animate-pulse border border-amber-200' :
                    app.status === 'ACTION_REQUIRED' ? 'bg-red-100 text-red-700 font-bold border border-red-200' :
                    app.status === 'FAILED' ? 'bg-red-100 text-red-800 font-bold border border-red-200' :
                    'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}
                >
                  {app.status === 'COMPLETED' ? '✓ Completed (100%)' :
                   app.status === 'PARTIALLY_COMPLETED' ? '⚡ Partially Completed' :
                   app.status === 'RETRYING' ? '⟳ Queue Retry Active' :
                   app.status === 'ACTION_REQUIRED' ? '⚠ Action Required' :
                   app.status === 'FAILED' ? '✗ Failed — Retry Available' : '⟳ In Progress'}
                </span>
                <span className="block text-[9px] text-slate-450 mt-1 font-mono">
                  Started: {new Date(app.timestamp).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Overall Progress Progress Indicator */}
            <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex justify-between text-[10px] font-bold text-slate-650 uppercase tracking-wider">
                <span>Orchestration Status</span>
                <span>{app.progressPercent}% Complete</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    app.status === 'ACTION_REQUIRED' ? 'bg-gov-failure animate-pulse' :
                    app.status === 'PARTIALLY_COMPLETED' ? 'bg-indigo-600' :
                    app.status === 'FAILED' ? 'bg-red-500' :
                    app.status === 'RETRYING' ? 'bg-amber-500' :
                    'bg-gov-success'
                  }`}
                  style={{ width: `${app.progressPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-550 leading-relaxed font-semibold">
                Dynamic Schema Fan-Out: Synchronized {app.completedDepartments} of {app.totalDepartments} target department registries.
              </p>
            </div>

            {/* Department-by-Department Independent Status Grid */}
            <div className="space-y-3">
              <span className="block text-[10px] font-extrabold uppercase text-slate-450 tracking-wider">
                Target Registry Integrations ({app.steps.length} Connected)
              </span>

              <div className="grid grid-cols-1 gap-3">
                {app.steps.map((step, idx) => (
                  <div 
                    key={idx}
                    className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      step.status === 'SUCCESS' ? 'bg-emerald-50/30 border-emerald-200' :
                      step.status === 'FAILED' ? 'bg-red-50/30 border-red-200' :
                      step.status === 'RETRYING' ? 'bg-amber-50/30 border-amber-200' :
                      step.status === 'CONSENT_BLOCKED' ? 'bg-slate-50 border-slate-200 opacity-70' :
                      'bg-white border-slate-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-800">
                          {step.departmentName}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {step.protocol || (step.departmentName.includes('Revenue') ? 'REST/JSON' : (step.departmentName.includes('Food') ? 'SOAP/XML' : 'CSV/SFTP'))}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-550 leading-normal font-semibold">
                        {step.remarks || step.action}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                        step.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' :
                        step.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                        step.status === 'RETRYING' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                        step.status === 'CONSENT_BLOCKED' ? 'bg-slate-200 text-slate-600' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {step.status === 'SUCCESS' ? '✓ Completed' :
                         step.status === 'FAILED' ? '✗ Failed' :
                         step.status === 'RETRYING' ? '⟳ Retrying' :
                         step.status === 'CONSENT_BLOCKED' ? 'Blocked (Consent)' : '○ In Progress'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <span className="block text-[10px] font-extrabold uppercase text-slate-450 tracking-wider">
                State Integration Timeline
              </span>
              <Timeline steps={app.steps} progressPercent={app.progressPercent} />
            </div>

          </div>
        </div>

        {/* Right Side Sidebar: Interactive Simulations and Info */}
        <div className="space-y-6">
          
          {/* Action Required Prompt Panel */}
          {app.status === 'ACTION_REQUIRED' && (
            <div className="bg-white border-2 border-red-200 rounded-2xl p-5 shadow-gov-md space-y-4">
              <div className="flex items-center gap-2 text-gov-failure font-bold text-xs">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>Action Required: Doc Re-upload</span>
              </div>

              <p className="text-xs text-slate-650 leading-relaxed font-semibold">
                The <span className="font-bold">Revenue Department</span> requested a clearer scan of your address proof document to proceed with validation.
              </p>

              <form onSubmit={handleActionSubmit} className="space-y-3">
                <div className="border border-dashed border-slate-200 hover:border-gov-failure rounded-lg p-5 text-center transition bg-slate-50 flex flex-col items-center justify-center relative cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setCorrectedFile(e.target.files[0]);
                    }}
                    disabled={isUploading}
                    required
                  />
                  {isUploading ? (
                    <RefreshCw className="w-5 h-5 text-gov-failure animate-spin" />
                  ) : correctedFile ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <FileText className="w-4 h-4 text-gov-failure" />
                      <span>{correctedFile.name}</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-4 h-4 text-slate-400 mx-auto" />
                      <span className="block text-[10px] font-bold text-slate-650">Select Clearer File</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!correctedFile || isUploading}
                  className="w-full py-2.5 bg-gov-failure hover:bg-red-700 text-white rounded-lg text-xs font-bold transition shadow-gov-sm disabled:opacity-50"
                >
                  {isUploading ? 'Uploading & Analyzing...' : 'Submit Corrected Document'}
                </button>
              </form>
            </div>
          )}

          {/* Dynamic Interoperability Engine Explanation */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-gov-sm space-y-4">
            <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <Server className="w-4 h-4 text-indigo-600" />
              <span>Dynamic Interoperability Core</span>
            </h4>
            
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-bold text-[10px]">
                  1
                </div>
                <p className="text-slate-550 leading-relaxed font-semibold">
                  <span className="font-extrabold text-slate-850">Dynamic Registry:</span> GovMesh determines target departments based on service code <code className="font-mono text-[10px] text-indigo-600">{app.serviceId || 'ADDRESS_CHANGE'}</code>.
                </p>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-bold text-[10px]">
                  2
                </div>
                <p className="text-slate-550 leading-relaxed font-semibold">
                  <span className="font-extrabold text-slate-850">Data Minimization:</span> Each department adapter transforms canonical data to extract strictly necessary fields.
                </p>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-bold text-[10px]">
                  3
                </div>
                <p className="text-slate-550 leading-relaxed font-semibold">
                  <span className="font-extrabold text-slate-850">Selective Retry:</span> Operational retries only re-dispatch to failed departments without duplicating completed records.
                </p>
              </li>
            </ul>
          </div>

        </div>

      </div>

      {/* Audit Trail Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAuditModal(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-gov-lg border border-slate-100 overflow-hidden transform transition-all z-10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-850">Audit Trail Ledger — {selectedAppId}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Immutable event log recording cross-department communication.</p>
              </div>
              <button
                onClick={() => setShowAuditModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
              {auditLogs.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-6">
                  No audit trail events logged yet.
                </p>
              ) : (
                auditLogs.map((log: any) => (
                  <div 
                    key={log.id} 
                    className="p-3 rounded-lg border border-slate-100 bg-slate-50 text-xs space-y-1 font-mono"
                  >
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-indigo-650">{log.event}</span>
                      <span className="text-slate-400">{log.timestamp}</span>
                    </div>
                    <p className="text-slate-700 font-sans text-xs">{log.details}</p>
                    <div className="flex justify-between items-center text-[9px] text-slate-450 pt-1 border-t border-slate-200/50">
                      <span>Actor: {log.actor}</span>
                      <span className={`font-bold ${log.result === 'SUCCESS' ? 'text-emerald-600' : 'text-red-600'}`}>
                        [{log.result}]
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowAuditModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
