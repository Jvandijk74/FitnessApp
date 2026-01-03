'use server';

import { getServerSupabase } from '@/lib/db/server-client';

// Calculate weekly volume by muscle group
export async function getWeeklyVolume(userId: string, week: number, year: number) {
  const supabase = await getServerSupabase();

  // Calculate week start and end dates
  const jan4 = new Date(year, 0, 4);
  const daysToAdd = (week - 1) * 7 - jan4.getDay() + 1;
  const weekStart = new Date(year, 0, 4 + daysToAdd);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  // Get strength exercises for the week
  const { data: exercises, error } = await supabase
    .from('strength_exercises')
    .select(`
      id,
      name,
      day,
      created_at,
      strength_sets_logged (
        weight,
        reps
      )
    `)
    .eq('user_id', userId)
    .gte('created_at', weekStart.toISOString())
    .lt('created_at', weekEnd.toISOString());

  if (error) {
    console.error('[Volume] Error fetching exercises:', error);
    return [];
  }

  if (!exercises || exercises.length === 0) {
    return [];
  }

  // Group by muscle group based on exercise names
  const muscleGroupMap: Record<string, { exercises: string[]; patterns: RegExp[] }> = {
    'Legs': {
      exercises: [],
      patterns: [/squat|deadlift|lunge|leg press|leg curl|hip thrust/i]
    },
    'Chest': {
      exercises: [],
      patterns: [/press|fly|chest/i]
    },
    'Back': {
      exercises: [],
      patterns: [/row|pull|lat/i]
    },
    'Shoulders': {
      exercises: [],
      patterns: [/shoulder|lateral|overhead/i]
    },
    'Arms': {
      exercises: [],
      patterns: [/curl|tricep|pushdown/i]
    },
    'Core': {
      exercises: [],
      patterns: [/crunch|plank|woodchop|ab/i]
    }
  };

  const volumeData: Record<string, { volume: number; sets: number }> = {};

  exercises.forEach((exercise: any) => {
    let muscleGroup = 'Other';

    // Determine muscle group
    for (const [group, config] of Object.entries(muscleGroupMap)) {
      if (config.patterns.some(pattern => pattern.test(exercise.name))) {
        muscleGroup = group;
        break;
      }
    }

    if (!volumeData[muscleGroup]) {
      volumeData[muscleGroup] = { volume: 0, sets: 0 };
    }

    // Calculate volume for this exercise
    if (exercise.strength_sets_logged) {
      exercise.strength_sets_logged.forEach((set: any) => {
        volumeData[muscleGroup].volume += set.weight * set.reps;
        volumeData[muscleGroup].sets += 1;
      });
    }
  });

  // Convert to array format with colors
  const colors: Record<string, string> = {
    'Legs': '#0ea5e9',
    'Chest': '#f97316',
    'Back': '#10b981',
    'Shoulders': '#8b5cf6',
    'Arms': '#ec4899',
    'Core': '#f59e0b'
  };

  return Object.entries(volumeData).map(([muscleGroup, data]) => ({
    muscleGroup,
    volume: Math.round(data.volume),
    sets: data.sets,
    color: colors[muscleGroup] || '#6b7280'
  }));
}

// Calculate progressive overload factors
export async function calculateProgressiveOverload(userId: string, currentWeek: number, currentYear: number) {
  const supabase = await getServerSupabase();

  // Get current week volume
  const currentVolume = await getWeeklyVolume(userId, currentWeek, currentYear);
  const currentTotalVolume = currentVolume.reduce((sum, m) => sum + m.volume, 0);

  // Get previous week volume
  let prevWeek = currentWeek - 1;
  let prevYear = currentYear;
  if (prevWeek === 0) {
    prevWeek = 52;
    prevYear = currentYear - 1;
  }

  const previousVolume = await getWeeklyVolume(userId, prevWeek, prevYear);
  const previousTotalVolume = previousVolume.reduce((sum, m) => sum + m.volume, 0);

  // Calculate volume increase percentage
  const volumeIncrease = previousTotalVolume > 0
    ? ((currentTotalVolume - previousTotalVolume) / previousTotalVolume) * 100
    : 0;

  // Get current week dates
  const jan4 = new Date(currentYear, 0, 4);
  const daysToAdd = (currentWeek - 1) * 7 - jan4.getDay() + 1;
  const weekStart = new Date(currentYear, 0, 4 + daysToAdd);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  // Calculate intensity (average RPE)
  const { data: currentSets } = await supabase
    .from('strength_sets_logged')
    .select('rpe')
    .gte('created_at', weekStart.toISOString())
    .lt('created_at', weekEnd.toISOString())
    .not('rpe', 'is', null);

  const currentAvgRPE = currentSets && currentSets.length > 0
    ? currentSets.reduce((sum: number, set: any) => sum + (set.rpe || 0), 0) / currentSets.length
    : 7;

  // Get previous week dates
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);
  const prevWeekEnd = new Date(prevWeekStart);
  prevWeekEnd.setDate(prevWeekStart.getDate() + 7);

  const { data: prevSets } = await supabase
    .from('strength_sets_logged')
    .select('rpe')
    .gte('created_at', prevWeekStart.toISOString())
    .lt('created_at', prevWeekEnd.toISOString())
    .not('rpe', 'is', null);

  const prevAvgRPE = prevSets && prevSets.length > 0
    ? prevSets.reduce((sum: number, set: any) => sum + (set.rpe || 0), 0) / prevSets.length
    : 7;

  const intensityIncrease = ((currentAvgRPE - prevAvgRPE) / prevAvgRPE) * 100;

  // Calculate frequency consistency (last 4 weeks)
  let weeksWithWorkouts = 0;
  for (let i = 0; i < 4; i++) {
    let checkWeek = currentWeek - i;
    let checkYear = currentYear;
    if (checkWeek <= 0) {
      checkWeek = 52 + checkWeek;
      checkYear = currentYear - 1;
    }

    const volume = await getWeeklyVolume(userId, checkWeek, checkYear);
    if (volume.reduce((sum, m) => sum + m.volume, 0) > 0) {
      weeksWithWorkouts++;
    }
  }

  const frequencyConsistency = (weeksWithWorkouts / 4) * 100;

  // Placeholder for recovery quality (would need sleep/HRV data)
  const recoveryQuality = 70;

  return {
    volumeIncrease: Math.round(volumeIncrease * 10) / 10,
    intensityIncrease: Math.round(intensityIncrease * 10) / 10,
    frequencyConsistency: Math.round(frequencyConsistency),
    recoveryQuality
  };
}

// Get current week number
export async function getCurrentWeek(): Promise<{ week: number; year: number }> {
  const now = new Date();
  const onejan = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil((((now.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
  return { week, year: now.getFullYear() };
}
