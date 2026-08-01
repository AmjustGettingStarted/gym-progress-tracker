import React, { useState, useEffect, useCallback } from 'react';
import {
  TabType,
  WorkoutSession,
  WorkoutTemplate,
  Exercise,
  BodyMeasurement,
  ProgressPhoto,
  UserProfile,
} from './types';
import { DEFAULT_EXERCISES, DEFAULT_TEMPLATES, INITIAL_USER_PROFILE } from './data/defaultData';
import { StorageService, GuestWorkoutData } from './lib/storage';
import { supabase, logoutUser, User } from './lib/supabase';
import { SupabaseSyncService, UserDataSnapshot } from './lib/supabaseSync';
import { calculateAllPRs } from './lib/calculations';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/Dashboard/DashboardView';
import { WorkoutLogger } from './components/Workout/WorkoutLogger';
import { TemplateManagerView } from './components/Workout/TemplateManagerView';
import { ExerciseLibraryView } from './components/Exercises/ExerciseLibraryView';
import { HistoryView } from './components/History/HistoryView';
import { ProgressView } from './components/Progress/ProgressView';
import { SettingsView } from './components/Settings/SettingsView';
import { ImportExportModal } from './components/Data/ImportExportModal';
import { AuthModal } from './components/Auth/AuthModal';
import { LoginPage } from './components/Auth/LoginPage';
import { ConfirmModal } from './components/ui/ConfirmModal';
import { StartWorkoutModal } from './components/Workout/StartWorkoutModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Supabase Auth & Login State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [guestMode, setGuestMode] = useState<boolean>(false);

  // Core Persistent State
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>(DEFAULT_EXERCISES);
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [profile, setProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);

  // Active Live Workout Draft
  const [activeWorkout, setActiveWorkout] = useState<WorkoutSession | null>(null);

  // Modal State
  const [isDataModalOpen, setIsDataModalOpen] = useState<boolean>(false);
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState<boolean>(false);
  const [isStartWorkoutModalOpen, setIsStartWorkoutModalOpen] = useState<boolean>(false);
  const [sessionToDeleteId, setSessionToDeleteId] = useState<string | null>(null);
  const [hasHydratedUserData, setHasHydratedUserData] = useState<boolean>(false);

  // Helper to load Guest Mode state from dedicated localStorage
  const loadGuestState = useCallback(() => {
    setHasHydratedUserData(false);
    const guestData = StorageService.getGuestData();
    setSessions(guestData.sessions);
    setTemplates(guestData.templates);
    setCustomExercises(guestData.customExercises);
    setExercises([...DEFAULT_EXERCISES, ...guestData.customExercises]);
    setMeasurements(guestData.measurements);
    setPhotos(guestData.photos);
    setProfile(guestData.profile);
    setActiveWorkout(guestData.activeDraft);
  }, []);

  // Helper to update guest_workout_data when in Guest Mode
  const updateGuestStorage = useCallback((partial: Partial<GuestWorkoutData>) => {
    if (currentUser) return; // Never update guest storage when logged in as remote user
    const current = StorageService.getGuestData();
    const updated: GuestWorkoutData = {
      ...current,
      ...partial,
    };
    StorageService.saveGuestData(updated);
  }, [currentUser]);

  const applySnapshot = useCallback((snapshot: UserDataSnapshot) => {
    setSessions(snapshot.sessions);
    setTemplates(snapshot.templates);
    setCustomExercises(snapshot.customExercises);
    setExercises([...DEFAULT_EXERCISES, ...snapshot.customExercises]);
    setMeasurements(snapshot.measurements);
    setPhotos(snapshot.photos);
    setProfile(snapshot.profile);
    setActiveWorkout(snapshot.activeDraft ?? null);
  }, []);

  // Helper to handle user login initialization and sync
  const handleUserLogin = useCallback(async (user: User) => {
    setHasHydratedUserData(false);

    const initialProfile: UserProfile = {
      ...INITIAL_USER_PROFILE,
      email: user.email || INITIAL_USER_PROFILE.email,
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || INITIAL_USER_PROFILE.name,
    };

    const starterSnapshot: UserDataSnapshot = {
      sessions: [],
      templates: DEFAULT_TEMPLATES,
      customExercises: [],
      measurements: [],
      photos: [],
      profile: initialProfile,
      activeDraft: null,
    };

    const cloudData = await SupabaseSyncService.loadUserData(user.id);
    if (!cloudData.exists) {
      await SupabaseSyncService.saveUserData(user.id, starterSnapshot);
      applySnapshot(starterSnapshot);
      setHasHydratedUserData(true);
      return;
    }

    applySnapshot(cloudData);
    setHasHydratedUserData(true);
  }, [applySnapshot]);

  // Load initial guest data on startup
  useEffect(() => {
    loadGuestState();
  }, [loadGuestState]);

  // Supabase Auth Listener & Cloud PostgreSQL Sync
  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      if (user) {
        handleUserLogin(user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null;
      setCurrentUser(user);

      if (user) {
        handleUserLogin(user);
      } else {
        // Disconnected / Logged out / Guest Mode: reload local guest_workout_data state
        loadGuestState();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadGuestState, handleUserLogin]);

  // Theme Syncing Effect
  useEffect(() => {
    if (profile.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [profile.theme]);

  useEffect(() => {
    if (!currentUser || !hasHydratedUserData) return;

    const payload: UserDataSnapshot = {
      sessions,
      templates,
      customExercises,
      measurements,
      photos,
      profile,
      activeDraft: activeWorkout,
    };

    void SupabaseSyncService.saveUserData(currentUser.id, payload);
  }, [activeWorkout, currentUser, customExercises, hasHydratedUserData, measurements, photos, profile, sessions, templates]);

  // Derived Personal Records
  const prs = calculateAllPRs(sessions);

  // Start Empty Workout
  const handleStartEmptyWorkout = () => {
    const newSession: WorkoutSession = {
      id: `sess-${Date.now()}`,
      name: 'Quick Workout Session',
      startTime: Date.now(),
      durationSeconds: 0,
      status: 'active',
      exercises: [],
      totalVolume: 0,
    };

    setActiveWorkout(newSession);
    if (!currentUser) {
      updateGuestStorage({ activeDraft: newSession });
    }
    setActiveTab('workout');
  };

  // Start Workout From Template
  const handleStartFromTemplate = (templateId: string) => {
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl) return;

    const templateExercises = tpl.exercises.map((item) => {
      const exObj = exercises.find((e) => e.id === item.exerciseId);
      const defaultSets = Array.from({ length: item.defaultSetsCount }).map((_, idx) => ({
        id: `set-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
        setType: 'Normal' as const,
        weight: item.targetWeight || 0,
        reps: item.targetReps || 0,
        completed: false,
      }));

      return {
        exerciseId: item.exerciseId,
        exerciseName: exObj ? exObj.name : 'Exercise',
        muscleGroup: exObj ? exObj.muscleGroup : ('Chest' as const),
        sets: defaultSets,
      };
    });

    const newSession: WorkoutSession = {
      id: `sess-${Date.now()}`,
      name: tpl.name,
      templateId: tpl.id,
      startTime: Date.now(),
      durationSeconds: 0,
      status: 'active',
      exercises: templateExercises,
      totalVolume: 0,
    };

    setActiveWorkout(newSession);
    if (!currentUser) {
      updateGuestStorage({ activeDraft: newSession });
    }
    setActiveTab('workout');
  };

  // Update Active Draft Workout
  const handleUpdateActiveSession = (updatedSession: WorkoutSession) => {
    setActiveWorkout(updatedSession);
    if (!currentUser) {
      updateGuestStorage({ activeDraft: updatedSession });
    }
  };

  // Finish Workout
  const handleFinishWorkout = (completedSession: WorkoutSession) => {
    const updatedSessionsList = [
      completedSession,
      ...sessions.filter((s) => s.id !== completedSession.id),
    ];
    setSessions(updatedSessionsList);
    setActiveWorkout(null);

    if (currentUser) {
      const nextSnapshot: UserDataSnapshot = {
        sessions: updatedSessionsList,
        templates,
        customExercises,
        measurements,
        photos,
        profile,
        activeDraft: null,
      };
      void SupabaseSyncService.saveUserData(currentUser.id, nextSnapshot);
    } else {
      updateGuestStorage({
        sessions: updatedSessionsList,
        activeDraft: null,
      });
    }
    setActiveTab('dashboard');
  };

  // Discard Active Workout
  const handleDiscardWorkout = () => {
    setIsDiscardConfirmOpen(true);
  };

  const confirmDiscardWorkout = () => {
    setActiveWorkout(null);
    if (!currentUser) {
      updateGuestStorage({ activeDraft: null });
    }
    setActiveTab('dashboard');
  };

  // Create Custom Exercise
  const handleCreateCustomExercise = (newEx: Exercise) => {
    const updatedCustom = [newEx, ...customExercises];
    setCustomExercises(updatedCustom);
    setExercises([...DEFAULT_EXERCISES, ...updatedCustom]);

    if (currentUser) {
      const nextSnapshot: UserDataSnapshot = {
        sessions,
        templates,
        customExercises: updatedCustom,
        measurements,
        photos,
        profile,
        activeDraft: activeWorkout,
      };
      void SupabaseSyncService.saveUserData(currentUser.id, nextSnapshot);
    } else {
      updateGuestStorage({ customExercises: updatedCustom });
    }
  };

  // Create Custom Template
  const handleCreateTemplate = (newTpl: WorkoutTemplate) => {
    const updated = [newTpl, ...templates];
    setTemplates(updated);
    if (currentUser) {
      const nextSnapshot: UserDataSnapshot = {
        sessions,
        templates: updated,
        customExercises,
        measurements,
        photos,
        profile,
        activeDraft: activeWorkout,
      };
      void SupabaseSyncService.saveUserData(currentUser.id, nextSnapshot);
    } else {
      updateGuestStorage({ templates: updated });
    }
  };

  // Update Template
  const handleUpdateTemplate = (updatedTpl: WorkoutTemplate) => {
    const updated = templates.map((t) => (t.id === updatedTpl.id ? updatedTpl : t));
    setTemplates(updated);
    if (currentUser) {
      const nextSnapshot: UserDataSnapshot = {
        sessions,
        templates: updated,
        customExercises,
        measurements,
        photos,
        profile,
        activeDraft: activeWorkout,
      };
      void SupabaseSyncService.saveUserData(currentUser.id, nextSnapshot);
    } else {
      updateGuestStorage({ templates: updated });
    }
  };

  // Delete Template
  const handleDeleteTemplate = (id: string) => {
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    if (currentUser) {
      const nextSnapshot: UserDataSnapshot = {
        sessions,
        templates: updated,
        customExercises,
        measurements,
        photos,
        profile,
        activeDraft: activeWorkout,
      };
      void SupabaseSyncService.saveUserData(currentUser.id, nextSnapshot);
    } else {
      updateGuestStorage({ templates: updated });
    }
  };

  // Delete Custom Exercise
  const handleDeleteExercise = (id: string) => {
    const updatedCustom = customExercises.filter((ex) => ex.id !== id);
    setCustomExercises(updatedCustom);
    setExercises([...DEFAULT_EXERCISES, ...updatedCustom]);
    if (!currentUser) {
      updateGuestStorage({ customExercises: updatedCustom });
    }
  };

  // Delete History Session
  const handleDeleteSession = (id: string) => {
    setSessionToDeleteId(id);
  };

  const confirmDeleteSession = () => {
    if (sessionToDeleteId) {
      const updated = sessions.filter((s) => s.id !== sessionToDeleteId);
      setSessions(updated);
      if (currentUser) {
        const nextSnapshot: UserDataSnapshot = {
          sessions: updated,
          templates,
          customExercises,
          measurements,
          photos,
          profile,
          activeDraft: activeWorkout,
        };
        void SupabaseSyncService.saveUserData(currentUser.id, nextSnapshot);
      } else {
        updateGuestStorage({ sessions: updated });
      }
      setSessionToDeleteId(null);
    }
  };

  // Repeat Session
  const handleRepeatSession = (pastSession: WorkoutSession) => {
    const newSession: WorkoutSession = {
      id: `sess-${Date.now()}`,
      name: pastSession.name,
      templateId: pastSession.templateId,
      startTime: Date.now(),
      durationSeconds: 0,
      status: 'active',
      exercises: pastSession.exercises.map((ex) => ({
        ...ex,
        sets: ex.sets.map((s) => ({
          ...s,
          id: `set-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          completed: false,
        })),
      })),
      totalVolume: 0,
    };

    setActiveWorkout(newSession);
    if (!currentUser) {
      updateGuestStorage({ activeDraft: newSession });
    }
    setActiveTab('workout');
  };

  // Body Measurement handlers
  const handleAddMeasurement = (m: BodyMeasurement) => {
    const updated = [m, ...measurements];
    setMeasurements(updated);
    if (currentUser) {
      const nextSnapshot: UserDataSnapshot = {
        sessions,
        templates,
        customExercises,
        measurements: updated,
        photos,
        profile,
        activeDraft: activeWorkout,
      };
      void SupabaseSyncService.saveUserData(currentUser.id, nextSnapshot);
    } else {
      updateGuestStorage({ measurements: updated });
    }
  };

  const handleDeleteMeasurement = (id: string) => {
    const updated = measurements.filter((m) => m.id !== id);
    setMeasurements(updated);
    if (currentUser) {
      const nextSnapshot: UserDataSnapshot = {
        sessions,
        templates,
        customExercises,
        measurements: updated,
        photos,
        profile,
        activeDraft: activeWorkout,
      };
      void SupabaseSyncService.saveUserData(currentUser.id, nextSnapshot);
    } else {
      updateGuestStorage({ measurements: updated });
    }
  };

  // Photo handlers
  const handleAddPhoto = (p: ProgressPhoto) => {
    const updated = [p, ...photos];
    setPhotos(updated);
    if (currentUser) {
      const nextSnapshot: UserDataSnapshot = {
        sessions,
        templates,
        customExercises,
        measurements,
        photos: updated,
        profile,
        activeDraft: activeWorkout,
      };
      void SupabaseSyncService.saveUserData(currentUser.id, nextSnapshot);
    } else {
      updateGuestStorage({ photos: updated });
    }
  };

  const handleDeletePhoto = (id: string) => {
    const updated = photos.filter((p) => p.id !== id);
    setPhotos(updated);
    if (currentUser) {
      const nextSnapshot: UserDataSnapshot = {
        sessions,
        templates,
        customExercises,
        measurements,
        photos: updated,
        profile,
        activeDraft: activeWorkout,
      };
      void SupabaseSyncService.saveUserData(currentUser.id, nextSnapshot);
    } else {
      updateGuestStorage({ photos: updated });
    }
  };

  // Update Profile
  const handleUpdateProfile = (updated: UserProfile) => {
    setProfile(updated);
    if (currentUser) {
      const nextSnapshot: UserDataSnapshot = {
        sessions,
        templates,
        customExercises,
        measurements,
        photos,
        profile: updated,
        activeDraft: activeWorkout,
      };
      void SupabaseSyncService.saveUserData(currentUser.id, nextSnapshot);
    } else {
      updateGuestStorage({ profile: updated });
    }
  };

  if (!currentUser && !guestMode) {
    return (
      <LoginPage
        onContinueGuest={() => setGuestMode(true)}
        onLoginSuccess={() => setGuestMode(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      {/* Primary Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasActiveWorkout={!!activeWorkout}
        onOpenActiveWorkout={() => setActiveTab('workout')}
        onStartNewWorkout={() => setIsStartWorkoutModalOpen(true)}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            sessions={sessions}
            templates={templates}
            prs={prs}
            onStartEmptyWorkout={handleStartEmptyWorkout}
            onStartFromTemplate={handleStartFromTemplate}
            onViewSessionDetails={() => setActiveTab('history')}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onDeleteSession={handleDeleteSession}
            onDeleteTemplate={handleDeleteTemplate}
            weightUnit={profile.weightUnit}
          />
        )}

        {activeTab === 'workout' &&
          (activeWorkout ? (
            <WorkoutLogger
              activeSession={activeWorkout}
              onUpdateSession={handleUpdateActiveSession}
              onFinishWorkout={handleFinishWorkout}
              onDiscardWorkout={handleDiscardWorkout}
              exercisesLibrary={exercises}
              onCreateCustomExercise={handleCreateCustomExercise}
              previousSessions={sessions}
              weightUnit={profile.weightUnit}
              soundEnabled={profile.soundEnabled}
              defaultRestTimerSeconds={profile.defaultRestTimerSeconds}
            />
          ) : (
            <div className="text-center py-16 space-y-4 max-w-md mx-auto">
              <h2 className="text-xl font-bold">No Active Workout</h2>
              <p className="text-xs text-gray-500">
                Start a blank workout or pick a template from your splits.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={handleStartEmptyWorkout}
                  className="px-4 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl font-bold text-xs cursor-pointer"
                >
                  Start Blank Workout
                </button>
                <button
                  onClick={() => setActiveTab('templates')}
                  className="px-4 py-2.5 bg-gray-200 dark:bg-zinc-800 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Choose Template
                </button>
              </div>
            </div>
          ))}

        {activeTab === 'templates' && (
          <TemplateManagerView
            templates={templates}
            exercisesLibrary={exercises}
            onStartFromTemplate={handleStartFromTemplate}
            onCreateTemplate={handleCreateTemplate}
            onUpdateTemplate={handleUpdateTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            onCreateCustomExercise={handleCreateCustomExercise}
          />
        )}

        {activeTab === 'exercises' && (
          <ExerciseLibraryView
            exercises={exercises}
            sessions={sessions}
            prs={prs}
            onCreateCustomExercise={handleCreateCustomExercise}
            onDeleteExercise={handleDeleteExercise}
            weightUnit={profile.weightUnit}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            sessions={sessions}
            onDeleteSession={handleDeleteSession}
            onRepeatSession={handleRepeatSession}
            weightUnit={profile.weightUnit}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressView
            sessions={sessions}
            exercises={exercises}
            prs={prs}
            measurements={measurements}
            onAddMeasurement={handleAddMeasurement}
            onDeleteMeasurement={handleDeleteMeasurement}
            photos={photos}
            onAddPhoto={handleAddPhoto}
            onDeletePhoto={handleDeletePhoto}
            weightUnit={profile.weightUnit}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            profile={profile}
            currentUser={currentUser}
            onUpdateProfile={handleUpdateProfile}
            onOpenDataModal={() => setIsDataModalOpen(true)}
            onSignOut={async () => {
              await logoutUser();
              setGuestMode(false);
            }}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}
      </main>

      {/* CSV & JSON Import / Export Modal */}
      <ImportExportModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        onDataReload={loadGuestState}
        sessions={sessions}
        templates={templates}
        exercises={exercises}
        measurements={measurements}
        profile={profile}
      />

      {/* Supabase Auth & Account Cloud Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onAuthSuccess={() => setIsAuthModalOpen(false)}
      />

      {/* Confirm Discard Workout Modal */}
      <ConfirmModal
        isOpen={isDiscardConfirmOpen}
        title="Discard Workout?"
        message="Are you sure you want to discard this workout? Progress will not be saved."
        confirmLabel="Discard Workout"
        cancelLabel="Keep Workout"
        variant="danger"
        onConfirm={confirmDiscardWorkout}
        onClose={() => setIsDiscardConfirmOpen(false)}
      />

      {/* Confirm Delete History Session Modal */}
      <ConfirmModal
        isOpen={!!sessionToDeleteId}
        title="Delete Workout Log?"
        message="Are you sure you want to delete this workout log permanently?"
        confirmLabel="Delete Log"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={confirmDeleteSession}
        onClose={() => setSessionToDeleteId(null)}
      />

      {/* Start Workout Options Modal */}
      <StartWorkoutModal
        isOpen={isStartWorkoutModalOpen}
        onClose={() => setIsStartWorkoutModalOpen(false)}
        templates={templates}
        onStartEmptyWorkout={handleStartEmptyWorkout}
        onStartFromTemplate={handleStartFromTemplate}
        onGoToTemplatesTab={() => setActiveTab('templates')}
      />
    </div>
  );
}
