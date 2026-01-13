import { NextRequest, NextResponse } from 'next/server';
import { logStrength } from '@/app/actions/plan';
import { TrainingDay } from '@/lib/db/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, day, exercise, sets } = body;

    // Validate required fields
    if (!user_id || !day || !exercise || !sets || !Array.isArray(sets)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate sets data
    const validSets = sets.filter(s => s.weight > 0 && s.reps > 0);
    if (validSets.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid sets provided' },
        { status: 400 }
      );
    }

    // Save to database
    await logStrength({
      user_id,
      day: day as TrainingDay,
      exercise,
      sets: validSets
    });

    return NextResponse.json({
      success: true,
      message: 'Workout saved successfully',
      setsLogged: validSets.length
    });
  } catch (error) {
    console.error('[API Log Strength] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save workout'
      },
      { status: 500 }
    );
  }
}
