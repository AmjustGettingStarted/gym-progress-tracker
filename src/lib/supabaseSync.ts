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
};
