import { Exercise, WorkoutTemplate, WorkoutSession, BodyMeasurement, UserProfile } from '../types';

export const DEFAULT_EXERCISES: Exercise[] = [
  // Chest
  { id: 'ex-1', name: 'Barbell Bench Press', muscleGroup: 'Chest', equipment: 'Barbell' },
  { id: 'ex-2', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', equipment: 'Dumbbell' },
  { id: 'ex-3', name: 'Cable Fly (Single D-Handle)', muscleGroup: 'Chest', equipment: 'Single D-Handle' },
  { id: 'ex-4', name: 'Dips (Chest Focus)', muscleGroup: 'Chest', equipment: 'Parallel Bar' },
  { id: 'ex-5', name: 'Push-Up', muscleGroup: 'Chest', equipment: 'Bodyweight' },
  { id: 'ex-31', name: 'Incline Barbell Bench Press', muscleGroup: 'Chest', equipment: 'Barbell' },
  { id: 'ex-32', name: 'Pec Deck Machine Fly', muscleGroup: 'Chest', equipment: 'Machine' },
  { id: 'ex-33', name: 'Decline Dumbbell Press', muscleGroup: 'Chest', equipment: 'Dumbbell' },

  // Lats & Back
  { id: 'ex-6', name: 'Barbell Deadlift', muscleGroup: 'Lower Back', equipment: 'Barbell' },
  { id: 'ex-7', name: 'Pull-Up', muscleGroup: 'Lats', equipment: 'Bodyweight' },
  { id: 'ex-8', name: 'Lat Pulldown (Wide Bar)', muscleGroup: 'Lats', equipment: 'Lat Pulldown Bar' },
  { id: 'ex-34', name: 'Lat Pulldown (V-Bar)', muscleGroup: 'Lats', equipment: 'V-Bar' },
  { id: 'ex-9', name: 'Barbell Bent Over Row', muscleGroup: 'Upper Back', equipment: 'Barbell' },
  { id: 'ex-10', name: 'Seated Cable Row (V-Bar)', muscleGroup: 'Upper Back', equipment: 'V-Bar' },
  { id: 'ex-35', name: 'Seated Cable Row (Straight Bar)', muscleGroup: 'Upper Back', equipment: 'Straight Bar' },
  { id: 'ex-11', name: 'Single-Arm Dumbbell Row', muscleGroup: 'Lats', equipment: 'Dumbbell' },
  { id: 'ex-36', name: 'T-Bar Row', muscleGroup: 'Upper Back', equipment: 'Barbell' },
  { id: 'ex-37', name: 'Straight-Arm Cable Pulldown (Rope)', muscleGroup: 'Lats', equipment: 'Rope Attachment' },

  // Biceps
  { id: 'ex-22', name: 'EZ Bar Bicep Curl', muscleGroup: 'Biceps', equipment: 'EZ Bar' },
  { id: 'ex-23', name: 'Incline Dumbbell Curl', muscleGroup: 'Biceps', equipment: 'Dumbbell' },
  { id: 'ex-26', name: 'Hammer Curl (Dumbbell)', muscleGroup: 'Biceps', equipment: 'Dumbbell' },
  { id: 'ex-38', name: 'Cable Bicep Curl (Straight Bar)', muscleGroup: 'Biceps', equipment: 'Straight Bar' },
  { id: 'ex-39', name: 'Preacher Curl (EZ Bar)', muscleGroup: 'Biceps', equipment: 'EZ Bar' },
  { id: 'ex-40', name: 'Concentration Curl', muscleGroup: 'Biceps', equipment: 'Dumbbell' },
  { id: 'ex-41', name: 'Cable Hammer Curl (Rope)', muscleGroup: 'Biceps', equipment: 'Rope Attachment' },

  // Triceps
  { id: 'ex-24', name: 'Triceps Pushdown (Rope Attachment)', muscleGroup: 'Triceps', equipment: 'Rope Attachment' },
  { id: 'ex-42', name: 'Triceps Pushdown (V-Bar)', muscleGroup: 'Triceps', equipment: 'V-Bar' },
  { id: 'ex-43', name: 'Triceps Pushdown (Straight Bar)', muscleGroup: 'Triceps', equipment: 'Straight Bar' },
  { id: 'ex-25', name: 'Skull Crusher (EZ Bar)', muscleGroup: 'Triceps', equipment: 'EZ Bar' },
  { id: 'ex-44', name: 'Overhead Dumbbell Extension', muscleGroup: 'Triceps', equipment: 'Dumbbell' },
  { id: 'ex-45', name: 'Close-Grip Bench Press', muscleGroup: 'Triceps', equipment: 'Barbell' },
  { id: 'ex-46', name: 'Single-Arm Cable Triceps Extension', muscleGroup: 'Triceps', equipment: 'Single D-Handle' },

  // Shoulders (Front, Side, Rear Delts)
  { id: 'ex-18', name: 'Overhead Barbell Press', muscleGroup: 'Front Delts', equipment: 'Barbell' },
  { id: 'ex-21', name: 'Seated Dumbbell Shoulder Press', muscleGroup: 'Front Delts', equipment: 'Dumbbell' },
  { id: 'ex-19', name: 'Dumbbell Lateral Raise', muscleGroup: 'Side Delts', equipment: 'Dumbbell' },
  { id: 'ex-47', name: 'Cable Lateral Raise (Single D-Handle)', muscleGroup: 'Side Delts', equipment: 'Single D-Handle' },
  { id: 'ex-20', name: 'Face Pull (Rope Attachment)', muscleGroup: 'Rear Delts', equipment: 'Rope Attachment' },
  { id: 'ex-48', name: 'Reverse Pec Deck Fly', muscleGroup: 'Rear Delts', equipment: 'Machine' },
  { id: 'ex-49', name: 'Barbell Shrugs', muscleGroup: 'Traps', equipment: 'Barbell' },

  // Legs (Quads, Hamstrings, Calves, Glutes)
  { id: 'ex-12', name: 'Barbell Back Squat', muscleGroup: 'Quads', equipment: 'Barbell' },
  { id: 'ex-50', name: 'Front Squat', muscleGroup: 'Quads', equipment: 'Barbell' },
  { id: 'ex-13', name: '45° Leg Press', muscleGroup: 'Quads', equipment: 'Leg Press' },
  { id: 'ex-14', name: 'Romanian Deadlift (Barbell)', muscleGroup: 'Hamstrings', equipment: 'Barbell' },
  { id: 'ex-51', name: 'Dumbbell Bulgarian Split Squat', muscleGroup: 'Quads', equipment: 'Dumbbell' },
  { id: 'ex-15', name: 'Leg Extension', muscleGroup: 'Quads', equipment: 'Machine' },
  { id: 'ex-16', name: 'Seated Leg Curl', muscleGroup: 'Hamstrings', equipment: 'Machine' },
  { id: 'ex-52', name: 'Lying Leg Curl', muscleGroup: 'Hamstrings', equipment: 'Machine' },
  { id: 'ex-17', name: 'Standing Calf Raise', muscleGroup: 'Calves', equipment: 'Machine' },
  { id: 'ex-53', name: 'Barbell Hip Thrust', muscleGroup: 'Glutes', equipment: 'Barbell' },

  // Core & Forearms & Cardio
  { id: 'ex-27', name: 'Hanging Leg Raise', muscleGroup: 'Abs', equipment: 'Parallel Bar' },
  { id: 'ex-28', name: 'Cable Crunch (Rope)', muscleGroup: 'Abs', equipment: 'Rope Attachment' },
  { id: 'ex-29', name: 'Ab Wheel Rollout', muscleGroup: 'Abs', equipment: 'Other' },
  { id: 'ex-54', name: 'Wrist Curl (Barbell)', muscleGroup: 'Forearms', equipment: 'Barbell' },
  { id: 'ex-30', name: 'Treadmill Running', muscleGroup: 'Cardio', equipment: 'Machine' },
];

export const DEFAULT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Push Day (Chest / Shoulders / Triceps)',
    description: 'Hypertrophy focused push workout for maximum chest, front delt, and triceps growth.',
    category: 'PPL',
    isBuiltIn: true,
    exercises: [
      { exerciseId: 'ex-1', defaultSetsCount: 4, targetReps: 8, targetWeight: 80 },
      { exerciseId: 'ex-2', defaultSetsCount: 3, targetReps: 10, targetWeight: 30 },
      { exerciseId: 'ex-18', defaultSetsCount: 3, targetReps: 8, targetWeight: 50 },
      { exerciseId: 'ex-19', defaultSetsCount: 4, targetReps: 12, targetWeight: 12 },
      { exerciseId: 'ex-24', defaultSetsCount: 3, targetReps: 12, targetWeight: 25 },
    ],
  },
  {
    id: 'tpl-2',
    name: 'Pull Day (Back / Rear Delts / Biceps)',
    description: 'Upper body pulling movements targeting lat thickness, upper back density, and arm flexion.',
    category: 'PPL',
    isBuiltIn: true,
    exercises: [
      { exerciseId: 'ex-6', defaultSetsCount: 3, targetReps: 5, targetWeight: 140 },
      { exerciseId: 'ex-7', defaultSetsCount: 3, targetReps: 8, targetWeight: 0 },
      { exerciseId: 'ex-10', defaultSetsCount: 3, targetReps: 10, targetWeight: 60 },
      { exerciseId: 'ex-20', defaultSetsCount: 4, targetReps: 15, targetWeight: 20 },
      { exerciseId: 'ex-22', defaultSetsCount: 3, targetReps: 10, targetWeight: 35 },
    ],
  },
  {
    id: 'tpl-3',
    name: 'Leg Day (Quads / Hamstrings / Calves)',
    description: 'Heavy compound leg routine for lower body power and quad development.',
    category: 'PPL',
    isBuiltIn: true,
    exercises: [
      { exerciseId: 'ex-12', defaultSetsCount: 4, targetReps: 8, targetWeight: 100 },
      { exerciseId: 'ex-14', defaultSetsCount: 3, targetReps: 10, targetWeight: 90 },
      { exerciseId: 'ex-13', defaultSetsCount: 3, targetReps: 12, targetWeight: 160 },
      { exerciseId: 'ex-16', defaultSetsCount: 3, targetReps: 12, targetWeight: 50 },
      { exerciseId: 'ex-17', defaultSetsCount: 4, targetReps: 15, targetWeight: 70 },
    ],
  },
  {
    id: 'tpl-4',
    name: 'Upper Body Power',
    description: 'Heavy compound upper body split for pure strength.',
    category: 'Upper/Lower',
    isBuiltIn: true,
    exercises: [
      { exerciseId: 'ex-1', defaultSetsCount: 4, targetReps: 5, targetWeight: 85 },
      { exerciseId: 'ex-9', defaultSetsCount: 4, targetReps: 6, targetWeight: 75 },
      { exerciseId: 'ex-18', defaultSetsCount: 3, targetReps: 6, targetWeight: 55 },
      { exerciseId: 'ex-7', defaultSetsCount: 3, targetReps: 8, targetWeight: 0 },
    ],
  },
  {
    id: 'tpl-5',
    name: 'Arnold Split: Chest & Back',
    description: 'Classic antagonist superset pairing for Arnold Schwarzenegger classic split.',
    category: 'Arnold',
    isBuiltIn: true,
    exercises: [
      { exerciseId: 'ex-1', defaultSetsCount: 4, targetReps: 10, targetWeight: 75 },
      { exerciseId: 'ex-9', defaultSetsCount: 4, targetReps: 10, targetWeight: 70 },
      { exerciseId: 'ex-2', defaultSetsCount: 3, targetReps: 12, targetWeight: 28 },
      { exerciseId: 'ex-8', defaultSetsCount: 3, targetReps: 12, targetWeight: 55 },
    ],
  }
];

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'User',
  email: 'user@gmail.com',
  weightUnit: 'kg',
  theme: 'light',
  defaultRestTimerSeconds: 90,
  soundEnabled: true,
  targetSplit: 'Push / Pull / Legs (5 days/week)',
};

// Generate realistic history for past 2 weeks (14 days of Push / Pull / Legs)
const now = new Date();
const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

export const SAMPLE_HISTORICAL_SESSIONS: WorkoutSession[] = [
  {
    id: 'ppl-day-1',
    name: 'Push Day A (Chest / Shoulders / Triceps)',
    templateId: 'tpl-1',
    startTime: daysAgo(1).setHours(18, 0, 0, 0),
    endTime: daysAgo(1).setHours(19, 15, 0, 0),
    durationSeconds: 4500,
    status: 'completed',
    notes: 'Day 1: Heavy flat bench. Felt strong and hit a new PR set!',
    totalVolume: 6120,
    prCount: 1,
    exercises: [
      {
        exerciseId: 'ex-1',
        exerciseName: 'Barbell Bench Press',
        muscleGroup: 'Chest',
        sets: [
          { id: 'p1-s1', setType: 'Warmup', weight: 50, reps: 10, completed: true },
          { id: 'p1-s2', setType: 'Normal', weight: 80, reps: 8, completed: true },
          { id: 'p1-s3', setType: 'Normal', weight: 85, reps: 6, completed: true, isPR: true },
          { id: 'p1-s4', setType: 'Normal', weight: 85, reps: 5, completed: true },
        ],
      },
      {
        exerciseId: 'ex-2',
        exerciseName: 'Incline Dumbbell Press',
        muscleGroup: 'Chest',
        sets: [
          { id: 'p1-s5', setType: 'Normal', weight: 30, reps: 10, completed: true },
          { id: 'p1-s6', setType: 'Normal', weight: 32, reps: 8, completed: true },
        ],
      },
      {
        exerciseId: 'ex-19',
        exerciseName: 'Dumbbell Lateral Raise',
        muscleGroup: 'Side Delts',
        sets: [
          { id: 'p1-s7', setType: 'Normal', weight: 12, reps: 15, completed: true },
          { id: 'p1-s8', setType: 'Normal', weight: 14, reps: 12, completed: true },
        ],
      },
      {
        exerciseId: 'ex-24',
        exerciseName: 'Triceps Pushdown (Rope Attachment)',
        muscleGroup: 'Triceps',
        sets: [
          { id: 'p1-s9', setType: 'Normal', weight: 25, reps: 12, completed: true },
          { id: 'p1-s10', setType: 'Normal', weight: 27.5, reps: 10, completed: true },
        ],
      },
    ],
  },
  {
    id: 'ppl-day-2',
    name: 'Pull Day A (Back / Rear Delts / Biceps)',
    templateId: 'tpl-2',
    startTime: daysAgo(2).setHours(17, 30, 0, 0),
    endTime: daysAgo(2).setHours(18, 45, 0, 0),
    durationSeconds: 4500,
    status: 'completed',
    notes: 'Day 2: Heavy deadlifts and lat pulldowns. Squeezed at top.',
    totalVolume: 7450,
    prCount: 1,
    exercises: [
      {
        exerciseId: 'ex-6',
        exerciseName: 'Barbell Deadlift',
        muscleGroup: 'Lower Back',
        sets: [
          { id: 'p2-s1', setType: 'Warmup', weight: 80, reps: 8, completed: true },
          { id: 'p2-s2', setType: 'Normal', weight: 140, reps: 5, completed: true },
          { id: 'p2-s3', setType: 'Normal', weight: 150, reps: 5, completed: true, isPR: true },
        ],
      },
      {
        exerciseId: 'ex-8',
        exerciseName: 'Lat Pulldown (Wide Bar)',
        muscleGroup: 'Lats',
        sets: [
          { id: 'p2-s4', setType: 'Normal', weight: 65, reps: 10, completed: true },
          { id: 'p2-s5', setType: 'Normal', weight: 70, reps: 8, completed: true },
        ],
      },
      {
        exerciseId: 'ex-22',
        exerciseName: 'EZ Bar Bicep Curl',
        muscleGroup: 'Biceps',
        sets: [
          { id: 'p2-s6', setType: 'Normal', weight: 30, reps: 12, completed: true },
          { id: 'p2-s7', setType: 'Normal', weight: 35, reps: 10, completed: true },
        ],
      },
    ],
  },
  {
    id: 'ppl-day-3',
    name: 'Leg Day A (Quads / Hamstrings / Calves)',
    templateId: 'tpl-3',
    startTime: daysAgo(3).setHours(18, 0, 0, 0),
    endTime: daysAgo(3).setHours(19, 15, 0, 0),
    durationSeconds: 4500,
    status: 'completed',
    notes: 'Day 3: Squats felt super deep. Great hamstring activation.',
    totalVolume: 8100,
    prCount: 1,
    exercises: [
      {
        exerciseId: 'ex-12',
        exerciseName: 'Barbell Back Squat',
        muscleGroup: 'Quads',
        sets: [
          { id: 'p3-s1', setType: 'Warmup', weight: 60, reps: 10, completed: true },
          { id: 'p3-s2', setType: 'Normal', weight: 100, reps: 8, completed: true },
          { id: 'p3-s3', setType: 'Normal', weight: 110, reps: 6, completed: true, isPR: true },
        ],
      },
      {
        exerciseId: 'ex-13',
        exerciseName: '45° Leg Press',
        muscleGroup: 'Quads',
        sets: [
          { id: 'p3-s4', setType: 'Normal', weight: 180, reps: 12, completed: true },
          { id: 'p3-s5', setType: 'Normal', weight: 200, reps: 10, completed: true },
        ],
      },
      {
        exerciseId: 'ex-14',
        exerciseName: 'Romanian Deadlift (Barbell)',
        muscleGroup: 'Hamstrings',
        sets: [
          { id: 'p3-s6', setType: 'Normal', weight: 90, reps: 10, completed: true },
          { id: 'p3-s7', setType: 'Normal', weight: 100, reps: 8, completed: true },
        ],
      },
    ],
  },
  {
    id: 'ppl-day-4',
    name: 'Push Day B (Incline Bench & Shoulder Focus)',
    templateId: 'tpl-1',
    startTime: daysAgo(4).setHours(17, 15, 0, 0),
    endTime: daysAgo(4).setHours(18, 25, 0, 0),
    durationSeconds: 4200,
    status: 'completed',
    notes: 'Day 4: Focused on upper chest and overhead pressing power.',
    totalVolume: 5600,
    prCount: 0,
    exercises: [
      {
        exerciseId: 'ex-31',
        exerciseName: 'Incline Barbell Bench Press',
        muscleGroup: 'Chest',
        sets: [
          { id: 'p4-s1', setType: 'Warmup', weight: 40, reps: 12, completed: true },
          { id: 'p4-s2', setType: 'Normal', weight: 65, reps: 8, completed: true },
          { id: 'p4-s3', setType: 'Normal', weight: 70, reps: 8, completed: true },
        ],
      },
      {
        exerciseId: 'ex-18',
        exerciseName: 'Overhead Barbell Press',
        muscleGroup: 'Front Delts',
        sets: [
          { id: 'p4-s4', setType: 'Normal', weight: 50, reps: 8, completed: true },
          { id: 'p4-s5', setType: 'Normal', weight: 55, reps: 6, completed: true },
        ],
      },
      {
        exerciseId: 'ex-4',
        exerciseName: 'Dips (Chest Focus)',
        muscleGroup: 'Chest',
        sets: [
          { id: 'p4-s6', setType: 'Normal', weight: 0, reps: 12, completed: true },
          { id: 'p4-s7', setType: 'Normal', weight: 10, reps: 10, completed: true },
        ],
      },
    ],
  },
  {
    id: 'ppl-day-5',
    name: 'Pull Day B (Barbell Rows & Bicep Peak)',
    templateId: 'tpl-2',
    startTime: daysAgo(5).setHours(18, 0, 0, 0),
    endTime: daysAgo(5).setHours(19, 10, 0, 0),
    durationSeconds: 4200,
    status: 'completed',
    notes: 'Day 5: Heavy bent over rows and incline dumbbell curls.',
    totalVolume: 6300,
    prCount: 1,
    exercises: [
      {
        exerciseId: 'ex-9',
        exerciseName: 'Barbell Bent Over Row',
        muscleGroup: 'Upper Back',
        sets: [
          { id: 'p5-s1', setType: 'Warmup', weight: 50, reps: 12, completed: true },
          { id: 'p5-s2', setType: 'Normal', weight: 75, reps: 8, completed: true },
          { id: 'p5-s3', setType: 'Normal', weight: 80, reps: 8, completed: true, isPR: true },
        ],
      },
      {
        exerciseId: 'ex-10',
        exerciseName: 'Seated Cable Row (V-Bar)',
        muscleGroup: 'Upper Back',
        sets: [
          { id: 'p5-s4', setType: 'Normal', weight: 65, reps: 10, completed: true },
          { id: 'p5-s5', setType: 'Normal', weight: 70, reps: 8, completed: true },
        ],
      },
      {
        exerciseId: 'ex-23',
        exerciseName: 'Incline Dumbbell Curl',
        muscleGroup: 'Biceps',
        sets: [
          { id: 'p5-s6', setType: 'Normal', weight: 14, reps: 12, completed: true },
          { id: 'p5-s7', setType: 'Normal', weight: 16, reps: 10, completed: true },
        ],
      },
    ],
  },
  {
    id: 'ppl-day-6',
    name: 'Leg Day B (Front Squats & Glutes)',
    templateId: 'tpl-3',
    startTime: daysAgo(6).setHours(17, 30, 0, 0),
    endTime: daysAgo(6).setHours(18, 40, 0, 0),
    durationSeconds: 4200,
    status: 'completed',
    notes: 'Day 6: Quad focused front squats and lying leg curls.',
    totalVolume: 6900,
    prCount: 0,
    exercises: [
      {
        exerciseId: 'ex-50',
        exerciseName: 'Front Squat',
        muscleGroup: 'Quads',
        sets: [
          { id: 'p6-s1', setType: 'Warmup', weight: 40, reps: 10, completed: true },
          { id: 'p6-s2', setType: 'Normal', weight: 70, reps: 8, completed: true },
          { id: 'p6-s3', setType: 'Normal', weight: 75, reps: 8, completed: true },
        ],
      },
      {
        exerciseId: 'ex-52',
        exerciseName: 'Lying Leg Curl',
        muscleGroup: 'Hamstrings',
        sets: [
          { id: 'p6-s4', setType: 'Normal', weight: 45, reps: 12, completed: true },
          { id: 'p6-s5', setType: 'Normal', weight: 50, reps: 10, completed: true },
        ],
      },
      {
        exerciseId: 'ex-53',
        exerciseName: 'Barbell Hip Thrust',
        muscleGroup: 'Glutes',
        sets: [
          { id: 'p6-s6', setType: 'Normal', weight: 100, reps: 10, completed: true },
          { id: 'p6-s7', setType: 'Normal', weight: 110, reps: 10, completed: true },
        ],
      },
    ],
  },
  {
    id: 'ppl-day-7',
    name: 'Push Day A (Bench PR Day)',
    templateId: 'tpl-1',
    startTime: daysAgo(7).setHours(18, 0, 0, 0),
    endTime: daysAgo(7).setHours(19, 15, 0, 0),
    durationSeconds: 4500,
    status: 'completed',
    notes: 'Day 7: Hit 87.5kg Bench Press for 5 reps! PR!',
    totalVolume: 6400,
    prCount: 1,
    exercises: [
      {
        exerciseId: 'ex-1',
        exerciseName: 'Barbell Bench Press',
        muscleGroup: 'Chest',
        sets: [
          { id: 'p7-s1', setType: 'Warmup', weight: 50, reps: 10, completed: true },
          { id: 'p7-s2', setType: 'Normal', weight: 80, reps: 8, completed: true },
          { id: 'p7-s3', setType: 'Normal', weight: 87.5, reps: 5, completed: true, isPR: true },
        ],
      },
      {
        exerciseId: 'ex-2',
        exerciseName: 'Incline Dumbbell Press',
        muscleGroup: 'Chest',
        sets: [
          { id: 'p7-s4', setType: 'Normal', weight: 32, reps: 10, completed: true },
          { id: 'p7-s5', setType: 'Normal', weight: 34, reps: 8, completed: true },
        ],
      },
    ],
  },
  {
    id: 'ppl-day-8',
    name: 'Pull Day A (Lat Pulldown PR Day)',
    templateId: 'tpl-2',
    startTime: daysAgo(8).setHours(17, 0, 0, 0),
    endTime: daysAgo(8).setHours(18, 15, 0, 0),
    durationSeconds: 4500,
    status: 'completed',
    notes: 'Day 8: Lat pulldowns up to 75kg!',
    totalVolume: 6800,
    prCount: 1,
    exercises: [
      {
        exerciseId: 'ex-8',
        exerciseName: 'Lat Pulldown (Wide Bar)',
        muscleGroup: 'Lats',
        sets: [
          { id: 'p8-s1', setType: 'Warmup', weight: 50, reps: 12, completed: true },
          { id: 'p8-s2', setType: 'Normal', weight: 70, reps: 8, completed: true },
          { id: 'p8-s3', setType: 'Normal', weight: 75, reps: 8, completed: true, isPR: true },
        ],
      },
      {
        exerciseId: 'ex-11',
        exerciseName: 'Single-Arm Dumbbell Row',
        muscleGroup: 'Lats',
        sets: [
          { id: 'p8-s4', setType: 'Normal', weight: 30, reps: 10, completed: true },
          { id: 'p8-s5', setType: 'Normal', weight: 34, reps: 8, completed: true },
        ],
      },
    ],
  },
  {
    id: 'ppl-day-9',
    name: 'Leg Day A (Heavy Back Squats PR)',
    templateId: 'tpl-3',
    startTime: daysAgo(9).setHours(18, 0, 0, 0),
    endTime: daysAgo(9).setHours(19, 20, 0, 0),
    durationSeconds: 4800,
    status: 'completed',
    notes: 'Day 9: Back squat PR at 115kg for 5 clean reps!',
    totalVolume: 8500,
    prCount: 1,
    exercises: [
      {
        exerciseId: 'ex-12',
        exerciseName: 'Barbell Back Squat',
        muscleGroup: 'Quads',
        sets: [
          { id: 'p9-s1', setType: 'Warmup', weight: 60, reps: 10, completed: true },
          { id: 'p9-s2', setType: 'Normal', weight: 100, reps: 8, completed: true },
          { id: 'p9-s3', setType: 'Normal', weight: 115, reps: 5, completed: true, isPR: true },
        ],
      },
      {
        exerciseId: 'ex-51',
        exerciseName: 'Dumbbell Bulgarian Split Squat',
        muscleGroup: 'Quads',
        sets: [
          { id: 'p9-s4', setType: 'Normal', weight: 18, reps: 10, completed: true },
          { id: 'p9-s5', setType: 'Normal', weight: 20, reps: 8, completed: true },
        ],
      },
    ],
  },
  {
    id: 'ppl-day-10',
    name: 'Push Day B (Overhead Press PR)',
    templateId: 'tpl-1',
    startTime: daysAgo(10).setHours(17, 30, 0, 0),
    endTime: daysAgo(10).setHours(18, 40, 0, 0),
    durationSeconds: 4200,
    status: 'completed',
    notes: 'Day 10: Overhead press reached 60kg for 6 reps!',
    totalVolume: 5800,
    prCount: 1,
    exercises: [
      {
        exerciseId: 'ex-18',
        exerciseName: 'Overhead Barbell Press',
        muscleGroup: 'Front Delts',
        sets: [
          { id: 'p10-s1', setType: 'Warmup', weight: 35, reps: 10, completed: true },
          { id: 'p10-s2', setType: 'Normal', weight: 55, reps: 8, completed: true },
          { id: 'p10-s3', setType: 'Normal', weight: 60, reps: 6, completed: true, isPR: true },
        ],
      },
      {
        exerciseId: 'ex-25',
        exerciseName: 'Skull Crusher (EZ Bar)',
        muscleGroup: 'Triceps',
        sets: [
          { id: 'p10-s4', setType: 'Normal', weight: 32.5, reps: 10, completed: true },
          { id: 'p10-s5', setType: 'Normal', weight: 35, reps: 8, completed: true },
        ],
      },
    ],
  },
  {
    id: 'ppl-day-11',
    name: 'Pull Day B (Barbell Bent Over Row PR)',
    templateId: 'tpl-2',
    startTime: daysAgo(11).setHours(18, 0, 0, 0),
    endTime: daysAgo(11).setHours(19, 10, 0, 0),
    durationSeconds: 4200,
    status: 'completed',
    notes: 'Day 11: Bent over row 85kg PR set!',
    totalVolume: 6700,
    prCount: 1,
    exercises: [
      {
        exerciseId: 'ex-9',
        exerciseName: 'Barbell Bent Over Row',
        muscleGroup: 'Upper Back',
        sets: [
          { id: 'p11-s1', setType: 'Warmup', weight: 50, reps: 10, completed: true },
          { id: 'p11-s2', setType: 'Normal', weight: 75, reps: 8, completed: true },
          { id: 'p11-s3', setType: 'Normal', weight: 85, reps: 6, completed: true, isPR: true },
        ],
      },
      {
        exerciseId: 'ex-26',
        exerciseName: 'Hammer Curl (Dumbbell)',
        muscleGroup: 'Biceps',
        sets: [
          { id: 'p11-s4', setType: 'Normal', weight: 16, reps: 10, completed: true },
          { id: 'p11-s5', setType: 'Normal', weight: 18, reps: 8, completed: true },
        ],
      },
    ],
  },
  {
    id: 'ppl-day-12',
    name: 'Leg Day B (Front Squat & Core)',
    templateId: 'tpl-3',
    startTime: daysAgo(12).setHours(17, 0, 0, 0),
    endTime: daysAgo(12).setHours(18, 10, 0, 0),
    durationSeconds: 4200,
    status: 'completed',
    notes: 'Day 12: Front squats and ab wheel rollouts.',
    totalVolume: 6400,
    prCount: 0,
    exercises: [
      {
        exerciseId: 'ex-50',
        exerciseName: 'Front Squat',
        muscleGroup: 'Quads',
        sets: [
          { id: 'p12-s1', setType: 'Warmup', weight: 40, reps: 10, completed: true },
          { id: 'p12-s2', setType: 'Normal', weight: 72.5, reps: 8, completed: true },
          { id: 'p12-s3', setType: 'Normal', weight: 77.5, reps: 6, completed: true },
        ],
      },
      {
        exerciseId: 'ex-29',
        exerciseName: 'Ab Wheel Rollout',
        muscleGroup: 'Abs',
        sets: [
          { id: 'p12-s4', setType: 'Normal', weight: 0, reps: 15, completed: true },
          { id: 'p12-s5', setType: 'Normal', weight: 0, reps: 12, completed: true },
        ],
      },
    ],
  },
  {
    id: 'ppl-day-13',
    name: 'Push Day A (Incline Dumbbell Press)',
    templateId: 'tpl-1',
    startTime: daysAgo(13).setHours(18, 15, 0, 0),
    endTime: daysAgo(13).setHours(19, 25, 0, 0),
    durationSeconds: 4200,
    status: 'completed',
    notes: 'Day 13: Great upper chest burn!',
    totalVolume: 5900,
    prCount: 0,
    exercises: [
      {
        exerciseId: 'ex-2',
        exerciseName: 'Incline Dumbbell Press',
        muscleGroup: 'Chest',
        sets: [
          { id: 'p13-s1', setType: 'Normal', weight: 30, reps: 10, completed: true },
          { id: 'p13-s2', setType: 'Normal', weight: 32, reps: 10, completed: true },
          { id: 'p13-s3', setType: 'Normal', weight: 34, reps: 8, completed: true },
        ],
      },
      {
        exerciseId: 'ex-3',
        exerciseName: 'Cable Fly (Single D-Handle)',
        muscleGroup: 'Chest',
        sets: [
          { id: 'p13-s4', setType: 'Normal', weight: 15, reps: 12, completed: true },
          { id: 'p13-s5', setType: 'Normal', weight: 17.5, reps: 10, completed: true },
        ],
      },
    ],
  },
  {
    id: 'ppl-day-14',
    name: 'Pull Day A (Seated Cable Row & Preacher Curls)',
    templateId: 'tpl-2',
    startTime: daysAgo(14).setHours(17, 30, 0, 0),
    endTime: daysAgo(14).setHours(18, 45, 0, 0),
    durationSeconds: 4500,
    status: 'completed',
    notes: 'Day 14: Completed full 2 weeks Push/Pull/Legs rotation!',
    totalVolume: 6600,
    prCount: 0,
    exercises: [
      {
        exerciseId: 'ex-10',
        exerciseName: 'Seated Cable Row (V-Bar)',
        muscleGroup: 'Upper Back',
        sets: [
          { id: 'p14-s1', setType: 'Warmup', weight: 45, reps: 12, completed: true },
          { id: 'p14-s2', setType: 'Normal', weight: 65, reps: 10, completed: true },
          { id: 'p14-s3', setType: 'Normal', weight: 70, reps: 8, completed: true },
        ],
      },
      {
        exerciseId: 'ex-39',
        exerciseName: 'Preacher Curl (EZ Bar)',
        muscleGroup: 'Biceps',
        sets: [
          { id: 'p14-s4', setType: 'Normal', weight: 25, reps: 12, completed: true },
          { id: 'p14-s5', setType: 'Normal', weight: 30, reps: 10, completed: true },
        ],
      },
    ],
  },
];

export const SAMPLE_BODY_MEASUREMENTS: BodyMeasurement[] = [
  {
    id: 'bm-1',
    date: daysAgo(20).toISOString().split('T')[0],
    weightKg: 78.5,
    bodyFatPercentage: 16.2,
    chestCm: 102,
    waistCm: 83,
    armsCm: 37.5,
    thighsCm: 58,
    notes: 'Initial check-in for cutting phase',
  },
  {
    id: 'bm-2',
    date: daysAgo(10).toISOString().split('T')[0],
    weightKg: 77.8,
    bodyFatPercentage: 15.8,
    chestCm: 102.5,
    waistCm: 82,
    armsCm: 37.8,
    thighsCm: 58.2,
    notes: 'Weight dropping steadily',
  },
  {
    id: 'bm-3',
    date: daysAgo(1).toISOString().split('T')[0],
    weightKg: 77.2,
    bodyFatPercentage: 15.4,
    chestCm: 103,
    waistCm: 81.2,
    armsCm: 38,
    thighsCm: 58.5,
    notes: 'Feeling leaner and stronger',
  },
];
