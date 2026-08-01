import React, { useState } from 'react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, logoutUser, User } from '../../lib/supabase';
import {
  LogOut,
  Mail,
  Lock,
  CheckCircle2,
  Chrome,
  Dumbbell,
  AlertTriangle,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onAuthSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await signInWithGoogle();
      if (onAuthSuccess) onAuthSuccess();
      onClose();
    } catch (err: any) {
      let msg = err.message || 'Failed to sign in with Google';
      if (err.message?.includes('provider is not enabled') || err.code === 'validation_failed') {
        msg = 'Google Sign-In is not enabled in your Supabase project console yet. Please enable Google in Supabase Dashboard > Authentication > Providers > Google, or use Email / Password authentication below.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      if (onAuthSuccess) onAuthSuccess();
      onClose();
    } catch (err: any) {
      let msg = err.message || 'Authentication failed.';
      if (err.message?.includes('provider is not enabled') || err.message?.includes('disabled')) {
        msg = 'Email authentication is disabled in your Supabase project. Go to Supabase Dashboard > Authentication > Providers > Email and enable it.';
      } else if (err.message?.includes('Invalid login credentials')) {
        msg = 'Invalid email or password. If you do not have an account yet, click "Need an account? Sign up".';
      } else if (err.message?.includes('User already registered')) {
        msg = 'An account with this email already exists. Click "Already registered? Sign in".';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await logoutUser();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:text-black dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Left Side Visual Hero (5 cols) */}
        <div className="md:col-span-5 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-6 sm:p-8 text-white flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-800 relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-black flex items-center justify-center font-black shadow-lg">
                <Dumbbell className="w-5 h-5" />
              </div>
              <span className="text-lg font-black tracking-wider uppercase bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                GymPro
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold tracking-tight leading-tight">
                Track Strength. Break Records.
              </h2>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Connect your account to synchronize workout logs, personal records, custom exercises, and body metrics seamlessly across devices.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-3 text-xs text-zinc-300">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Automated PR & Volume Analytics</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-zinc-300">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Supabase Cloud PostgreSQL Sync</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-zinc-300">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Custom Splits & Exercise Library</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 mt-6 border-t border-zinc-800/80">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
              Powered by Supabase Cloud Auth
            </p>
          </div>
        </div>

        {/* Right Side Auth Form (7 cols) */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-center">
          {currentUser ? (
            /* Logged In State */
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Account Active</h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                  You are signed in and synced with Supabase.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                  {currentUser.email?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-sm font-bold text-emerald-950 dark:text-emerald-100 truncate">
                      {currentUser.user_metadata?.full_name || currentUser.email}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  </div>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 truncate">
                    {currentUser.email}
                  </p>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                disabled={loading}
                className="w-full py-3 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-900/60 rounded-xl font-bold text-xs text-red-700 dark:text-red-300 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Account</span>
              </button>
            </div>
          ) : (
            /* Sign In / Sign Up Form */
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                  {mode === 'signin'
                    ? 'Enter your credentials to access cloud sync'
                    : 'Sign up to back up your workout progression'}
                </p>
              </div>

              {errorMsg && (
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 rounded-2xl text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Supabase Auth Notice</span>
                  </div>
                  <p className="leading-relaxed">{errorMsg}</p>
                </div>
              )}

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700/80 border border-gray-300 dark:border-zinc-700 rounded-2xl font-bold text-xs text-gray-900 dark:text-white flex items-center justify-center space-x-3 transition-all shadow-xs cursor-pointer"
              >
                <Chrome className="w-4 h-4 text-blue-500" />
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-gray-200 dark:border-zinc-800 w-full"></div>
                <span className="bg-white dark:bg-zinc-900 px-3 text-[10px] uppercase font-bold text-gray-400 tracking-wider absolute">
                  or email
                </span>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-zinc-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-zinc-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-black text-white dark:bg-white dark:text-black font-bold text-xs rounded-xl shadow-md hover:bg-gray-800 dark:hover:bg-gray-100 transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <span>Processing...</span>
                  ) : (
                    <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                  )}
                </button>
              </form>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-zinc-800 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'signin' ? 'signup' : 'signin');
                    setErrorMsg(null);
                  }}
                  className="font-semibold text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                >
                  {mode === 'signin'
                    ? "Need an account? Sign up"
                    : 'Already registered? Sign in'}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Continue Guest Mode →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
