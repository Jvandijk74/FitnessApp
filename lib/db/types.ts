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
