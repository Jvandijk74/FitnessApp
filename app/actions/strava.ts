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
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from('strava_connections')
    .select('access_token, refresh_token, athlete_id')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    accessToken: data.access_token,
    athleteId: data.athlete_id,
    isConnected: true
  };
}

export async function syncStravaActivities(userId: string) {
  const connection = await getStravaConnection(userId);

  if (!connection) {
    throw new Error('Strava not connected');
  }

  const supabase = await getServerSupabase();
  const runs = await fetchRecentRuns(connection.accessToken);

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

  if (runLogs.length > 0) {
    await supabase.from('run_logged').insert(runLogs).throwOnError();
  }

  revalidatePath('/dashboard');

  return { count: runs.length };
}
