import React, { useState, useEffect } from 'react';
import { useDemo } from '../context/DemoContext';
import { Timeline } from '../components/Timeline';
import { 
  Search, AlertTriangle, AlertCircle, RefreshCw, Upload, CheckCircle2, 
  ArrowRight, FileText, LayoutList, History, ShieldAlert
} from 'lucide-react';
import { Modal } from '../components/Modal';
import api from '../services/api';

export const ApplicationTracking: React.FC = () => {
  const { 
    applications, setApplications, trackingState, triggerDemoState, uploadDocument, documents, activeAppId
  } = useDemo();

  const [searchId, setSearchId] = useState(activeAppId || 'GM-2026-000124');
  const [selectedAppId, setSelectedAppId] = useState(activeAppId || 'GM-2026-000124');
  
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
        if (isMounted && liveRes && liveRes.data) {
          const liveTx = liveRes.data;
          setApplications(prev => {
            const exists = prev.some(a => a.id === selectedAppId);
            if (!exists) {
              const newLiveApp = {
                id: selectedAppId,
                serviceId: "address-update",
                serviceName: "Address Update",
                workflowId: "ADDRESS_CHANGE_V1",
                timestamp: liveTx.updatedAt || new Date().toISOString(),
                correlationId: liveTx.correlationId || `CORR-26-${selectedAppId}`,
                status: liveTx.status,
                progressPercent: liveTx.progressPercent,
                completedDepartments: liveTx.completedDepartments,
                totalDepartments: liveTx.totalDepartments || 3,
                steps: liveTx.steps?.map((s: any) => ({
                  departmentName: s.departmentName,
                  action: s.departmentCode === 'REVENUE' ? 'Verify/update address record' : (s.departmentCode === 'FOOD' ? 'Update eligible ration/PDS record' : 'Update relevant local service record'),
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
                status: liveTx.status,
                progressPercent: liveTx.progressPercent,
                completedDepartments: liveTx.completedDepartments,
                steps: liveTx.steps?.map((s: any) => ({
                  departmentName: s.departmentName,
                  action: s.departmentCode === 'REVENUE' ? 'Verify/update address record' : (s.departmentCode === 'FOOD' ? 'Update eligible ration/PDS record' : 'Update relevant local service record'),
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
    return () => { isMounted = false; };
  }, [selectedAppId]);

  const [correctedFile, setCorrectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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
      if (liveRes && liveRes.data) {
        setSelectedAppId(query);
        return;
      }
    } catch (err) {
      console.warn('Search query error:', err);
    }
    
    alert("Application ID not found in prototype environment. Try searching: GM-2026-000124 or GM-2026-000087");
  };

  const app = applications.find(a => a.id === selectedAppId) || applications[0];

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctedFile) return;

    setIsUploading(true);
    // Simulate re-upload and document OCR scan
    setTimeout(() => {
      setIsUploading(false);
      setCorrectedFile(null);
      // Move demo state to Action Resolved!
      triggerDemoState('ACTION_RESOLVED');
      
      // Auto-advance to food success, failure, retry, etc. after delay if presenter wants
    }, 2000);
  };

  return (
    <div className="space-y-6 py-2">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Unified Application Tracking</h1>
        <p className="text-xs text-slate-550 font-semibold mt-1">
          Monitor multi-department validations in real-time. Citizens never need to visit individual department portals.
        </p>
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
                  className={`inline-block text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    app.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 font-bold' :
                    app.status === 'RETRYING' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                    app.status === 'ACTION_REQUIRED' ? 'bg-red-100 text-red-700 font-bold' :
                    'bg-blue-100 text-blue-800'
                  }`}
                >
                  {app.status === 'COMPLETED' ? 'Completed' :
                   app.status === 'RETRYING' ? 'Queue Retry Active' :
                   app.status === 'ACTION_REQUIRED' ? 'Action Required' : 'In Progress'}
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
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    app.status === 'ACTION_REQUIRED' ? 'bg-gov-failure animate-pulse' :
                    app.status === 'RETRYING' ? 'bg-amber-500' : 'bg-gov-primary'
                  }`}
                  style={{ width: `${app.progressPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                This request automatically maps schemas across departments. Current completion: {app.completedDepartments} of {app.totalDepartments} registries synchronized.
              </p>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
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

              <p className="text-xs text-slate-650 leading-relaxed">
                The <span className="font-bold">Revenue Department</span> rejected the uploaded Address Proof scan, citing: <span className="italic font-bold">"Electricity bill image is blurry. Cannot read municipal house number index."</span>
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

          {/* Retry logs panel */}
          {app.status === 'RETRYING' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-gov-md space-y-4">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />
                <span>Automatic Retry Manager Active</span>
              </div>

              <p className="text-xs text-slate-550 leading-relaxed font-semibold">
                The Gram Panchayat server is currently unresponsive. GovMesh has caught the failure and queued a schedule to retry automatically. No data is lost.
              </p>

              <div className="border border-slate-100 rounded-lg p-3 bg-slate-50 space-y-2 font-mono text-[9px]">
                <div className="flex justify-between text-slate-400 font-sans font-bold uppercase mb-1">
                  <span>Retry Log</span>
                  <span>Status</span>
                </div>
                <div className="flex justify-between text-slate-650">
                  <span>Attempt 1: 10:10 AM</span>
                  <span className="text-gov-failure font-bold">FAILED (503 Gateway Down)</span>
                </div>
                {trackingState === 'RURAL_RETRYING' ? (
                  <div className="flex justify-between text-slate-850 animate-pulse font-bold">
                    <span>Attempt 2: 10:11 AM</span>
                    <span className="text-amber-600 font-bold">RETRYING NOW...</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-slate-500">
                    <span>Attempt 2: 10:11 AM</span>
                    <span className="text-slate-450">PENDING (Scheduled)</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Attempt 3: 10:15 AM</span>
                  <span>PENDING (Backoff queue)</span>
                </div>
              </div>

              {/* Inline recovery button for presentation convenience */}
              <div className="border-t border-slate-100 pt-3">
                <button
                  onClick={() => triggerDemoState('RURAL_SUCCESS')}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-gov-primary hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-gov-sm transition border"
                >
                  <span>Simulate System Recovery</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Integration explanation cards */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-gov-sm space-y-4">
            <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">
              GovMesh Orchestration Core
            </h4>
            
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-bold text-[10px]">
                  1
                </div>
                <p className="text-slate-550 leading-relaxed font-semibold">
                  <span className="font-extrabold text-slate-850">Single Application:</span> A single workflow updates the municipal, civil food registry, and panchayat records.
                </p>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-bold text-[10px]">
                  2
                </div>
                <p className="text-slate-550 leading-relaxed font-semibold">
                  <span className="font-extrabold text-slate-850">Consent Bound:</span> APIs share data parameters mapping specifically to your approved consent scopes.
                </p>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-bold text-[10px]">
                  3
                </div>
                <p className="text-slate-550 leading-relaxed font-semibold">
                  <span className="font-extrabold text-slate-850">Automatic Retries:</span> Failures are quarantined and resolved automatically by GovMesh without throwing stack traces to citizens.
                </p>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};
