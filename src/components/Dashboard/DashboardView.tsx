import React, { useState } from 'react';
import { WorkoutSession, WorkoutTemplate, PersonalRecord } from '../../types';
import { formatDate, formatDuration } from '../../lib/calculations';
import { CustomSelect } from '../ui/CustomSelect';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Dumbbell,
  Award,
  Calendar as CalendarIcon,
  Plus,
  Play,
  ChevronRight,
  TrendingUp,
  Clock,
  Activity,
  Flame,
  ArrowUpRight,
  Sparkles,
  Zap,
  CheckCircle2,
  ListFilter,
  BarChart2,
  Users,
  Trash2,
  ChevronDown,
  PieChart as PieChartIcon,
  TrendingDown,
} from 'lucide-react';

interface DashboardViewProps {
  sessions: WorkoutSession[];
  templates: WorkoutTemplate[];
  prs: Record<string, PersonalRecord>;
  onStartEmptyWorkout: () => void;
  onStartFromTemplate: (templateId: string) => void;
  onViewSessionDetails: (session: WorkoutSession) => void;
  onNavigateToTab: (tab: any) => void;
  onDeleteSession?: (sessionId: string) => void;
  onDeleteTemplate?: (templateId: string) => void;
  onLoadSampleData?: () => void;
  weightUnit: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  sessions,
  templates,
  prs,
  onStartEmptyWorkout,
  onStartFromTemplate,
  onViewSessionDetails,
  onNavigateToTab,
  onDeleteSession,
  onDeleteTemplate,
  onLoadSampleData,
  weightUnit,
}) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const [selectedDate, setSelectedDate] = useState<string>(now.toISOString().split('T')[0]);
  const [activeChartTab, setActiveChartTab] = useState<'exercise' | 'ppl' | 'sets'>('exercise');

  // Compute metrics
  const completedSessions = sessions.filter((s) => s.status === 'completed');

  // Workouts this week (last 7 days)
  const sevenDaysAgoMs = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  const recentWeekSessions = completedSessions.filter((s) => s.startTime >= sevenDaysAgoMs);

  // Total PRs count
  const prCount = Object.keys(prs).length;

  // Collect unique exercises present in workout history for the Exercise Progress Chart
  const exerciseMap = new Map<string, string>();
  completedSessions.forEach((s) => {
    s.exercises.forEach((ex) => {
      exerciseMap.set(ex.exerciseId, ex.exerciseName);
    });
  });

  const availableExerciseOptions = Array.from(exerciseMap.entries()).map(([id, name]) => ({
    id,
    name,
  }));

  const [timeRange, setTimeRange] = useState<'90d' | '30d' | '7d'>('90d');
  const [selectedChartExerciseId, setSelectedChartExerciseId] = useState<string>(
    availableExerciseOptions[0]?.id || ''
  );

  // Cutoff timestamp helper
  const daysToSubtract = timeRange === '90d' ? 90 : timeRange === '30d' ? 30 : 7;
  const cutoffTime = now.getTime() - daysToSubtract * 24 * 60 * 60 * 1000;

  // Generate Exercise Weight Progress Chart Data over selected time range
  const exerciseProgressData = React.useMemo(() => {
    if (!selectedChartExerciseId) return [];
    const points: { date: string; maxWeight: number; reps: number }[] = [];

    const sortedSessions = completedSessions
      .filter((s) => s.startTime >= cutoffTime)
      .sort((a, b) => a.startTime - b.startTime);

    for (const session of sortedSessions) {
      const match = session.exercises.find((e) => e.exerciseId === selectedChartExerciseId);
      if (match && match.sets.length > 0) {
        const completedSets = match.sets.filter((s) => s.completed && s.weight > 0);
        if (completedSets.length > 0) {
          const topWeight = Math.max(...completedSets.map((s) => s.weight));
          const topSet = completedSets.find((s) => s.weight === topWeight);
          points.push({
            date: new Date(session.startTime).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
            maxWeight: topWeight,
            reps: topSet?.reps || 0,
          });
        }
      }
    }
    return points;
  }, [completedSessions, selectedChartExerciseId, cutoffTime]);

  // Daily Sets & Workouts Data for selected time range
  const dailySetsData = React.useMemo(() => {
    const numDays = daysToSubtract;
    return Array.from({ length: numDays }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (numDays - 1 - i));
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = numDays <= 7 
        ? d.toLocaleDateString('default', { weekday: 'short' })
        : d.toLocaleDateString('default', { month: 'short', day: 'numeric' });

      const daySessions = completedSessions.filter(
        (s) => new Date(s.startTime).toISOString().split('T')[0] === dateStr
      );

      const daySets = daySessions.reduce(
        (acc, s) =>
          acc +
          s.exercises.reduce((exAcc, ex) => exAcc + ex.sets.filter((st) => st.completed).length, 0),
        0
      );

      return {
        date: dateStr,
        day: dayLabel,
        sets: daySets,
        workouts: daySessions.length,
      };
    });
  }, [completedSessions, daysToSubtract]);

  // Push / Pull / Legs Split Volume for selected time range
  const pplDistribution = React.useMemo(() => {
    let pushSets = 0;
    let pullSets = 0;
    let legsSets = 0;
    let armsCoreSets = 0;

    const filteredSessions = completedSessions.filter((s) => s.startTime >= cutoffTime);

    filteredSessions.forEach((s) => {
      s.exercises.forEach((ex) => {
        const completedCount = ex.sets.filter((st) => st.completed).length;
        const group = ex.muscleGroup;
        if (['Chest', 'Shoulders', 'Front Delts', 'Side Delts', 'Triceps'].includes(group)) {
          pushSets += completedCount;
        } else if (['Back', 'Lats', 'Upper Back', 'Lower Back', 'Rear Delts', 'Biceps', 'Traps'].includes(group)) {
          pullSets += completedCount;
        } else if (['Legs', 'Quads', 'Hamstrings', 'Calves', 'Glutes'].includes(group)) {
          legsSets += completedCount;
        } else {
          armsCoreSets += completedCount;
        }
      });
    });

    return [
      { category: 'Push Split', sets: pushSets, fill: '#ef4444' },
      { category: 'Pull Split', sets: pullSets, fill: '#3b82f6' },
      { category: 'Legs Split', sets: legsSets, fill: '#10b981' },
      { category: 'Arms / Core', sets: armsCoreSets, fill: '#f59e0b' },
    ];
  }, [completedSessions, cutoffTime]);

  // Calendar matrix generator
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const workoutDaysSet = new Set<string>();
  completedSessions.forEach((s) => {
    const dStr = new Date(s.startTime).toISOString().split('T')[0];
    workoutDaysSet.add(dStr);
  });

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const monthStr = (currentMonth + 1).toString().padStart(2, '0');
    const dayStr = d.toString().padStart(2, '0');
    calendarDays.push(`${currentYear}-${monthStr}-${dayStr}`);
  }

  // Workouts for selected date
  const selectedDateSessions = completedSessions.filter(
    (s) => new Date(s.startTime).toISOString().split('T')[0] === selectedDate
  );

  return (
    <div id="dashboard-view" className="space-y-6 pb-20 md:pb-8 max-w-7xl mx-auto">
      {/* Top Header / Welcome & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Dashboard
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              Live Tracker
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Track workout frequency, strength progression by exercise, and personal records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="dash-start-empty-btn"
            onClick={onStartEmptyWorkout}
            className="flex items-center space-x-2 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Blank Workout</span>
          </button>
          <button
            onClick={() => onNavigateToTab('templates')}
            className="flex items-center space-x-1.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 transition-all cursor-pointer"
          >
            <Dumbbell className="w-3.5 h-3.5 text-emerald-500" />
            <span>Templates</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Metric Cards (shadcn SectionCards Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Sessions (7 Days) */}
        <div className="bg-gradient-to-t from-emerald-500/5 to-white dark:to-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400">
              Sessions (7 Days)
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
              <TrendingUp className="w-3 h-3" />
              <span>+{recentWeekSessions.length}</span>
            </span>
          </div>
          <div>
            <div className="text-3xl font-semibold tabular-nums text-gray-900 dark:text-white">
              {recentWeekSessions.length}
            </div>
            <div className="mt-2 text-xs font-medium text-gray-600 dark:text-zinc-400 flex items-center gap-1">
              <span>{recentWeekSessions.length >= 3 ? 'Target achieved this week' : 'Goal: 3-5 sessions/week'}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Sets Logged */}
        <div className="bg-gradient-to-t from-blue-500/5 to-white dark:to-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400">
              Total Sets Logged
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border border-blue-200 dark:border-blue-800/80 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">
              <TrendingUp className="w-3 h-3" />
              <span>Active</span>
            </span>
          </div>
          <div>
            <div className="text-3xl font-semibold tabular-nums text-gray-900 dark:text-white">
              {completedSessions.reduce(
                (acc, s) =>
                  acc +
                  s.exercises.reduce((exAcc, ex) => exAcc + ex.sets.filter((st) => st.completed).length, 0),
                0
              )}
            </div>
            <div className="mt-2 text-xs font-medium text-gray-600 dark:text-zinc-400">
              Working & back-off sets recorded
            </div>
          </div>
        </div>

        {/* Card 3: Personal Records */}
        <div className="bg-gradient-to-t from-amber-500/5 to-white dark:to-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400">
              Personal Records (1RM)
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border border-amber-200 dark:border-amber-800/80 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300">
              <Award className="w-3 h-3" />
              <span>{prCount} PRs</span>
            </span>
          </div>
          <div>
            <div className="text-3xl font-semibold tabular-nums text-gray-900 dark:text-white">
              {prCount}
            </div>
            <div className="mt-2 text-xs font-medium text-gray-600 dark:text-zinc-400">
              Peak strength milestones reached
            </div>
          </div>
        </div>

        {/* Card 4: Total Logged Workouts */}
        <div className="bg-gradient-to-t from-purple-500/5 to-white dark:to-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400">
              Lifetime Workouts
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border border-purple-200 dark:border-purple-800/80 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300">
              <Flame className="w-3 h-3" />
              <span>Completed</span>
            </span>
          </div>
          <div>
            <div className="text-3xl font-semibold tabular-nums text-gray-900 dark:text-white">
              {completedSessions.length}
            </div>
            <div className="mt-2 text-xs font-medium text-gray-600 dark:text-zinc-400">
              Logged session history
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Overview Tabbed Charts Panel (Left 7 Cols) & Recent Workout Activity Table (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tabbed Overview Charts Panel */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3 mb-4 gap-2">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Progress Analytics</h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  Switch tabs to analyze individual exercises, Push/Pull splits, or daily sets.
                </p>
              </div>

              {/* Tabs Switcher */}
              <div className="flex items-center bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl">
                <button
                  onClick={() => setActiveChartTab('exercise')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeChartTab === 'exercise'
                      ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-xs'
                      : 'text-gray-500 hover:text-black dark:hover:text-white'
                  }`}
                >
                  Exercise Progress
                </button>
                <button
                  onClick={() => setActiveChartTab('ppl')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeChartTab === 'ppl'
                      ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-xs'
                      : 'text-gray-500 hover:text-black dark:hover:text-white'
                  }`}
                >
                  Push / Pull / Legs
                </button>
                <button
                  onClick={() => setActiveChartTab('sets')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeChartTab === 'sets'
                      ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-xs'
                      : 'text-gray-500 hover:text-black dark:hover:text-white'
                  }`}
                >
                  Daily Sets
                </button>
              </div>
            </div>

            {/* Time Range Filter Toggle Buttons matching snippet 4 */}
            <div className="flex items-center justify-between gap-2 mb-3 bg-gray-50 dark:bg-zinc-800/50 p-2 rounded-xl border border-gray-100 dark:border-zinc-800">
              <span className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                Time Range:
              </span>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setTimeRange('90d')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    timeRange === '90d'
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                      : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white border border-gray-200 dark:border-zinc-700'
                  }`}
                >
                  Last 3 months
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange('30d')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    timeRange === '30d'
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                      : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white border border-gray-200 dark:border-zinc-700'
                  }`}
                >
                  Last 30 days
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange('7d')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    timeRange === '7d'
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                      : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white border border-gray-200 dark:border-zinc-700'
                  }`}
                >
                  Last 7 days
                </button>
              </div>
            </div>

            {/* TAB 1: Specific Exercise Strength Progression */}
            {activeChartTab === 'exercise' && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                    Select Exercise to Track:
                  </label>
                  {availableExerciseOptions.length > 0 && (
                    <CustomSelect
                      value={selectedChartExerciseId}
                      onChange={(val) => setSelectedChartExerciseId(val)}
                      options={availableExerciseOptions.map((ex) => ({
                        value: ex.id,
                        label: ex.name,
                      }))}
                      placeholder="Select exercise..."
                      size="sm"
                      showSearch={true}
                    />
                  )}
                </div>

                <div className="h-60 w-full">
                  {exerciseProgressData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-gray-400 italic">
                      No logged sets for this exercise yet. Perform a workout to see weight progression!
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={exerciseProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                          </linearGradient>
                          <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a15" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888888' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888888' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#18181b',
                            borderColor: '#27272a',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '12px',
                          }}
                          formatter={(val: any) => [`${val} ${weightUnit}`, 'Top Weight']}
                        />
                        <Area
                          type="natural"
                          dataKey="maxWeight"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#fillDesktop)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: Push / Pull / Legs Volume Donut Pie Chart */}
            {activeChartTab === 'ppl' && (
              <div className="space-y-3">
                <div className="h-60 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pplDistribution}
                        dataKey="sets"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={5}
                      >
                        {pplDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#18181b',
                          borderColor: '#27272a',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                        formatter={(val: any) => [`${val} sets`, 'Volume']}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => <span className="text-xs font-semibold text-gray-700 dark:text-zinc-300">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* TAB 3: Daily Sets Smooth Wave Chart */}
            {activeChartTab === 'sets' && (
              <div className="space-y-3">
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailySetsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="setsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a15" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888888' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888888' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#18181b',
                          borderColor: '#27272a',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                        formatter={(val: any) => [`${val} sets`, 'Completed Sets']}
                      />
                      <Area
                        type="natural"
                        dataKey="sets"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#setsGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Workout Activity Table Panel */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3 mb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Recent Workouts</h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  {completedSessions.length} total logged workouts
                </p>
              </div>
              <button
                onClick={() => onNavigateToTab('history')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                View all
              </button>
            </div>

            {completedSessions.length === 0 ? (
              <div className="text-center py-12 text-gray-400 dark:text-zinc-500">
                <Dumbbell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-semibold">No workout activity recorded.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedSessions.slice(0, 4).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/80 transition-all border border-transparent hover:border-gray-200 dark:hover:border-zinc-700 group"
                  >
                    <div
                      onClick={() => onViewSessionDetails(session)}
                      className="flex items-center space-x-3 min-w-0 cursor-pointer flex-1"
                    >
                      <div className="w-9 h-9 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold flex items-center justify-center text-xs shrink-0">
                        {session.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {session.name}
                        </h4>
                        <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                          {formatDate(session.startTime)} • {session.exercises.length} ex
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-bold text-gray-900 dark:text-white">
                          {session.exercises.reduce((acc, ex) => acc + ex.sets.filter((st) => st.completed).length, 0)} sets
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatDuration(session.durationSeconds)}
                        </span>
                      </div>

                      {onDeleteSession && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(session.id);
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                          title="Delete Workout Log"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-gray-100 dark:border-zinc-800">
            <button
              onClick={() => onNavigateToTab('templates')}
              className="w-full py-2 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-xl text-xs font-bold text-gray-900 dark:text-white flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Browse Workout Templates</span>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Consistency Grid & Quick Start Splits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Widget (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-gray-700 dark:text-zinc-300" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {now.toLocaleString('default', { month: 'long' })} {currentYear} Calendar
              </h3>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-zinc-400">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Logged Workout</span>
            </div>
          </div>

          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-400 dark:text-zinc-500 mb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((dateStr, idx) => {
              if (!dateStr) {
                return <div key={`empty-${idx}`} className="h-10 rounded-xl" />;
              }
              const dayNum = parseInt(dateStr.split('-')[2], 10);
              const isWorkoutDay = workoutDaysSet.has(dateStr);
              const isSelected = selectedDate === dateStr;
              const isToday = dateStr === now.toISOString().split('T')[0];

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-11 rounded-xl flex flex-col items-center justify-center text-xs font-medium transition-all relative cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-black dark:ring-white bg-gray-100 dark:bg-zinc-800 font-bold shadow-xs'
                      : 'hover:bg-gray-50 dark:hover:bg-zinc-800/60'
                  } ${isToday ? 'border border-blue-500' : 'border border-transparent'}`}
                >
                  <span
                    className={
                      isSelected
                        ? 'text-black dark:text-white'
                        : isToday
                        ? 'text-blue-600 dark:text-blue-400 font-bold'
                        : 'text-gray-700 dark:text-zinc-300'
                    }
                  >
                    {dayNum}
                  </span>
                  {isWorkoutDay && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Date Session Summary */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400 mb-2">
              <span>Workouts on {formatDate(selectedDate)}</span>
              <span>{selectedDateSessions.length} session(s)</span>
            </div>

            {selectedDateSessions.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-zinc-500 italic py-2">
                No workouts logged on this day.
              </p>
            ) : (
              <div className="space-y-2">
                {selectedDateSessions.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => onViewSessionDetails(s)}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/70 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">{s.name}</h4>
                      <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                        {s.exercises.length} exercises • {s.totalVolume.toLocaleString()} {weightUnit} volume
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <span>{formatDuration(s.durationSeconds)}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Templates List (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-gray-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Quick Splits</h3>
              <button
                onClick={() => onNavigateToTab('templates')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Manage
              </button>
            </div>

            <div className="space-y-2.5">
              {templates.slice(0, 4).map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-3 rounded-xl border border-gray-200 dark:border-zinc-800 hover:border-gray-400 dark:hover:border-zinc-600 transition-all flex items-center justify-between group"
                >
                  <div className="pr-2 min-w-0">
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400">
                      {tpl.category}
                    </span>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white mt-1 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {tpl.name}
                    </h4>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      id={`btn-quick-start-${tpl.id}`}
                      onClick={() => onStartFromTemplate(tpl.id)}
                      className="p-2 bg-black text-white dark:bg-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-xs cursor-pointer"
                      title="Start Workout Split"
                    >
                      <Play className="w-3 h-3 fill-current" />
                    </button>
                    {onDeleteTemplate && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTemplate(tpl.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                        title="Delete Workout Split"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800">
            <button
              onClick={() => onNavigateToTab('history')}
              className="w-full text-center text-xs font-medium text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
            >
              Full Workout History →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
