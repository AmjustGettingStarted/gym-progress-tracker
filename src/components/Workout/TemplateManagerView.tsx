import React, { useState } from 'react';
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
import { WorkoutTemplate, Exercise } from '../../types';
import { CustomSelect } from '../ui/CustomSelect';
import { ExerciseSelectorModal } from './ExerciseSelectorModal';
import { Play, Plus, Trash2, Edit3, BookOpen, Dumbbell, X, GripVertical } from 'lucide-react';

function SortableTemplateExerciseCard({
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
      className={`transition-shadow ${isDragging ? 'opacity-60 z-20 ring-2 ring-emerald-500 rounded-xl' : ''}`}
    >
      {children({ attributes, listeners })}
    </div>
  );
}

interface TemplateManagerViewProps {
  templates: WorkoutTemplate[];
  exercisesLibrary: Exercise[];
  onStartFromTemplate: (templateId: string) => void;
  onCreateTemplate: (template: WorkoutTemplate) => void;
  onUpdateTemplate?: (template: WorkoutTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
  onCreateCustomExercise: (newEx: Exercise) => void;
}

export const TemplateManagerView: React.FC<TemplateManagerViewProps> = ({
  templates,
  exercisesLibrary,
  onStartFromTemplate,
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onCreateCustomExercise,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isCreatingModalOpen, setIsCreatingModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'PPL' | 'Upper/Lower' | 'Arnold' | 'Bro Split' | 'Full Body' | 'Custom'>('Custom');
  const [selectedExercises, setSelectedExercises] = useState<{ id: string; exerciseId: string; name: string; defaultSetsCount: number }[]>([]);

  // Sensors for Drag & Drop
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
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
    if (over && active.id !== over.id) {
      setSelectedExercises((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(items, oldIndex, newIndex);
        }
        return items;
      });
    }
  };

  const filteredTemplates = templates.filter((tpl) => {
    if (selectedCategory === 'All') return true;
    return tpl.category === selectedCategory;
  });

  const handleOpenCreateModal = () => {
    setEditingTemplateId(null);
    setName('');
    setDescription('');
    setCategory('Custom');
    setSelectedExercises([]);
    setIsCreatingModalOpen(true);
  };

  const handleOpenEditModal = (tpl: WorkoutTemplate) => {
    setEditingTemplateId(tpl.id);
    setName(tpl.name);
    setDescription(tpl.description || '');
    setCategory(tpl.category);
    setSelectedExercises(
      tpl.exercises.map((e, index) => {
        const exObj = exercisesLibrary.find((ex) => ex.id === e.exerciseId);
        return {
          id: `tpl-ex-${e.exerciseId}-${index}-${Math.random().toString(36).substring(2, 6)}`,
          exerciseId: e.exerciseId,
          name: exObj ? exObj.name : 'Exercise',
          defaultSetsCount: e.defaultSetsCount,
        };
      })
    );
    setIsCreatingModalOpen(true);
  };

  const handleExerciseAdd = (exercises: Exercise[]) => {
    const newItems = exercises.map((e) => ({
      id: `tpl-ex-${e.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      exerciseId: e.id,
      name: e.name,
      defaultSetsCount: 3,
    }));
    setSelectedExercises([...selectedExercises, ...newItems]);
  };

  const handleRemoveExercise = (idx: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== idx));
  };

  const handleSetsCountChange = (idx: number, count: number) => {
    const updated = [...selectedExercises];
    updated[idx].defaultSetsCount = count;
    setSelectedExercises(updated);
  };

  const handleSaveTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || selectedExercises.length === 0) return;

    const tplData: WorkoutTemplate = {
      id: editingTemplateId || `tpl-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'Custom workout split template',
      category,
      isBuiltIn: false,
      exercises: selectedExercises.map((e) => ({
        exerciseId: e.exerciseId,
        defaultSetsCount: e.defaultSetsCount,
      })),
    };

    if (editingTemplateId && onUpdateTemplate) {
      onUpdateTemplate(tplData);
    } else {
      onCreateTemplate(tplData);
    }

    setIsCreatingModalOpen(false);
    setName('');
    setDescription('');
    setSelectedExercises([]);
  };

  return (
    <div id="template-manager-view" className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Workout Templates & Splits</h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            Workout splits save your favorite exercise routines so you can start a gym session in 1 click.
          </p>
        </div>

        <button
          id="btn-create-template-open"
          onClick={handleOpenCreateModal}
          className="flex items-center space-x-1.5 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Custom Template</span>
        </button>
      </div>

      {/* Info Callout */}
      <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-2xl text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between">
        <span>💡 <strong>What are splits?</strong> Pre-configured routines like Push/Pull/Legs or Arnold Split. Launch any split instantly or delete/edit ones you don't use.</span>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none">
        {['All', 'PPL', 'Upper/Lower', 'Arnold', 'Bro Split', 'Full Body', 'Custom'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between hover:border-gray-300 dark:hover:border-zinc-700 transition-all space-y-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400">
                    {tpl.category}
                  </span>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1.5">
                    {tpl.name}
                  </h3>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEditModal(tpl)}
                    className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Edit Template"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteTemplate(tpl.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                    title="Delete Template"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-2 line-clamp-2">
                {tpl.description}
              </p>

              {/* Exercises List in Template */}
              <div className="mt-3 space-y-1 bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-gray-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Exercises ({tpl.exercises.length}):
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {tpl.exercises.map((item) => {
                    const exObj = exercisesLibrary.find((e) => e.id === item.exerciseId);
                    return (
                      <span
                        key={item.exerciseId}
                        className="text-[11px] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-zinc-200 px-2 py-0.5 rounded font-medium"
                      >
                        {exObj ? exObj.name : 'Exercise'} ({item.defaultSetsCount} sets)
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              id={`btn-start-template-${tpl.id}`}
              onClick={() => onStartFromTemplate(tpl.id)}
              className="w-full py-2.5 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-xs cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start This Workout</span>
            </button>
          </div>
        ))}
      </div>

      {/* Modal: Create Custom Template */}
      {isCreatingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">New Workout Template</h3>
              <button
                onClick={() => setIsCreatingModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTemplateSubmit} className="p-4 flex-1 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Chest & Arm Hypertrophy"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    Split Category
                  </label>
                  <CustomSelect
                    value={category}
                    onChange={(val) => setCategory(val as any)}
                    options={[
                      { value: 'Custom', label: 'Custom' },
                      { value: 'PPL', label: 'PPL' },
                      { value: 'Upper/Lower', label: 'Upper/Lower' },
                      { value: 'Arnold', label: 'Arnold' },
                      { value: 'Bro Split', label: 'Bro Split' },
                      { value: 'Full Body', label: 'Full Body' },
                    ]}
                    size="sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description..."
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Template Exercises */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                    Template Exercises ({selectedExercises.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsExercisePickerOpen(true)}
                    className="text-xs text-blue-600 dark:text-blue-400 font-bold flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Exercise</span>
                  </button>
                </div>

                {selectedExercises.length === 0 ? (
                  <p className="text-xs text-gray-400 dark:text-zinc-500 italic py-2 text-center">
                    No exercises added yet. Click "Add Exercise" above.
                  </p>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    modifiers={[restrictToVerticalAxis]}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={selectedExercises.map((ex) => ex.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {selectedExercises.map((ex, idx) => (
                          <SortableTemplateExerciseCard key={ex.id} id={ex.id}>
                            {({ attributes, listeners }) => (
                              <div className="p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-xl border border-gray-200 dark:border-zinc-700 flex items-center justify-between group">
                                <div className="flex items-center space-x-2">
                                  <button
                                    type="button"
                                    {...attributes}
                                    {...listeners}
                                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 cursor-grab active:cursor-grabbing touch-none rounded hover:bg-gray-200/50 dark:hover:bg-zinc-700/50 transition-colors"
                                    title="Drag to reorder exercise"
                                  >
                                    <GripVertical className="w-4 h-4" />
                                  </button>
                                  <h5 className="text-xs font-bold text-gray-900 dark:text-white">
                                    {ex.name}
                                  </h5>
                                </div>

                                <div className="flex items-center space-x-3">
                                  <div className="flex items-center space-x-1 text-xs">
                                    <span className="text-gray-500 dark:text-zinc-400 font-medium">Sets:</span>
                                    <input
                                      type="number"
                                      min="1"
                                      max="10"
                                      value={ex.defaultSetsCount || ''}
                                      onFocus={(e) => e.target.select()}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '') {
                                          handleSetsCountChange(idx, '' as any);
                                        } else {
                                          const num = parseInt(val, 10);
                                          handleSetsCountChange(idx, isNaN(num) ? 1 : num);
                                        }
                                      }}
                                      onBlur={() => {
                                        if (!ex.defaultSetsCount || (typeof ex.defaultSetsCount === 'number' && ex.defaultSetsCount < 1)) {
                                          handleSetsCountChange(idx, 1);
                                        } else if (typeof ex.defaultSetsCount === 'number' && ex.defaultSetsCount > 20) {
                                          handleSetsCountChange(idx, 20);
                                        }
                                      }}
                                      className="w-12 px-1.5 py-0.5 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded font-bold text-center text-xs text-gray-900 dark:text-white"
                                    />
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleRemoveExercise(idx)}
                                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </SortableTemplateExerciseCard>
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-zinc-800 flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreatingModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedExercises.length === 0}
                  className="px-5 py-2 bg-black text-white dark:bg-white dark:text-black font-bold text-xs rounded-xl disabled:opacity-40"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exercise Picker Modal for Template */}
      <ExerciseSelectorModal
        isOpen={isExercisePickerOpen}
        onClose={() => setIsExercisePickerOpen(false)}
        exercises={exercisesLibrary}
        onSelectExercises={handleExerciseAdd}
        onCreateCustomExercise={onCreateCustomExercise}
      />
    </div>
  );
};
