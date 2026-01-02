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

    // Fetch strength exercises
    const { data: strengthExercises, error: strengthError } = await supabase
      .from('strength_exercises')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (strengthError) {
      console.error('[Activities] Error fetching strength exercises:', strengthError);
      throw strengthError;
    }

    // Combine and format activities
    const activities = [
      ...(runs || []).map(run => ({
        id: run.id,
        type: 'run' as const,
        date: run.created_at,
        distance: run.distance_km,
        duration: run.duration_minutes,
        avgHR: run.avg_hr,
        maxHR: run.max_hr,
        rpe: run.rpe,
        source: run.source || 'manual',
        day: run.day
      })),
      ...(strengthExercises || []).map(exercise => ({
        id: exercise.id,
        type: 'strength' as const,
        date: exercise.created_at,
        exercise: exercise.name,
        sets: exercise.sets,
        day: exercise.day
      }))
    ];

    // Sort by date descending
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    console.log('[Activities] Fetched', activities.length, 'activities');
    return activities;
  } catch (error) {
    console.error('[Activities] Exception in getActivities:', error);
    console.error('[Activities] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}
