import { NextResponse } from 'next/server';
import { handleTokenExchange, saveConnection } from '@/lib/strava/oauth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const userId = searchParams.get('user') || 'demo-user';
  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  const tokens = await handleTokenExchange(code);
  await saveConnection(userId, tokens);
  return NextResponse.redirect(`/dashboard?connected=strava`);
}
