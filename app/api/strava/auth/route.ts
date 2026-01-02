import { NextResponse } from 'next/server';
import { buildAuthRedirectUrl } from '@/lib/strava/oauth';
import { getServerSupabase } from '@/lib/db/server-client';

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const supabase = await getServerSupabase();
  const { data } = await supabase.auth.getUser();
  const redirect = buildAuthRedirectUrl(origin, data.user?.id);
  return NextResponse.redirect(redirect);
}
