import React, { useState, useEffect, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { CustomSelect } from '../ui/CustomSelect';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  WorkoutSession,
  SessionExercise,
  ExerciseSet,
  Exercise,
  SetType,
  PersonalRecord,
} from '../../types';
import { calculate1RM, calculateSessionVolume, formatDuration } from '../../lib/calculations';
import { ExerciseSelectorModal } from './ExerciseSelectorModal';
import { RestTimerBar } from '../RestTimerBar';
import {
  Clock,
  Plus,
  Trash2,
  Check,
  Award,
  MoreVertical,
  Dumbbell,
  FileText,
  Copy,
  ChevronDown,
  Sparkles,
  X,
  CheckCircle2,
  GripVertical,
} from 'lucide-react';

function SortableExerciseCard({
  id,
  children,
}: {
  key?: React.Key;
  id: string;
  children: (dragProps: { attributes: any; listeners: any }) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`transition-shadow ${isDragging ? 'opacity-60 z-20 ring-2 ring-emerald-500 rounded-2xl' : ''}`}
    >
      {children({ attributes, listeners })}
    </div>
  );
}

interface WorkoutLoggerProps {
  activeSession: WorkoutSession;
  onUpdateSession: (session: WorkoutSession) => void;
  onFinishWorkout: (completedSession: WorkoutSession) => void;
  onDiscardWorkout: () => void;
  exercisesLibrary: Exercise[];
  onCreateCustomExercise: (newEx: Exercise) => void;
  previousSessions: WorkoutSession[];
  weightUnit: string;
  soundEnabled: boolean;
  defaultRestTimerSeconds: number;
}

export const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({
  activeSession,
  onUpdateSession,
  onFinishWorkout,
  onDiscardWorkout,
  exercisesLibrary,
  onCreateCustomExercise,
  previousSessions,
  weightUnit,
  soundEnabled,
  defaultRestTimerSeconds,
}) => {
  // Timer state
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(activeSession.durationSeconds || 0);

  // Rest Timer State
  const [restTimerActive, setRestTimerActive] = useState<boolean>(false);
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number>(defaultRestTimerSeconds);
  const [showRestTimer, setShowRestTimer] = useState<boolean>(false);

  // Exercise Picker Modal
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState<boolean>(false);

  // Finish Summary Modal
  const [showFinishModal, setShowFinishModal] = useState<boolean>(false);
  const [completedSummary, setCompletedSummary] = useState<WorkoutSession | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 2,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const items = activeSession.exercises;
      const oldIndex = items.findIndex(
        (ex, idx) => `active-ex-${ex.exerciseId || idx}-${idx}` === active.id
      );
      const newIndex = items.findIndex(
        (ex, idx) => `active-ex-${ex.exerciseId || idx}-${idx}` === over.id
      );
      if (oldIndex !== -1 && newIndex !== -1) {
        onUpdateSession({
          ...activeSession,
          exercises: arrayMove(items, oldIndex, newIndex),
        });
      }
    }
  };

  // Keep activeSession and onUpdateSession in refs for safe timer updates
  const activeSessionRef = useRef(activeSession);
  useEffect(() => {
    activeSessionRef.current = activeSession;
  }, [activeSession]);

  const onUpdateSessionRef = useRef(onUpdateSession);
  useEffect(() => {
    onUpdateSessionRef.current = onUpdateSession;
  }, [onUpdateSession]);

  // Elapsed timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync elapsedSeconds to parent draft in useEffect (outside render phase)
  useEffect(() => {
    if (elapsedSeconds > 0) {
      onUpdateSessionRef.current({
        ...activeSessionRef.current,
        durationSeconds: elapsedSeconds,
      });
    }
  }, [elapsedSeconds]);

  // Rest timer tick
  useEffect(() => {
    let interval: any = null;
    if (restTimerActive && restSecondsRemaining > 0) {
      interval = setInterval(() => {
        setRestSecondsRemaining((prev) => {
          if (prev <= 1) return 0;
          return prev - 1;
        });
      }, 1000);
    } else if (restTimerActive && restSecondsRemaining === 0) {
      setRestTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [restTimerActive, restSecondsRemaining]);

  const startRestTimer = (seconds: number) => {
    setRestSecondsRemaining(seconds);
    setRestTimerActive(true);
    setShowRestTimer(true);
  };

  // Find previous performance for an exercise
  const getPreviousExerciseStats = (exerciseId: string) => {
    for (const session of previousSessions) {
      if (session.status !== 'completed') continue;
      const ex = session.exercises.find((e) => e.exerciseId === exerciseId);
      if (ex && ex.sets.length > 0) {
        const bestSet = [...ex.sets]
          .filter((s) => s.completed)
          .sort((a, b) => b.weight - a.weight)[0];
        if (bestSet) {
          return {
            date: new Date(session.startTime).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
            weight: bestSet.weight,
            reps: bestSet.reps,
          };
        }
      }
    }
    return null;
  };

  // Handlers for session fields
  const handleTitleChange = (newTitle: string) => {
    onUpdateSession({ ...activeSession, name: newTitle });
  };

  const handleNotesChange = (notes: string) => {
    onUpdateSession({ ...activeSession, notes });
  };

  // Exercise manipulation
  const handleAddExercises = (selected: Exercise[]) => {
    const newExercises: SessionExercise[] = selected.map((ex) => ({
      exerciseId: ex.id,
      exerciseName: ex.name,
      muscleGroup: ex.muscleGroup,
      sets: [
        {
          id: `set-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          setType: 'Normal',
          weight: 0,
          reps: 0,
          completed: false,
        },
      ],
    }));

    onUpdateSession({
      ...activeSession,
      exercises: [...activeSession.exercises, ...newExercises],
    });
  };

  const handleRemoveExercise = (index: number) => {
    const updated = activeSession.exercises.filter((_, idx) => idx !== index);
    onUpdateSession({ ...activeSession, exercises: updated });
  };

  const handleExerciseNotesChange = (index: number, notes: string) => {
    const updated = [...activeSession.exercises];
    updated[index].notes = notes;
    onUpdateSession({ ...activeSession, exercises: updated });
  };

  // Set manipulation
  const handleAddSet = (exerciseIndex: number) => {
    const updated = [...activeSession.exercises];
    const sets = updated[exerciseIndex].sets;

    const newSet: ExerciseSet = {
      id: `set-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      setType: 'Normal',
      weight: 0,
      reps: 0,
      completed: false,
    };

    updated[exerciseIndex].sets = [...sets, newSet];
    onUpdateSession({ ...activeSession, exercises: updated });
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    const updated = [...activeSession.exercises];
    updated[exerciseIndex].sets = updated[exerciseIndex].sets.filter((_, idx) => idx !== setIndex);
    onUpdateSession({ ...activeSession, exercises: updated });
  };

  const handleUpdateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: keyof ExerciseSet,
    value: any
  ) => {
    const updated = [...activeSession.exercises];
    const set = { ...updated[exerciseIndex].sets[setIndex], [field]: value };

    // If completed is toggled to true, trigger rest timer!
    if (field === 'completed' && value === true) {
      startRestTimer(defaultRestTimerSeconds);
    }

    updated[exerciseIndex].sets[setIndex] = set;

    const totalVol = calculateSessionVolume(updated);
    onUpdateSession({
      ...activeSession,
      exercises: updated,
      totalVolume: totalVol,
    });
  };

  // Finish Workout Process
  const handlePromptFinish = () => {
    const totalVol = calculateSessionVolume(activeSession.exercises);
    const finalSession: WorkoutSession = {
      ...activeSession,
      endTime: Date.now(),
      status: 'completed',
      durationSeconds: elapsedSeconds,
      totalVolume: totalVol,
    };

    setCompletedSummary(finalSession);
    setShowFinishModal(true);
  };

  const handleConfirmFinish = () => {
    if (completedSummary) {
      onFinishWorkout(completedSummary);
    }
  };

  return (
    <div id="workout-logger-view" className="space-y-6 pb-28 md:pb-12 max-w-4xl mx-auto">
      {/* Top Banner & Timer */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-4 md:p-5 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Live Session
            </span>
          </div>

          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl font-mono text-xs font-bold text-gray-900 dark:text-white">
            <Clock className="w-3.5 h-3.5 text-gray-500" />
            <span>{formatDuration(elapsedSeconds)}</span>
          </div>
        </div>

        {/* Workout Name Input */}
        <div>
          <input
            type="text"
            value={activeSession.name}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Workout Title (e.g. Chest & Triceps)"
            className="w-full text-xl md:text-2xl font-black bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-zinc-700 focus:border-black dark:focus:border-white focus:outline-none text-gray-900 dark:text-white transition-colors"
          />
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Total Volume: <span className="font-bold text-gray-900 dark:text-white">{calculateSessionVolume(activeSession.exercises).toLocaleString()} {weightUnit}</span>
          </p>
        </div>

        {/* Workout Notes */}
        <div>
          <textarea
            value={activeSession.notes || ''}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Workout notes or energy levels..."
            rows={2}
            className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
          />
        </div>
      </div>

      {/* Exercises Section */}
      <div className="space-y-4">
        {activeSession.exercises.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-dashed border-gray-300 dark:border-zinc-800 p-8 rounded-2xl text-center space-y-3">
            <Dumbbell className="w-10 h-10 mx-auto text-gray-400 opacity-60" />
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">No exercises added yet</h4>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Add exercises from the library to start logging your sets.
              </p>
            </div>
            <button
              id="btn-add-exercise-empty"
              onClick={() => setIsExercisePickerOpen(true)}
              className="inline-flex items-center space-x-2 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs hover:bg-gray-800 dark:hover:bg-gray-200 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Exercise</span>
            </button>
          </div>
        ) : (
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
          >
            <SortableContext
              items={activeSession.exercises.map(
                (ex, idx) => `active-ex-${ex.exerciseId || idx}-${idx}`
              )}
              strategy={verticalListSortingStrategy}
            >
              {activeSession.exercises.map((ex, exIdx) => {
                const prevStats = getPreviousExerciseStats(ex.exerciseId);
                const itemId = `active-ex-${ex.exerciseId || exIdx}-${exIdx}`;

                return (
                  <SortableExerciseCard key={itemId} id={itemId}>
                    {({ attributes, listeners }) => (
                      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 space-y-3 shadow-xs">
                        {/* Exercise Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-2">
                            <button
                              type="button"
                              {...attributes}
                              {...listeners}
                              className="mt-0.5 p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-grab active:cursor-grabbing rounded hover:bg-gray-100 dark:hover:bg-zinc-800"
                              title="Drag to reorder exercise"
                            >
                              <GripVertical className="w-4 h-4" />
                            </button>
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400">
                                {ex.muscleGroup}
                              </span>
                              <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1">
                                {ex.exerciseName}
                              </h3>

                              {/* Previous Set Comparison Indicator */}
                              {prevStats && (
                                <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
                                  Prev: <span className="font-semibold text-gray-700 dark:text-zinc-300">{prevStats.weight} {weightUnit} × {prevStats.reps} reps</span> ({prevStats.date})
                                </p>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => handleRemoveExercise(exIdx)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                            title="Remove Exercise"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                {/* Per Exercise Notes Input */}
                <div>
                  <input
                    type="text"
                    value={ex.notes || ''}
                    onChange={(e) => handleExerciseNotesChange(exIdx, e.target.value)}
                    placeholder="Exercise note (e.g., seat setting 4, wide grip)..."
                    className="w-full text-xs text-gray-700 dark:text-zinc-300 bg-gray-50 dark:bg-zinc-800/40 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 focus:outline-none"
                  />
                </div>

                {/* Sets Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-zinc-500 border-b border-gray-100 dark:border-zinc-800">
                        <th className="pb-2 w-10 text-center">Set</th>
                        <th className="pb-2 w-32">Type</th>
                        <th className="pb-2 w-24">Weight ({weightUnit})</th>
                        <th className="pb-2 w-20">Reps</th>
                        <th className="pb-2 w-16 text-center">1RM</th>
                        <th className="pb-2 w-12 text-center">Done</th>
                        <th className="pb-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
                      {ex.sets.map((set, setIdx) => {
                        const est1RM = calculate1RM(set.weight, set.reps);

                        return (
                          <tr
                            key={set.id}
                            className={`transition-colors ${
                              set.completed
                                ? 'bg-emerald-50/40 dark:bg-emerald-950/20'
                                : ''
                            }`}
                          >
                            {/* Set Number */}
                            <td className="py-2 text-center font-bold text-gray-600 dark:text-zinc-400">
                              {setIdx + 1}
                            </td>

                            {/* Set Type */}
                            <td className="py-2">
                              <Select
                                value={set.setType || 'Normal'}
                                onValueChange={(val) =>
                                  handleUpdateSet(exIdx, setIdx, 'setType', val as SetType)
                                }
                              >
                                <SelectTrigger className="w-28 sm:w-32 h-8 text-xs font-semibold">
                                  <SelectValue placeholder="Set Type" />
                                </SelectTrigger>
                                <SelectContent className="z-50">
                                  <SelectItem value="Normal">Normal</SelectItem>
                                  <SelectItem value="Warmup">Warmup (W)</SelectItem>
                                  <SelectItem value="Working Set">Working Set</SelectItem>
                                  <SelectItem value="Top Set">Top Set (T)</SelectItem>
                                  <SelectItem value="Back-off Set">Back-off Set</SelectItem>
                                  <SelectItem value="Drop">Drop Set (D)</SelectItem>
                                  <SelectItem value="Failure">Failure (F)</SelectItem>
                                  <SelectItem value="Rest-Pause">Rest-Pause</SelectItem>
                                  <SelectItem value="Cluster">Cluster</SelectItem>
                                  <SelectItem value="Super Set">Super Set</SelectItem>
                                  <SelectItem value="Myo-reps">Myo-reps</SelectItem>
                                  <SelectItem value="AMRAP">AMRAP</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>

                            {/* Weight */}
                            <td className="py-2">
                              <input
                                type="number"
                                step="0.5"
                                value={set.weight || ''}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) =>
                                  handleUpdateSet(exIdx, setIdx, 'weight', parseFloat(e.target.value) || 0)
                                }
                                className="w-20 px-2 py-1 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                                placeholder="0"
                              />
                            </td>

                            {/* Reps */}
                            <td className="py-2">
                              <input
                                type="number"
                                value={set.reps || ''}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) =>
                                  handleUpdateSet(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)
                                }
                                className="w-16 px-2 py-1 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                                placeholder="0"
                              />
                            </td>

                            {/* Est 1RM */}
                            <td className="py-2 text-center font-mono text-[11px] font-medium text-gray-500 dark:text-zinc-400">
                              {est1RM > 0 ? `${est1RM}` : '-'}
                            </td>

                            {/* Checkbox */}
                            <td className="py-2 text-center">
                              <button
                                onClick={() =>
                                  handleUpdateSet(exIdx, setIdx, 'completed', !set.completed)
                                }
                                className={`w-6 h-6 rounded-md border flex items-center justify-center mx-auto transition-all ${
                                  set.completed
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : 'border-gray-300 dark:border-zinc-600 hover:border-emerald-500'
                                }`}
                              >
                                {set.completed && <Check className="w-4 h-4 stroke-[3]" />}
                              </button>
                            </td>

                            {/* Delete Set */}
                            <td className="py-2 text-right">
                              <button
                                onClick={() => handleRemoveSet(exIdx, setIdx)}
                                className="p-1 text-gray-300 hover:text-red-500 dark:text-zinc-600 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Add Set Button */}
                <button
                  onClick={() => handleAddSet(exIdx)}
                  className="w-full py-2 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-gray-700 dark:text-zinc-300 flex items-center justify-center space-x-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Set</span>
                </button>
                      </div>
                    )}
                  </SortableExerciseCard>
                );
              })}
            </SortableContext>
          </DndContext>
        )}

        {/* Add Exercise Floating / Bottom Button */}
        <button
          id="btn-add-exercise-bottom"
          onClick={() => setIsExercisePickerOpen(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-zinc-800 rounded-2xl text-xs font-bold text-gray-700 dark:text-zinc-300 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white flex items-center justify-center space-x-2 transition-colors bg-white dark:bg-zinc-900"
        >
          <Plus className="w-4 h-4" />
          <span>Add More Exercises</span>
        </button>
      </div>

      {/* Logger Bottom Controls */}
      <div className="flex items-center space-x-3 pt-4">
        <button
          id="btn-discard-workout"
          onClick={onDiscardWorkout}
          className="w-1/3 py-3 border border-red-200 dark:border-red-950/60 bg-red-50/50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/60 rounded-2xl text-xs font-bold transition-all"
        >
          Discard
        </button>

        <button
          id="btn-finish-workout"
          onClick={handlePromptFinish}
          className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Finish Workout</span>
        </button>
      </div>

      {/* Rest Timer Bar */}
      {showRestTimer && (
        <RestTimerBar
          secondsRemaining={restSecondsRemaining}
          isActive={restTimerActive}
          onStartTimer={startRestTimer}
          onPauseTimer={() => setRestTimerActive(false)}
          onResumeTimer={() => setRestTimerActive(true)}
          onResetTimer={() => setRestSecondsRemaining(defaultRestTimerSeconds)}
          onClose={() => setShowRestTimer(false)}
          soundEnabled={soundEnabled}
        />
      )}

      {/* Exercise Selector Modal */}
      <ExerciseSelectorModal
        isOpen={isExercisePickerOpen}
        onClose={() => setIsExercisePickerOpen(false)}
        exercises={exercisesLibrary}
        onSelectExercises={handleAddExercises}
        onCreateCustomExercise={onCreateCustomExercise}
      />

      {/* Finish Celebration Summary Modal */}
      {showFinishModal && completedSummary && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Workout Complete!</h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                Great effort! Here is your session breakdown:
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-gray-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800">
              <div>
                <span className="text-[10px] font-semibold text-gray-400 uppercase">Duration</span>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatDuration(completedSummary.durationSeconds)}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-gray-400 uppercase">Total Volume</span>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {completedSummary.totalVolume.toLocaleString()} {weightUnit}
                </p>
              </div>
            </div>

            <div className="text-left text-xs space-y-1 bg-gray-50 dark:bg-zinc-800/30 p-3 rounded-xl">
              <span className="font-semibold text-gray-500 dark:text-zinc-400">Exercises Completed:</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {completedSummary.exercises.map((e) => e.exerciseName).join(', ')}
              </p>
            </div>

            <button
              id="btn-confirm-finish-workout"
              onClick={handleConfirmFinish}
              className="w-full py-3 bg-black text-white dark:bg-white dark:text-black rounded-xl text-sm font-bold shadow-sm"
            >
              Save Session to History
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
