import React, { useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  requirePin?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  requirePin = false
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { reAuthenticate } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (requirePin) {
      if (!pin) {
        setError('Please enter your 6-digit application PIN.');
        return;
      }
      const isValid = await reAuthenticate(pin);
      if (!isValid) {
        setError('Incorrect PIN. For testing, use "123456" or "1234".');
        return;
      }
    }

    onConfirm();
    setPin('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-md rounded-xl shadow-gov-lg border border-slate-100 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            {requirePin ? (
              <ShieldAlert className="w-5 h-5 text-gov-primary" />
            ) : (
              <div className="w-2.5 h-2.5 bg-gov-secondary rounded-full animate-ping" />
            )}
            <h3 className="font-bold text-slate-800">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-650 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">{description}</p>

            {requirePin && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Enter 6-Digit PIN to Authorize Action
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, ''));
                    setError('');
                  }}
                  placeholder="••••••"
                  className="w-full text-center tracking-[1em] text-lg font-bold py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-gov-secondary bg-slate-50 focus:bg-white transition"
                  autoFocus
                />
                <p className="text-[10px] text-slate-400">
                  Tip: Use demo PIN <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-gov-primary font-semibold">123456</code> to verify this sensitive action.
                </p>
              </div>
            )}

            {error && (
              <div className="text-xs text-gov-failure font-medium bg-red-50 p-2.5 rounded-lg border border-red-150">
                {error}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-150 rounded-lg transition"
            >
              {cancelText}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-gov-primary hover:bg-slate-800 rounded-lg shadow-gov-sm transition"
            >
              {confirmText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
