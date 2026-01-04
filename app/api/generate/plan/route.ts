import { NextRequest, NextResponse } from 'next/server';
import { llmService } from '@/lib/coach/llm-service';
import { getServerSupabase } from '@/lib/db/server-client';

interface PlanGenerationRequest {
  userId: string;
  experience: 'beginner' | 'intermediate' | 'advanced';
  frequency: number; // days per week
  goals: string[]; // e.g., ['hypertrophy', 'strength']
  focusAreas: string[]; // muscle groups
  limitations: string;
  equipment: string[];
}

export async function POST(request: NextRequest) {
  const requestStartTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  try {
    const data: PlanGenerationRequest = await request.json();

    console.log(`\n🤖 [API /generate/plan] Incoming request (${requestId})`);
    console.log(`   👤 User: ${data.userId}`);
    console.log(`   💪 Experience: ${data.experience}`);
    console.log(`   📅 Frequency: ${data.frequency} days/week`);
    console.log(`   🎯 Goals: ${data.goals.join(', ')}`);
    console.log(`   🕐 Timestamp: ${new Date().toISOString()}`);

    // Fetch available exercises from database
    const supabase = await getServerSupabase();
    const { data: exercises, error } = await supabase
      .from('exercises')
      .select('name, muscle_group, description')
      .order('muscle_group');

    if (error || !exercises) {
      throw new Error('Failed to fetch exercises from database');
    }

    console.log(`\n📋 [API /generate/plan] Fetched ${exercises.length} exercises from database`);

    // Group exercises by muscle group for better context
    const exercisesByGroup: Record<string, typeof exercises> = {};
    exercises.forEach(ex => {
      if (!exercisesByGroup[ex.muscle_group]) {
        exercisesByGroup[ex.muscle_group] = [];
      }
      exercisesByGroup[ex.muscle_group].push(ex);
    });

    // Create detailed prompt for Groq
    const prompt = `You are an expert strength coach creating a personalized weekly training plan. Generate a complete strength training program based on this athlete's profile:

**Athlete Profile:**
- Experience Level: ${data.experience}
- Training Frequency: ${data.frequency} days per week
- Goals: ${data.goals.join(', ')}
- Focus Areas: ${data.focusAreas.join(', ')}
- Limitations/Injuries: ${data.limitations || 'None'}
- Available Equipment: ${data.equipment.join(', ')}

**Available Exercises by Muscle Group:**
${Object.entries(exercisesByGroup).map(([group, exs]) =>
  `${group}: ${exs.map(e => e.name).join(', ')}`
).join('\n')}

**Instructions:**
1. Create a ${data.frequency}-day training split that aligns with their goals
2. Use ONLY exercises from the available exercise list above
3. For each workout day, provide:
   - Day name (e.g., "Push Day", "Leg Day", "Upper Body")
   - 4-6 exercises
   - Sets (e.g., "3", "4")
   - Reps (e.g., "8-12", "6-8", "12-15")
   - Tempo (e.g., "3010", "2020") - 4-digit format: eccentric-pause-concentric-pause
   - Rest (e.g., "90s", "120s")
   - Target RPE (e.g., "7-8", "8-9")
   - Brief notes explaining exercise selection

4. Follow these training principles:
   - ${data.experience === 'beginner' ? 'Keep it simple with compound movements, moderate volume' : ''}
   - ${data.experience === 'intermediate' ? 'Balance compound and isolation, progressive overload focus' : ''}
   - ${data.experience === 'advanced' ? 'Advanced techniques, higher volume, periodization' : ''}
   - ${data.goals.includes('hypertrophy') ? 'Focus on 8-15 rep range, higher volume' : ''}
   - ${data.goals.includes('strength') ? 'Focus on 3-6 rep range, lower volume, longer rest' : ''}

5. Return ONLY a valid JSON object in this exact format:
{
  "planName": "Descriptive plan name",
  "description": "Brief overview of the plan and its focus",
  "days": [
    {
      "dayOfWeek": "monday",
      "name": "Push Day",
      "type": "strength",
      "exercises": [
        {
          "exerciseName": "Barbell Bench Press",
          "sets": 4,
          "reps": "8-10",
          "tempo": "3010",
          "rest": "120s",
          "targetRPE": "8",
          "notes": "Focus on controlled eccentric"
        }
      ]
    }
  ]
}

**IMPORTANT:**
- Use exact exercise names from the available list
- dayOfWeek must be lowercase: monday, tuesday, wednesday, thursday, friday, saturday, sunday
- type must be "strength"
- Return ONLY the JSON, no markdown, no explanations
- Ensure JSON is properly formatted and valid`;

    console.log(`\n🧠 [API /generate/plan] Sending to Groq (${requestId})`);
    const aiResponse = await llmService.generateCoachResponse(prompt);

    console.log(`\n✅ [API /generate/plan] Received AI response (${requestId})`);
    console.log(`   📏 Response length: ${aiResponse.length} characters`);

    // Parse the AI response
    let workoutPlan;
    try {
      // Clean the response (remove markdown code blocks if present)
      const cleanedResponse = aiResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      workoutPlan = JSON.parse(cleanedResponse);
      console.log(`\n✅ [API /generate/plan] Successfully parsed workout plan`);
      console.log(`   📅 Days: ${workoutPlan.days?.length || 0}`);
    } catch (parseError) {
      console.error(`\n❌ [API /generate/plan] Failed to parse AI response`);
      console.error(`   Response: ${aiResponse.substring(0, 500)}`);
      throw new Error('Failed to parse AI-generated plan. Please try again.');
    }

    // Validate the plan structure
    if (!workoutPlan.days || !Array.isArray(workoutPlan.days)) {
      throw new Error('Invalid plan structure: missing days array');
    }

    // Validate exercise names against database
    const validExerciseNames = new Set(exercises.map(e => e.name));
    const invalidExercises: string[] = [];

    workoutPlan.days.forEach((day: any) => {
      day.exercises?.forEach((ex: any) => {
        if (!validExerciseNames.has(ex.exerciseName)) {
          invalidExercises.push(ex.exerciseName);
        }
      });
    });

    if (invalidExercises.length > 0) {
      console.warn(`\n⚠️  [API /generate/plan] Found invalid exercises: ${invalidExercises.join(', ')}`);
      console.warn(`   Will attempt to match or suggest alternatives`);
    }

    const duration = Date.now() - requestStartTime;

    console.log(`\n✅ [API /generate/plan] Success (${requestId})`);
    console.log(`   📋 Plan: ${workoutPlan.planName}`);
    console.log(`   📅 Days: ${workoutPlan.days.length}`);
    console.log(`   ⏱️  Duration: ${duration}ms`);

    return NextResponse.json({
      success: true,
      plan: workoutPlan,
      availableExercises: exercises,
    });

  } catch (error) {
    const duration = Date.now() - requestStartTime;
    console.error(`\n❌ [API /generate/plan] Error (${requestId}) - ${duration}ms`);
    console.error(`   Error type: ${error instanceof Error ? error.constructor.name : typeof error}`);
    console.error(`   Error message: ${error instanceof Error ? error.message : String(error)}`);
    console.error(`   Stack trace:`, error instanceof Error ? error.stack : 'N/A');

    return NextResponse.json(
      {
        error: 'Failed to generate workout plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
