import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus, Volume2, VolumeX, X, Clock } from 'lucide-react';

interface RestTimerBarProps {
  secondsRemaining: number;
  isActive: boolean;
  onStartTimer: (seconds: number) => void;
  onPauseTimer: () => void;
  onResumeTimer: () => void;
  onResetTimer: () => void;
  onClose: () => void;
  soundEnabled: boolean;
}

export const RestTimerBar: React.FC<RestTimerBarProps> = ({
  secondsRemaining,
  isActive,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onResetTimer,
  onClose,
  soundEnabled,
}) => {
  const [isMuted, setIsMuted] = useState(!soundEnabled);

  const formatMMSS = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isFinished = secondsRemaining === 0 && !isActive;

  return (
    <div
      id="rest-timer-bar-container"
      className="fixed bottom-16 md:bottom-6 right-4 z-50 bg-black text-white dark:bg-zinc-900 dark:text-white dark:border dark:border-zinc-700 rounded-xl shadow-xl px-4 py-3 flex items-center space-x-3 transition-all animate-in slide-in-from-bottom-4"
    >
      <div className="flex items-center space-x-2">
        <Clock className={`w-4 h-4 text-emerald-400 ${isActive ? 'animate-spin' : ''}`} />
        <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">Rest:</span>
        <span className="text-lg font-mono font-bold tracking-tight min-w-[50px]">
          {formatMMSS(secondsRemaining)}
        </span>
      </div>

      <div className="h-5 w-px bg-zinc-800 dark:bg-zinc-700" />

      {/* Quick Adjust */}
      <div className="flex items-center space-x-1">
        <button
          id="btn-timer-minus-15"
          onClick={() => onStartTimer(Math.max(0, secondsRemaining - 15))}
          className="px-1.5 py-0.5 text-xs font-mono bg-zinc-800 hover:bg-zinc-700 rounded text-gray-300"
          title="-15s"
        >
          -15s
        </button>
        <button
          id="btn-timer-plus-15"
          onClick={() => onStartTimer(secondsRemaining + 15)}
          className="px-1.5 py-0.5 text-xs font-mono bg-zinc-800 hover:bg-zinc-700 rounded text-gray-300"
          title="+15s"
        >
          +15s
        </button>
      </div>

      {/* Play/Pause */}
      <div className="flex items-center space-x-1">
        {isActive ? (
          <button
            id="btn-timer-pause"
            onClick={onPauseTimer}
            className="p-1.5 bg-amber-600 hover:bg-amber-700 rounded-md text-white"
            title="Pause"
          >
            <Pause className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            id="btn-timer-play"
            onClick={onResumeTimer}
            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-md text-white"
            title="Resume"
          >
            <Play className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          id="btn-timer-reset"
          onClick={onResetTimer}
          className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-md text-gray-300"
          title="Reset"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          id="btn-timer-close"
          onClick={onClose}
          className="p-1.5 hover:bg-zinc-800 rounded-md text-gray-400 hover:text-white"
          title="Close Timer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
