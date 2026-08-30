import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDemo } from '../context/DemoContext';
import { 
  Search, Mic, AlertCircle, ArrowRight, CheckCircle2, 
  HelpCircle, Sparkles, MapPin, FileBadge, HeartHandshake, Box, Calendar
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    applications, consents, notifications, 
    setNlQuery, setWorkflowStep, currentStep, activeAppId, trackingState
  } = useDemo();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  // Active address update application
  const activeApp = applications.find(app => app.id === activeAppId || app.status !== "COMPLETED") || applications[0];

  const handleNlSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Trigger state machine
    setNlQuery(searchQuery);
    setWorkflowStep('ANALYZING');
    navigate('/workflow');
  };

  const handleQuickService = (serviceId: string, desc: string) => {
    setNlQuery(desc);
    setWorkflowStep('ANALYZING');
    navigate('/workflow');
  };

  const triggerVoiceInput = () => {
    setIsRecording(true);
    // Simulate speech-to-text
    setTimeout(() => {
      setSearchQuery("I have changed my residential address and need to update records.");
      setIsRecording(false);
    }, 1500);
  };

  // Get active pending consent count
  const pendingConsents = consents.filter(c => c.status === "REQUESTED");

  return (
    <div className="space-y-8 py-2">
      {/* Dynamic Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Good morning, {user?.name || 'Citizen'}
        </h1>
        <p className="text-xs text-slate-550 font-semibold mt-1">
          What do you need assistance with today? Describe your request in plain text.
        </p>
      </div>

      {/* Natural Language Query Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-gov-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Sparkles className="w-48 h-48 text-indigo-900" />
        </div>

        <form onSubmit={handleNlSearch} className="space-y-4 max-w-3xl relative z-10">
          <div className="space-y-2">
            <label className="block text-[10px] uppercase font-extrabold tracking-wider text-slate-450">
              Intelligent Service Search (Natural Language Assistant)
            </label>
            
            <div className="relative">
              <textarea
                rows={2}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='e.g., "I have moved to a new address in Pune and want to update my ration card and land records."'
                className="w-full pl-4 pr-12 py-3.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-gov-secondary bg-slate-50 focus:bg-white transition resize-none leading-relaxed"
                required
              />
              <button
                type="button"
                onClick={triggerVoiceInput}
                className={`absolute right-4.5 top-5 p-1.5 rounded-full hover:bg-slate-250 transition ${
                  isRecording ? 'text-red-500 bg-red-50 animate-ping' : 'text-slate-400'
                }`}
                title="Simulate Voice Input"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[10px] text-slate-400 leading-normal flex items-start gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
              <span>
                GovMesh AI matches your request intent with authorized state registry APIs under strict user-consent controls.
              </span>
            </div>
            
            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-gov-primary hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-gov-sm transition shrink-0"
            >
              <span>Find Services</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Quick Services */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-450">
          Quick Services
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => handleQuickService('address-update', 'I have moved to a new home and need to update my address record.')}
            className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-gov-sm hover:border-gov-secondary text-left transition hover:shadow-gov-md"
          >
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="block font-bold text-xs text-slate-800">Address Change</span>
              <span className="text-[9px] text-slate-400">Revenue, Food, Rural</span>
            </div>
          </button>

          <button
            onClick={() => handleQuickService('income-cert', 'Apply for a fresh annual Income Certificate.')}
            className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-gov-sm hover:border-gov-secondary text-left transition hover:shadow-gov-md"
          >
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <FileBadge className="w-4 h-4" />
            </div>
            <div>
              <span className="block font-bold text-xs text-slate-800">Certificates</span>
              <span className="text-[9px] text-slate-400">Revenue Records</span>
            </div>
          </button>

          <button
            onClick={() => handleQuickService('benefits-schemes', 'Apply for senior citizen welfare schemes and pensions.')}
            className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-gov-sm hover:border-gov-secondary text-left transition hover:shadow-gov-md"
          >
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <span className="block font-bold text-xs text-slate-800">Benefits & Schemes</span>
              <span className="text-[9px] text-slate-400">Direct Benefit Transfer</span>
            </div>
          </button>

          <button
            onClick={() => navigate('/services')}
            className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-gov-sm hover:border-gov-secondary text-left transition hover:shadow-gov-md"
          >
            <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <span className="block font-bold text-xs text-slate-800">Other Services</span>
              <span className="text-[9px] text-slate-400">Browse catalogue</span>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Applications Panel */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-450">
            Active Applications
          </h3>

          {activeApp ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-gov-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800">
                    {activeApp.serviceName}
                  </h4>
                  <span className="text-[10px] text-slate-450 font-mono mt-0.5 block">
                    ID: {activeApp.id}
                  </span>
                </div>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    activeApp.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                    activeApp.status === 'RETRYING' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                    activeApp.status === 'ACTION_REQUIRED' ? 'bg-red-150 text-red-700 animate-bounce' :
                    'bg-blue-100 text-blue-700'
                  }`}
                >
                  {activeApp.status === 'COMPLETED' ? 'Completed' :
                   activeApp.status === 'RETRYING' ? 'Queue Retry Active' :
                   activeApp.status === 'ACTION_REQUIRED' ? 'Action Required' : 'Processing'}
                </span>
              </div>

              {/* Progress Bar indicator */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-600">
                  <span>Progress Profile</span>
                  <span>{activeApp.progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      activeApp.status === 'ACTION_REQUIRED' ? 'bg-gov-failure' :
                      activeApp.status === 'RETRYING' ? 'bg-amber-500' : 'bg-gov-primary'
                    }`}
                    style={{ width: `${activeApp.progressPercent}%` }}
                  />
                </div>
                <span className="block text-[9px] text-slate-450 font-semibold mt-1">
                  Completed {activeApp.completedDepartments} of {activeApp.totalDepartments} connected departments.
                </span>
              </div>

              {/* Action alert inside card if error/clarify exists */}
              {activeApp.status === 'ACTION_REQUIRED' && (
                <div className="p-3 bg-red-50 border border-red-150 rounded-lg flex items-center justify-between text-xs font-bold text-red-800">
                  <span>Revenue requested a clearer scan of address proof.</span>
                  <button
                    onClick={() => navigate('/track')}
                    className="flex items-center gap-1 text-[10px] uppercase font-extrabold tracking-wide text-red-800 hover:underline"
                  >
                    <span>Upload Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              {activeApp.status === 'RETRYING' && (
                <div className="p-3 bg-amber-50 border border-amber-150 rounded-lg flex items-center gap-2 text-xs font-bold text-amber-800">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>Gram Panchayat system down. GovMesh retry manager is executing recovery tasks.</span>
                </div>
              )}

              <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-semibold">
                  Workflow: {activeApp.workflowId}
                </span>
                <button
                  onClick={() => navigate('/track')}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  <span>Track Timeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs shadow-gov-sm">
              No active applications. Select a service to get started.
            </div>
          )}
        </div>

        {/* Pending Actions & Recent Activities Sidebar */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-450">
            Pending Actions
          </h3>

          <div className="space-y-3">
            {/* Action Required Banner if exists */}
            {activeApp?.status === 'ACTION_REQUIRED' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl shadow-gov-sm space-y-2">
                <div className="flex items-center gap-2 text-gov-failure font-bold text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Action Required</span>
                </div>
                <p className="text-[11px] text-slate-650 leading-relaxed">
                  Revenue department requests a clearer scan of your residential proof document to verify changes.
                </p>
                <button
                  onClick={() => navigate('/track')}
                  className="w-full text-center py-2 bg-gov-failure hover:bg-red-700 text-white rounded-lg text-[10px] font-bold shadow-gov-sm transition"
                >
                  Upload Corrected Proof
                </button>
              </div>
            )}

            {/* Consent request banner */}
            {pendingConsents.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl shadow-gov-sm space-y-2">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                  <HeartHandshake className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>Consent Approval Required</span>
                </div>
                <p className="text-[11px] text-slate-650 leading-relaxed">
                  Food & Civil Supplies Department requests temporary access to verify your household catalog profile.
                </p>
                <button
                  onClick={() => navigate('/profile?tab=consents')}
                  className="w-full text-center py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-[10px] font-bold shadow-gov-sm transition"
                >
                  Review Access Permissions
                </button>
              </div>
            )}

            {activeApp?.status !== 'ACTION_REQUIRED' && pendingConsents.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-4 text-center text-slate-400 text-[10px] font-semibold shadow-gov-sm">
                ✔ All actions clear. No pending approvals.
              </div>
            )}
          </div>

          {/* Recent Activity timeline */}
          <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-450 pt-2">
            Recent Activity Feed
          </h3>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-gov-sm divide-y divide-slate-100">
            {notifications.slice(0, 3).map((ntf, idx) => (
              <div key={idx} className="py-2.5 first:pt-0 last:pb-0">
                <div className="flex justify-between items-start gap-1.5">
                  <span className="font-bold text-[11px] text-slate-800 line-clamp-1 leading-tight">
                    {ntf.title}
                  </span>
                  <span className="text-[8px] font-mono text-slate-400 shrink-0">
                    {ntf.timestamp}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                  {ntf.description}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};
