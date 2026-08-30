import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemo, ServiceWorkflowStep } from '../context/DemoContext';
import { ProgressBar } from '../components/ProgressBar';
import { 
  ArrowRight, ShieldAlert, Sparkles, Upload, FileText, CheckCircle2, 
  ChevronRight, BrainCircuit, HeartHandshake, FileCheck, RefreshCw, X, ShieldCheck
} from 'lucide-react';
import { Modal } from '../components/Modal';

export const ServiceWorkflow: React.FC = () => {
  const {
    currentStep, setWorkflowStep, nlQuery, submitServiceRequest,
    uploadDocument, ocrFields, updateOcrField, ocrConfidence, uploadedDoc
  } = useDemo();
  const navigate = useNavigate();

  // Workflow steps for the ProgressBar
  const steps = [
    "Intents Suggestion",
    "Data Preview",
    "Consent Management",
    "Document Upload",
    "OCR Verification",
    "Final Submission"
  ];

  // Map step index
  const getStepIndex = (step: ServiceWorkflowStep): number => {
    switch (step) {
      case 'INPUT':
      case 'ANALYZING':
      case 'INTENT_DETECTED': return 0;
      case 'DEPT_PREVIEW': return 1;
      case 'CONSENT_FORM': return 2;
      case 'DOC_UPLOAD': return 3;
      case 'OCR_PROCESSING': return 4;
      case 'FINAL_REVIEW': return 5;
      case 'SUCCESS_SPLASH': return 5;
      default: return 0;
    }
  };

  // State checks
  const [consentsApproved, setConsentsApproved] = useState({
    revenue: false,
    food: false,
    rural: false
  });
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [activeConsentDept, setActiveConsentDept] = useState<'revenue' | 'food' | 'rural' | null>(null);

  const [expandedPrivacy, setExpandedPrivacy] = useState<{ [key: string]: boolean }>({});
  const [isUploading, setIsUploading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Automatically advance ANALYZING to INTENT_DETECTED after 2s
  useEffect(() => {
    if (currentStep === 'ANALYZING') {
      const timer = setTimeout(() => {
        setWorkflowStep('INTENT_DETECTED');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Expand helper
  const togglePrivacy = (key: string) => {
    setExpandedPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Document Upload trigger
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // Simulate upload delay
    setTimeout(async () => {
      setIsUploading(false);
      await uploadDocument({ name: file.name, size: file.size });
    }, 1500);
  };

  // Consent Actions
  const openConsentPrompt = (dept: 'revenue' | 'food' | 'rural') => {
    setActiveConsentDept(dept);
    setShowConsentModal(true);
  };

  const handleConsentConfirm = () => {
    if (activeConsentDept) {
      setConsentsApproved(prev => ({ ...prev, [activeConsentDept]: true }));
    }
    setShowConsentModal(false);
    setActiveConsentDept(null);
  };

  const handleConsentReject = (dept: 'revenue' | 'food' | 'rural') => {
    setConsentsApproved(prev => ({ ...prev, [dept]: false }));
  };

  const isAllConsentApproved = consentsApproved.revenue && consentsApproved.food && consentsApproved.rural;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2">
      {/* Workflow Navigation Tracker */}
      {currentStep !== 'ANALYZING' && currentStep !== 'SUCCESS_SPLASH' && (
        <ProgressBar steps={steps} currentStepIndex={getStepIndex(currentStep)} />
      )}

      {/* Render Steps */}
      {currentStep === 'ANALYZING' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-gov-md space-y-6 flex flex-col items-center justify-center min-h-[45vh]">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
            <BrainCircuit className="w-6 h-6 text-indigo-600 absolute top-5 left-5 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-800 animate-pulse">Understanding your request...</h2>
            <p className="text-xs text-slate-450 max-w-sm leading-relaxed">
              GovMesh AI is parsing search intent, mapping required fields, and loading coordinate API policies.
            </p>
          </div>
        </div>
      )}

      {currentStep === 'INTENT_DETECTED' && (
        <div className="space-y-6">
          {/* Main Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-gov-md space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-450">
                  GovMesh AI Assistant Suggestion
                </span>
                <h2 className="text-lg font-extrabold text-slate-800 leading-tight">
                  Request Identified: <span className="text-indigo-600">Address Change</span>
                </h2>
              </div>
            </div>

            <p className="text-xs text-slate-550 leading-relaxed font-semibold">
              Based on your search prompt: <span className="italic font-bold text-slate-800 bg-slate-50 px-2 py-1 rounded">"{nlQuery}"</span>, GovMesh has identified that this action impacts three connected government registries:
            </p>

            {/* Suggested Departments */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                <span className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-700">1</span>
                <h4 className="font-bold text-xs text-slate-800">Revenue Department</h4>
                <p className="text-[10px] text-slate-500 leading-normal">Updates primary civic address indices and land registries.</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                <span className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-700">2</span>
                <h4 className="font-bold text-xs text-slate-800">Food & Civil Supplies</h4>
                <p className="text-[10px] text-slate-500 leading-normal">Updates eligible Public Distribution System (PDS) ration details.</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                <span className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-700">3</span>
                <h4 className="font-bold text-xs text-slate-800">Rural Development</h4>
                <p className="text-[10px] text-slate-500 leading-normal">Synchronizes local Panchayat databases and municipal files.</p>
              </div>
            </div>

            {/* AI Disclaimer */}
            <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-start gap-2.5 text-[10px] text-indigo-850">
              <ShieldAlert className="w-4.5 h-4.5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold">AI Assistant Disclosure:</span> GovMesh matches natural language queries with matching services for preview. It does not independently overwrite official records or bypass departmental rules. Actual executions are governed entirely by deterministic policy and your explicit consent.
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={() => setWorkflowStep('DEPT_PREVIEW')}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-gov-primary hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-gov-sm transition"
            >
              <span>Review Request Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {currentStep === 'DEPT_PREVIEW' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-gov-md space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 uppercase tracking-wide">Data Sharing Preview</h2>
              <p className="text-xs text-slate-500 mt-1">
                Review exactly what parameters are requested, their purpose, and why each department needs access.
              </p>
            </div>

            {/* Department cards preview lists */}
            <div className="space-y-4">
              
              {/* Revenue */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-gov-sm">
                <div className="px-4 py-3 bg-slate-550 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                  <h4 className="font-bold text-xs text-slate-800">Revenue Department</h4>
                  <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">Mandatory</span>
                </div>
                <div className="p-4 space-y-3.5 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-450 uppercase">Data Scope Requested</span>
                      <p className="font-semibold text-slate-700 mt-0.5">Name, New Address, Address Proof (validated OCR outcome)</p>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-450 uppercase">Purpose of access</span>
                      <p className="font-semibold text-slate-700 mt-0.5">Validate residential jurisdiction and update state land registries.</p>
                    </div>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => togglePrivacy('rev')}
                      className="text-[10px] font-bold text-indigo-650 hover:underline"
                    >
                      Why is this data needed?
                    </button>
                    {expandedPrivacy['rev'] && (
                      <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-100 text-[10px] text-slate-500 leading-relaxed">
                        Under Maharashtra Land Revenue Code 1966, any update in residential indices must be verified against certified utility billing documents to prevent land index fraud and locate proper tax zones.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Food Dept */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-gov-sm">
                <div className="px-4 py-3 bg-slate-550 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                  <h4 className="font-bold text-xs text-slate-800">Food & Civil Supplies Department</h4>
                  <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">Mandatory</span>
                </div>
                <div className="p-4 space-y-3.5 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-450 uppercase">Data Scope Requested</span>
                      <p className="font-semibold text-slate-700 mt-0.5">Name, New Address, Document verification result</p>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-450 uppercase">Purpose of access</span>
                      <p className="font-semibold text-slate-700 mt-0.5">Recalculate PDS quotas and synchronize ration card card records.</p>
                    </div>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => togglePrivacy('food')}
                      className="text-[10px] font-bold text-indigo-650 hover:underline"
                    >
                      Why is this data needed?
                    </button>
                    {expandedPrivacy['food'] && (
                      <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-100 text-[10px] text-slate-500 leading-relaxed">
                        Necessary under National Food Security Act (NFSA) guidelines to prevent dual allocations of ration benefits across districts. Address verification matches district indices to set proper grain quotas.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Rural */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-gov-sm">
                <div className="px-4 py-3 bg-slate-550 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                  <h4 className="font-bold text-xs text-slate-800">Rural Development Department</h4>
                  <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">Mandatory</span>
                </div>
                <div className="p-4 space-y-3.5 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-450 uppercase">Data Scope Requested</span>
                      <p className="font-semibold text-slate-700 mt-0.5">Name, New Address, local utility service records</p>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-450 uppercase">Purpose of access</span>
                      <p className="font-semibold text-slate-700 mt-0.5">Synchronize local Gram Panchayat resident databases.</p>
                    </div>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => togglePrivacy('rural')}
                      className="text-[10px] font-bold text-indigo-650 hover:underline"
                    >
                      Why is this data needed?
                    </button>
                    {expandedPrivacy['rural'] && (
                      <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-100 text-[10px] text-slate-500 leading-relaxed">
                        Required for Gram Panchayat voter register updates and local water/electricity utilities configurations inside village administrative borders.
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setWorkflowStep('INTENT_DETECTED')}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              Back
            </button>
            <button
              onClick={() => setWorkflowStep('CONSENT_FORM')}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-gov-primary hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-gov-sm transition"
            >
              <span>Continue to Consent</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {currentStep === 'CONSENT_FORM' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-gov-md space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 uppercase tracking-wide">Review Data Sharing Consent</h2>
              <p className="text-xs text-slate-550 mt-1 font-semibold">
                You must explicitly approve data sharing for each involved department before starting the coordinated workflow.
              </p>
            </div>

            <div className="space-y-4">
              {/* Revenue Consent Card */}
              <div className={`border p-4.5 rounded-xl transition shadow-gov-sm ${
                consentsApproved.revenue ? 'border-emerald-250 bg-emerald-50/20' : 'border-slate-200'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800">REVENUE DEPARTMENT CONSENT</h4>
                    <ul className="text-[11px] text-slate-600 mt-2 space-y-1 pl-1.5 list-disc list-inside leading-relaxed font-semibold">
                      <li>Scope: Name, Address, Address Proof verification</li>
                      <li>Purpose: Address registry update</li>
                      <li>Duration: 30 Days</li>
                    </ul>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {consentsApproved.revenue ? (
                      <>
                        <span className="text-xs font-bold text-gov-success flex items-center gap-1">
                          ✓ Consent Approved
                        </span>
                        <button
                          onClick={() => handleConsentReject('revenue')}
                          className="text-[10px] text-slate-400 hover:text-slate-650 hover:underline px-2.5 py-1 border border-slate-200 rounded bg-white font-semibold"
                        >
                          Revoke
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => openConsentPrompt('revenue')}
                          className="px-4 py-2 bg-gov-primary hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-gov-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleConsentReject('revenue')}
                          className="px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 bg-white"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Food Consent Card */}
              <div className={`border p-4.5 rounded-xl transition shadow-gov-sm ${
                consentsApproved.food ? 'border-emerald-250 bg-emerald-50/20' : 'border-slate-200'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800">FOOD & CIVIL SUPPLIES CONSENT</h4>
                    <ul className="text-[11px] text-slate-600 mt-2 space-y-1 pl-1.5 list-disc list-inside leading-relaxed font-semibold">
                      <li>Scope: Name, Address, Document verification status</li>
                      <li>Purpose: Ration card sync and quota mapping</li>
                      <li>Duration: 30 Days</li>
                    </ul>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {consentsApproved.food ? (
                      <>
                        <span className="text-xs font-bold text-gov-success flex items-center gap-1">
                          ✓ Consent Approved
                        </span>
                        <button
                          onClick={() => handleConsentReject('food')}
                          className="text-[10px] text-slate-400 hover:text-slate-650 hover:underline px-2.5 py-1 border border-slate-200 rounded bg-white font-semibold"
                        >
                          Revoke
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => openConsentPrompt('food')}
                          className="px-4 py-2 bg-gov-primary hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-gov-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleConsentReject('food')}
                          className="px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 bg-white"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Rural Consent Card */}
              <div className={`border p-4.5 rounded-xl transition shadow-gov-sm ${
                consentsApproved.rural ? 'border-emerald-250 bg-emerald-50/20' : 'border-slate-200'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800">RURAL DEVELOPMENT CONSENT</h4>
                    <ul className="text-[11px] text-slate-600 mt-2 space-y-1 pl-1.5 list-disc list-inside leading-relaxed font-semibold">
                      <li>Scope: Name, Address, utility record mapping</li>
                      <li>Purpose: Panchayat database synchronization</li>
                      <li>Duration: 30 Days</li>
                    </ul>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {consentsApproved.rural ? (
                      <>
                        <span className="text-xs font-bold text-gov-success flex items-center gap-1">
                          ✓ Consent Approved
                        </span>
                        <button
                          onClick={() => handleConsentReject('rural')}
                          className="text-[10px] text-slate-400 hover:text-slate-650 hover:underline px-2.5 py-1 border border-slate-200 rounded bg-white font-semibold"
                        >
                          Revoke
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => openConsentPrompt('rural')}
                          className="px-4 py-2 bg-gov-primary hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-gov-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleConsentReject('rural')}
                          className="px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 bg-white"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setWorkflowStep('DEPT_PREVIEW')}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              Back
            </button>
            <button
              onClick={() => setWorkflowStep('DOC_UPLOAD')}
              disabled={!isAllConsentApproved}
              className={`flex items-center gap-1.5 px-5 py-2.5 text-white rounded-lg text-xs font-bold shadow-gov-sm transition ${
                isAllConsentApproved ? 'bg-gov-primary hover:bg-slate-800' : 'bg-slate-350 cursor-not-allowed'
              }`}
            >
              <span>Continue to Document Upload</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {currentStep === 'DOC_UPLOAD' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-gov-md space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 uppercase tracking-wide">Upload Supporting Documents</h2>
              <p className="text-xs text-slate-500 mt-1">
                Please upload a valid scan of your Address Proof (Electricity Bill, Rent Agreement, or Aadhaar) to proceed.
              </p>
            </div>

            {/* Drag & Drop Upload Block */}
            {!uploadedDoc && (
              <div className="border-2 border-dashed border-slate-300 hover:border-gov-secondary rounded-2xl p-10 text-center transition bg-slate-50/50 flex flex-col items-center justify-center relative cursor-pointer group">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                
                {isUploading ? (
                  <div className="space-y-4">
                    <RefreshCw className="w-8 h-8 text-gov-secondary animate-spin mx-auto" />
                    <p className="text-xs font-bold text-slate-650 animate-pulse">Uploading file... please wait...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-gov-sm text-slate-400 group-hover:text-gov-secondary transition mx-auto border border-slate-100">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-850">
                        Drag & Drop document here, or <span className="text-indigo-650 hover:underline">Browse Files</span>
                      </p>
                      <p className="text-[10px] text-slate-450 mt-1 font-semibold">
                        Supported Formats: PDF, JPG, PNG (Max 5MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Uploaded doc file card */}
            {uploadedDoc && (
              <div className="border border-emerald-200 bg-emerald-50/15 rounded-xl p-4.5 flex items-center justify-between shadow-gov-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-lg flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 leading-tight">
                      {uploadedDoc.name}
                    </h4>
                    <span className="text-[9px] text-slate-450 font-mono mt-1 block">
                      Size: {uploadedDoc.size} • Uploaded: {uploadedDoc.uploadedAt}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Uploaded Successful
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setWorkflowStep('CONSENT_FORM')}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              Back
            </button>
            <button
              onClick={() => {
                if (uploadedDoc) {
                  setWorkflowStep('OCR_PROCESSING');
                  // Trigger auto transitions inside OCR_PROCESSING
                  setTimeout(() => {
                    setWorkflowStep('FINAL_REVIEW');
                  }, 2500);
                }
              }}
              disabled={!uploadedDoc}
              className={`flex items-center gap-1.5 px-5 py-2.5 text-white rounded-lg text-xs font-bold shadow-gov-sm transition ${
                uploadedDoc ? 'bg-gov-primary hover:bg-slate-800' : 'bg-slate-350 cursor-not-allowed'
              }`}
            >
              <span>Analyze with GovMesh OCR</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {currentStep === 'OCR_PROCESSING' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-gov-md space-y-6 flex flex-col items-center justify-center min-h-[45vh]">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
            <BrainCircuit className="w-6 h-6 text-indigo-600 absolute top-5 left-5" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-800 animate-pulse">Running document entity extractions...</h2>
            <p className="text-xs text-slate-450 max-w-sm leading-relaxed">
              GovMesh OCR is classifying document types, matching structural schemas, and reading textual values.
            </p>
          </div>
        </div>
      )}

      {currentStep === 'FINAL_REVIEW' && ocrFields && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-gov-md space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 uppercase tracking-wide">Review Your Request</h2>
              <p className="text-xs text-slate-550 mt-1 font-semibold">
                Confirm extracted text details and verify the coordination roadmap before submitting.
              </p>
            </div>

            {/* Section 1: Extracted OCR fields */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-450">
                  OCR Extracted Data (Advisory)
                </span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-gov-sm">
                  Confidence: {ocrConfidence}%
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase font-bold text-slate-450">Name on Document</label>
                  <input
                    type="text"
                    value={ocrFields.name}
                    onChange={(e) => updateOcrField('name', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase font-bold text-slate-450">Issue Date</label>
                  <input
                    type="text"
                    value={ocrFields.issueDate}
                    onChange={(e) => updateOcrField('issueDate', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="block text-[9px] uppercase font-bold text-slate-450">New Address Extracted</label>
                  <textarea
                    rows={2}
                    value={ocrFields.address}
                    onChange={(e) => updateOcrField('address', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white resize-none"
                  />
                </div>
              </div>

              <p className="text-[10px] text-slate-400 italic">
                * Extracted information is provided for review and does not automatically modify authoritative government records.
              </p>
            </div>

            {/* Section 2: Summary Checks */}
            <div className="border-t border-slate-100 pt-5 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Workflow Target</span>
                <span className="font-bold text-slate-800">Address Change</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Approved Consents</span>
                <span className="font-bold text-slate-800">Revenue, Food, Rural ✓ Approved</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Uploaded Proof</span>
                <span className="font-bold text-slate-800">{uploadedDoc?.name}</span>
              </div>
            </div>

            {/* Section 3: Checkbox Terms */}
            <div className="border-t border-slate-100 pt-5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-350 text-indigo-650 focus:ring-indigo-500 mt-0.5 shrink-0"
                />
                <span className="text-xs text-slate-650 font-semibold leading-relaxed">
                  I confirm that the information provided is accurate and authorize GovMesh to coordinate this request across Revenue, Food & Civil Supplies, and Rural Development registries.
                </span>
              </label>
            </div>

          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setWorkflowStep('DOC_UPLOAD')}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              Back
            </button>
            <button
              onClick={() => submitServiceRequest(consentsApproved)}
              disabled={!termsAccepted}
              className={`flex items-center gap-1.5 px-6 py-3 text-white rounded-lg text-xs font-extrabold shadow-gov-sm transition ${
                termsAccepted ? 'bg-gov-success hover:bg-emerald-700' : 'bg-slate-350 cursor-not-allowed'
              }`}
            >
              <span>Confirm & Start Workflow</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {currentStep === 'SUCCESS_SPLASH' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 md:p-12 text-center shadow-gov-md space-y-6 max-w-2xl mx-auto flex flex-col items-center justify-center py-10">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center shadow-gov-sm">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Coordinated Request Created Successfully</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              GovMesh has initialized a secure orchestration flow. A unified timeline is tracking steps across 3 departments.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2 w-full max-w-md text-xs">
            <div className="flex justify-between">
              <span className="text-slate-450 uppercase tracking-wide font-bold text-[10px]">Application ID</span>
              <span className="font-bold text-slate-800 font-mono">GM-2026-000124</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-450 uppercase tracking-wide font-bold text-[10px]">Workflow Core</span>
              <span className="font-semibold text-slate-700">ADDRESS_CHANGE_V1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-450 uppercase tracking-wide font-bold text-[10px]">Registry Status</span>
              <span className="font-bold text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider text-[9px]">In Progress</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md pt-2">
            <button
              onClick={() => navigate('/track')}
              className="w-full py-3 bg-gov-primary hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-gov-sm transition"
            >
              Track Application Progress
            </button>
            <button
              onClick={() => {
                setWorkflowStep('INPUT');
                navigate('/');
              }}
              className="w-full py-3 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 bg-white"
            >
              Return Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Consent Authorization Password modal */}
      <Modal
        isOpen={showConsentModal}
        onClose={() => {
          setShowConsentModal(false);
          setActiveConsentDept(null);
        }}
        onConfirm={handleConsentConfirm}
        title="Authorize Data Sharing"
        description={`Approving this consent will issue a purpose-bound access ticket to the ${
          activeConsentDept === 'revenue' ? 'Revenue Department' :
          activeConsentDept === 'food' ? 'Food & Civil Supplies Department' : 'Rural Development Department'
        }. GovMesh will map and forward only the authorized data scope.`}
        requirePin={true}
        confirmText="Approve Consent"
        cancelText="Cancel"
      />
    </div>
  );
};
