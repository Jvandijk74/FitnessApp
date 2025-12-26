import { AthleteProfile, RunPrescription, StrengthExerciseBlock, StrengthPrescription, WeeklyPlan } from './types';
import { TrainingDay } from '@/lib/db/types';

const STRUCTURE: TrainingDay[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
];

interface PriorLoad {
  averageRunMinutes: number;
  longRunMinutes: number;
  highRpeCount: number;
}

function progressiveMultiplier(readiness: number | undefined, highRpeCount: number) {
  if (readiness !== undefined && readiness < 0.4) return 0.9;
  if (highRpeCount > 2) return 0.92;
  if (readiness !== undefined && readiness > 0.75 && highRpeCount === 0) return 1.06;
  return 1.02;
}

function baseDurations(profile: AthleteProfile, prior?: PriorLoad) {
  const multiplier = progressiveMultiplier(profile.readinessScore, prior?.highRpeCount ?? 0);
  const avg = prior?.averageRunMinutes ?? 40;
  const longBase = prior?.longRunMinutes ?? 70;
  return {
    easy: Math.round(avg * multiplier),
    tempo: Math.round((avg + 10) * multiplier),
    long: Math.round(longBase * multiplier + 10)
  };
}

function fixedStrength(day: TrainingDay): StrengthExerciseBlock[] {
  return [
    {
      name: 'Back Squat',
      sets: day === 'friday' ? '3×6' : '4×6–8',
      tempo: 'Tempo 3-1-1',
      rest: 'Rest 120s',
      targetRpe: day === 'friday' ? 'RPE 6 cap (double day)' : 'RPE 7'
    },
    {
      name: 'Bench Press',
      sets: '3×8–10',
      tempo: 'Tempo 2-1-1',
      rest: 'Rest 90s',
      targetRpe: 'RPE 7'
    },
    {
      name: 'Romanian Deadlift',
      sets: '3×8–10',
      tempo: 'Tempo 3-1-1',
      rest: 'Rest 120s',
      targetRpe: day === 'friday' ? 'RPE 6 (fatigue-managed)' : 'RPE 7'
    }
  ];
}

function runPrescriptionForDay(
  day: TrainingDay,
  base: ReturnType<typeof baseDurations>,
  profile: AthleteProfile
): RunPrescription | null {
  switch (day) {
    case 'monday':
    case 'friday':
      return {
        day,
        durationMinutes: Math.max(30, base.easy),
        intensity: 'easy',
        targetRpe: 6,
        notes: 'Easy aerobic, nose-breathing pace. No swapping days allowed.'
      };
    case 'wednesday':
      return {
        day,
        durationMinutes: Math.max(35, base.tempo),
        intensity: 'tempo',
        targetRpe: 7,
        notes: `Tempo around threshold pace (${profile.thresholdPace.toFixed(2)} min/km).`
      };
    case 'sunday':
      return {
        day,
        durationMinutes: Math.max(60, base.long),
        intensity: 'long',
        targetRpe: 7,
        notes: 'Long run—steady, slight negative split allowed.'
      };
    default:
      return null;
  }
}

export function generateWeeklyPlan(profile: AthleteProfile, priorLoad?: PriorLoad): WeeklyPlan {
  const base = baseDurations(profile, priorLoad);

  const runs: RunPrescription[] = [];
  const strength: StrengthPrescription[] = [];

  STRUCTURE.forEach((day) => {
    const run = runPrescriptionForDay(day, base, profile);
    if (run) runs.push(run);

    if (['tuesday', 'thursday', 'friday'].includes(day)) {
      strength.push({ day, exercises: fixedStrength(day) });
    }
  });

  return {
    start: new Date().toISOString().slice(0, 10),
    runs,
    strength
  };
}

export function adjustNextWeek(profile: AthleteProfile, recentRpe: number[], prior: PriorLoad): WeeklyPlan {
  const highRpeCount = recentRpe.filter((rpe) => rpe >= 8).length;
  const adjustedPrior = { ...prior, highRpeCount };
  return generateWeeklyPlan({ ...profile, readinessScore: profile.readinessScore ?? 0.6 }, adjustedPrior);
}
