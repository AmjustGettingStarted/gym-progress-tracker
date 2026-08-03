import React, { useState } from 'react';
import { signInWithEmail, signUpWithEmail } from '../../lib/supabase';
import HeroSection from '../ui/glassmorphism-trust-hero';
import { Mail, Lock, AlertTriangle, ArrowRight, Dumbbell, Eye, EyeOff } from 'lucide-react';
import GymImage from "../../../assets/gym.png";

interface LoginPageProps {
  onContinueGuest: () => void;
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onContinueGuest, onLoginSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
      setErrorMsg(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden font-sans bg-zinc-950 flex items-center justify-center">

      {/* Background Gym Image (Full Opacity, Controlled by Gradient) */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none opacity-100"
        style={{ backgroundImage: `url(${GymImage})` }}
      />

      {/* Cinematic Dark Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-black via-black/15 via-40% to-black/5" />

      {/* Grid Layout */}
      <div className="relative z-10 w-full h-full max-w-7xl mx-auto p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

        {/* Left Side: Brand Hero (Animated Entrance) */}
        <div className="hidden lg:flex lg:col-span-7 h-full flex-col justify-center pr-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
          <HeroSection />
        </div>

        {/* Right Side: Dark Glass Form Card (Animated Entrance) */}
        <div className="col-span-1 lg:col-span-5 w-full max-w-md mx-auto my-auto animate-in fade-in zoom-in-95 duration-500">
          <div className="relative rounded-[32px] overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.55)] border border-white/15">

            {/* Glass Blur Background Layer */}
            <div
              className="absolute inset-0"
              style={{
                backdropFilter: "blur(35px) saturate(140%)",
                WebkitBackdropFilter: "blur(35px) saturate(140%)",
                background: "linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06))",
              }}
            />

            {/* Inner Top Edge Highlight for Depth */}
            <div
              className="absolute inset-0 rounded-[32px] pointer-events-none"
              style={{
                boxShadow: `
                  inset 0 1px 0 rgba(255,255,255,0.2),
                  inset 0 -1px 0 rgba(0,0,0,0.4)
                `,
              }}
            />

            {/* Form Content */}
            <div className="relative z-10 p-8 sm:p-10 text-white transition-all duration-300">

              {/* Mobile/Tablet Brand Pill */}
              <div className="lg:hidden mb-6 flex items-center">
                <div
                  style={{
                    backgroundColor: 'rgba(24, 24, 27, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                  className="inline-flex items-center space-x-3 px-3.5 py-1.5 rounded-full backdrop-blur-md relative"
                >
                  {/* Subtle Emerald Logo Glow */}
                  <div className="absolute w-20 h-20 bg-emerald-500/20 blur-3xl rounded-full -top-6 -left-6 pointer-events-none" />

                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-zinc-950 font-black relative z-10">
                    <Dumbbell className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-black tracking-wider uppercase text-white relative z-10">
                    GymPro
                  </span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1.5 mb-6">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {mode === 'signin' ? 'Sign In to GymPro' : 'Create an Account'}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 font-medium">
                  {mode === 'signin'
                    ? 'Access your workout progression and cloud logs.'
                    : 'Sign up with your email to start cloud synchronization.'}
                </p>
              </div>

              {/* Error Notice */}
              {errorMsg && (
                <div
                  style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid rgba(245, 158, 11, 0.3)'
                  }}
                  className="mb-4 p-3.5 rounded-xl text-xs text-amber-200 space-y-1 backdrop-blur-md"
                >
                  <div className="flex items-center space-x-2 font-bold text-amber-400">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Authentication Notice</span>
                  </div>
                  <p className="leading-relaxed font-medium">{errorMsg}</p>
                </div>
              )}

              {/* Form Inputs */}
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.12)'
                      }}
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.12)'
                      }}
                      className="w-full pl-10 pr-10 py-3 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2 mt-2"
                >
                  {loading ? (
                    <span>Connecting...</span>
                  ) : (
                    <span>{mode === 'signin' ? 'Sign In to Account' : 'Create New Account'}</span>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6 flex items-center justify-center">
                <div className="w-full border-t border-white/10"></div>
              </div>

              {/* Footer Navigation */}
              <div className="flex items-center justify-between text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'signin' ? 'signup' : 'signin');
                    setErrorMsg(null);
                  }}
                  className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  {mode === 'signin'
                    ? "Don't have an account? Sign up"
                    : 'Already have an account? Sign in'}
                </button>

                <button
                  type="button"
                  onClick={onContinueGuest}
                  className="text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer flex items-center space-x-1"
                >
                  <span>Guest Mode</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};