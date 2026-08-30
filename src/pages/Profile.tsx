import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDemo } from '../context/DemoContext';
import { useSearchParams } from 'react-router-dom';
import { 
  User, Shield, FolderHeart, ShieldCheck, KeyRound, Key, Laptop,
  HelpCircle, Trash2, FileText, AlertCircle, Award, CheckCircle2, Lock
} from 'lucide-react';
import { Modal } from '../components/Modal';

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { documents, resetDemo } = useDemo();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active tab via query params
  const activeTab = searchParams.get('tab') || 'profile';

  // State checks
  const [showPinModal, setShowPinModal] = useState(false);
  const [showLogoutAllModal, setShowLogoutAllModal] = useState(false);
  const [showDeleteDocModal, setShowDeleteDocModal] = useState<string | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: user?.address || '',
    district: user?.district || '',
    state: user?.state || ''
  });

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setEditMode(false);
  };

  const handleConfirmPinChange = () => {
    setShowPinModal(false);
    alert("Application authorization PIN successfully modified.");
  };

  const handleConfirmLogoutAll = () => {
    setShowLogoutAllModal(false);
    alert("All other active device sessions have been securely terminated.");
  };

  return (
    <div className="space-y-6 py-2">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Citizen Profile Core</h1>
        <p className="text-xs text-slate-550 font-semibold mt-1">
          Review verified registries, manage uploaded certificate files, and configure application security policies.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => handleTabChange('profile')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors -mb-[2px] ${
            activeTab === 'profile'
              ? 'border-indigo-650 text-indigo-750 font-extrabold'
              : 'border-transparent text-slate-450 hover:text-slate-700'
          }`}
        >
          My Profile
        </button>
        <button
          onClick={() => handleTabChange('wallet')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors -mb-[2px] ${
            activeTab === 'wallet'
              ? 'border-indigo-650 text-indigo-750 font-extrabold'
              : 'border-transparent text-slate-450 hover:text-slate-700'
          }`}
        >
          Document Wallet
        </button>
        <button
          onClick={() => handleTabChange('security')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors -mb-[2px] ${
            activeTab === 'security'
              ? 'border-indigo-650 text-indigo-750 font-extrabold'
              : 'border-transparent text-slate-450 hover:text-slate-700'
          }`}
        >
          Privacy & Security
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'profile' && user && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main profile Card info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-gov-sm space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wide">
                  Personal Information
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-gov-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Identity</span>
                </span>
              </div>

              {!editMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs leading-relaxed font-semibold">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Full Name</span>
                    <p className="text-slate-850 text-sm mt-0.5">{user.name}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Citizen Reference ID</span>
                    <p className="text-slate-850 font-mono text-sm mt-0.5">{user.citizenId}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Mobile Number</span>
                    <p className="text-slate-850 text-sm mt-0.5">{user.mobile}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Email ID</span>
                    <p className="text-slate-850 text-sm mt-0.5">{user.email || 'Not Provided'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Verified Address</span>
                    <p className="text-slate-850 text-sm mt-0.5">{user.address}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">District</span>
                    <p className="text-slate-850 text-sm mt-0.5">{user.district}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">State</span>
                    <p className="text-slate-850 text-sm mt-0.5">{user.state}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600">Full Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-gov-secondary bg-slate-50"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600">Email ID</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-gov-secondary bg-slate-50"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="font-bold text-slate-600">Verified Address</label>
                      <textarea
                        rows={2}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-gov-secondary bg-slate-50 resize-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600">District</label>
                      <input
                        type="text"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-gov-secondary bg-slate-50"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600">State</label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-gov-secondary bg-slate-50"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gov-primary hover:bg-slate-800 text-white rounded-lg font-bold shadow-gov-sm"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              )}

              {!editMode && (
                <div className="border-t border-slate-100 pt-4 text-right">
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 bg-gov-primary hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-gov-sm transition border"
                  >
                    Edit Profile Details
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick info panel */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-gov-sm space-y-4">
              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">
                Consent Preferences
              </h4>
              <div className="space-y-3 text-xs leading-relaxed font-semibold">
                <div className="flex justify-between">
                  <span className="text-slate-400">Language preference</span>
                  <span className="font-bold text-slate-800">English (EN)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Registry integration</span>
                  <span className="font-bold text-gov-success">Active sandbox</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Last auth pin check</span>
                  <span className="font-bold text-slate-800">Today, 10:05 AM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'wallet' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-gov-sm flex items-center justify-between text-xs text-slate-550 leading-relaxed font-semibold">
            <div className="flex items-center gap-2">
              <FolderHeart className="w-5 h-5 text-indigo-500 shrink-0" />
              <span>
                Document wallet records are stored locally for active coordinate workflow mappings.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.length === 0 ? (
              <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-450 text-xs shadow-gov-sm">
                Wallet is currently empty. Upload documents during service request steps.
              </div>
            ) : (
              documents.map(doc => (
                <div key={doc.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-gov-sm flex items-center justify-between hover:shadow-gov-md transition gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-650 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 leading-tight">
                        {doc.name}
                      </h4>
                      <span className="text-[9px] text-slate-450 mt-1 block">
                        Size: {doc.size} • Uploaded: {doc.uploadedAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowDeleteDocModal(doc.id)}
                      className="p-2 text-slate-400 hover:text-gov-failure hover:bg-red-50 rounded transition"
                      title="Delete from wallet"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* PIN card settings */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-gov-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wide">
                Security Activity Toggles
              </h3>

              <div className="divide-y divide-slate-100 text-xs font-semibold">
                <div className="py-4 first:pt-0 flex items-center justify-between gap-4">
                  <div>
                    <h5 className="font-bold text-slate-850 text-xs">Application PIN</h5>
                    <p className="text-[10px] text-slate-500 mt-0.5">Used to authenticate sensitive actions like consent grants or document submissions.</p>
                  </div>
                  <button
                    onClick={() => setShowPinModal(true)}
                    className="px-4 py-2 border border-slate-200 text-indigo-655 hover:bg-indigo-50 font-bold rounded-lg text-xs shrink-0"
                  >
                    Change PIN
                  </button>
                </div>

                <div className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <h5 className="font-bold text-slate-850 text-xs">Session Management</h5>
                    <p className="text-[10px] text-slate-500 mt-0.5">Disconnect all other browser sessions accessing this citizen profile.</p>
                  </div>
                  <button
                    onClick={() => setShowLogoutAllModal(true)}
                    className="px-4 py-2 border border-red-200 text-gov-failure hover:bg-red-50 font-bold rounded-lg text-xs shrink-0"
                  >
                    Logout All Devices
                  </button>
                </div>
              </div>
            </div>

            {/* Sessions list */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-gov-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wide">
                Active Browser Sessions
              </h3>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <Laptop className="w-5 h-5 text-gov-primary shrink-0" />
                  <div className="flex-1">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>Windows 11 PC (Chrome Web)</span>
                      <span className="text-gov-success text-[10px]">Active Now</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Pune IP: 157.38.109.12 • Session initiated today, 10:04 AM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Retention policies */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-gov-sm space-y-4">
              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">
                Data Retention Rules
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                Under sandbox parameters, document uploads are expired after 30 days of inactivity. Hashed sharing logs remain logged permanently in the append-only registry ledger.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialogs */}
      <Modal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onConfirm={handleConfirmPinChange}
        title="Change Application PIN"
        description="Verify your current credentials and enter a new 6-digit verification PIN to confirm changes."
        requirePin={true}
        confirmText="Save New PIN"
        cancelText="Cancel"
      />

      <Modal
        isOpen={showLogoutAllModal}
        onClose={() => setShowLogoutAllModal(false)}
        onConfirm={handleConfirmLogoutAll}
        title="Logout All Devices"
        description="This will instantly invalidate JWT session tokens across all other devices. Only your current browser session remains authenticated."
        requirePin={true}
        confirmText="Confirm Disconnection"
        cancelText="Cancel"
      />
    </div>
  );
};
