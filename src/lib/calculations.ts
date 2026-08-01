import { ExerciseSet, SessionExercise, WorkoutSession, PersonalRecord } from '../types';

/**
 * Calculates estimated One-Rep Max using the Epley formula:
 * 1RM = Weight * (1 + Reps / 30)
 */
export function calculate1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

/**
 * Calculates total volume lifted across completed sets
 */
export function calculateSessionVolume(exercises: SessionExercise[]): number {
  let total = 0;
  for (const ex of exercises) {
    for (const set of ex.sets) {
      if (set.completed && set.weight > 0 && set.reps > 0) {
        total += set.weight * set.reps;
      }
    }
  }
  return Math.round(total * 10) / 10;
}

/**
 * Formats seconds into human readable duration (e.g., "1h 12m" or "45m 20s")
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0m';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m ${secs > 0 ? `${secs}s` : ''}`.trim();
}

/**
 * Formats ISO date string or timestamp into clean display format (e.g. "Jul 30, 2026")
 */
export function formatDate(dateInput: string | number | Date): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Formats time string (e.g. "6:30 PM")
 */
export function formatTime(dateInput: string | number | Date): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

/**
 * Computes Personal Records dictionary per exercise from all completed workout sessions
 */
export function calculateAllPRs(sessions: WorkoutSession[]): Record<string, PersonalRecord> {
  const prs: Record<string, PersonalRecord> = {};

  const completedSessions = sessions.filter(s => s.status === 'completed');

  // Sort chronologically
  completedSessions.sort((a, b) => a.startTime - b.startTime);

  for (const session of completedSessions) {
    const sessionDate = formatDate(session.startTime);

    for (const ex of session.exercises) {
      for (const set of ex.sets) {
        if (!set.completed || set.weight <= 0 || set.reps <= 0) continue;

        const est1RM = calculate1RM(set.weight, set.reps);
        const setVolume = set.weight * set.reps;

        const currentPR = prs[ex.exerciseId];

        if (!currentPR) {
          prs[ex.exerciseId] = {
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseName,
            maxWeight: set.weight,
            maxVolume: setVolume,
            estimated1RM: est1RM,
            date: sessionDate,
          };
        } else {
          prs[ex.exerciseId] = {
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseName,
            maxWeight: Math.max(currentPR.maxWeight, set.weight),
            maxVolume: Math.max(currentPR.maxVolume, setVolume),
            estimated1RM: Math.max(currentPR.estimated1RM, est1RM),
            date: set.weight > currentPR.maxWeight || est1RM > currentPR.estimated1RM ? sessionDate : currentPR.date,
          };
        }
      }
    }
  }

  return prs;
}

/**
 * Converts kg to lbs or vice versa
 */
export function convertWeight(value: number, from: 'kg' | 'lbs', to: 'kg' | 'lbs'): number {
  if (from === to) return value;
  if (from === 'kg' && to === 'lbs') return Math.round(value * 2.20462 * 10) / 10;
  if (from === 'lbs' && to === 'kg') return Math.round((value / 2.20462) * 10) / 10;
  return value;
}
