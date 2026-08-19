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

    const csvEscape = (value: string | number | undefined | null): string => {
      const str = value === undefined || value === null ? '' : String(value);
      return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    };

    const headers = [
      'Session Name', 'Date', 'Duration (min)', 'Exercise', 'Muscle Group',
      'Set #', 'Set Type', 'Weight', 'Reps', 'RPE', 'Completed',
      'Exercise Notes', 'Notes',
    ];
    const rows: string[] = [headers.join(',')];

    list.forEach((session) => {
      const dateStr = new Date(session.startTime).toISOString().split('T')[0];
      const durationMin = Math.round((session.durationSeconds || 0) / 60);

      if (session.exercises.length === 0) {
        rows.push(
          [
            csvEscape(session.name), csvEscape(dateStr), csvEscape(durationMin),
            '', '', '', '', '', '', '', '', '', csvEscape(session.notes)
          ].join(',')
        );
        return;
      }

      session.exercises.forEach((exercise) => {
        exercise.sets.forEach((set, setIdx) => {
          rows.push(
            [
              csvEscape(session.name), csvEscape(dateStr), csvEscape(durationMin),
              csvEscape(exercise.exerciseName), csvEscape(exercise.muscleGroup),
              csvEscape(setIdx + 1), csvEscape(set.setType), csvEscape(set.weight),
              csvEscape(set.reps), csvEscape(set.rpe ?? ''), csvEscape(set.completed ? 'Yes' : 'No'),
              csvEscape(exercise.notes), csvEscape(session.notes),
            ].join(',')
          );
        });
      });
    });

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
