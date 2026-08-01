import React, { useState } from 'react';
import { CustomSelect } from '../ui/CustomSelect';
import { ConfirmModal } from '../ui/ConfirmModal';
import { Exercise, MuscleGroup, Equipment, WorkoutSession, PersonalRecord } from '../../types';
import { calculate1RM } from '../../lib/calculations';
import { DEFAULT_EXERCISES } from '../../data/defaultData';
import { Search, Plus, Dumbbell, Award, ChevronRight, X, Filter, Trash2, Sparkles } from 'lucide-react';

interface ExerciseLibraryViewProps {
  exercises: Exercise[];
  sessions: WorkoutSession[];
  prs: Record<string, PersonalRecord>;
  onCreateCustomExercise: (newEx: Exercise) => void;
  onDeleteExercise?: (exerciseId: string) => void;
  weightUnit: string;
}

const MUSCLE_GROUPS: MuscleGroup[] = [
  'Chest',
  'Back',
  'Lats',
  'Upper Back',
  'Lower Back',
  'Shoulders',
  'Front Delts',
  'Side Delts',
  'Rear Delts',
  'Biceps',
  'Triceps',
  'Forearms',
  'Quads',
  'Hamstrings',
  'Calves',
  'Glutes',
  'Abs',
  'Traps',
  'Legs',
  'Arms',
  'Core',
  'Cardio',
  'Full Body',
];

const EQUIPMENTS: Equipment[] = [
  'Barbell',
  'Dumbbell',
  'Cable',
  'V-Bar',
  'Rope Attachment',
  'Straight Bar',
  'Lat Pulldown Bar',
  'Single D-Handle',
  'Parallel Bar',
  'EZ Bar',
  'Machine',
  'Smith Machine',
  'Leg Press',
  'Bodyweight',
  'Kettlebell',
  'Bands',
  'Other',
];

export const ExerciseLibraryView: React.FC<ExerciseLibraryViewProps> = ({
  exercises,
  sessions,
  prs,
  onCreateCustomExercise,
  onDeleteExercise,
  weightUnit,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'All'>('All');

  // Exercise Detail Drawer State
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  // Custom Exercise Creation State
  const [isCreatingModal, setIsCreatingModal] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null);
  const [customName, setCustomName] = useState('');
  const [customMuscle, setCustomMuscle] = useState<MuscleGroup>('Chest');
  const [customEquipment, setCustomEquipment] = useState<Equipment>('Barbell');

  // Auto-suggestions list when typing custom exercise name
  const suggestions = DEFAULT_EXERCISES.filter(
    (ex) =>
      customName.trim().length >= 2 &&
      ex.name.toLowerCase().includes(customName.toLowerCase()) &&
      !exercises.some((e) => e.name.toLowerCase() === ex.name.toLowerCase())
  ).slice(0, 4);

  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = selectedMuscle === 'All' || ex.muscleGroup === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newEx: Exercise = {
      id: `custom-ex-${Date.now()}`,
      name: customName.trim(),
      muscleGroup: customMuscle,
      equipment: customEquipment,
      isCustom: true,
    };

    onCreateCustomExercise(newEx);
    setIsCreatingModal(false);
    setCustomName('');
  };

  const handlePickSuggestion = (sugg: Exercise) => {
    setCustomName(sugg.name);
    setCustomMuscle(sugg.muscleGroup);
    setCustomEquipment(sugg.equipment);
  };

  // Get historical performance for selected exercise
  const getExerciseHistory = (exerciseId: string) => {
    const history: { date: string; bestWeight: number; bestReps: number; est1RM: number }[] = [];

    const completed = sessions.filter((s) => s.status === 'completed');
    completed.sort((a, b) => b.startTime - a.startTime); // newest first

    for (const session of completed) {
      const ex = session.exercises.find((e) => e.exerciseId === exerciseId);
      if (ex && ex.sets.length > 0) {
        const completedSets = ex.sets.filter((s) => s.completed && s.weight > 0);
        if (completedSets.length > 0) {
          const sorted = [...completedSets].sort((a, b) => b.weight - a.weight);
          const topSet = sorted[0];
          history.push({
            date: new Date(session.startTime).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
            bestWeight: topSet.weight,
            bestReps: topSet.reps,
            est1RM: calculate1RM(topSet.weight, topSet.reps),
          });
        }
      }
    }

    return history;
  };

  return (
    <div id="exercise-library-view" className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Exercise Database</h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            Browse built-in exercise collection ({exercises.length} total) or add custom exercises.
          </p>
        </div>

        <button
          id="btn-open-create-custom-ex"
          onClick={() => setIsCreatingModal(true)}
          className="flex items-center space-x-1.5 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Custom Exercise</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercise database (e.g. Bicep, Tricep, V-Bar, Bench)..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedMuscle('All')}
            className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
              selectedMuscle === 'All'
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300'
            }`}
          >
            All Muscles ({exercises.length})
          </button>
          {MUSCLE_GROUPS.map((m) => {
            const count = exercises.filter((e) => e.muscleGroup === m).length;
            if (count === 0 && selectedMuscle !== m) return null;
            return (
              <button
                key={m}
                onClick={() => setSelectedMuscle(m)}
                className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                  selectedMuscle === m
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300'
                }`}
              >
                {m} {count > 0 ? `(${count})` : ''}
              </button>
            );
          })}
        </div>
      </div>

      {/* Exercises List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredExercises.map((ex) => {
          const prRecord = prs[ex.id];

          return (
            <div
              key={ex.id}
              className="p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-gray-400 dark:hover:border-zinc-600 rounded-2xl transition-all flex items-center justify-between group shadow-xs cursor-pointer"
            >
              <div className="flex-1 min-w-0 pr-2" onClick={() => setSelectedExercise(ex)}>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400">
                    {ex.muscleGroup}
                  </span>
                  {ex.isCustom && (
                    <span className="text-[9px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 px-1.5 py-0.5 rounded">
                      Custom
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                  {ex.name}
                </h3>

                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                  Equipment: {ex.equipment}
                </p>

                {prRecord ? (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1 flex items-center space-x-1">
                    <Award className="w-3 h-3" />
                    <span>
                      PR: {prRecord.maxWeight} {weightUnit}
                    </span>
                  </p>
                ) : null}
              </div>

              <div className="flex items-center space-x-1 shrink-0">
                {onDeleteExercise && (
                  <button
                    onClick={(evt) => {
                      evt.stopPropagation();
                      setExerciseToDelete(ex);
                    }}
                    className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                    title="Remove Exercise"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors" onClick={() => setSelectedExercise(ex)} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Exercise Detail Drawer / Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400">
                  {selectedExercise.muscleGroup} • {selectedExercise.equipment}
                </span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                  {selectedExercise.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedExercise(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              {/* Personal Record Summary */}
              {prs[selectedExercise.id] ? (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-900/50 p-4 rounded-xl text-amber-900 dark:text-amber-200">
                  <div className="flex items-center space-x-2 font-bold text-xs uppercase tracking-wider mb-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Personal Best Record</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <span className="text-[10px] text-amber-700 dark:text-amber-400">Max Weight</span>
                      <p className="text-base font-black">
                        {prs[selectedExercise.id].maxWeight} {weightUnit}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-700 dark:text-amber-400">Est. 1RM</span>
                      <p className="text-base font-black">
                        {prs[selectedExercise.id].estimated1RM} {weightUnit}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-700 dark:text-amber-400">Date Set</span>
                      <p className="text-xs font-bold mt-1">
                        {prs[selectedExercise.id].date}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400 dark:text-zinc-500 italic">
                  No personal records logged for this exercise yet.
                </p>
              )}

              {/* Workout History for this exercise */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-2">
                  Performance History
                </h4>

                {getExerciseHistory(selectedExercise.id).length === 0 ? (
                  <p className="text-xs text-gray-400">No previous sets logged.</p>
                ) : (
                  <div className="space-y-2">
                    {getExerciseHistory(selectedExercise.id).map((h, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 text-xs"
                      >
                        <span className="text-gray-500 dark:text-zinc-400">{h.date}</span>
                        <div className="flex items-center space-x-3">
                          <span className="font-bold text-gray-900 dark:text-white">
                            {h.bestWeight} {weightUnit} × {h.bestReps} reps
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Custom Exercise */}
      {isCreatingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Create Custom Exercise</h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Exercise Name *
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Start typing (e.g. Triceps, Lat Pulldown, V-Bar)..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none"
                />

                {/* Auto-suggestions */}
                {suggestions.length > 0 && (
                  <div className="mt-2 p-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Suggested Movements:
                    </span>
                    {suggestions.map((sugg) => (
                      <button
                        key={sugg.id}
                        type="button"
                        onClick={() => handlePickSuggestion(sugg)}
                        className="w-full text-left px-2 py-1 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg text-xs font-semibold text-gray-800 dark:text-zinc-200 flex items-center justify-between cursor-pointer"
                      >
                        <span>{sugg.name}</span>
                        <span className="text-[10px] text-gray-400">{sugg.muscleGroup} • {sugg.equipment}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    Muscle Group
                  </label>
                  <CustomSelect
                    value={customMuscle}
                    onChange={(val) => setCustomMuscle(val as MuscleGroup)}
                    options={MUSCLE_GROUPS.map((m) => ({ value: m, label: m }))}
                    size="sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    Equipment / Attachment
                  </label>
                  <CustomSelect
                    value={customEquipment}
                    onChange={(val) => setCustomEquipment(val as Equipment)}
                    options={EQUIPMENTS.map((eq) => ({ value: eq, label: eq }))}
                    size="sm"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-zinc-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black font-bold text-xs rounded-xl cursor-pointer"
                >
                  Save Exercise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Exercise Confirmation Modal */}
      <ConfirmModal
        isOpen={!!exerciseToDelete}
        title="Remove Exercise?"
        message={exerciseToDelete ? `Are you sure you want to remove "${exerciseToDelete.name}" from your exercise library?` : ''}
        confirmLabel="Remove Exercise"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => {
          if (exerciseToDelete && onDeleteExercise) {
            onDeleteExercise(exerciseToDelete.id);
            setExerciseToDelete(null);
          }
        }}
        onClose={() => setExerciseToDelete(null)}
      />
    </div>
  );
};
