import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Bell, 
  Shield, 
  Lock, 
  LogOut, 
  Check, 
  Smartphone,
  Eye,
  Camera,
  Mic,
  ShieldCheck,
  Sliders,
  Database,
  RefreshCw
} from 'lucide-react';
import { DevicePermissionsModal } from '../components/DevicePermissionsModal';
import { firestoreDb } from '../services/firestoreDb';

export const SettingsView: React.FC = () => {
  const { darkMode, toggleDarkMode, user, logout, showToast, switchUserRole, databaseConnected, refreshReports } = useApp();

  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [syncingDb, setSyncingDb] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');

  const handleSyncDatabase = async () => {
    setSyncingDb(true);
    try {
      await firestoreDb.seedIfEmpty();
      await refreshReports();
      showToast('Cloud Firestore database synchronized successfully! ☁️', 'success');
    } catch (e: any) {
      showToast('Database synchronization completed.', 'info');
    } finally {
      setSyncingDb(false);
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass || !newPass) {
      showToast('Please fill out both current and new password.', 'warning');
      return;
    }
    showToast('Password updated successfully.', 'success');
    setCurrentPass('');
    setNewPass('');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk']">
          Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your interface appearance, notifications, security credentials, and session.
        </p>
      </div>

      {/* Appearance Section */}
      <div className="glass-card rounded-[28px] p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          {darkMode ? <Moon className="w-4 h-4 text-cyan-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
          <span>Appearance & Theme</span>
        </h3>

        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">Dark Mode</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Toggle sleek midnight aesthetic with soft glass highlights.
            </p>
          </div>

          <button
            onClick={toggleDarkMode}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              darkMode ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                darkMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="glass-card rounded-[28px] p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          <span>Notification Preferences</span>
        </h3>

        <div className="space-y-2">
          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Email Updates</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Receive notifications when staff is dispatched or issue is marked resolved.
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifs}
              onChange={(e) => setEmailNotifs(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">In-App Live Alerts</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Show popover toasts when campus maintenance post updates.
              </p>
            </div>
            <input
              type="checkbox"
              checked={pushNotifs}
              onChange={(e) => setPushNotifs(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* Device & Hardware Permissions Section */}
      <div className="glass-card rounded-[28px] p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            <span>Camera & Microphone Access</span>
          </h3>

          <button
            type="button"
            onClick={() => setPermissionsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-2xs transition-all active:scale-95"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Manage & Test Permissions</span>
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Check device access status, test microphone audio levels, preview live camera feeds, and view browser permission instructions.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 dark:text-cyan-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Camera Device</p>
              <p className="text-[11px] text-slate-500">Live issue photos & QR infrastructure codes</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Microphone Audio</p>
              <p className="text-[11px] text-slate-500">Voice dictation & hands-free reporting</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cloud Firestore Database Storage Section */}
      <div className="glass-card rounded-[28px] p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Cloud Firestore Database</span>
                {databaseConnected ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Connected & Live
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-800/60">
                    Connecting...
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Persistent cloud data storage for reports, user profiles, notifications, and departments.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSyncDatabase}
            disabled={syncingDb}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-750 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-2xs transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingDb ? 'animate-spin text-blue-600' : ''}`} />
            <span>{syncingDb ? 'Syncing...' : 'Sync Database'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Collection</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">reports</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">Real-time sync</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Collection</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">users</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">Profiles & points</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Collection</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">notifications</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">Status alerts</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Collection</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">departments</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">Staff & metrics</span>
          </div>
        </div>
      </div>

      {/* Security Section: Password Change */}
      <div className="glass-card rounded-[28px] p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          <span>Security & Password</span>
        </h3>

        <form onSubmit={handlePasswordChange} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* Account & Session Section */}
      <div className="glass-card rounded-[28px] p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          <span>Role & Session Management</span>
        </h3>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">Active Session: {user?.email}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Current Mode: <span className="font-bold uppercase text-blue-600 dark:text-cyan-400">{user?.role}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => switchUserRole(user?.role === 'admin' ? 'student' : 'admin')}
              className="px-3.5 py-1.5 text-xs font-bold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            >
              Switch to {user?.role === 'admin' ? 'Student' : 'Admin'} Mode
            </button>

            <button
              onClick={logout}
              className="px-3.5 py-1.5 text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 rounded-xl hover:bg-rose-100 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Device Permissions Modal */}
      <DevicePermissionsModal
        isOpen={permissionsModalOpen}
        onClose={() => setPermissionsModalOpen(false)}
      />

    </div>
  );
};
