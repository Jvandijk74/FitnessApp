import { NextResponse } from 'next/server';
import { handleTokenExchange, saveConnection } from '@/lib/strava/oauth';
import { validateState } from '@/lib/strava/state';
import { DEMO_USER_ID } from '@/lib/constants';

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const userId = searchParams.get('user') || DEMO_USER_ID;

    // Handle Strava authorization errors
    if (error) {
      console.error('Strava authorization error:', error);
      return NextResponse.redirect(
        new URL(`/dashboard?error=strava_denied`, origin)
      );
    }

    // Validate required parameters
    if (!code) {
      console.error('Missing authorization code');
      return NextResponse.redirect(
        new URL(`/dashboard?error=missing_code`, origin)
      );
    }

    // Validate state for CSRF protection
    if (!validateState(state)) {
      console.error('Invalid or missing state parameter');
      return NextResponse.redirect(
        new URL(`/dashboard?error=invalid_state`, origin)
      );
    }

    // Exchange authorization code for tokens
    const tokens = await handleTokenExchange(code);

    // Save the connection to database
    await saveConnection(userId, tokens);

    console.log(`Strava connected successfully for user ${userId}, athlete ${tokens.athlete.id}`);

    // Redirect to dashboard with success message
    return NextResponse.redirect(
      new URL(`/dashboard?connected=strava`, origin)
    );
  } catch (error) {
    console.error('Strava callback error:', error);

    // Extract error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Redirect to dashboard with error
    const { origin } = new URL(request.url);
    return NextResponse.redirect(
      new URL(`/dashboard?error=connection_failed&details=${encodeURIComponent(errorMessage)}`, origin)
    );
  }
}
