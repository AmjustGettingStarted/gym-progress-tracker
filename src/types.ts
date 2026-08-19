export type MuscleGroup = 
  | 'Chest' 
  | 'Back' 
  | 'Lats'
  | 'Upper Back'
  | 'Lower Back'
  | 'Shoulders' 
  | 'Front Delts'
  | 'Side Delts'
  | 'Rear Delts'
  | 'Biceps'
  | 'Triceps'
  | 'Forearms'
  | 'Quads'
  | 'Hamstrings'
  | 'Calves'
  | 'Glutes'
  | 'Abs'
  | 'Legs' 
  | 'Arms' 
  | 'Core' 
  | 'Traps'
  | 'Cardio' 
  | 'Full Body';

export type Equipment = 
  | 'Barbell' 
  | 'Dumbbell' 
  | 'Cable'
  | 'V-Bar'
  | 'Rope Attachment'
  | 'Straight Bar'
  | 'Lat Pulldown Bar'
  | 'Single D-Handle'
  | 'Parallel Bar'
  | 'EZ Bar'
  | 'Machine' 
  | 'Smith Machine' 
  | 'Leg Press'
  | 'Bodyweight' 
  | 'Kettlebell' 
  | 'Bands' 
  | 'Other';

export type SetType = 
  | 'Normal' 
  | 'Warmup' 
  | 'Working Set' 
  | 'Top Set' 
  | 'Back-off Set' 
  | 'Drop' 
  | 'Failure' 
  | 'Rest-Pause' 
  | 'Cluster' 
  | 'Super Set' 
  | 'Myo-reps' 
  | 'AMRAP';

export type WeightUnit = 'kg' | 'lbs';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  notes?: string;
  isCustom?: boolean;
}

export interface ExerciseSet {
  id: string;
  setType: SetType;
  weight: number; // Stored in user's active unit or kg
  reps: number;
  rpe?: number; // 1-10 rate of perceived exertion
  completed: boolean;
  isPR?: boolean;
}

export interface SessionExercise {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  notes?: string;
  sets: ExerciseSet[];
}

export interface WorkoutSession {
  id: string;
  name: string;
  templateId?: string;
  startTime: number; // timestamp ms
  endTime?: number; // timestamp ms
  durationSeconds: number;
  status: 'active' | 'completed' | 'discarded';
  notes?: string;
  exercises: SessionExercise[];
  totalVolume: number;
  prCount?: number;
}

export interface TemplateExerciseItem {
  exerciseId: string;
  defaultSetsCount: number;
  targetReps?: number;
  targetWeight?: number;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  category: 'PPL' | 'Upper/Lower' | 'Arnold' | 'Bro Split' | 'Full Body' | 'Custom';
  exercises: TemplateExerciseItem[];
  isBuiltIn?: boolean;
}

export interface BodyMeasurement {
  id: string;
  date: string; // ISO format YYYY-MM-DD
  weightKg: number;
  bodyFatPercentage?: number;
  chestCm?: number;
  waistCm?: number;
  armsCm?: number;
  thighsCm?: number;
  notes?: string;
}

export interface ProgressPhoto {
  id: string;
  date: string; // YYYY-MM-DD
  photoUrl: string; // base64 or object URL
  tag: 'Front' | 'Back' | 'Side' | 'Other';
  caption?: string;
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  maxWeight: number;
  maxVolume: number;
  estimated1RM: number;
  date: string;
}

export interface UserProfile {
  name: string;
  email: string;
  weightUnit: WeightUnit;
  theme: 'light' | 'dark';
  defaultRestTimerSeconds: number;
  soundEnabled: boolean;
  targetSplit: string;
}

export type TabType = 'dashboard' | 'workout' | 'templates' | 'history' | 'progress' | 'exercises' | 'settings';

export type DailyLogType = 'workout' | 'rest';

export interface DailyLog {
  id: string;
  logDate: string; // YYYY-MM-DD
  logType: DailyLogType;
}

