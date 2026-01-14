'use server';

import { getServerSupabase } from '@/lib/db/server-client';
import { fetchRecentRuns, fetchActivityDetail, fetchActivityStreams, refreshAccessToken } from '@/lib/strava/oauth';
import { revalidatePath } from 'next/cache';

interface StravaRun {
  id: number;
  distance_km: number;
  duration_minutes: number;
  avg_hr?: number;
  max_hr?: number;
  start_date: string;
}

/**
 * Match a logged run to a scheduled workout based on date and workout characteristics
 * Returns the scheduled_workout_id if a good match is found, otherwise null
 */
async function matchRunToScheduledWorkout(
  userId: string,
  activityDate: string,
  distanceKm: number,
  durationMinutes: number,
  supabase: any
): Promise<string | null> {
  try {
    // Convert activity date to just the date part (YYYY-MM-DD)
    const runDate = new Date(activityDate).toISOString().split('T')[0];

    // Find all scheduled run workouts for this date
    const { data: scheduledWorkouts, error } = await supabase
      .from('scheduled_workouts')
      .select('id, run_distance_km, run_duration_minutes, name')
      .eq('user_id', userId)
      .eq('workout_date', runDate)
      .eq('workout_type', 'run')
      .eq('completed', false); // Only match to uncompleted workouts

    if (error || !scheduledWorkouts || scheduledWorkouts.length === 0) {
      return null;
    }

    // Find the best matching workout based on distance/duration similarity
    let bestMatch: { id: string; score: number } | null = null;

    for (const workout of scheduledWorkouts) {
      let score = 0;
      let totalWeight = 0;

      // Compare distance if planned workout has distance
      if (workout.run_distance_km) {
        const distanceDiff = Math.abs(distanceKm - Number(workout.run_distance_km));
        const distanceTolerance = Number(workout.run_distance_km) * 0.2; // 20% tolerance

        if (distanceDiff <= distanceTolerance) {
          // Score based on how close it is (closer = higher score)
          const distanceScore = 100 * (1 - distanceDiff / distanceTolerance);
          score += distanceScore * 2; // Weight distance more heavily
          totalWeight += 2;
        }
      }

      // Compare duration if planned workout has duration
      if (workout.run_duration_minutes) {
        const durationDiff = Math.abs(durationMinutes - Number(workout.run_duration_minutes));
        const durationTolerance = Number(workout.run_duration_minutes) * 0.25; // 25% tolerance

        if (durationDiff <= durationTolerance) {
          const durationScore = 100 * (1 - durationDiff / durationTolerance);
          score += durationScore;
          totalWeight += 1;
        }
      }

      // If no planned distance/duration, give a base score (any run matches)
      if (!workout.run_distance_km && !workout.run_duration_minutes) {
        score = 50;
        totalWeight = 1;
      }

      // Calculate weighted average score
      const finalScore = totalWeight > 0 ? score / totalWeight : 0;

      // Update best match if this is better and score is above threshold
      if (finalScore >= 50 && (!bestMatch || finalScore > bestMatch.score)) {
        bestMatch = { id: workout.id, score: finalScore };
      }
    }

    if (bestMatch) {
      console.log(`[Strava Matching] Matched run (${distanceKm}km, ${durationMinutes}min) to scheduled workout ${bestMatch.id} with score ${bestMatch.score.toFixed(1)}`);
      return bestMatch.id;
    }

    return null;
  } catch (error) {
    console.error('[Strava Matching] Error matching run to scheduled workout:', error);
    return null;
  }
}

export async function getStravaConnection(userId: string) {
  try {
    console.log('[Strava Actions] Getting Strava connection for user:', userId);
    const supabase = await getServerSupabase();
    const { data, error } = await supabase
      .from('strava_connections')
      .select('access_token, refresh_token, athlete_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.log('[Strava Actions] Query error:', error.message);
      return null;
    }

    if (!data) {
      console.log('[Strava Actions] No Strava connection found for user');
      return null;
    }

    console.log('[Strava Actions] Connection found for athlete:', data.athlete_id);
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      athleteId: data.athlete_id,
      isConnected: true
    };
  } catch (error) {
    console.error('[Strava Actions] Exception in getStravaConnection:', error);
    console.error('[Strava Actions] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return null;
  }
}

export async function syncStravaActivities(userId: string) {
  try {
    console.log('[Strava Actions] Starting sync for user:', userId);

    const connection = await getStravaConnection(userId);

    if (!connection) {
      console.error('[Strava Actions] Sync failed - no connection found');
      throw new Error('Strava not connected');
    }

    console.log('[Strava Actions] Connection verified, fetching activities...');
    const supabase = await getServerSupabase();

    let runs;
    let accessToken = connection.accessToken;

    try {
      runs = await fetchRecentRuns(accessToken);
      console.log('[Strava Actions] Fetched', runs.length, 'activities from Strava');
    } catch (error) {
      // If token expired, try refreshing it
      if (error instanceof Error && error.message.includes('token expired')) {
        console.log('[Strava Actions] Access token expired, refreshing...');

        try {
          const newTokens = await refreshAccessToken(connection.refreshToken);

          // Update tokens in database
          const { error: updateError } = await supabase
            .from('strava_connections')
            .update({
              access_token: newTokens.access_token,
              refresh_token: newTokens.refresh_token
            })
            .eq('user_id', userId);

          if (updateError) {
            console.error('[Strava Actions] Failed to update tokens:', updateError);
            throw new Error('Failed to update refreshed tokens');
          }

          console.log('[Strava Actions] Tokens refreshed, retrying fetch...');
          accessToken = newTokens.access_token;
          runs = await fetchRecentRuns(accessToken);
          console.log('[Strava Actions] Fetched', runs.length, 'activities after token refresh');
        } catch (refreshError) {
          console.error('[Strava Actions] Token refresh failed:', refreshError);
          throw new Error('Strava connection expired. Please reconnect your Strava account.');
        }
      } else {
        console.error('[Strava Actions] Failed to fetch runs from Strava:', error);
        throw new Error(`Failed to fetch activities from Strava: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Import runs to the database - first match to scheduled workouts, then insert
    console.log('[Strava Actions] Matching runs to scheduled workouts...');

    const runLogsWithMatching = await Promise.all(
      runs.map(async (run: StravaRun) => {
        const scheduledWorkoutId = await matchRunToScheduledWorkout(
          userId,
          run.start_date,
          run.distance_km,
          run.duration_minutes,
          supabase
        );

        return {
          user_id: userId,
          day: new Date(run.start_date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as any,
          distance_km: run.distance_km,
          duration_minutes: run.duration_minutes,
          avg_hr: run.avg_hr ? Math.round(run.avg_hr) : undefined,
          max_hr: run.max_hr ? Math.round(run.max_hr) : undefined,
          activity_date: run.start_date,
          strava_activity_id: run.id.toString(),
          source: 'strava' as const,
          scheduled_workout_id: scheduledWorkoutId
        };
      })
    );

    const runLogs = runLogsWithMatching;
    const matchedCount = runLogs.filter(log => log.scheduled_workout_id).length;
    console.log('[Strava Actions] Prepared', runLogs.length, 'run logs for import,', matchedCount, 'matched to scheduled workouts');

    if (runLogs.length > 0) {
      try {
        // Get existing Strava activity IDs to avoid duplicates
        const { data: existingRuns } = await supabase
          .from('run_logged')
          .select('strava_activity_id')
          .eq('user_id', userId)
          .not('strava_activity_id', 'is', null);

        const existingIds = new Set(existingRuns?.map(r => r.strava_activity_id) || []);

        // Filter out runs that already exist
        const newRunLogs = runLogs.filter((log: typeof runLogs[number]) => !existingIds.has(log.strava_activity_id));

        if (newRunLogs.length > 0) {
          const { error } = await supabase.from('run_logged').insert(newRunLogs);
          if (error) {
            console.error('[Strava Actions] Database insert error:', error);
            throw new Error(`Failed to save activities to database: ${error.message}`);
          }
          console.log('[Strava Actions] Successfully inserted', newRunLogs.length, 'new runs into database');
          console.log('[Strava Actions] Skipped', runLogs.length - newRunLogs.length, 'duplicate runs');

          // Mark matched scheduled workouts as completed
          const linkedWorkoutIds = newRunLogs
            .filter(log => log.scheduled_workout_id)
            .map(log => log.scheduled_workout_id);

          if (linkedWorkoutIds.length > 0) {
            const { error: updateError } = await supabase
              .from('scheduled_workouts')
              .update({ completed: true, completed_at: new Date().toISOString() })
              .in('id', linkedWorkoutIds);

            if (updateError) {
              console.error('[Strava Actions] Failed to mark workouts as completed:', updateError);
            } else {
              console.log('[Strava Actions] Marked', linkedWorkoutIds.length, 'scheduled workouts as completed');
            }
          }
        } else {
          console.log('[Strava Actions] All runs already exist in database');
        }
      } catch (error) {
        console.error('[Strava Actions] Exception during database insert:', error);
        throw error;
      }
    } else {
      console.log('[Strava Actions] No runs fetched from Strava');
    }

    revalidatePath('/dashboard');
    revalidatePath('/log');
    console.log('[Strava Actions] Sync completed successfully');

    return { count: runs.length };
  } catch (error) {
    console.error('[Strava Actions] Exception in syncStravaActivities:', error);
    console.error('[Strava Actions] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

export async function getActivityDetails(userId: string, activityId: string) {
  try {
    console.log('[Strava Actions] Fetching activity details for:', activityId);

    const connection = await getStravaConnection(userId);
    if (!connection) {
      throw new Error('Strava not connected');
    }

    // Fetch both activity detail and streams in parallel
    const [detail, streams] = await Promise.all([
      fetchActivityDetail(connection.accessToken, activityId),
      fetchActivityStreams(connection.accessToken, activityId)
    ]);

    console.log('[Strava Actions] Activity details fetched successfully');

    return {
      detail,
      streams
    };
  } catch (error) {
    console.error('[Strava Actions] Exception in getActivityDetails:', error);
    console.error('[Strava Actions] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}
