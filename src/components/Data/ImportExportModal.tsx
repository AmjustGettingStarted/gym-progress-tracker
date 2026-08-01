import React, { useState } from 'react';
import { StorageService } from '../../lib/storage';
import { ConfirmModal } from '../ui/ConfirmModal';
import { Download, Upload, Database, RefreshCw, X, Check } from 'lucide-react';
import {
  WorkoutSession,
  WorkoutTemplate,
  Exercise,
  BodyMeasurement,
  UserProfile,
} from '../../types';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReload: () => void;
  sessions: WorkoutSession[];
  templates: WorkoutTemplate[];
  exercises: Exercise[];
  measurements: BodyMeasurement[];
  profile: UserProfile;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  onDataReload,
  sessions,
  templates,
  exercises,
  measurements,
  profile,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  if (!isOpen) return null;

  // Export CSV download
  const handleExportCSV = () => {
    const csvContent = StorageService.exportSessionsCSV(sessions);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `gym_workout_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON download
  const handleExportJSON = () => {
    const jsonContent = StorageService.exportJSONBackup({
      sessions,
      templates,
      exercises,
      measurements,
      profile,
    });
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `gym_tracker_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import JSON handler
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const text = evt.target?.result as string;
          const parsed = JSON.parse(text);
          const customEx = parsed.exercises || parsed.customExercises || [];
          StorageService.saveGuestData({
            sessions: parsed.sessions || [],
            templates: parsed.templates || [],
            customExercises: customEx,
            measurements: parsed.measurements || [],
            photos: parsed.photos || [],
            profile: parsed.profile || profile,
            activeDraft: null,
          });
          setImportStatus('Data successfully imported to Guest storage!');
          onDataReload();
          setTimeout(() => setImportStatus(null), 3000);
        } catch (err) {
          console.error(err);
          setImportStatus('Failed to parse import file.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Reset to clean guest data
  const handleResetGuestData = () => {
    setIsResetConfirmOpen(true);
  };

  const confirmResetGuestData = () => {
    StorageService.resetGuestData();
    onDataReload();
    setImportStatus('Guest data reset to clean initial state.');
    setIsResetConfirmOpen(false);
    setTimeout(() => setImportStatus(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-gray-700 dark:text-zinc-300" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Data Management</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-black dark:hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {importStatus && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{importStatus}</span>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Export Options</h4>

          <button
            onClick={handleExportCSV}
            className="w-full p-3 bg-gray-50 dark:bg-zinc-800/60 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 flex items-center justify-between text-xs font-bold text-gray-900 dark:text-white transition-all cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <Download className="w-4 h-4 text-emerald-500" />
              <span>Export Workout History (CSV)</span>
            </div>
            <span className="text-[10px] text-gray-400 font-normal">Excel / Sheets</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="w-full p-3 bg-gray-50 dark:bg-zinc-800/60 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 flex items-center justify-between text-xs font-bold text-gray-900 dark:text-white transition-all cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <Download className="w-4 h-4 text-blue-500" />
              <span>Export Full Backup (JSON)</span>
            </div>
            <span className="text-[10px] text-gray-400 font-normal">Complete State</span>
          </button>
        </div>

        <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-zinc-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Import & Reset</h4>

          <label className="w-full p-3 bg-gray-50 dark:bg-zinc-800/60 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 flex items-center justify-between text-xs font-bold text-gray-900 dark:text-white cursor-pointer transition-all">
            <div className="flex items-center space-x-2">
              <Upload className="w-4 h-4 text-purple-500" />
              <span>Restore Backup (JSON)</span>
            </div>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          <button
            onClick={handleResetGuestData}
            className="w-full p-3 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 rounded-xl border border-red-200 dark:border-red-900/50 flex items-center justify-between text-xs font-bold text-red-700 dark:text-red-400 transition-all cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>Clear Guest Storage State</span>
            </div>
          </button>
        </div>
      </div>

      {/* Confirm Reset Guest Data Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Clear Guest Storage Data?"
        message="Are you sure you want to reset Guest Mode storage to a clean slate? All stored guest workouts and measurements will be removed."
        confirmLabel="Clear Guest Data"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={confirmResetGuestData}
        onClose={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
