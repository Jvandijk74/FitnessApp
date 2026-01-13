import { NextRequest, NextResponse } from 'next/server';
import { getWeeklyVolume } from '@/app/actions/volume';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const week = Number(searchParams.get('week')) || 1;
  const year = Number(searchParams.get('year')) || new Date().getFullYear();
  const userId = 'demo-user'; // Replace with actual auth

  try {
    const volumeData = await getWeeklyVolume(userId, week, year);

    return NextResponse.json({
      success: true,
      volumeData,
      week,
      year
    });
  } catch (error) {
    console.error('[API Volume] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch volume data' },
      { status: 500 }
    );
  }
}
