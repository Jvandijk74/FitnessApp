export type UUID = string;

export type TrainingDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface Plan {
  id: UUID;
  user_id: UUID;
  week_start: string;
  structure: TrainingDay[];
  prescriptions: Record<string, WorkoutPrescription[]>;
  created_at?: string;
}

export interface WorkoutPrescription {
  type: 'run' | 'strength';
  title: string;
  description: string;
  day: TrainingDay;
  targets: {
    durationMinutes?: number;
    distanceKm?: number;
    intensity?: string;
    rpe?: number;
  };
}

export interface RunLog {
  id?: UUID;
  user_id: UUID;
  plan_id?: UUID;
  day: TrainingDay;
  distance_km: number;
  duration_minutes: number;
  avg_hr?: number;
  max_hr?: number;
  rpe?: number;
  source?: 'manual' | 'strava';
}

export interface StrengthSetLog {
  exercise_id: UUID;
  weight: number;
  reps: number;
  rpe?: number;
  rir?: number;
}

export interface StrengthExercise {
  id: UUID;
  plan_id?: UUID;
  day: TrainingDay;
  name: string;
  sets: string;
  tempo: string;
  rest: string;
  target_rpe: string;
}

export interface User {
  id: string;
  email?: string;
  threshold_pace?: number;
  threshold_hr?: number;
  age?: number;
  weight_kg?: number;
  height_cm?: number;
  gender?: 'male' | 'female' | 'other';
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  created_at?: string;
}

export interface NutritionGoal {
  id?: UUID;
  user_id: string;
  daily_calories: number;
  protein_grams: number;
  carbs_grams: number;
  fat_grams: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface NutritionLog {
  id?: UUID;
  user_id: string;
  log_date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  meal_name: string;
  calories: number;
  protein_grams: number;
  carbs_grams: number;
  fat_grams: number;
  notes?: string;
  created_at?: string;
}

export interface DailyNutritionSummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  meals: NutritionLog[];
}
