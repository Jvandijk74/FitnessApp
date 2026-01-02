import { getServerSupabase } from '@/lib/db/server-client';

const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize';
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';

export function buildAuthRedirectUrl(origin: string, state: string) {
  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID || '',
    redirect_uri: `${origin}/api/strava/callback`,
    response_type: 'code',
    scope: 'read,activity:read',
    approval_prompt: 'auto',
    state
  });
  return `${STRAVA_AUTH_URL}?${params.toString()}`;
}

export async function handleTokenExchange(code: string) {
  const res = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code'
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to exchange Strava code: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  return {
    access_token: data.access_token as string,
    refresh_token: data.refresh_token as string,
    expires_at: data.expires_at as number,
    athlete: data.athlete as { id: number }
  };
}

export async function saveConnection(
  userId: string,
  tokens: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    athlete: { id: number };
  }
) {
  const supabase = getServerSupabase();

  // Convert Unix timestamp to ISO timestamp for PostgreSQL
  const expiresAt = new Date(tokens.expires_at * 1000).toISOString();

  const { error } = await supabase
    .from('strava_connections')
    .upsert(
      {
        user_id: userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        athlete_id: tokens.athlete.id,
        expires_at: expiresAt,
        updated_at: new Date().toISOString()
      },
      {
        onConflict: 'user_id'
      }
    );

  if (error) {
    throw new Error(`Failed to save Strava connection: ${error.message}`);
  }
}

export async function fetchRecentRuns(accessToken: string) {
  const res = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=20', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  if (!res.ok) throw new Error('Failed to fetch Strava activities');
  const activities = await res.json();
  return activities
    .filter((a: any) => a.type === 'Run')
    .map((a: any) => ({
      id: a.id,
      distance_km: a.distance / 1000,
      duration_minutes: Math.round(a.moving_time / 60),
      avg_hr: a.average_heartrate,
      max_hr: a.max_heartrate,
      start_date: a.start_date
    }));
}
