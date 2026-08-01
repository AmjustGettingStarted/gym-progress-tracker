import React, { useState } from 'react';
import { Exercise, MuscleGroup, Equipment } from '../../types';
import { CustomSelect } from '../ui/CustomSelect';
import { Search, Plus, Check, X, Filter } from 'lucide-react';

interface ExerciseSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercises: Exercise[];
  onSelectExercises: (selected: Exercise[]) => void;
  onCreateCustomExercise: (newEx: Exercise) => void;
}

const MUSCLE_GROUPS: MuscleGroup[] = [
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core',
  'Cardio',
  'Full Body',
];

const EQUIPMENTS: Equipment[] = [
  'Barbell',
  'Dumbbell',
  'Machine',
  'Cable',
  'Bodyweight',
  'Smith Machine',
  'Kettlebell',
  'Bands',
  'Other',
];

export const ExerciseSelectorModal: React.FC<ExerciseSelectorModalProps> = ({
  isOpen,
  onClose,
  exercises,
  onSelectExercises,
  onCreateCustomExercise,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'All'>('All');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | 'All'>('All');
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);

  // Custom Exercise Creation State
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customMuscle, setCustomMuscle] = useState<MuscleGroup>('Chest');
  const [customEquipment, setCustomEquipment] = useState<Equipment>('Barbell');

  if (!isOpen) return null;

  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = selectedMuscle === 'All' || ex.muscleGroup === selectedMuscle;
    const matchesEquipment = selectedEquipment === 'All' || ex.equipment === selectedEquipment;
    return matchesSearch && matchesMuscle && matchesEquipment;
  });

  const toggleSelect = (id: string) => {
    if (selectedExerciseIds.includes(id)) {
      setSelectedExerciseIds(selectedExerciseIds.filter((i) => i !== id));
    } else {
      setSelectedExerciseIds([...selectedExerciseIds, id]);
    }
  };

  const handleAddSelected = () => {
    const chosen = exercises.filter((ex) => selectedExerciseIds.includes(ex.id));
    onSelectExercises(chosen);
    setSelectedExerciseIds([]);
    onClose();
  };

  const handleCreateCustomSubmit = (e: React.FormEvent) => {
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
    setSelectedExerciseIds([...selectedExerciseIds, newEx.id]);
    setCustomName('');
    setIsCreatingCustom(false);
  };

  return (
    <div
      id="exercise-selector-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Select Exercises</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Pick exercises to add to your active workout
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:text-black dark:text-zinc-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!isCreatingCustom ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search exercise by name..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            {/* Category Pills */}
            <div className="space-y-2">
              <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-xs font-semibold text-gray-400 mr-1 shrink-0">Muscle:</span>
                <button
                  onClick={() => setSelectedMuscle('All')}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 transition-colors ${
                    selectedMuscle === 'All'
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300'
                  }`}
                >
                  All
                </button>
                {MUSCLE_GROUPS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMuscle(m)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 transition-colors ${
                      selectedMuscle === m
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise List */}
            <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
              {filteredExercises.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                  No exercises match your search filters.
                </div>
              ) : (
                filteredExercises.map((ex) => {
                  const isSelected = selectedExerciseIds.includes(ex.id);
                  return (
                    <div
                      key={ex.id}
                      onClick={() => toggleSelect(ex.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                          : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
                      }`}
                    >
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {ex.name}
                        </h4>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-[10px] font-medium text-gray-500 dark:text-zinc-400">
                            {ex.muscleGroup}
                          </span>
                          <span className="text-[10px] text-gray-400">•</span>
                          <span className="text-[10px] font-medium text-gray-500 dark:text-zinc-400">
                            {ex.equipment}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-gray-300 dark:border-zinc-600'
                        }`}
                      >
                        {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={() => setIsCreatingCustom(true)}
              className="w-full py-2.5 border border-dashed border-gray-300 dark:border-zinc-700 rounded-xl text-xs font-semibold text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:border-gray-400 dark:hover:border-zinc-500 flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Custom Exercise</span>
            </button>
          </div>
        ) : (
          /* Custom Exercise Form */
          <form onSubmit={handleCreateCustomSubmit} className="p-5 space-y-4">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">New Custom Exercise</h4>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Exercise Name *
              </label>
              <input
                type="text"
                required
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Bulgarian Split Squat"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Primary Muscle
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
                  Equipment
                </label>
                <CustomSelect
                  value={customEquipment}
                  onChange={(val) => setCustomEquipment(val as Equipment)}
                  options={EQUIPMENTS.map((eq) => ({ value: eq, label: eq }))}
                  size="sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreatingCustom(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-bold"
              >
                Save & Select Exercise
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        {!isCreatingCustom && (
          <div className="p-4 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between bg-gray-50 dark:bg-zinc-900/80">
            <span className="text-xs text-gray-500 dark:text-zinc-400">
              {selectedExerciseIds.length} exercise(s) selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                id="btn-add-selected-exercises"
                disabled={selectedExerciseIds.length === 0}
                onClick={handleAddSelected}
                className="px-5 py-2 bg-black text-white dark:bg-white dark:text-black disabled:opacity-40 rounded-xl text-xs font-bold transition-all"
              >
                Add to Workout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
