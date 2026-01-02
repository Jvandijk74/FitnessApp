'use server';

import { getServerSupabase } from '@/lib/db/server-client';
import { generateWeeklyPlan } from '@/lib/coach/engine';
import { AthleteProfile } from '@/lib/coach/types';
import { TrainingDay } from '@/lib/db/types';

export async function createPlan(userId: string) {
  const supabase = await getServerSupabase();
  const profile: AthleteProfile = {
    id: userId,
    thresholdPace: 5.0,
    thresholdHr: 170,
    readinessScore: 0.6,
    recentRpeAverage: 6.5
  };
  const plan = generateWeeklyPlan(profile, {
    averageRunMinutes: 40,
    longRunMinutes: 70,
    highRpeCount: 0
  });

  await supabase
    .from('plans')
    .upsert({
      user_id: userId,
      week_start: plan.start,
      structure: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      prescriptions: plan
    })
    .throwOnError();

  return plan;
}

export async function logRun(payload: {
  user_id: string;
  plan_id?: string;
  day: TrainingDay;
  distance_km: number;
  duration_minutes: number;
  avg_hr?: number;
  max_hr?: number;
  rpe?: number;
}) {
  const supabase = await getServerSupabase();
  await supabase.from('run_logged').insert({ ...payload, source: 'manual' }).throwOnError();
}

export async function logStrength(payload: {
  user_id: string;
  day: TrainingDay;
  exercise: string;
  sets: { weight: number; reps: number; rpe?: number; rir?: number }[];
}) {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from('strength_exercises')
    .insert({
      user_id: payload.user_id,
      day: payload.day,
      name: payload.exercise,
      sets: `${payload.sets.length} sets`,
      tempo: 'Tempo 3-1-1',
      rest: 'Rest 120s',
      target_rpe: 'Logged'
    })
    .select('id')
    .single();

  if (error) throw error;

  const exerciseId = data.id;
  const rows = payload.sets.map((set) => ({
    exercise_id: exerciseId,
    weight: set.weight,
    reps: set.reps,
    rpe: set.rpe,
    rir: set.rir
  }));
  await supabase.from('strength_sets_logged').insert(rows).throwOnError();
}
