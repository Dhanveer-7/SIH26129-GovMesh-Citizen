import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDemo } from '../context/DemoContext';
import { SIHController } from '../components/SIHController';
import { 
  Menu, X, Bell, User, LayoutDashboard, Shield, AlertTriangle, 
  HelpCircle, LogOut, Settings, History, ClipboardList, Award
} from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isAuthenticated, logout, user } = useAuth();
  const { notifications, markNotificationAsRead } = useDemo();
  const navigate = useNavigate();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/services', label: 'Services', icon: <ClipboardList className="w-4 h-4" /> },
    { to: '/track', label: 'Track Application', icon: <History className="w-4 h-4" /> },
    { to: '/notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { to: '/help', label: 'Help', icon: <HelpCircle className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      
      {/* Top Advisory Banner (SIH Prototype Disclaimer) */}
      <div className="bg-amber-500 text-slate-950 text-center py-2 px-4 text-xs font-semibold flex items-center justify-center gap-2 border-b border-amber-600">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>
          SIH 2026 Prototype Sandbox: GovMesh is a systems-interoperability demonstration. No real government connections or official state data are authorized.
        </span>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-gov-dark text-white border-b border-slate-800 shadow-gov-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-gov-sm">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-extrabold text-lg tracking-wider text-white flex items-center">
                    Gov<span className="text-indigo-400">Mesh</span>
                  </span>
                  <span className="block text-[8px] tracking-widest text-indigo-200 uppercase font-bold">
                    Citizen Service Core
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Link Toggles */}
            {isAuthenticated && (
              <nav className="hidden md:flex items-center space-x-1">
                {navLinks.map(link => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold tracking-wide transition-colors ${
                        isActive
                          ? 'bg-slate-850 text-white border border-slate-700'
                          : 'text-slate-300 hover:text-white hover:bg-slate-850/50'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>
            )}

            {/* Right-Side Utility Triggers */}
            <div className="flex items-center gap-3">
              
              {isAuthenticated ? (
                <>
                  {/* Notifications Notification Trigger */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setNotificationOpen(!notificationOpen);
                        setProfileDropdownOpen(false);
                      }}
                      className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition relative"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full text-[9px] font-bold w-4.5 h-4.5 flex items-center justify-center animate-bounce">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Notification Dropdown Pane */}
                    {notificationOpen && (
                      <div className="absolute right-0 mt-2.5 w-80 bg-white text-slate-900 border border-slate-100 rounded-xl shadow-gov-lg overflow-hidden py-1 z-50">
                        <div className="px-4 py-2 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-750">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="text-[10px] text-indigo-600 font-bold">
                              {unreadCount} Unread
                            </span>
                          )}
                        </div>
                        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                          {notifications.length === 0 ? (
                            <div className="p-6 text-center text-xs text-slate-400">
                              No notifications.
                            </div>
                          ) : (
                            notifications.slice(0, 5).map(ntf => (
                              <div
                                key={ntf.id}
                                onClick={() => {
                                  markNotificationAsRead(ntf.id);
                                  setNotificationOpen(false);
                                  navigate('/notifications');
                                }}
                                className={`p-3.5 hover:bg-slate-50 cursor-pointer transition ${
                                  !ntf.isRead ? 'bg-indigo-50/20' : ''
                                }`}
                              >
                                <div className="flex items-start gap-2.5">
                                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                    ntf.type === 'SUCCESS' ? 'bg-gov-success' :
                                    ntf.type === 'ALERT' ? 'bg-gov-failure' :
                                    ntf.type === 'WARNING' ? 'bg-amber-500' : 'bg-gov-secondary'
                                  }`} />
                                  <div>
                                    <h4 className="font-bold text-xs text-slate-800 leading-tight">
                                      {ntf.title}
                                    </h4>
                                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                      {ntf.description}
                                    </p>
                                    <span className="text-[9px] text-slate-400 mt-1.5 block">
                                      {ntf.timestamp}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 text-center">
                          <Link
                            to="/notifications"
                            onClick={() => setNotificationOpen(false)}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                          >
                            View All Notifications
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Profile Dropdown Profile Trigger */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(!profileDropdownOpen);
                        setNotificationOpen(false);
                      }}
                      className="flex items-center gap-1.5 p-1 px-2.5 rounded-full hover:bg-slate-800 transition border border-slate-700 bg-slate-850"
                    >
                      <User className="w-4 h-4 text-slate-350" />
                      <span className="hidden sm:inline text-xs font-semibold text-slate-200">
                        {user?.name || 'Citizen'}
                      </span>
                    </button>

                    {/* Profile Dropdown Menu */}
                    {profileDropdownOpen && (
                      <div className="absolute right-0 mt-2.5 w-56 bg-white text-slate-900 border border-slate-100 rounded-xl shadow-gov-lg overflow-hidden py-1 z-50">
                        <div className="p-4 border-b border-slate-100 bg-slate-50">
                          <h4 className="font-bold text-xs text-slate-800 leading-none">
                            {user?.name}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-mono mt-1.5 block">
                            ID: {user?.citizenId}
                          </span>
                        </div>
                        <div className="py-1">
                          <Link
                            to="/profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 font-semibold"
                          >
                            <User className="w-4 h-4 text-slate-400" />
                            <span>My Profile</span>
                          </Link>
                          <Link
                            to="/profile?tab=security"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 font-semibold"
                          >
                            <Settings className="w-4 h-4 text-slate-400" />
                            <span>Privacy & Security</span>
                          </Link>
                        </div>
                        <div className="border-t border-slate-100 py-1">
                          <button
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              handleLogout();
                            }}
                            className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-xs text-gov-failure hover:bg-red-50 font-semibold transition"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-gov-sm transition"
                >
                  Citizen Sign In
                </Link>
              )}

              {/* Mobile Hamburger menu */}
              {isAuthenticated && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && isAuthenticated && (
          <div className="md:hidden bg-slate-900 border-t border-slate-800 py-2">
            <div className="px-2 space-y-1">
              {navLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs font-bold transition ${
                      isActive
                        ? 'bg-slate-800 text-white border border-slate-700'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                    }`
                  }
                >
                  {link.icon}
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main page content area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer disclaimer and metadata */}
      <footer className="bg-gov-dark text-slate-400 py-8 border-t border-slate-800 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Left side */}
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="font-bold text-white">GovMesh Platform Core</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Interoperability & Data Minimization Engine
                </p>
              </div>
            </div>

            {/* Middle disclaimer */}
            <p className="text-[10px] text-slate-500 max-w-md text-center md:text-left leading-relaxed">
              This digital dashboard is an SIH 2026 prototype. All data sharing logs, certificates, consents, and application statuses are generated within local mock sandbox APIs for representation purposes.
            </p>

            {/* Right side */}
            <div className="flex items-center gap-4 font-bold text-slate-400">
              <Link to="/help" className="hover:text-white hover:underline">Help</Link>
              <span>•</span>
              <Link to="/profile?tab=security" className="hover:text-white hover:underline">Security</Link>
              <span>•</span>
              <span>v1.0.0-Beta</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Interactive Live Controller */}
      {isAuthenticated && <SIHController />}
    </div>
  );
};
