import { NextResponse } from 'next/server';
import { calculateLactateThresholds } from '@/app/actions/metrics';

const DEMO_USER = 'demo-user';

export async function GET() {
  try {
    const thresholds = await calculateLactateThresholds(DEMO_USER);

    return NextResponse.json({
      lt1HR: thresholds.lt1HR,
      lt2HR: thresholds.lt2HR,
      lt1Pace: thresholds.lt1Pace,
      lt2Pace: thresholds.lt2Pace,
      explanation: thresholds.explanation,
    });
  } catch (error) {
    console.error('[API] Error fetching thresholds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch thresholds' },
      { status: 500 }
    );
  }
}
