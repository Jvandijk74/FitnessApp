import { NextResponse } from 'next/server';
import { buildAuthRedirectUrl } from '@/lib/strava/oauth';
import { generateState, storeState } from '@/lib/strava/state';

export async function GET(request: Request) {
  try {
    const origin = new URL(request.url).origin;

    // Generate and store state for CSRF protection
    const state = generateState();
    storeState(state);

    const redirect = buildAuthRedirectUrl(origin, state);
    return NextResponse.redirect(redirect);
  } catch (error) {
    console.error('Strava auth error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Strava authentication' },
      { status: 500 }
    );
  }
}
