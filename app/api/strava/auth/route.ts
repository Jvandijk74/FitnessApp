import { NextResponse } from 'next/server';
import { buildAuthRedirectUrl } from '@/lib/strava/oauth';

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const redirect = buildAuthRedirectUrl(origin);
  return NextResponse.redirect(redirect);
}
