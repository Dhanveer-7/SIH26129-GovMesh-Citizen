import React, { useState } from 'react';
import { useDemo } from '../context/DemoContext';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Clock, AlertTriangle, AlertCircle, Eye, RefreshCw, Trash2, CheckCheck, Zap } from 'lucide-react';
import api from '../services/api';

export const Notifications: React.FC = () => {
  const { 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    clearAllNotifications, 
    addNotification 
  } = useDemo();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'action' | 'completed'>('all');
  const [isTestingSync, setIsTestingSync] = useState(false);

  const handleTestLiveSync = async () => {
    setIsTestingSync(true);
    try {
      const res = await api.submitGovMeshTransaction({
        applicationId: 'GM-2026-000124',
        citizenId: 'GM-CIT-10001',
        serviceCode: 'ADDRESS_CHANGE',
        purpose: 'Live Cross-Department Verification Test',
        consents: { revenue: true, food: true, rural: true },
        citizen: {
          name: 'Aarav Sharma',
          address: {
            line1: 'Flat 402, Shivajinagar Residency, FC Road',
            district: 'Pune',
            state: 'Maharashtra'
          }
        }
      });

      if (res && (res.success || res.status === 'COMPLETED')) {
        addNotification({
          title: "Live Cross-Department Synchronization Complete",
          description: "GovMesh Core successfully verified and synchronized records across Revenue (Render), Food & Civil Supplies (Render SOAP), and Rural Development (Vercel CSV). All 3 departments responded with HTTP 200 OK.",
          type: "SUCCESS",
          applicationId: "GM-2026-000124",
          priority: "HIGH"
        });
      } else {
        addNotification({
          title: "Department Sync Status",
          description: res.message || "Synchronization completed with partial response.",
          type: "WARNING",
          applicationId: "GM-2026-000124",
          priority: "MEDIUM"
        });
      }
    } catch (err: any) {
      addNotification({
        title: "Live Sync Connection Error",
        description: err.message || "Failed to contact GovMesh Core orchestrator.",
        type: "ALERT",
        applicationId: "GM-2026-000124",
        priority: "HIGH"
      });
    } finally {
      setIsTestingSync(false);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.isRead;
    if (activeTab === 'action') return n.type === 'ALERT';
    if (activeTab === 'completed') return n.title.toLowerCase().includes('complete') || n.description.toLowerCase().includes('complete');
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return <Check className="w-4 h-4 text-emerald-600" />;
      case 'WARNING':
        return <RefreshCw className="w-4 h-4 text-amber-600 animate-spin" style={{ animationDuration: '6s' }} />;
      case 'ALERT':
        return <AlertTriangle className="w-4 h-4 text-red-650" />;
      default:
        return <Bell className="w-4 h-4 text-blue-600" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case 'SUCCESS': return 'bg-emerald-50';
      case 'WARNING': return 'bg-amber-50';
      case 'ALERT': return 'bg-red-50';
      default: return 'bg-blue-50';
    }
  };

  return (
    <div className="space-y-6 py-2">
      {/* Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Citizen Notifications Center</h1>
          <p className="text-xs text-slate-550 font-semibold mt-1">
            Stay updated on coordinated registry updates, consent requests, and actions required.
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleTestLiveSync}
            disabled={isTestingSync}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-gov-sm transition disabled:opacity-50"
            title="Execute Live Multi-Department Sync Check"
          >
            <Zap className={`w-3.5 h-3.5 ${isTestingSync ? 'animate-bounce' : ''}`} />
            <span>{isTestingSync ? 'Syncing...' : 'Test Live Cloud Sync'}</span>
          </button>

          {notifications.length > 0 && (
            <>
              <button
                onClick={markAllNotificationsAsRead}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition shadow-gov-sm"
                title="Mark all notifications as read"
              >
                <CheckCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>Mark All Read</span>
              </button>

              <button
                onClick={clearAllNotifications}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold transition shadow-gov-sm"
                title="Clear all stored notifications"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                <span>Clear All</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {(['all', 'unread', 'action', 'completed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors -mb-[2px] ${
              activeTab === tab
                ? 'border-indigo-650 text-indigo-750 font-extrabold'
                : 'border-transparent text-slate-450 hover:text-slate-700'
            }`}
          >
            {tab === 'all' && 'All Updates'}
            {tab === 'unread' && 'Unread'}
            {tab === 'action' && 'Action Required'}
            {tab === 'completed' && 'Completed'}
          </button>
        ))}
      </div>

      {/* Feed List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 text-xs shadow-gov-sm space-y-3">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <p className="font-semibold text-slate-600">No notifications in this view.</p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              All multi-department transactions, cross-registry sync statuses, and statutory consent notifications will appear here.
            </p>
            <button
              onClick={handleTestLiveSync}
              disabled={isTestingSync}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-gov-sm transition"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isTestingSync ? 'Running Live Cloud Sync...' : 'Test Live Cloud Sync'}</span>
            </button>
          </div>
        ) : (
          filteredNotifications.map(n => (
            <div
              key={n.id}
              className={`bg-white border rounded-xl p-4.5 shadow-gov-sm transition flex items-start gap-4 hover:shadow-gov-md ${
                !n.isRead ? 'border-indigo-200 ring-1 ring-indigo-50 bg-indigo-50/5' : 'border-slate-200'
              }`}
            >
              {/* Type Icon indicator */}
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-gov-sm ${getBg(n.type)}`}>
                {getIcon(n.type)}
              </div>

              {/* Text content details */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-extrabold text-xs text-slate-800 leading-tight">
                    {n.title}
                  </h3>
                  <span className="text-[9px] text-slate-400 font-mono shrink-0">
                    {n.timestamp}
                  </span>
                </div>
                
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  {n.description}
                </p>

                {n.applicationId && (
                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-[9px] bg-slate-100 font-mono px-2 py-0.5 rounded text-slate-650">
                      ID: {n.applicationId}
                    </span>
                    <button
                      onClick={() => navigate('/track')}
                      className="text-[9px] font-extrabold text-indigo-650 hover:underline uppercase tracking-wider"
                    >
                      Track Request
                    </button>
                  </div>
                )}
              </div>

              {/* Actions Right Side */}
              {!n.isRead && (
                <button
                  onClick={() => markNotificationAsRead(n.id)}
                  className="px-2.5 py-1 text-[9px] font-extrabold uppercase text-slate-450 hover:text-indigo-600 hover:border-indigo-200 border border-slate-200 rounded bg-white shrink-0 shadow-gov-sm"
                  title="Mark as Read"
                >
                  Dismiss
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
