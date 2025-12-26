import { getServerSupabase } from '@/lib/db/server-client';

const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize';
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';

function getStravaConfig() {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing Strava credentials. Set STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET in your environment.');
  }

  return { clientId, clientSecret };
}

export function buildAuthRedirectUrl(origin: string) {
  const { clientId } = getStravaConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${origin}/api/strava/callback`,
    response_type: 'code',
    scope: 'read,activity:read',
    approval_prompt: 'auto'
  });
  return `${STRAVA_AUTH_URL}?${params.toString()}`;
}

export async function handleTokenExchange(code: string) {
  const { clientId, clientSecret } = getStravaConfig();
  const res = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code'
    })
  });
  if (!res.ok) throw new Error('Failed to exchange Strava code');
  const data = await res.json();
  return {
    access_token: data.access_token as string,
    refresh_token: data.refresh_token as string,
    athlete: data.athlete
  };
}

export async function saveConnection(userId: string, tokens: { access_token: string; refresh_token: string }) {
  const supabase = getServerSupabase();
  await supabase
    .from('strava_connections')
    .upsert({
      user_id: userId,
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
