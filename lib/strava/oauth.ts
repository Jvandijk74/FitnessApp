import { getServerSupabase } from '@/lib/db/server-client';

const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize';
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';

function getUserState(userId?: string | null) {
  return userId || process.env.NEXT_PUBLIC_DEMO_USER_ID || 'demo-user';
}

export function buildAuthRedirectUrl(origin: string, userId?: string | null) {
  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID || '',
    redirect_uri: `${origin}/api/strava/callback`,
    response_type: 'code',
    scope: 'read,activity:read',
    approval_prompt: 'auto',
    state: getUserState(userId)
  });
  return `${STRAVA_AUTH_URL}?${params.toString()}`;
}

export async function handleTokenExchange(code: string, redirectUri: string) {
  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID || '',
    client_secret: process.env.STRAVA_CLIENT_SECRET || '',
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri
  });

  const res = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  if (!res.ok) {
    const errorData = await res.text();
    console.error('Strava token exchange failed:', errorData);
    throw new Error(`Failed to exchange Strava code: ${res.status} - ${errorData}`);
  }

  const data = await res.json();
  return {
    access_token: data.access_token as string,
    refresh_token: data.refresh_token as string,
    athlete: data.athlete
  };
}

export async function saveConnection(userId: string, tokens: { access_token: string; refresh_token: string }) {
  const supabase = await getServerSupabase();
  await supabase
    .from('strava_connections')
    .upsert({
      user_id: getUserState(userId),
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token
    })
    .throwOnError();
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
