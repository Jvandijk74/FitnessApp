import { NextRequest, NextResponse } from 'next/server';
import { calculateProgressiveOverload } from '@/app/actions/volume';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const week = Number(searchParams.get('week')) || 1;
  const year = Number(searchParams.get('year')) || new Date().getFullYear();
  const userId = 'demo-user'; // Replace with actual auth

  try {
    const factors = await calculateProgressiveOverload(userId, week, year);

    return NextResponse.json({
      success: true,
      factors
    });
  } catch (error) {
    console.error('[API Overload] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate overload' },
      { status: 500 }
    );
  }
}
