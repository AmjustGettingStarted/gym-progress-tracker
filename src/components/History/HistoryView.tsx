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
import { WorkoutSession } from '../../types';
import { formatDate, formatDuration } from '../../lib/calculations';
import { StorageService } from '../../lib/storage';
import { Search, Calendar, Clock, Award, Trash2, Play, ChevronDown, ChevronUp, Download, Eye, X, GripVertical, ChevronLeft, ChevronRight } from 'lucide-react';

interface HistoryViewProps {
  sessions: WorkoutSession[];
  onDeleteSession: (sessionId: string) => void;
  onRepeatSession: (session: WorkoutSession) => void;
  weightUnit: string;
}

function DraggableTableRow({
  id,
  ex,
  exIdx,
  maxSetsCount,
  weightUnit,
}: {
  key?: React.Key;
  id: string;
  ex: any;
  exIdx: number;
  maxSetsCount: number;
  weightUnit: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const setIndexes = Array.from({ length: maxSetsCount }, (_, i) => i);

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover:bg-gray-50/50 dark:hover:bg-zinc-800/40 transition-colors border-b border-gray-100 dark:border-zinc-800/60 ${
        isDragging ? 'opacity-60 z-20 bg-emerald-50 dark:bg-emerald-950/40' : ''
      }`}
    >
      <td className="p-3 text-center text-gray-400 font-bold w-10">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-grab active:cursor-grabbing rounded hover:bg-gray-200 dark:hover:bg-zinc-800 inline-flex items-center justify-center"
          title="Drag to reorder"
        >
          <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" />
        </button>
      </td>
      <td className="p-3 font-bold text-gray-900 dark:text-white whitespace-nowrap">
        {ex.exerciseName}
      </td>
      <td className="p-3 whitespace-nowrap">
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700">
          {ex.muscleGroup}
        </span>
      </td>
      {setIndexes.map((stIdx) => {
        const st = ex.sets?.[stIdx];
        if (!st) {
          return (
            <td key={stIdx} className="p-3 text-center text-gray-300 dark:text-zinc-700">
              -
            </td>
          );
        }
        return (
          <td key={stIdx} className="p-3 text-center whitespace-nowrap">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-zinc-800/80 border border-gray-200/80 dark:border-zinc-700/80 shadow-2xs">
              <span className="text-xs font-mono font-bold text-gray-900 dark:text-white">
                {st.weight}{weightUnit} × {st.reps}
              </span>
              {st.setType && st.setType !== 'Normal' && (
                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider px-1 bg-emerald-50 dark:bg-emerald-950/60 rounded">
                  {st.setType}
                </span>
              )}
            </div>
          </td>
        );
      })}
    </tr>
  );
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  sessions,
  onDeleteSession,
  onRepeatSession,
  weightUnit,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [detailModalSession, setDetailModalSession] = useState<WorkoutSession | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, pageSize]);

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
      setDetailModalSession((prev) => {
        if (!prev) return null;
        const items = prev.exercises;
        const oldIndex = items.findIndex(
          (ex, idx) => `ex-${ex.exerciseId || idx}-${idx}` === active.id
        );
        const newIndex = items.findIndex(
          (ex, idx) => `ex-${ex.exerciseId || idx}-${idx}` === over.id
        );
        if (oldIndex !== -1 && newIndex !== -1) {
          return {
            ...prev,
            exercises: arrayMove(items, oldIndex, newIndex),
          };
        }
        return prev;
      });
    }
  };

  const completedSessions = sessions.filter((s) => s.status === 'completed');
  completedSessions.sort((a, b) => b.startTime - a.startTime); // newest first

  const filteredSessions = completedSessions.filter((s) => {
    const matchesTitle = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesExercise = s.exercises.some((e) =>
      e.exerciseName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesTitle || matchesExercise;
  });

  const totalPages = Math.ceil(filteredSessions.length / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedSessions = filteredSessions.slice(startIndex, startIndex + pageSize);

  const toggleExpand = (id: string) => {
    setExpandedSessionId(expandedSessionId === id ? null : id);
  };

  const handleDownloadDayData = (session: WorkoutSession) => {
    const csvContent = StorageService.exportSessionsCSV([session]);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date(session.startTime).toISOString().split('T')[0];
    link.setAttribute('download', `Workout_Data_${session.name.replace(/\s+/g, '_')}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="history-view" className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Workout History</h2>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
          Review past workout logs, set stats, export specific day data, or repeat workouts.
        </p>

        <div className="mt-4 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search history by workout or exercise name..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none"
          />
        </div>
      </div>

      {/* History Sessions List */}
      <div className="space-y-3">
        {filteredSessions.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-10 rounded-2xl text-center space-y-2">
            <Calendar className="w-10 h-10 mx-auto text-gray-400 opacity-50" />
            <p className="text-sm font-bold text-gray-900 dark:text-white">No workout history found</p>
            <p className="text-xs text-gray-500">Log your first workout to see your history here.</p>
          </div>
        ) : (
          paginatedSessions.map((s) => {
            const isExpanded = expandedSessionId === s.id;

            return (
              <div
                key={s.id}
                className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-3 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="cursor-pointer" onClick={() => setDetailModalSession(s)}>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                      {s.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                      {formatDate(s.startTime)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {s.prCount && s.prCount > 0 ? (
                      <span className="inline-flex items-center space-x-1 text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full">
                        <Award className="w-3 h-3" />
                        <span>{s.prCount} PR</span>
                      </span>
                    ) : null}

                    {/* View In-depth Details Button */}
                    <button
                      onClick={() => setDetailModalSession(s)}
                      className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                      title="In-depth Workout Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Download Specific Day's Data Button */}
                    <button
                      onClick={() => handleDownloadDayData(s)}
                      className="p-1.5 text-gray-400 hover:text-emerald-500 rounded-lg transition-colors cursor-pointer"
                      title="Download Day's CSV Data"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {/* Delete Session Button */}
                    <button
                      onClick={() => onDeleteSession(s.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                      title="Delete Session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-zinc-400 py-1 border-y border-gray-100 dark:border-zinc-800">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>{formatDuration(s.durationSeconds)}</span>
                  </div>
                  <div>•</div>
                  <div>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {s.totalVolume.toLocaleString()}
                    </span>{' '}
                    {weightUnit}
                  </div>
                  <div>•</div>
                  <div>{s.exercises.length} exercises</div>
                </div>

                {/* Exercises summary or expanded sets table */}
                {!isExpanded ? (
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {s.exercises.map((ex) => (
                        <span
                          key={ex.exerciseId}
                          className="text-[10px] bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 px-2 py-0.5 rounded font-medium"
                        >
                          {ex.exerciseName}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => toggleExpand(s.id)}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center space-x-1 shrink-0 ml-2 cursor-pointer"
                    >
                      <span>Show Sets</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 pt-2">
                    {s.exercises.map((ex, exIdx) => (
                      <div
                        key={exIdx}
                        className="bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-gray-100 dark:border-zinc-800 space-y-2"
                      >
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                          {ex.exerciseName}
                        </h4>

                        <div className="space-y-1">
                          {ex.sets.map((set, setIdx) => (
                            <div
                              key={set.id}
                              className="flex items-center justify-between text-xs text-gray-700 dark:text-zinc-300 py-0.5"
                            >
                              <span>Set {setIdx + 1} ({set.setType}):</span>
                              <span className="font-mono font-bold">
                                {set.weight} {weightUnit} × {set.reps} reps
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-zinc-800">
                      <button
                        onClick={() => onRepeatSession(s)}
                        className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Perform Workout Again</span>
                      </button>

                      <button
                        onClick={() => toggleExpand(s.id)}
                        className="text-xs font-semibold text-gray-500 flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Hide Sets</span>
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls Bar */}
      {filteredSessions.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-zinc-400">
            <span>
              Showing <strong className="text-gray-900 dark:text-white">{startIndex + 1}</strong> to{' '}
              <strong className="text-gray-900 dark:text-white">
                {Math.min(startIndex + pageSize, filteredSessions.length)}
              </strong>{' '}
              of <strong className="text-gray-900 dark:text-white">{filteredSessions.length}</strong> workouts
            </span>

            <div className="flex items-center space-x-1.5 border-l border-gray-200 dark:border-zinc-700 pl-3">
              <span className="text-gray-400">Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-xs text-gray-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer text-gray-700 dark:text-zinc-300"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  pageNum === safeCurrentPage
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage >= totalPages}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer text-gray-700 dark:text-zinc-300"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* In-Depth Workout Detail Modal / Data Table Page */}
      {detailModalSession && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Header Toolbar */}
            <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center space-x-3">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  {formatDate(detailModalSession.startTime)}
                </span>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">
                    {detailModalSession.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">
                    {formatDuration(detailModalSession.durationSeconds)} • {detailModalSession.totalVolume.toLocaleString()} {weightUnit} total volume
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownloadDayData(detailModalSession)}
                  className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>
                <button
                  onClick={() => setDetailModalSession(null)}
                  className="p-1.5 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-zinc-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Data Table Content Area */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
              {/* Table controls */}
              <div className="flex items-center justify-between gap-2 border-b border-gray-200 dark:border-zinc-800 pb-3">
                <div className="flex items-center space-x-2 text-xs font-bold">
                  <span className="px-3 py-1.5 rounded-lg bg-gray-900 text-white dark:bg-white dark:text-black">Outline View</span>
                  <span className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400">Performance Log</span>
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  {detailModalSession.exercises.length} Exercises Logged
                </div>
              </div>

              {/* Styled Data Table matching user design with working drag-and-drop */}
              {(() => {
                const maxSetsCount = Math.max(
                  3,
                  ...detailModalSession.exercises.map((ex) => ex.sets ? ex.sets.length : 0)
                );
                const setColumns = Array.from({ length: maxSetsCount }, (_, i) => i + 1);

                return (
                  <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
                    <DndContext
                      collisionDetection={closestCenter}
                      modifiers={[restrictToVerticalAxis]}
                      onDragEnd={handleDragEnd}
                      sensors={sensors}
                    >
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-zinc-800/80 text-gray-500 dark:text-zinc-400 font-bold border-b border-gray-200 dark:border-zinc-800">
                            <th className="p-3 w-10 text-center">#</th>
                            <th className="p-3 min-w-[140px]">Exercise</th>
                            <th className="p-3 min-w-[100px]">Muscle</th>
                            {setColumns.map((setNum) => (
                              <th key={setNum} className="p-3 text-center min-w-[110px]">
                                Set {setNum}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/80">
                          <SortableContext
                            items={detailModalSession.exercises.map(
                              (ex, idx) => `ex-${ex.exerciseId || idx}-${idx}`
                            )}
                            strategy={verticalListSortingStrategy}
                          >
                            {detailModalSession.exercises.map((ex, exIdx) => {
                              const itemId = `ex-${ex.exerciseId || exIdx}-${exIdx}`;
                              return (
                                <DraggableTableRow
                                  key={itemId}
                                  id={itemId}
                                  ex={ex}
                                  exIdx={exIdx}
                                  maxSetsCount={maxSetsCount}
                                  weightUnit={weightUnit}
                                />
                              );
                            })}
                          </SortableContext>
                        </tbody>
                      </table>
                    </DndContext>
                  </div>
                );
              })()}

              {detailModalSession.notes && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl text-xs text-blue-900 dark:text-blue-200">
                  <strong className="block mb-1 font-bold">Session Notes:</strong>
                  {detailModalSession.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
