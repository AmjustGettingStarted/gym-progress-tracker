import { supabase } from './supabase';
import {
  WorkoutSession,
  WorkoutTemplate,
  Exercise,
  BodyMeasurement,
  ProgressPhoto,
  UserProfile,
} from '../types';
import { DEFAULT_TEMPLATES, INITIAL_USER_PROFILE } from '../data/defaultData';

export interface UserDataSnapshot {
  sessions: WorkoutSession[];
  templates: WorkoutTemplate[];
  customExercises: Exercise[];
  measurements: BodyMeasurement[];
  photos: ProgressPhoto[];
  profile: UserProfile;
  activeDraft: WorkoutSession | null;
}

export interface UserDataLoadResult extends UserDataSnapshot {
  exists: boolean;
}

const createDefaultSnapshot = (): UserDataSnapshot => ({
  sessions: [],
  templates: DEFAULT_TEMPLATES,
  customExercises: [],
  measurements: [],
  photos: [],
  profile: { ...INITIAL_USER_PROFILE },
  activeDraft: null,
});

const normalizeSnapshot = (raw: Partial<UserDataSnapshot> | null | undefined): UserDataSnapshot => {
  const fallback = createDefaultSnapshot();
  return {
    sessions: Array.isArray(raw?.sessions) ? raw.sessions : fallback.sessions,
    templates: Array.isArray(raw?.templates) && raw.templates.length > 0 ? raw.templates : fallback.templates,
    customExercises: Array.isArray(raw?.customExercises) ? raw.customExercises : fallback.customExercises,
    measurements: Array.isArray(raw?.measurements) ? raw.measurements : fallback.measurements,
    photos: Array.isArray(raw?.photos) ? raw.photos : fallback.photos,
    profile: raw?.profile ? { ...fallback.profile, ...raw.profile } : fallback.profile,
    activeDraft: raw?.activeDraft ?? null,
  };
};

// Converts a timestamp to a local YYYY-MM-DD key, matching Postgres `date`.
export const toDateKey = (timestamp: number | Date): string => {
  const d = typeof timestamp === 'number' ? new Date(timestamp) : timestamp;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const SupabaseSyncService = {
  createDefaultSnapshot,

  async loadUserData(userId: string): Promise<UserDataLoadResult> {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('data')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      if (!data?.data) {
        return { exists: false, ...createDefaultSnapshot() };
      }

      return {
        exists: true,
        ...normalizeSnapshot(data.data as Partial<UserDataSnapshot>),
      };
    } catch (err) {
      console.error('Error loading data from Supabase:', err);
      return { exists: false, ...createDefaultSnapshot() };
    }
  },

  async saveUserData(userId: string, snapshot: UserDataSnapshot) {
    try {
      const payload = {
        id: userId,
        user_id: userId,
        data: snapshot,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('workouts').upsert(payload, { onConflict: 'id' });
      if (error) throw error;
    } catch (err) {
      console.error('Supabase saveUserData error:', err);
    }
  },

  // Fetch today's (or any date's) log_type for a user, or null if no row exists yet.
  async getDailyLog(userId: string, dateKey: string): Promise<'workout' | 'rest' | null> {
    try {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('log_type')
        .eq('user_id', userId)
        .eq('log_date', dateKey)
        .maybeSingle();
      if (error) throw error;
      return data ? (data.log_type as 'workout' | 'rest') : null;
    } catch (err) {
      console.error('Error fetching daily log:', err);
      return null;
    }
  },

  // Insert or overwrite a single day's log entry.
  async upsertDailyLog(userId: string, dateKey: string, logType: 'workout' | 'rest') {
    try {
      const { error } = await supabase.from('daily_logs').upsert(
        { user_id: userId, log_date: dateKey, log_type: logType, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,log_date' }
      );
      if (error) throw error;
    } catch (err) {
      console.error('Error upserting daily log:', err);
    }
  },

  // Call on app mount (after auth) and again right after finishing a workout.
  // - No row yet for today -> creates one ('workout' if hasWorkoutToday, else 'rest').
  // - Row exists as 'rest' but user has since worked out -> upgrades to 'workout'.
  // - Never silently downgrades an existing 'workout' entry.
  async ensureDailyActivityLogged(userId: string, hasWorkoutToday: boolean) {
    const todayKey = toDateKey(new Date());
    const existing = await this.getDailyLog(userId, todayKey);
    if (existing === null) {
      await this.upsertDailyLog(userId, todayKey, hasWorkoutToday ? 'workout' : 'rest');
    } else if (existing === 'rest' && hasWorkoutToday) {
      await this.upsertDailyLog(userId, todayKey, 'workout');
    }
  },
};

