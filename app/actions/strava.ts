'use server';

import { getServerSupabase } from '@/lib/db/server-client';
import { fetchRecentRuns } from '@/lib/strava/oauth';
import { revalidatePath } from 'next/cache';

interface StravaRun {
  id: number;
  distance_km: number;
  duration_minutes: number;
  avg_hr?: number;
  max_hr?: number;
  start_date: string;
}

export async function getStravaConnection(userId: string) {
  try {
    console.log('[Strava Actions] Getting Strava connection for user:', userId);
    const supabase = await getServerSupabase();
    const { data, error } = await supabase
      .from('strava_connections')
      .select('access_token, refresh_token, athlete_id')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.log('[Strava Actions] No connection found or error:', error.message);
      return null;
    }

    if (!data) {
      console.log('[Strava Actions] No connection data found');
      return null;
    }

    console.log('[Strava Actions] Connection found for athlete:', data.athlete_id);
    return {
      accessToken: data.access_token,
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
    try {
      runs = await fetchRecentRuns(connection.accessToken);
      console.log('[Strava Actions] Fetched', runs.length, 'activities from Strava');
    } catch (error) {
      console.error('[Strava Actions] Failed to fetch runs from Strava:', error);
      throw new Error(`Failed to fetch activities from Strava: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Import runs to the database
    const runLogs = runs.map((run: StravaRun) => ({
      user_id: userId,
      day: new Date(run.start_date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as any,
      distance_km: run.distance_km,
      duration_minutes: run.duration_minutes,
      avg_hr: run.avg_hr,
      max_hr: run.max_hr,
      source: 'strava' as const
    }));

    console.log('[Strava Actions] Prepared', runLogs.length, 'run logs for import');

    if (runLogs.length > 0) {
      try {
        const { error } = await supabase.from('run_logged').insert(runLogs);
        if (error) {
          console.error('[Strava Actions] Database insert error:', error);
          throw new Error(`Failed to save activities to database: ${error.message}`);
        }
        console.log('[Strava Actions] Successfully inserted', runLogs.length, 'runs into database');
      } catch (error) {
        console.error('[Strava Actions] Exception during database insert:', error);
        throw error;
      }
    } else {
      console.log('[Strava Actions] No new runs to import');
    }

    revalidatePath('/dashboard');
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
