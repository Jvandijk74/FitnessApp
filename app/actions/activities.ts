'use server';

import { getServerSupabase } from '@/lib/db/server-client';

export async function getActivities(userId: string) {
  try {
    console.log('[Activities] Fetching activities for user:', userId);
    const supabase = await getServerSupabase();

    // Fetch runs
    const { data: runs, error: runsError } = await supabase
      .from('run_logged')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (runsError) {
      console.error('[Activities] Error fetching runs:', runsError);
      throw runsError;
    }

    // Fetch strength exercises (legacy format)
    const { data: strengthExercises, error: strengthError } = await supabase
      .from('strength_exercises')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (strengthError) {
      console.error('[Activities] Error fetching strength exercises:', strengthError);
      throw strengthError;
    }

    // Fetch completed scheduled workouts
    const { data: scheduledWorkouts, error: scheduledError } = await supabase
      .from('scheduled_workouts')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', true)
      .order('completed_at', { ascending: false });

    if (scheduledError) {
      console.error('[Activities] Error fetching scheduled workouts:', scheduledError);
    }

    console.log('[Activities] Found', scheduledWorkouts?.length || 0, 'completed scheduled workouts');

    // Fetch exercises for completed strength workouts
    const scheduledWorkoutsWithExercises = await Promise.all(
      (scheduledWorkouts || []).map(async (workout) => {
        if (workout.workout_type === 'strength') {
          const { data: exercises } = await supabase
            .from('scheduled_workout_exercises')
            .select('*')
            .eq('scheduled_workout_id', workout.id)
            .order('order_index');

          // Calculate total volume
          let totalVolume = 0;
          let totalSets = 0;
          if (exercises) {
            exercises.forEach((ex: any) => {
              if (ex.logged_sets) {
                ex.logged_sets.forEach((set: any) => {
                  totalVolume += (set.weight || 0) * (set.reps || 0);
                  totalSets++;
                });
              }
            });
          }

          return { ...workout, exercises, totalVolume, totalSets };
        }
        return workout;
      })
    );

    // Combine and format activities
    const activities = [
      // Runs
      ...(runs || []).map(run => ({
        id: run.id,
        type: 'run' as const,
        date: run.activity_date || run.created_at,
        distance: run.distance_km,
        duration: run.duration_minutes,
        avgHR: run.avg_hr,
        maxHR: run.max_hr,
        rpe: run.rpe,
        source: run.source || 'manual',
        stravaActivityId: run.strava_activity_id,
        day: run.day
      })),
      // Legacy strength exercises
      ...(strengthExercises || []).map(exercise => ({
        id: exercise.id,
        type: 'strength' as const,
        date: exercise.activity_date || exercise.created_at,
        exercise: exercise.name,
        sets: exercise.sets,
        day: exercise.day,
        source: 'manual'
      })),
      // Completed scheduled workouts
      ...scheduledWorkoutsWithExercises.map(workout => ({
        id: workout.id,
        type: workout.workout_type as 'run' | 'strength',
        date: workout.completed_at || workout.workout_date,
        name: workout.name,
        // For runs
        ...(workout.workout_type === 'run' ? {
          duration: workout.run_duration_minutes,
          distance: workout.run_distance_km,
          intensity: workout.run_intensity,
          targetRpe: workout.run_target_rpe
        } : {}),
        // For strength
        ...(workout.workout_type === 'strength' ? {
          exercises: workout.exercises,
          totalVolume: workout.totalVolume,
          totalSets: workout.totalSets,
          exerciseCount: workout.exercises?.length || 0
        } : {}),
        source: 'scheduled',
        scheduledWorkoutId: workout.id,
        aiFeedback: workout.ai_feedback
      }))
    ];

    // Sort by date descending
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    console.log('[Activities] Fetched', activities.length, 'total activities');
    console.log('[Activities] Breakdown:', {
      runs: runs?.length || 0,
      legacyStrength: strengthExercises?.length || 0,
      scheduledWorkouts: scheduledWorkoutsWithExercises.length
    });

    return activities;
  } catch (error) {
    console.error('[Activities] Exception in getActivities:', error);
    console.error('[Activities] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    // Return empty array instead of throwing to prevent page crashes
    return [];
  }
}
