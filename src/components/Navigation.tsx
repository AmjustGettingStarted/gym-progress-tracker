import React from 'react';
import { TabType } from '../types';
import { User as SupabaseUser } from '../lib/supabase';
import {
  LayoutDashboard,
  Dumbbell,
  BookOpen,
  History,
  TrendingUp,
  Settings as SettingsIcon,
  PlusCircle,
  User,
} from 'lucide-react';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  hasActiveWorkout: boolean;
  onOpenActiveWorkout: () => void;
  onStartNewWorkout: () => void;
  currentUser: SupabaseUser | null;
  onOpenAuthModal: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  hasActiveWorkout,
  onOpenActiveWorkout,
  onStartNewWorkout,
  currentUser,
  onOpenAuthModal,
}) => {
  const navItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'templates' as TabType, label: 'Templates', icon: BookOpen },
    { id: 'exercises' as TabType, label: 'Exercises', icon: Dumbbell },
    { id: 'history' as TabType, label: 'History', icon: History },
    { id: 'progress' as TabType, label: 'Progress', icon: TrendingUp },
  ];

  return (
    <>
      {/* Top Desktop Navigation Header */}
      <header id="top-nav-header" className="sticky top-0 z-40 bg-white dark:bg-black border-b border-gray-200 dark:border-zinc-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-8 h-8 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-sm tracking-widest">
              G
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                Gym Tracker
              </h1>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                {currentUser ? 'Supabase Synced' : 'Minimal. Fast. Cloud Ready.'}
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav id="desktop-nav-links" className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-desktop-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-100 text-gray-900 dark:bg-zinc-800 dark:text-white'
                      : 'text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Account / Cloud Sync Button */}
            <button
              id="btn-account-auth"
              onClick={onOpenAuthModal}
              className={`flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                currentUser
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-gray-50 dark:bg-zinc-800/80 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
              title={currentUser ? `Logged in as ${currentUser.email}` : 'Sign In / Cloud Sync'}
            >
              <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">
                {currentUser ? currentUser.email?.split('@')[0] : 'Sign In'}
              </span>
            </button>

            {hasActiveWorkout ? (
              <button
                id="btn-resume-active-workout"
                onClick={onOpenActiveWorkout}
                className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-md transition-all shadow-sm animate-pulse"
              >
                <span className="w-2 h-2 rounded-full bg-white"></span>
                <span>Active Workout</span>
              </button>
            ) : (
              <button
                id="btn-start-new-workout-top"
                onClick={onStartNewWorkout}
                className="flex items-center space-x-1.5 bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 text-xs font-semibold px-3 py-2 rounded-md transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Start Workout</span>
              </button>
            )}

            <button
              id="btn-settings"
              onClick={() => setActiveTab('settings')}
              className={`p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors ${
                activeTab === 'settings' ? 'bg-gray-100 dark:bg-zinc-800 text-black dark:text-white' : ''
              }`}
              title="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav id="mobile-bottom-nav" className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-md border-t border-gray-200 dark:border-zinc-800 px-2 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-mobile-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-md transition-colors ${
                isActive
                  ? 'text-black dark:text-white font-semibold'
                  : 'text-gray-500 dark:text-zinc-500 hover:text-gray-800 dark:hover:text-zinc-300'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
