import {
  Exercise,
  WorkoutTemplate,
  WorkoutSession,
  BodyMeasurement,
  ProgressPhoto,
  UserProfile,
} from '../types';
import {
  DEFAULT_EXERCISES,
  DEFAULT_TEMPLATES,
  INITIAL_USER_PROFILE,
} from '../data/defaultData';

export interface GuestWorkoutData {
  sessions: WorkoutSession[];
  templates: WorkoutTemplate[];
  customExercises: Exercise[];
  measurements: BodyMeasurement[];
  photos: ProgressPhoto[];
  profile: UserProfile;
  activeDraft: WorkoutSession | null;
}

const GUEST_DATA_KEY = 'guest_workout_data';

export const StorageService = {
  // Load Guest Mode data from dedicated localStorage key
  getGuestData(): GuestWorkoutData {
    try {
      const raw = localStorage.getItem(GUEST_DATA_KEY);
      if (!raw) {
        // Clean slate on first launch for Guest Mode
        return {
          sessions: [],
          templates: DEFAULT_TEMPLATES,
          customExercises: [],
          measurements: [],
          photos: [],
          profile: INITIAL_USER_PROFILE,
          activeDraft: null,
        };
      }
      const parsed = JSON.parse(raw) as Partial<GuestWorkoutData>;
      return {
        sessions: parsed.sessions || [],
        templates: parsed.templates || DEFAULT_TEMPLATES,
        customExercises: parsed.customExercises || [],
        measurements: parsed.measurements || [],
        photos: parsed.photos || [],
        profile: parsed.profile || INITIAL_USER_PROFILE,
        activeDraft: parsed.activeDraft || null,
      };
    } catch (err) {
      console.error('Error reading guest data from storage:', err);
      return {
        sessions: [],
        templates: DEFAULT_TEMPLATES,
        customExercises: [],
        measurements: [],
        photos: [],
        profile: INITIAL_USER_PROFILE,
        activeDraft: null,
      };
    }
  },

  // Save Guest Mode data to dedicated localStorage key
  saveGuestData(data: GuestWorkoutData): void {
    try {
      localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Error writing guest data to storage:', err);
    }
  },

  // Reset Guest Mode to clean slate
  resetGuestData(): GuestWorkoutData {
    try {
      localStorage.removeItem(GUEST_DATA_KEY);
    } catch (err) {
      console.error('Error resetting guest data:', err);
    }
    return this.getGuestData();
  },

  // CSV Export & Import Handlers
  exportSessionsCSV(sessions: WorkoutSession[], sessionIds?: string[]): string {
    let list = sessions;
    if (sessionIds && sessionIds.length > 0) {
      list = list.filter((s) => sessionIds.includes(s.id));
    }
    const rows: string[] = [];
    rows.push('Session Date,Workout Name,Exercise Name,Muscle Group,Set #,Set Type,Weight,Reps,Completed,Duration (min),Notes');

    for (const session of list) {
      const dateStr = new Date(session.startTime).toLocaleDateString('en-US');
      const durationMin = Math.round((session.durationSeconds || 0) / 60);
      const notesEscaped = (session.notes || '').replace(/"/g, '""');

      for (const ex of session.exercises) {
        let setNum = 1;
        for (const set of ex.sets) {
          rows.push(
            `"${dateStr}","${session.name.replace(/"/g, '""')}","${ex.exerciseName.replace(/"/g, '""')}","${ex.muscleGroup}",${setNum},"${set.setType}",${set.weight},${set.reps},${set.completed},${durationMin},"${notesEscaped}"`
          );
          setNum++;
        }
      }
    }

    return rows.join('\n');
  },

  exportJSONBackup(dataState: {
    exercises: Exercise[];
    templates: WorkoutTemplate[];
    sessions: WorkoutSession[];
    measurements: BodyMeasurement[];
    profile: UserProfile;
  }): string {
    const backupObj = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      ...dataState,
    };
    return JSON.stringify(backupObj, null, 2);
  },
};
