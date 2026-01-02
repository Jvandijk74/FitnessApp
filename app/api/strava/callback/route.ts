import { NextResponse } from 'next/server';
import { handleTokenExchange, saveConnection } from '@/lib/strava/oauth';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const userId = url.searchParams.get('user') || 'demo-user';

  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 });

  const redirectUri = `${url.origin}/api/strava/callback`;
  const tokens = await handleTokenExchange(code, redirectUri);
  await saveConnection(userId, tokens);

  return NextResponse.redirect(`${url.origin}/dashboard?connected=strava`);
}
