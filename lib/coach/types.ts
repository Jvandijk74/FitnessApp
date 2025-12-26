import { TrainingDay } from '@/lib/db/types';

export type IntensityZone = 'easy' | 'tempo' | 'threshold' | 'long' | 'rest';

export interface AthleteProfile {
  id: string;
  thresholdPace: number; // min/km
  thresholdHr?: number;
  readinessScore?: number; // 0-1
  recentRpeAverage?: number;
}

export interface RunPrescription {
  day: TrainingDay;
  durationMinutes: number;
  intensity: IntensityZone;
  targetRpe: number;
  notes?: string;
}

export interface StrengthPrescription {
  day: TrainingDay;
  exercises: StrengthExerciseBlock[];
}

export interface StrengthExerciseBlock {
  name: string;
  sets: string;
  tempo: string;
  rest: string;
  targetRpe: string;
}

export interface WeeklyPlan {
  start: string;
  runs: RunPrescription[];
  strength: StrengthPrescription[];
}
