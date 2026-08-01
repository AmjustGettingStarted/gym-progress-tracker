import React, { useState } from 'react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../../lib/supabase';
import {
  Dumbbell,
  Mail,
  Lock,
  Chrome,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface LoginPageProps {
  onContinueGuest: () => void;
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onContinueGuest, onLoginSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await signInWithGoogle();
      onLoginSuccess();
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
      onLoginSuccess();
    } catch (err: any) {
      let msg = err.message || 'Authentication failed.';
      if (err.message?.includes('provider is not enabled') || err.message?.includes('disabled')) {
        msg = 'Email authentication is disabled in your Supabase project. Go to Supabase Dashboard > Authentication > Providers > Email and enable it.';
      } else if (err.message?.includes('Invalid login credentials')) {
        msg = 'Invalid email or password. If you do not have an account yet, click "Don\'t have an account? Sign up".';
      } else if (err.message?.includes('User already registered')) {
        msg = 'An account with this email already exists. Click "Already have an account? Sign in".';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-white dark:bg-zinc-950">
      {/* Left Side: Brand & Hero (Shown on Desktop) */}
      <div className="hidden lg:flex bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-8 sm:p-12 lg:p-16 text-white flex-col justify-between border-r border-zinc-800 relative">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-10 my-auto">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-black flex items-center justify-center font-black shadow-xl">
              <Dumbbell className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-widest uppercase bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              GymPro
            </span>
          </div>

          <div className="space-y-4 max-w-lg">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white">
              Track Strength. <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Break Records.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-normal">
              Log sets, monitor 1RM personal records, build custom splits, and save body metrics safely with automated Supabase Cloud sync.
            </p>
          </div>

          <div className="space-y-4 pt-4 max-w-md">
            <div className="flex items-center space-x-3.5 text-sm text-zinc-300">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="font-medium">Real-Time Supabase Cloud PostgreSQL Backup</span>
            </div>
            <div className="flex items-center space-x-3.5 text-sm text-zinc-300">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="font-medium">Automated PR Calculation & Volume Analytics</span>
            </div>
            <div className="flex items-center space-x-3.5 text-sm text-zinc-300">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="font-medium">Sync Workout Splits Across All Devices</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-8 mt-12 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
          <span className="flex items-center space-x-2 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Supabase Cloud Engine • Auth & Postgres Active</span>
          </span>
        </div>
      </div>

      {/* Right Side: Auth Form (Always visible, centered on mobile) */}
      <div className="p-6 sm:p-12 lg:p-16 flex flex-col justify-center min-h-svh bg-white dark:bg-zinc-950">
        <div className="max-w-md w-full mx-auto space-y-6 sm:space-y-8">
          {/* Mobile Logo Brand header (shown when not desktop) */}
          <div className="flex items-center space-x-2.5 lg:hidden pb-2 border-b border-gray-100 dark:border-zinc-800">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-black flex items-center justify-center font-black shadow-md">
              <Dumbbell className="w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-widest uppercase text-gray-900 dark:text-white">
              GymPro
            </span>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {mode === 'signin' ? 'Sign In to GymPro' : 'Create an Account'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              {mode === 'signin'
                ? 'Welcome back! Access your workout progression and cloud logs.'
                : 'Sign up with your email to start cloud synchronization.'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl text-xs text-amber-950 dark:text-amber-200 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Authentication Configuration Alert</span>
              </div>
              <p className="leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-4 px-5 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-2xl font-bold text-xs sm:text-sm text-gray-900 dark:text-white flex items-center justify-center space-x-3 transition-all shadow-xs cursor-pointer"
          >
            <Chrome className="w-5 h-5 text-blue-500" />
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-gray-200 dark:border-zinc-800 w-full"></div>
            <span className="bg-white dark:bg-zinc-950 px-4 text-xs uppercase font-bold text-gray-400 tracking-wider absolute">
              or with email
            </span>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-4" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-black text-white dark:bg-white dark:text-black font-bold text-xs sm:text-sm rounded-xl shadow-md hover:bg-gray-800 dark:hover:bg-gray-100 transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Connecting...</span>
              ) : (
                <span>{mode === 'signin' ? 'Sign In to Account' : 'Create New Account'}</span>
              )}
            </button>
          </form>

          <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-zinc-800 text-xs sm:text-sm">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setErrorMsg(null);
              }}
              className="font-bold text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              {mode === 'signin'
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>

            <button
              type="button"
              onClick={onContinueGuest}
              className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center space-x-1"
            >
              <span>Continue Guest Mode</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
