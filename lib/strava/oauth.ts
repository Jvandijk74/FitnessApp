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

export async function saveConnection(
  userId: string,
  tokens: {
    access_token: string;
    refresh_token: string;
    athlete?: { id: number };
  }
) {
  const supabase = await getServerSupabase();

  console.log('[Strava OAuth] Saving connection for user:', userId);
  console.log('[Strava OAuth] Athlete ID:', tokens.athlete?.id);

  const { error } = await supabase
    .from('strava_connections')
    .upsert({
      user_id: userId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      athlete_id: tokens.athlete?.id || null
    });

  if (error) {
    console.error('[Strava OAuth] Error saving connection:', error);
    throw error;
  }

  console.log('[Strava OAuth] Connection saved successfully!');
}

export async function refreshAccessToken(refreshToken: string) {
  console.log('[Strava OAuth] Refreshing access token...');

  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID || '',
    client_secret: process.env.STRAVA_CLIENT_SECRET || '',
    refresh_token: refreshToken,
    grant_type: 'refresh_token'
  });

  try {
    const res = await fetch(STRAVA_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error('[Strava OAuth] Token refresh failed:', res.status, errorData);
      throw new Error(`Failed to refresh Strava token: ${res.status}`);
    }

    const data = await res.json();
    console.log('[Strava OAuth] Token refreshed successfully');

    return {
      access_token: data.access_token as string,
      refresh_token: data.refresh_token as string,
      expires_at: data.expires_at as number
    };
  } catch (error) {
    console.error('[Strava OAuth] Exception refreshing token:', error);
    throw error;
  }
}

export async function fetchRecentRuns(accessToken: string) {
  console.log('[Strava OAuth] Fetching ALL runs from Strava with pagination...');

  const allActivities: any[] = [];
  let page = 1;
  const perPage = 200; // Max allowed by Strava API
  let hasMore = true;

  try {
    while (hasMore) {
      console.log(`[Strava OAuth] Fetching page ${page}...`);

      const res = await fetch(
        `https://www.strava.com/api/v3/athlete/activities?per_page=${perPage}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      if (!res.ok) {
        const status = res.status;
        const statusText = res.statusText;
        let errorBody = '';

        try {
          errorBody = await res.text();
        } catch (e) {
          errorBody = 'Could not read error response';
        }

        console.error('[Strava OAuth] Failed to fetch activities:', {
          status,
          statusText,
          body: errorBody
        });

        if (status === 401) {
          throw new Error('Strava token expired or invalid');
        }

        throw new Error(`Failed to fetch Strava activities: ${status} ${statusText}`);
      }

      const activities = await res.json();
      console.log(`[Strava OAuth] Fetched ${activities.length} activities on page ${page}`);

      if (activities.length === 0) {
        hasMore = false;
      } else {
        allActivities.push(...activities);

        // If we got fewer activities than requested, we've reached the end
        if (activities.length < perPage) {
          hasMore = false;
        } else {
          page++;
        }
      }
    }

    console.log(`[Strava OAuth] Total activities fetched: ${allActivities.length}`);

    // Filter and map only running activities
    const runs = allActivities
      .filter((a: any) => a.type === 'Run')
      .map((a: any) => ({
        id: a.id,
        distance_km: a.distance / 1000,
        duration_minutes: Math.round(a.moving_time / 60),
        avg_hr: a.average_heartrate,
        max_hr: a.max_heartrate,
        start_date: a.start_date
      }));

    console.log(`[Strava OAuth] Filtered to ${runs.length} running activities`);

    return runs;
  } catch (error) {
    console.error('[Strava OAuth] Exception fetching activities:', error);
    throw error;
  }
}

export async function fetchAthleteStats(accessToken: string, athleteId: number) {
  try {
    console.log('[Strava OAuth] Fetching athlete stats for athlete:', athleteId);

    const res = await fetch(`https://www.strava.com/api/v3/athletes/${athleteId}/stats`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!res.ok) {
      console.error('[Strava OAuth] Failed to fetch athlete stats:', res.status, res.statusText);
      throw new Error('Failed to fetch Strava athlete stats');
    }

    const stats = await res.json();
    console.log('[Strava OAuth] Athlete stats fetched successfully');

    // Note: Strava API doesn't provide RHR or HRV in the stats endpoint
    // These would need to come from Strava's premium features or external integrations
    return {
      recent_run_totals: stats.recent_run_totals,
      all_run_totals: stats.all_run_totals,
      ytd_run_totals: stats.ytd_run_totals
    };
  } catch (error) {
    console.error('[Strava OAuth] Exception fetching athlete stats:', error);
    throw error;
  }
}

export async function fetchActivityDetail(accessToken: string, activityId: string) {
  try {
    console.log('[Strava OAuth] Fetching activity detail for activity:', activityId);

    const res = await fetch(`https://www.strava.com/api/v3/activities/${activityId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!res.ok) {
      console.error('[Strava OAuth] Failed to fetch activity detail:', res.status, res.statusText);
      throw new Error('Failed to fetch Strava activity detail');
    }

    const activity = await res.json();
    console.log('[Strava OAuth] Activity detail fetched successfully');

    return {
      id: activity.id,
      name: activity.name,
      distance: activity.distance,
      moving_time: activity.moving_time,
      elapsed_time: activity.elapsed_time,
      total_elevation_gain: activity.total_elevation_gain,
      type: activity.type,
      start_date: activity.start_date,
      average_speed: activity.average_speed,
      max_speed: activity.max_speed,
      average_heartrate: activity.average_heartrate,
      max_heartrate: activity.max_heartrate,
      calories: activity.calories,
      map: activity.map?.summary_polyline,
      splits_metric: activity.splits_metric,
      laps: activity.laps
    };
  } catch (error) {
    console.error('[Strava OAuth] Exception fetching activity detail:', error);
    throw error;
  }
}

export async function fetchActivityStreams(accessToken: string, activityId: string) {
  try {
    console.log('[Strava OAuth] Fetching activity streams for activity:', activityId);

    const streamTypes = ['time', 'latlng', 'distance', 'altitude', 'heartrate', 'velocity_smooth'];
    const res = await fetch(
      `https://www.strava.com/api/v3/activities/${activityId}/streams?keys=${streamTypes.join(',')}&key_by_type=true`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    if (!res.ok) {
      console.error('[Strava OAuth] Failed to fetch activity streams:', res.status, res.statusText);
      throw new Error('Failed to fetch Strava activity streams');
    }

    const streams = await res.json();
    console.log('[Strava OAuth] Activity streams fetched successfully');

    return streams;
  } catch (error) {
    console.error('[Strava OAuth] Exception fetching activity streams:', error);
    throw error;
  }
}
