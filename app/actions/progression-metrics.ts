'use server';

import { getServerSupabase } from '@/lib/db/server-client';

export interface ProgressionMetrics {
  // Volume progression
  weeklyVolume: { week: string; volume: number }[];
  volumeChange: number; // % change from last period

  // Strength progression (key exercises)
  strengthProgression: {
    exercise: string;
    currentWeight: number;
    previousWeight: number;
    change: number;
    changePercent: number;
  }[];

  // Training frequency
  trainingFrequency: {
    totalWorkouts: number;
    strengthWorkouts: number;
    runWorkouts: number;
    avgPerWeek: number;
  };

  // Training stress balance
  trainingStress: {
    runningStress: number; // TRIMP score for runs
    strengthStress: number; // Volume load for strength
    totalStress: number;
    balance: 'balanced' | 'run-heavy' | 'strength-heavy';
    acuteChronicRatio: number; // Injury risk indicator
    recommendation: string;
  };
}

/**
 * Calculate comprehensive progression metrics
 */
export async function getProgressionMetrics(
  userId: string,
  weeksBack: number = 12
): Promise<ProgressionMetrics> {
  try {
    console.log('[Progression Metrics] Calculating metrics for user:', userId);
    const supabase = await getServerSupabase();

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (weeksBack * 7));

    // Fetch completed scheduled workouts
    const { data: workouts } = await supabase
      .from('scheduled_workouts')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', true)
      .gte('completed_at', startDate.toISOString())
      .order('completed_at', { ascending: true });

    // Fetch exercises for strength workouts
    const strengthWorkoutIds = (workouts || [])
      .filter(w => w.workout_type === 'strength')
      .map(w => w.id);

    let exercises: any[] = [];
    if (strengthWorkoutIds.length > 0) {
      const { data: exercisesData } = await supabase
        .from('scheduled_workout_exercises')
        .select('*')
        .in('scheduled_workout_id', strengthWorkoutIds);
      exercises = exercisesData || [];
    }

    // Calculate weekly volume progression
    const weeklyVolume = calculateWeeklyVolume(workouts || [], exercises);

    // Calculate volume change (last 4 weeks vs previous 4 weeks)
    const volumeChange = calculateVolumeChange(weeklyVolume);

    // Calculate strength progression on key exercises
    const strengthProgression = calculateStrengthProgression(exercises);

    // Calculate training frequency
    const trainingFrequency = calculateTrainingFrequency(workouts || [], weeksBack);

    // Calculate training stress and balance
    const trainingStress = await calculateTrainingStress(userId, workouts || [], exercises);

    return {
      weeklyVolume,
      volumeChange,
      strengthProgression,
      trainingFrequency,
      trainingStress
    };
  } catch (error) {
    console.error('[Progression Metrics] Error:', error);
    throw error;
  }
}

/**
 * Calculate weekly volume (kg lifted per week)
 */
function calculateWeeklyVolume(workouts: any[], exercises: any[]): { week: string; volume: number }[] {
  const volumeByWeek: Record<string, number> = {};

  workouts.forEach(workout => {
    if (workout.workout_type === 'strength' && workout.completed_at) {
      // Get week string (e.g., "2026-W02")
      const date = new Date(workout.completed_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay() + 1); // Monday
      const weekStr = weekStart.toISOString().split('T')[0];

      // Calculate volume for this workout
      const workoutExercises = exercises.filter(ex => ex.scheduled_workout_id === workout.id);
      let workoutVolume = 0;

      workoutExercises.forEach(ex => {
        if (ex.logged_sets) {
          ex.logged_sets.forEach((set: any) => {
            workoutVolume += (set.weight || 0) * (set.reps || 0);
          });
        }
      });

      volumeByWeek[weekStr] = (volumeByWeek[weekStr] || 0) + workoutVolume;
    }
  });

  // Convert to array and sort by date
  return Object.entries(volumeByWeek)
    .map(([week, volume]) => ({ week, volume }))
    .sort((a, b) => a.week.localeCompare(b.week));
}

/**
 * Calculate volume change (recent vs previous period)
 */
function calculateVolumeChange(weeklyVolume: { week: string; volume: number }[]): number {
  if (weeklyVolume.length < 8) return 0;

  // Last 4 weeks
  const recent = weeklyVolume.slice(-4);
  const recentAvg = recent.reduce((sum, w) => sum + w.volume, 0) / 4;

  // Previous 4 weeks
  const previous = weeklyVolume.slice(-8, -4);
  const previousAvg = previous.reduce((sum, w) => sum + w.volume, 0) / 4;

  if (previousAvg === 0) return 0;
  return ((recentAvg - previousAvg) / previousAvg) * 100;
}

/**
 * Calculate strength progression on key exercises
 */
function calculateStrengthProgression(exercises: any[]): {
  exercise: string;
  currentWeight: number;
  previousWeight: number;
  change: number;
  changePercent: number;
}[] {
  // Group exercises by name
  const exercisesByName: Record<string, any[]> = {};
  exercises.forEach(ex => {
    const name = ex.exercise_name.toLowerCase();
    if (!exercisesByName[name]) exercisesByName[name] = [];
    exercisesByName[name].push(ex);
  });

  // Calculate progression for each exercise
  const progression: any[] = [];

  Object.entries(exercisesByName).forEach(([name, exs]) => {
    if (exs.length < 2) return; // Need at least 2 workouts

    // Sort by date
    exs.sort((a, b) => {
      const dateA = new Date(a.created_at || '');
      const dateB = new Date(b.created_at || '');
      return dateA.getTime() - dateB.getTime();
    });

    // Get max weight from most recent workout
    const recent = exs[exs.length - 1];
    const recentMaxWeight = getMaxWeight(recent);

    // Get max weight from workout 4-6 weeks ago
    const previousIndex = Math.max(0, exs.length - 5);
    const previous = exs[previousIndex];
    const previousMaxWeight = getMaxWeight(previous);

    if (recentMaxWeight > 0 && previousMaxWeight > 0) {
      const change = recentMaxWeight - previousMaxWeight;
      const changePercent = (change / previousMaxWeight) * 100;

      progression.push({
        exercise: formatExerciseName(name),
        currentWeight: recentMaxWeight,
        previousWeight: previousMaxWeight,
        change,
        changePercent
      });
    }
  });

  // Sort by absolute change (biggest improvements first)
  return progression
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 5); // Top 5
}

function getMaxWeight(exercise: any): number {
  if (!exercise.logged_sets || exercise.logged_sets.length === 0) return 0;
  return Math.max(...exercise.logged_sets.map((s: any) => s.weight || 0));
}

function formatExerciseName(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Calculate training frequency
 */
function calculateTrainingFrequency(workouts: any[], weeksBack: number): {
  totalWorkouts: number;
  strengthWorkouts: number;
  runWorkouts: number;
  avgPerWeek: number;
} {
  const total = workouts.length;
  const strength = workouts.filter(w => w.workout_type === 'strength').length;
  const run = workouts.filter(w => w.workout_type === 'run').length;

  return {
    totalWorkouts: total,
    strengthWorkouts: strength,
    runWorkouts: run,
    avgPerWeek: total / weeksBack
  };
}

/**
 * Calculate training stress and balance
 */
async function calculateTrainingStress(userId: string, workouts: any[], exercises: any[]): Promise<{
  runningStress: number;
  strengthStress: number;
  totalStress: number;
  balance: 'balanced' | 'run-heavy' | 'strength-heavy';
  acuteChronicRatio: number;
  recommendation: string;
}> {
  const supabase = await getServerSupabase();

  // Calculate running stress (simplified TRIMP)
  let runningStress = 0;
  const runWorkouts = workouts.filter(w => w.workout_type === 'run');

  runWorkouts.forEach(run => {
    // Simple stress score: duration * relative intensity
    const duration = run.run_duration_minutes || 30;
    const rpe = run.run_target_rpe || 6;
    const relativeIntensity = rpe / 10;
    runningStress += duration * relativeIntensity * 1.5; // Scaling factor
  });

  // Calculate strength stress (volume load)
  let strengthStress = 0;
  const strengthWorkouts = workouts.filter(w => w.workout_type === 'strength');

  strengthWorkouts.forEach(workout => {
    const workoutExercises = exercises.filter(ex => ex.scheduled_workout_id === workout.id);
    workoutExercises.forEach(ex => {
      if (ex.logged_sets) {
        ex.logged_sets.forEach((set: any) => {
          strengthStress += (set.weight || 0) * (set.reps || 0) * 0.01; // Scale down
        });
      }
    });
  });

  const totalStress = runningStress + strengthStress;

  // Determine balance
  let balance: 'balanced' | 'run-heavy' | 'strength-heavy' = 'balanced';
  if (runningStress > strengthStress * 1.5) balance = 'run-heavy';
  if (strengthStress > runningStress * 1.5) balance = 'strength-heavy';

  // Calculate Acute:Chronic Workload Ratio
  // Acute = last 7 days, Chronic = last 28 days
  const acuteChronicRatio = calculateAcuteChronicRatio(workouts, exercises);

  // Generate recommendation
  let recommendation = '';
  if (acuteChronicRatio > 1.5) {
    recommendation = '⚠️ High injury risk: Reduce training volume or intensity. Consider adding recovery days.';
  } else if (acuteChronicRatio < 0.8) {
    recommendation = '📈 Low training load: You can safely increase training volume for better adaptations.';
  } else if (balance === 'run-heavy') {
    recommendation = '🏃 Running-focused: Consider adding more strength training for balanced development and injury prevention.';
  } else if (balance === 'strength-heavy') {
    recommendation = '💪 Strength-focused: Consider adding more cardiovascular work for overall fitness and recovery.';
  } else {
    recommendation = '✅ Well-balanced training: Good mix of running and strength. Keep it up!';
  }

  return {
    runningStress,
    strengthStress,
    totalStress,
    balance,
    acuteChronicRatio,
    recommendation
  };
}

/**
 * Calculate Acute:Chronic Workload Ratio
 */
function calculateAcuteChronicRatio(workouts: any[], exercises: any[]): number {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twentyEightDaysAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

  // Calculate acute load (last 7 days)
  const acuteWorkouts = workouts.filter(w => {
    const date = new Date(w.completed_at || w.workout_date);
    return date >= sevenDaysAgo;
  });
  const acuteLoad = calculateTotalLoad(acuteWorkouts, exercises);

  // Calculate chronic load (last 28 days)
  const chronicWorkouts = workouts.filter(w => {
    const date = new Date(w.completed_at || w.workout_date);
    return date >= twentyEightDaysAgo;
  });
  const chronicLoad = calculateTotalLoad(chronicWorkouts, exercises) / 4; // Average per week

  if (chronicLoad === 0) return 1;
  return acuteLoad / chronicLoad;
}

function calculateTotalLoad(workouts: any[], exercises: any[]): number {
  let load = 0;

  workouts.forEach(workout => {
    if (workout.workout_type === 'run') {
      const duration = workout.run_duration_minutes || 30;
      const rpe = workout.run_target_rpe || 6;
      load += duration * (rpe / 10);
    } else if (workout.workout_type === 'strength') {
      const workoutExercises = exercises.filter(ex => ex.scheduled_workout_id === workout.id);
      workoutExercises.forEach(ex => {
        if (ex.logged_sets) {
          ex.logged_sets.forEach((set: any) => {
            load += (set.weight || 0) * (set.reps || 0) * 0.01;
          });
        }
      });
    }
  });

  return load;
}
