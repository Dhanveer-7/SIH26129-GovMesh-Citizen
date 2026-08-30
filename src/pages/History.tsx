import React, { useState } from 'react';
import { useDemo } from '../context/DemoContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  History as HistIcon, Shield, Eye, RefreshCw, HelpCircle, 
  Trash2, ClipboardList, Info, BarChart3, Database, Calendar
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const History: React.FC = () => {
  const { applications, consents, sharingLogs, revokeConsent } = useDemo();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Navigation tabs via query param ?tab=
  const activeTab = searchParams.get('tab') || 'applications';

  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [selectedConsentId, setSelectedConsentId] = useState<string | null>(null);

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const handleRevokeTrigger = (id: string) => {
    setSelectedConsentId(id);
    setShowRevokeModal(true);
  };

  const handleConfirmRevoke = () => {
    if (selectedConsentId) {
      revokeConsent(selectedConsentId);
    }
    setShowRevokeModal(false);
    setSelectedConsentId(null);
  };

  // Recharts metric calculations
  const chartData = [
    { name: 'Revenue', count: sharingLogs.filter(log => log.sharedWith.includes('Revenue')).length },
    { name: 'Food Dept', count: sharingLogs.filter(log => log.sharedWith.includes('Food')).length },
    { name: 'Rural Dev', count: sharingLogs.filter(log => log.sharedWith.includes('Rural')).length }
  ];

  return (
    <div className="space-y-6 py-2">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">History & Transparency Ledger</h1>
        <p className="text-xs text-slate-550 font-semibold mt-1">
          Review past transactions, manage active data-sharing consents, and audit logs of exactly when registries accessed your records.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => handleTabChange('applications')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors -mb-[2px] ${
            activeTab === 'applications'
              ? 'border-indigo-650 text-indigo-750 font-extrabold'
              : 'border-transparent text-slate-450 hover:text-slate-700'
          }`}
        >
          Applications List
        </button>
        <button
          onClick={() => handleTabChange('consents')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors -mb-[2px] ${
            activeTab === 'consents'
              ? 'border-indigo-650 text-indigo-750 font-extrabold'
              : 'border-transparent text-slate-450 hover:text-slate-700'
          }`}
        >
          Active Consents
        </button>
        <button
          onClick={() => handleTabChange('transparency')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors -mb-[2px] ${
            activeTab === 'transparency'
              ? 'border-indigo-650 text-indigo-750 font-extrabold'
              : 'border-transparent text-slate-450 hover:text-slate-700'
          }`}
        >
          Data Sharing Ledger
        </button>
      </div>

      {/* Tabs Content */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {applications.map(app => (
            <div
              key={app.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-gov-sm hover:shadow-gov-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wide">
                    {app.serviceName}
                  </h3>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                      app.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                      app.status === 'RETRYING' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                      app.status === 'ACTION_REQUIRED' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-750'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-450 font-mono">
                  <span>ID: {app.id}</span>
                  <span>•</span>
                  <span>Submitted: {new Date(app.timestamp).toLocaleDateString()}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/track')}
                className="px-4 py-2 border border-indigo-200 text-indigo-650 hover:bg-indigo-50 font-bold rounded-lg text-xs transition bg-white"
              >
                Inspect Workflow Details
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'consents' && (
        <div className="space-y-4">
          {consents.map(consent => (
            <div
              key={consent.id}
              className={`bg-white border rounded-xl p-5 shadow-gov-sm transition flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                consent.status === 'REVOKED' || consent.status === 'EXPIRED' ? 'border-slate-100 opacity-60' : 'border-slate-200'
              }`}
            >
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-slate-800">
                    {consent.department.toUpperCase()}
                  </h4>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                      consent.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 font-bold' :
                      consent.status === 'REVOKED' ? 'bg-red-100 text-red-700' :
                      'bg-slate-155 text-slate-650'
                    }`}
                  >
                    {consent.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs leading-relaxed font-semibold">
                  <div>
                    <span className="text-[10px] font-bold text-slate-450 uppercase block">Access Scope Granted</span>
                    <p className="text-slate-700">{consent.scope.join(', ')}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-450 uppercase block">Purpose Bound</span>
                    <p className="text-slate-700">{consent.purpose}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[9px] text-slate-450 font-mono border-t border-slate-50 pt-2">
                  <span>Consent ID: {consent.id}</span>
                  <span>•</span>
                  <span>Expires: {new Date(consent.expiryDate).toLocaleDateString()}</span>
                </div>
              </div>

              {consent.status === 'APPROVED' && (
                <button
                  onClick={() => handleRevokeTrigger(consent.id)}
                  className="px-4 py-2 border border-red-200 text-gov-failure hover:bg-red-50 font-bold rounded-lg text-xs transition bg-white flex items-center gap-1.5 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Revoke Access</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'transparency' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Audit trail list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-gov-sm">
              <div className="px-4 py-3 border-b border-slate-250 bg-slate-50 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Immutable Exchange Ledger
                </span>
                <span className="text-[10px] bg-indigo-50 text-indigo-750 px-2 py-0.5 rounded font-bold font-mono">
                  Total Exchanges: {sharingLogs.length}
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {sharingLogs.map((log) => (
                  <div key={log.id} className="p-4 space-y-2 hover:bg-slate-50/50 transition">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">{log.sharedWith}</span>
                      <span className="text-slate-450 font-mono text-[10px] font-normal">{log.timestamp}</span>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-550 leading-relaxed font-semibold">
                      <div>
                        <span className="text-slate-400 font-bold">Shared Data:</span> {log.dataScope.join(', ')}
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold">Verification:</span> {log.purpose}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-[9px] text-slate-400 font-mono">
                      <span>Log Hash: SHA-256...{log.id.replace('DSL-', '')}</span>
                      <span>•</span>
                      <span>Consent Ref: {log.consentId}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Access Statistics Visual Graphics */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-gov-sm space-y-4">
              <div>
                <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">
                  Audit Access Volume
                </h4>
                <p className="text-[10px] text-slate-450 mt-0.5 leading-normal">
                  Total record pull operations executed by department APIs during active coordinates.
                </p>
              </div>

              {/* BarChart Recharts */}
              <div className="h-48 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Tooltip cursor={{ fill: '#f1f5f9' }} />
                    <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-lg flex items-start gap-2 text-[10px] text-indigo-850 leading-relaxed">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  Ledger audit lists are generated using cryptographically hashed parameters to ensure non-repudiation of transactions between department systems.
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Revocation modal */}
      <Modal
        isOpen={showRevokeModal}
        onClose={() => {
          setShowRevokeModal(false);
          setSelectedConsentId(null);
        }}
        onConfirm={handleConfirmRevoke}
        title="Revoke Sharing Consent"
        description="Are you sure you want to revoke this consent? Connected department services will instantly lose access to any files or verified attributes associated with this authorization scope. This may pause active applications."
        requirePin={true}
        confirmText="Confirm Revocation"
        cancelText="Cancel"
      />
    </div>
  );
};
