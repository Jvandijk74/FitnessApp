import { NextResponse } from 'next/server';
import { handleTokenExchange, saveConnection } from '@/lib/strava/oauth';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');
  const userId = url.searchParams.get('user') || 'demo-user';

  console.log('[Strava Callback] Received callback');
  console.log('[Strava Callback] URL:', url.toString());
  console.log('[Strava Callback] Code:', code ? `${code.slice(0, 10)}...` : 'MISSING');
  console.log('[Strava Callback] Error:', error);
  console.log('[Strava Callback] Error Description:', errorDescription);

  // Handle user denial or Strava errors
  if (error) {
    console.error('[Strava Callback] OAuth error:', error, errorDescription);
    const errorMessage = encodeURIComponent(errorDescription || error || 'Authorization denied');
    return NextResponse.redirect(`${url.origin}/dashboard?strava_error=${errorMessage}`);
  }

  if (!code) {
    console.error('[Strava Callback] Missing authorization code');
    return NextResponse.redirect(
      `${url.origin}/dashboard?strava_error=${encodeURIComponent('Missing authorization code')}`
    );
  }

  try {
    const redirectUri = `${url.origin}/api/strava/callback`;
    console.log('[Strava Callback] Exchanging code for tokens...');

    const tokens = await handleTokenExchange(code, redirectUri);

    console.log('[Strava Callback] Saving connection to database...');
    await saveConnection(userId, tokens);

    console.log('[Strava Callback] Success! Redirecting to dashboard...');
    return NextResponse.redirect(`${url.origin}/dashboard?connected=strava`);
  } catch (error) {
    console.error('[Strava Callback] Error during token exchange or save:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const encodedError = encodeURIComponent(errorMessage);

    return NextResponse.redirect(`${url.origin}/dashboard?strava_error=${encodedError}`);
  }
}
