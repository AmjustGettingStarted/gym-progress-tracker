import React, { useState } from 'react';
import { CustomSelect } from '../ui/CustomSelect';
import {
  WorkoutSession,
  Exercise,
  PersonalRecord,
  BodyMeasurement,
  ProgressPhoto,
} from '../../types';
import { calculate1RM, formatDate } from '../../lib/calculations';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  Award,
  Scale,
  Camera,
  Plus,
  Trash2,
  Calendar,
  X,
  Upload,
} from 'lucide-react';

interface ProgressViewProps {
  sessions: WorkoutSession[];
  exercises: Exercise[];
  prs: Record<string, PersonalRecord>;
  measurements: BodyMeasurement[];
  onAddMeasurement: (m: BodyMeasurement) => void;
  onDeleteMeasurement: (id: string) => void;
  photos: ProgressPhoto[];
  onAddPhoto: (p: ProgressPhoto) => void;
  onDeletePhoto: (id: string) => void;
  weightUnit: string;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  sessions,
  exercises,
  prs,
  measurements,
  onAddMeasurement,
  onDeleteMeasurement,
  photos,
  onAddPhoto,
  onDeletePhoto,
  weightUnit,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'prs' | 'body' | 'photos'>('analytics');

  // Exercise Chart Selection
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(
    exercises.length > 0 ? exercises[0].id : ''
  );

  // New Body Measurement Modal
  const [isAddMeasurementOpen, setIsAddMeasurementOpen] = useState(false);
  const [mWeight, setMWeight] = useState<string>('');
  const [mFat, setMFat] = useState<string>('');
  const [mChest, setMChest] = useState<string>('');
  const [mWaist, setMWaist] = useState<string>('');
  const [mArms, setMArms] = useState<string>('');
  const [mThighs, setMThighs] = useState<string>('');

  // New Photo State
  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState(false);
  const [photoTag, setPhotoTag] = useState<'Front' | 'Back' | 'Side'>('Front');
  const [photoDataUrl, setPhotoDataUrl] = useState<string>('');

  // Prepare Exercise Progress Data for Recharts
  const getExerciseDataForChart = (exId: string) => {
    const data: { date: string; maxWeight: number; est1RM: number }[] = [];
    const completed = sessions.filter((s) => s.status === 'completed');
    completed.sort((a, b) => a.startTime - b.startTime); // oldest to newest

    for (const session of completed) {
      const ex = session.exercises.find((e) => e.exerciseId === exId);
      if (ex && ex.sets.length > 0) {
        const completedSets = ex.sets.filter((s) => s.completed && s.weight > 0);
        if (completedSets.length > 0) {
          const maxW = Math.max(...completedSets.map((s) => s.weight));
          const topSet = completedSets.find((s) => s.weight === maxW)!;
          data.push({
            date: new Date(session.startTime).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
            maxWeight: maxW,
            est1RM: calculate1RM(topSet.weight, topSet.reps),
          });
        }
      }
    }
    return data;
  };

  const chartData = getExerciseDataForChart(selectedExerciseId);

  // Body weight chart data
  const bodyWeightChartData = [...measurements]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((m) => ({
      date: formatDate(m.date),
      weight: m.weightKg,
      fat: m.bodyFatPercentage || null,
    }));

  const handleSaveMeasurementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mWeight) return;

    const newM: BodyMeasurement = {
      id: `bm-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      weightKg: parseFloat(mWeight),
      bodyFatPercentage: mFat ? parseFloat(mFat) : undefined,
      chestCm: mChest ? parseFloat(mChest) : undefined,
      waistCm: mWaist ? parseFloat(mWaist) : undefined,
      armsCm: mArms ? parseFloat(mArms) : undefined,
      thighsCm: mThighs ? parseFloat(mThighs) : undefined,
    };

    onAddMeasurement(newM);
    setIsAddMeasurementOpen(false);
    setMWeight('');
    setMFat('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoDataUrl) return;

    const newPhoto: ProgressPhoto = {
      id: `photo-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      photoUrl: photoDataUrl,
      tag: photoTag,
    };

    onAddPhoto(newPhoto);
    setIsAddPhotoOpen(false);
    setPhotoDataUrl('');
  };

  return (
    <div id="progress-view" className="space-y-6 pb-20 md:pb-8">
      {/* Sub-tab Navigation */}
      <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-zinc-800 pb-3">
        {[
          { id: 'analytics', label: 'Exercise Analytics', icon: TrendingUp },
          { id: 'prs', label: 'PR Hall of Fame', icon: Award },
          { id: 'body', label: 'Body Metrics', icon: Scale },
          { id: 'photos', label: 'Progress Photos', icon: Camera },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Analytics Tab */}
      {activeSubTab === 'analytics' && (
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Strength Progression Chart</h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                Track top weight and estimated 1RM over time per exercise.
              </p>
            </div>

            <CustomSelect
              value={selectedExerciseId}
              onChange={(val) => setSelectedExerciseId(val)}
              options={exercises.map((ex) => ({
                value: ex.id,
                label: ex.name,
                sublabel: ex.muscleGroup,
              }))}
              placeholder="Select exercise..."
              size="sm"
              showSearch={true}
            />
          </div>

          {chartData.length < 2 ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              Log at least 2 sessions with this exercise to render a progress line chart.
            </div>
          ) : (
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#27272a',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="maxWeight"
                    name={`Max Weight (${weightUnit})`}
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="est1RM"
                    name={`Est 1RM (${weightUnit})`}
                    stroke="#3b82f6"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* PRs Hall of Fame */}
      {activeSubTab === 'prs' && (
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">All-Time Personal Records</h3>

          {Object.keys(prs).length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">No personal records logged yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(Object.values(prs) as PersonalRecord[]).map((pr) => (
                <div
                  key={pr.exerciseId}
                  className="p-4 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl border border-gray-200 dark:border-zinc-700 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      {pr.exerciseName}
                    </h4>
                    <Award className="w-4 h-4 text-amber-500" />
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-[10px] text-gray-400 font-semibold uppercase">
                        Max Weight
                      </span>
                      <p className="text-lg font-black text-gray-900 dark:text-white">
                        {pr.maxWeight} {weightUnit}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 font-semibold uppercase">
                        Est. 1RM
                      </span>
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        ~{pr.estimated1RM} {weightUnit}
                      </p>
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-400 text-right pt-1 border-t border-gray-200/50 dark:border-zinc-700/50">
                    Set on {pr.date}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Body Metrics */}
      {activeSubTab === 'body' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Body Weight Trend</h3>
                <p className="text-xs text-gray-500">Track body composition changes over time.</p>
              </div>
              <button
                onClick={() => setIsAddMeasurementOpen(true)}
                className="flex items-center space-x-1.5 bg-black text-white dark:bg-white dark:text-black text-xs font-bold px-3 py-2 rounded-xl"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Measurement</span>
              </button>
            </div>

            {bodyWeightChartData.length > 1 && (
              <div className="h-60 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={bodyWeightChartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="date" stroke="#888888" fontSize={11} />
                    <YAxis stroke="#888888" fontSize={11} domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        borderColor: '#27272a',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: '12px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      name={`Weight (${weightUnit})`}
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Body Measurements Log List */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Logs History</h4>
            <div className="space-y-2">
              {measurements.map((m) => (
                <div
                  key={m.id}
                  className="p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-xl border border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-gray-900 dark:text-white">{formatDate(m.date)}</span>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Weight: <span className="font-bold">{m.weightKg} {weightUnit}</span>
                      {m.bodyFatPercentage ? ` • Body Fat: ${m.bodyFatPercentage}%` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => onDeleteMeasurement(m.id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Progress Photos */}
      {activeSubTab === 'photos' && (
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Progress Photos</h3>
              <p className="text-xs text-gray-500">Visual physique comparison gallery.</p>
            </div>
            <button
              onClick={() => setIsAddPhotoOpen(true)}
              className="flex items-center space-x-1.5 bg-black text-white dark:bg-white dark:text-black text-xs font-bold px-3 py-2 rounded-xl"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Photo</span>
            </button>
          </div>

          {photos.length === 0 ? (
            <p className="text-xs text-gray-400 py-10 text-center">No progress photos uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {photos.map((p) => (
                <div
                  key={p.id}
                  className="relative group rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 bg-black aspect-3/4"
                >
                  <img src={p.photoUrl} alt="Progress" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end">
                    <span className="text-[10px] font-bold text-white uppercase">{p.tag}</span>
                    <span className="text-[10px] text-gray-300">{formatDate(p.date)}</span>
                  </div>
                  <button
                    onClick={() => onDeletePhoto(p.id)}
                    className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Measurement Modal */}
      {isAddMeasurementOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Log Body Measurement</h3>
            <form onSubmit={handleSaveMeasurementSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Weight ({weightUnit}) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={mWeight}
                  onChange={(e) => setMWeight(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Body Fat % (optional)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={mFat}
                  onChange={(e) => setMFat(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddMeasurementOpen(false)}
                  className="px-3 py-1.5 text-xs text-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-black text-white dark:bg-white dark:text-black font-bold text-xs rounded-xl"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Photo Modal */}
      {isAddPhotoOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Upload Progress Photo</h3>
            <form onSubmit={handleSavePhotoSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Tag Pose
                </label>
                <CustomSelect
                  value={photoTag}
                  onChange={(val) => setPhotoTag(val as any)}
                  options={[
                    { value: 'Front', label: 'Front Pose' },
                    { value: 'Back', label: 'Back Pose' },
                    { value: 'Side', label: 'Side Pose' },
                  ]}
                  size="sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Image File
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-gray-500"
                />
              </div>

              {photoDataUrl && (
                <div className="h-32 w-full rounded-xl overflow-hidden border border-gray-200">
                  <img src={photoDataUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddPhotoOpen(false)}
                  className="px-3 py-1.5 text-xs text-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!photoDataUrl}
                  className="px-4 py-1.5 bg-black text-white dark:bg-white dark:text-black font-bold text-xs rounded-xl disabled:opacity-40"
                >
                  Upload Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
