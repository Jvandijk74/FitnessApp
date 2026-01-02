import { getServerSupabase } from '@/lib/db/server-client';

const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize';
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';

export function buildAuthRedirectUrl(origin: string) {
  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID || '',
    redirect_uri: `${origin}/api/strava/callback`,
    response_type: 'code',
    scope: 'read,activity:read',
    approval_prompt: 'auto'
  });
  return `${STRAVA_AUTH_URL}?${params.toString()}`;
}

export async function handleTokenExchange(code: string, redirectUri: string) {
  // Log environment variables (masked)
  console.log('[Strava OAuth] Starting token exchange...');
  console.log('[Strava OAuth] Client ID:', process.env.STRAVA_CLIENT_ID ? `${process.env.STRAVA_CLIENT_ID.slice(0, 4)}...` : 'MISSING');
  console.log('[Strava OAuth] Client Secret:', process.env.STRAVA_CLIENT_SECRET ? 'Present (masked)' : 'MISSING');
  console.log('[Strava OAuth] Code:', code ? `${code.slice(0, 10)}...` : 'MISSING');
  console.log('[Strava OAuth] Redirect URI:', redirectUri);

  // Validate required parameters
  if (!process.env.STRAVA_CLIENT_ID) {
    throw new Error('STRAVA_CLIENT_ID is not configured');
  }
  if (!process.env.STRAVA_CLIENT_SECRET) {
    throw new Error('STRAVA_CLIENT_SECRET is not configured');
  }
  if (!code) {
    throw new Error('Authorization code is missing');
  }

  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID,
    client_secret: process.env.STRAVA_CLIENT_SECRET,
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri
  });

  console.log('[Strava OAuth] Request params:', {
    client_id: process.env.STRAVA_CLIENT_ID,
    code: `${code.slice(0, 10)}...`,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
    client_secret: '[MASKED]'
  });

  try {
    const res = await fetch(STRAVA_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    console.log('[Strava OAuth] Response status:', res.status);
    console.log('[Strava OAuth] Response headers:', Object.fromEntries(res.headers.entries()));

    if (!res.ok) {
      let errorData;
      const contentType = res.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        errorData = await res.json();
      } else {
        errorData = await res.text();
      }

      console.error('[Strava OAuth] Error response:', errorData);
      console.error('[Strava OAuth] Full error details:', {
        status: res.status,
        statusText: res.statusText,
        contentType,
        data: errorData
      });

      // Provide helpful error messages based on status code
      let userMessage = 'Failed to connect to Strava';
      if (res.status === 400) {
        userMessage = 'Invalid request to Strava. Please check your configuration.';
      } else if (res.status === 401) {
        userMessage = 'Strava authorization failed. Please check your Client ID and Secret.';
      } else if (res.status === 403) {
        userMessage = 'Access denied by Strava. Please verify your app settings.';
      }

      throw new Error(`${userMessage} (Status: ${res.status}) - ${JSON.stringify(errorData)}`);
    }

    const data = await res.json();
    console.log('[Strava OAuth] Token exchange successful!');
    console.log('[Strava OAuth] Athlete ID:', data.athlete?.id);

    return {
      access_token: data.access_token as string,
      refresh_token: data.refresh_token as string,
      athlete: data.athlete
    };
  } catch (error) {
    console.error('[Strava OAuth] Exception during token exchange:', error);
    throw error;
  }
}

export async function saveConnection(userId: string, tokens: { access_token: string; refresh_token: string }) {
  const supabase = await getServerSupabase();
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
