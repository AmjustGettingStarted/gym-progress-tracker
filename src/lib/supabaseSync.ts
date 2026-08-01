import { supabase } from './supabase';
import {
  WorkoutSession,
  WorkoutTemplate,
  Exercise,
  BodyMeasurement,
  ProgressPhoto,
  UserProfile,
} from '../types';

export const SupabaseSyncService = {
  // Load all user collections from Supabase tables
  async loadUserData(userId: string) {
    try {
      // 1. Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const profile: UserProfile | null = profileData
        ? {
            name: profileData.name || '',
            email: profileData.email || '',
            targetSplit: profileData.target_split || profileData.targetSplit || 'Push Pull Legs',
            weightUnit: profileData.weight_unit || profileData.weightUnit || 'kg',
            theme: profileData.theme || 'dark',
            defaultRestTimerSeconds: profileData.default_rest_timer_seconds || profileData.defaultRestTimerSeconds || 90,
            soundEnabled: profileData.sound_enabled ?? profileData.soundEnabled ?? true,
          }
        : null;

      // 2. Sessions
      const { data: sessionsData } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId);
      const sessions: WorkoutSession[] = sessionsData
        ? sessionsData.map((s) => (s.data ? s.data : (s as unknown as WorkoutSession)))
        : [];

      // 3. Templates
      const { data: templatesData } = await supabase
        .from('templates')
        .select('*')
        .eq('user_id', userId);
      const templates: WorkoutTemplate[] = templatesData
        ? templatesData.map((t) => (t.data ? t.data : (t as unknown as WorkoutTemplate)))
        : [];

      // 4. Custom Exercises
      const { data: exercisesData } = await supabase
        .from('custom_exercises')
        .select('*')
        .eq('user_id', userId);
      const customExercises: Exercise[] = exercisesData
        ? exercisesData.map((e) => (e.data ? e.data : (e as unknown as Exercise)))
        : [];

      // 5. Measurements
      const { data: measurementsData } = await supabase
        .from('measurements')
        .select('*')
        .eq('user_id', userId);
      const measurements: BodyMeasurement[] = measurementsData
        ? measurementsData.map((m) => (m.data ? m.data : (m as unknown as BodyMeasurement)))
        : [];

      // 6. Progress Photos
      const { data: photosData } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', userId);
      const photos: ProgressPhoto[] = photosData
        ? photosData.map((p) => (p.data ? p.data : (p as unknown as ProgressPhoto)))
        : [];

      return {
        profile,
        sessions,
        templates,
        customExercises,
        measurements,
        photos,
      };
    } catch (err) {
      console.error('Error loading data from Supabase:', err);
      return null;
    }
  },

  // Save Profile
  async saveProfile(userId: string, profile: UserProfile) {
    try {
      await supabase.from('profiles').upsert(
        {
          id: userId,
          user_id: userId,
          name: profile.name,
          email: profile.email,
          target_split: profile.targetSplit,
          weight_unit: profile.weightUnit,
          theme: profile.theme,
          default_rest_timer_seconds: profile.defaultRestTimerSeconds,
          sound_enabled: profile.soundEnabled,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
    } catch (err) {
      console.error('Supabase saveProfile error:', err);
    }
  },

  // Save Session
  async saveSession(userId: string, session: WorkoutSession) {
    try {
      await supabase.from('sessions').upsert(
        {
          id: session.id,
          user_id: userId,
          data: session,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
    } catch (err) {
      console.error('Supabase saveSession error:', err);
    }
  },

  // Delete Session
  async deleteSession(sessionId: string) {
    try {
      await supabase.from('sessions').delete().eq('id', sessionId);
    } catch (err) {
      console.error('Supabase deleteSession error:', err);
    }
  },

  // Save Template
  async saveTemplate(userId: string, template: WorkoutTemplate) {
    try {
      await supabase.from('templates').upsert(
        {
          id: template.id,
          user_id: userId,
          data: template,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
    } catch (err) {
      console.error('Supabase saveTemplate error:', err);
    }
  },

  // Delete Template
  async deleteTemplate(templateId: string) {
    try {
      await supabase.from('templates').delete().eq('id', templateId);
    } catch (err) {
      console.error('Supabase deleteTemplate error:', err);
    }
  },

  // Save Custom Exercise
  async saveCustomExercise(userId: string, exercise: Exercise) {
    try {
      await supabase.from('custom_exercises').upsert(
        {
          id: exercise.id,
          user_id: userId,
          data: exercise,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
    } catch (err) {
      console.error('Supabase saveCustomExercise error:', err);
    }
  },

  // Save Measurement
  async saveMeasurement(userId: string, measurement: BodyMeasurement) {
    try {
      await supabase.from('measurements').upsert(
        {
          id: measurement.id,
          user_id: userId,
          data: measurement,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
    } catch (err) {
      console.error('Supabase saveMeasurement error:', err);
    }
  },

  // Delete Measurement
  async deleteMeasurement(measurementId: string) {
    try {
      await supabase.from('measurements').delete().eq('id', measurementId);
    } catch (err) {
      console.error('Supabase deleteMeasurement error:', err);
    }
  },

  // Save Photo
  async savePhoto(userId: string, photo: ProgressPhoto) {
    try {
      await supabase.from('progress_photos').upsert(
        {
          id: photo.id,
          user_id: userId,
          data: photo,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
    } catch (err) {
      console.error('Supabase savePhoto error:', err);
    }
  },

  // Delete Photo
  async deletePhoto(photoId: string) {
    try {
      await supabase.from('progress_photos').delete().eq('id', photoId);
    } catch (err) {
      console.error('Supabase deletePhoto error:', err);
    }
  },
};
