import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Smartphone, Lock, Eye, AlertCircle, HelpCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, verifyOtp, otpSent, mobileNumber } = useAuth();
  const navigate = useNavigate();

  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!mobile || mobile.trim().length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    const success = await login(mobile);
    setLoading(false);

    if (!success) {
      setError('Invalid mobile format. Please use numbers only.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    const success = await verifyOtp(otp);
    setLoading(false);

    if (success) {
      navigate('/');
    } else {
      setError('Incorrect OTP. Try the sandbox default OTP: 123456');
    }
  };

  const triggerDemoLogin = async () => {
    setLoading(true);
    setMobile('+91 98765 43210');
    await login('+919876543210');
    setOtp('123456');
    const success = await verifyOtp('123456');
    setLoading(false);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-gov-lg overflow-hidden">
        
        {/* Form Header */}
        <div className="px-6 py-8 text-center bg-slate-50 border-b border-slate-100">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white mx-auto mb-3 shadow-gov-sm">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Sign In to GovMesh</h2>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            One Citizen Identity. Access coordinated services without department portal switching.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8 space-y-6">
          {error && (
            <div className="flex items-center gap-2 text-xs font-bold text-gov-failure bg-red-50 border border-red-150 p-3.5 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!otpSent ? (
            /* Step 1: Mobile Entry */
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-650">
                  Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-xs font-semibold text-slate-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => {
                      setMobile(e.target.value.replace(/\D/g, '').slice(0, 10));
                      setError('');
                    }}
                    placeholder="Enter mobile number"
                    className="w-full pl-12 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-gov-secondary bg-slate-50 focus:bg-white transition"
                    disabled={loading}
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gov-primary hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-gov-sm transition disabled:opacity-50"
              >
                <span>Send One-Time Password</span>
              </button>
            </form>
          ) : (
            /* Step 2: OTP Entry */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-650">
                    Verification Code (OTP)
                  </label>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Sent to {mobileNumber}
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ''));
                    setError('');
                  }}
                  placeholder="••••••"
                  className="w-full text-center tracking-[1em] text-lg font-bold py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-gov-secondary bg-slate-50 focus:bg-white transition"
                  disabled={loading}
                  required
                />
                <p className="text-[10px] text-slate-400">
                  Tip: Sandbox verification code is <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-gov-primary font-semibold">123456</code>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gov-success hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-gov-sm transition disabled:opacity-50"
              >
                <span>Verify & Sign In</span>
              </button>
            </form>
          )}

          {/* Quick Demo Bypass */}
          <div className="border-t border-slate-100 pt-5">
            <button
              onClick={triggerDemoLogin}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-yellow-400 rounded-xl text-xs font-bold shadow-gov-sm transition border border-slate-800"
            >
              <Smartphone className="w-4 h-4 text-yellow-400" />
              <span>Bypass Sandbox (Demo Access)</span>
            </button>
          </div>
        </div>

        {/* Footer Support links */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-bold">
          <Link to="/help" className="hover:underline flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Support Helpdesk</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/profile?tab=security" className="hover:underline">Privacy Policy</Link>
            <span>•</span>
            <span className="text-slate-400">SIH 2026 Core</span>
          </div>
        </div>

      </div>
    </div>
  );
};
