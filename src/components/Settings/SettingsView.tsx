import React from 'react';
import { UserProfile } from '../../types';
import { CustomSelect } from '../ui/CustomSelect';
import { User as SupabaseUser } from '../../lib/supabase';
import { Sun, Moon, Scale, Clock, Database, LogOut, ShieldCheck, CheckCircle2, LogIn } from 'lucide-react';

interface SettingsViewProps {
  profile: UserProfile;
  currentUser?: SupabaseUser | null;
  onUpdateProfile: (updated: UserProfile) => void;
  onOpenDataModal: () => void;
  onSignOut?: () => void;
  onOpenAuthModal?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  currentUser,
  onUpdateProfile,
  onOpenDataModal,
  onSignOut,
  onOpenAuthModal,
}) => {
  const toggleTheme = () => {
    onUpdateProfile({ ...profile, theme: profile.theme === 'light' ? 'dark' : 'light' });
  };

  const toggleWeightUnit = () => {
    onUpdateProfile({ ...profile, weightUnit: profile.weightUnit === 'kg' ? 'lbs' : 'kg' });
  };

  return (
    <div id="settings-view" className="space-y-6 pb-20 md:pb-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings & Account</h2>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
          Customize application preferences, weight units, theme, and manage cloud session.
        </p>
      </div>

      {/* Account & Cloud Sync Section with Sign Out / Sign In Button */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Account & Cloud Status</span>
          </h3>
          {currentUser ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3 h-3" />
              <span>Synced with Supabase</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <span>Guest Mode</span>
            </span>
          )}
        </div>

        {currentUser ? (
          <div className="p-4 bg-gray-50 dark:bg-zinc-800/80 rounded-2xl border border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                {currentUser.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  {currentUser.user_metadata?.full_name || currentUser.email}
                </p>
                <p className="text-[11px] text-gray-500">{currentUser.email}</p>
              </div>
            </div>

            {onSignOut && (
              <button
                onClick={onSignOut}
                className="w-full sm:w-auto px-4 py-2 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 dark:bg-zinc-800/80 rounded-2xl border border-gray-100 dark:border-zinc-800 flex items-center justify-between">
            <p className="text-xs text-gray-600 dark:text-zinc-300">
              Sign in with Google or Email to sync workout data across all devices.
            </p>
            {onOpenAuthModal && (
              <button
                onClick={onOpenAuthModal}
                className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black font-bold text-xs rounded-xl flex items-center space-x-2 cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shrink-0"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Sign Up</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-bold flex items-center justify-center text-lg">
            {profile.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">{profile.name}</h3>
            <p className="text-xs text-gray-500">{profile.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => onUpdateProfile({ ...profile, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
              Target Training Split
            </label>
            <input
              type="text"
              value={profile.targetSplit}
              onChange={(e) => onUpdateProfile({ ...profile, targetSplit: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* App Preferences */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">App Preferences</h3>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-xl border border-gray-100 dark:border-zinc-800">
          <div className="flex items-center space-x-3">
            {profile.theme === 'light' ? (
              <Sun className="w-5 h-5 text-amber-500" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-400" />
            )}
            <div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white">Color Theme</h4>
              <p className="text-[11px] text-gray-500">
                Current mode: {profile.theme === 'light' ? 'Light' : 'Dark'}
              </p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg text-xs font-bold text-gray-900 dark:text-white cursor-pointer"
          >
            Switch to {profile.theme === 'light' ? 'Dark' : 'Light'}
          </button>
        </div>

        {/* Weight Unit Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-xl border border-gray-100 dark:border-zinc-800">
          <div className="flex items-center space-x-3">
            <Scale className="w-5 h-5 text-emerald-500" />
            <div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white">Weight Unit</h4>
              <p className="text-[11px] text-gray-500">Active unit: {profile.weightUnit.toUpperCase()}</p>
            </div>
          </div>

          <button
            onClick={toggleWeightUnit}
            className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg text-xs font-bold text-gray-900 dark:text-white cursor-pointer"
          >
            Use {profile.weightUnit === 'kg' ? 'LBS' : 'KG'}
          </button>
        </div>

        {/* Default Rest Timer */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-xl border border-gray-100 dark:border-zinc-800">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-blue-500" />
            <div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white">Default Rest Timer</h4>
              <p className="text-[11px] text-gray-500">Timer duration after set completion</p>
            </div>
          </div>

          <CustomSelect
            value={profile.defaultRestTimerSeconds.toString()}
            onChange={(val) =>
              onUpdateProfile({ ...profile, defaultRestTimerSeconds: parseInt(val) || 90 })
            }
            options={[
              { value: '60', label: '60 seconds' },
              { value: '90', label: '90 seconds' },
              { value: '120', label: '2 minutes' },
              { value: '180', label: '3 minutes' },
            ]}
            size="sm"
          />
        </div>
      </div>

      {/* Data Section */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Data & Backup</h3>
        <p className="text-xs text-gray-500">
          Export your entire workout logs to CSV/Excel or restore from a backup file.
        </p>

        <button
          onClick={onOpenDataModal}
          className="w-full py-2.5 bg-black text-white dark:bg-white dark:text-black font-bold text-xs rounded-xl flex items-center justify-center space-x-2 cursor-pointer"
        >
          <Database className="w-4 h-4" />
          <span>Manage Data (Export / Import / CSV)</span>
        </button>
      </div>
    </div>
  );
};
