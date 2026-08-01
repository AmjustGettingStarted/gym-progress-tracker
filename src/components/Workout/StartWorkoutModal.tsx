import React from 'react';
import { WorkoutTemplate } from '../../types';
import { Plus, Dumbbell, Sparkles, X, ChevronRight } from 'lucide-react';

interface StartWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: WorkoutTemplate[];
  onStartEmptyWorkout: () => void;
  onStartFromTemplate: (templateId: string) => void;
  onGoToTemplatesTab?: () => void;
}

export const StartWorkoutModal: React.FC<StartWorkoutModalProps> = ({
  isOpen,
  onClose,
  templates,
  onStartEmptyWorkout,
  onStartFromTemplate,
  onGoToTemplatesTab,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Start Workout
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                Choose a template or start with a blank log
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Option 1: Blank Workout */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 block mb-2.5">
              Quick Start
            </span>
            <button
              id="start-blank-workout-option"
              onClick={() => {
                onStartEmptyWorkout();
                onClose();
              }}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-emerald-50/60 dark:bg-zinc-800/60 dark:hover:bg-emerald-950/30 border border-gray-200 dark:border-zinc-700/80 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    Start Blank Workout
                  </div>
                  <div className="text-xs text-gray-500 dark:text-zinc-400">
                    Add exercises as you go during your workout session
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          </div>

          {/* Option 2: Select from My Templates */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                Select from Templates ({templates.length})
              </span>
              {onGoToTemplatesTab && (
                <button
                  onClick={() => {
                    onGoToTemplatesTab();
                    onClose();
                  }}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Manage Templates
                </button>
              )}
            </div>

            {templates.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30">
                <Sparkles className="w-6 h-6 text-amber-500 mx-auto mb-2 opacity-80" />
                <p className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                  No saved templates yet
                </p>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
                  Create custom routines in the Templates section to quickly start workouts with prefilled sets and reps.
                </p>
                {onGoToTemplatesTab && (
                  <button
                    onClick={() => {
                      onGoToTemplatesTab();
                      onClose();
                    }}
                    className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create First Template</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => {
                      onStartFromTemplate(tpl.id);
                      onClose();
                    }}
                    className="p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 hover:bg-gray-50 dark:hover:bg-zinc-800/80 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {tpl.name}
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
                        {tpl.exercises.length} exercise{tpl.exercises.length === 1 ? '' : 's'}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartFromTemplate(tpl.id);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-all flex items-center space-x-1"
                    >
                      <span>Start</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
