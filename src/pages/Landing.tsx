import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowRight, ShieldCheck, RefreshCw, KeyRound, Eye, FileText, 
  HelpCircle, Database, GitMerge, FileCheck
} from 'lucide-react';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleStart = () => {
    if (isAuthenticated) {
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-750 font-bold rounded-full text-xs border border-indigo-150">
          <AwardIcon className="w-3.5 h-3.5" />
          <span>SIH 2026 Core Demonstration Concept</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          One Citizen Request.<br />
          <span className="text-indigo-600 bg-gradient-to-r from-indigo-600 to-blue-650 bg-clip-text text-transparent">
            Multiple Government Systems.
          </span><br />
          One Coordinated Workflow.
        </h1>

        <p className="text-sm md:text-base text-slate-550 max-w-2xl mx-auto leading-relaxed font-semibold">
          Access connected government services through a single, transparent, and consent-driven experience. GovMesh coordinates backend registries to complete requests without legacy portal hopping.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={handleStart}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-gov-md transition-all hover:translate-x-0.5"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition"
          >
            <span>How GovMesh Works</span>
          </a>
        </div>
      </div>

      {/* Visual System Interaction Flow Diagram */}
      <div id="how-it-works" className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-gov-md max-w-5xl mx-auto">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-center text-slate-450 mb-8">
          GovMesh Orchestration Paradigm
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-7 items-center gap-6 text-center">
          
          {/* Step 1: Citizen */}
          <div className="lg:col-span-1 flex flex-col items-center p-4 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white mb-2 shadow-gov-sm">
              <UserIcon className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-xs">Citizen</h4>
            <p className="text-[10px] text-slate-500 mt-1">One description or selection</p>
          </div>

          {/* Connector 1 */}
          <div className="lg:col-span-1 flex flex-col items-center justify-center text-indigo-500">
            <ArrowRight className="w-5 h-5 rotate-90 lg:rotate-0" />
            <span className="text-[9px] font-bold uppercase mt-1">Consent</span>
          </div>

          {/* Step 2: GovMesh Engine */}
          <div className="lg:col-span-2 flex flex-col items-center p-5 bg-indigo-50/50 border border-indigo-100 rounded-xl relative ring-2 ring-indigo-50 ring-offset-2">
            <div className="w-14 h-14 rounded-full bg-indigo-850 flex items-center justify-center text-white mb-2 shadow-gov-md">
              <GitMerge className="w-7 h-7 text-indigo-400" />
            </div>
            <h4 className="font-bold text-slate-900 text-xs">GovMesh Core</h4>
            <p className="text-[10px] text-slate-600 mt-1.5 leading-normal">
              Resolves schemas, maps intents, tracks audits, and queues actions.
            </p>
          </div>

          {/* Connector 2 */}
          <div className="lg:col-span-1 flex flex-col items-center justify-center text-indigo-500">
            <ArrowRight className="w-5 h-5 rotate-90 lg:rotate-0" />
            <span className="text-[9px] font-bold uppercase mt-1">Orchestrator</span>
          </div>

          {/* Step 3: Departments */}
          <div className="lg:col-span-2 flex flex-col gap-2.5">
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg text-left">
              <div className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-700">R</div>
              <div>
                <h5 className="font-bold text-[11px] text-slate-800 leading-none">Revenue Department</h5>
                <span className="text-[9px] text-slate-500">Verification & Land Records</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg text-left">
              <div className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-700">F</div>
              <div>
                <h5 className="font-bold text-[11px] text-slate-800 leading-none">Food & Civil Supplies</h5>
                <span className="text-[9px] text-slate-500">Ration PDS Card Sync</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg text-left">
              <div className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-700">P</div>
              <div>
                <h5 className="font-bold text-[11px] text-slate-800 leading-none">Rural Development</h5>
                <span className="text-[9px] text-slate-500">Gram Panchayat Records</span>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 font-bold rounded-lg text-[10px]">
            <FileCheck className="w-3.5 h-3.5" />
            <span>Result: One Unified Application ID & Live Coordinating Tracking Timeline</span>
          </div>
        </div>
      </div>

      {/* Why GovMesh Section */}
      <div className="space-y-8 max-w-5xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900">Why GovMesh?</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Eliminating portal hopping through secure API orchestrations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {whyCards.map((card, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-gov-sm space-y-3 hover:shadow-gov-md transition">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                {card.icon}
              </div>
              <h4 className="font-bold text-slate-800 text-sm">{card.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Security & Data Minimization Section */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 md:p-12 shadow-gov-lg max-w-5xl mx-auto relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
          <ShieldCheck className="w-96 h-96" />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              A Platform Built Entirely on Trust and Consent
            </h2>
            <p className="text-xs text-slate-350 leading-relaxed">
              GovMesh does not create central databases. It is an authorization exchange mechanism. Data is only shared with selected departments for specified purposes and under explicit durations.
            </p>
            <div className="space-y-3">
              {securityBulletPoints.map((pt, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-900 text-indigo-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-200">{pt}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {securityCards.map((card, idx) => (
              <div key={idx} className="bg-slate-850 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="text-indigo-400">{card.icon}</div>
                <h5 className="font-bold text-slate-200 text-xs">{card.title}</h5>
                <p className="text-[10px] text-slate-400 leading-normal">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

const whyCards = [
  {
    title: 'One Application',
    desc: 'Enter your details or describe your changes once. GovMesh distributes it across all necessary departments.',
    icon: <FileText className="w-5 h-5" />
  },
  {
    title: 'Consent-Driven Data Sharing',
    desc: 'You decide exactly who gets to read what files. You retain absolute control to view, approve, or revoke authorizations.',
    icon: <Eye className="w-5 h-5" />
  },
  {
    title: 'Unified Timeline Tracking',
    desc: 'Track progress with a single tracking number. See live, step-by-step validations from every department in one view.',
    icon: <ClipboardIcon className="w-5 h-5" />
  },
  {
    title: 'Cross-Department Coordination',
    desc: 'State registries talk directly to each other via secure API brokers, resolving legacy silo communication bottlenecks.',
    icon: <GitMerge className="w-5 h-5" />
  },
  {
    title: 'Automatic Error Recovery',
    desc: 'If a department server goes offline, GovMesh automatically queues the workflow and retries when it recovers. No data is lost.',
    icon: <RefreshCw className="w-5 h-5" />
  },
  {
    title: 'Assistive Intent Mapping',
    desc: 'Describe what you need in plain text. Intelligent matching suggests the right departments without legal jargon.',
    icon: <HelpCircle className="w-5 h-5" />
  }
];

const securityBulletPoints = [
  "OAuth 2.0 / OpenID Connect Identity Control",
  "Purpose-Bound Schema Validations",
  "Append-Only Data Audit Ledgers",
  "Encrypted Data-In-Transit Transfers"
];

const securityCards = [
  {
    title: 'Secure Identity',
    desc: 'Access verified profile systems using secure single-sign-on protocols.',
    icon: <KeyRound className="w-4 h-4" />
  },
  {
    title: 'Data Minimization',
    desc: 'Departments only see data fields mandatory to verify your specific service.',
    icon: <Database className="w-4 h-4" />
  },
  {
    title: 'Transparent Audits',
    desc: 'Every data exchange event is logged into an immutable trail for citizen inspection.',
    icon: <FileCheck className="w-4 h-4" />
  },
  {
    title: 'Citizen Authority',
    desc: 'Revoke active consents instantly to disconnect departments from accessing documents.',
    icon: <ShieldCheck className="w-4 h-4" />
  }
];

// Helper mini components to prevent lucide-react name overlap issues
function AwardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  );
}

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ClipboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
  );
}
