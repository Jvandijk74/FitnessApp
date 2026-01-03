import { NextRequest, NextResponse } from 'next/server';
import { llmService } from '@/lib/coach/llm-service';
import { getServerSupabase } from '@/lib/db/server-client';

export async function POST(request: NextRequest) {
  const requestStartTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  try {
    const { userId } = await request.json();

    console.log(`\n📊 [API /analyze/activities] Incoming request (${requestId})`);
    console.log(`   👤 User ID: ${userId}`);
    console.log(`   🕐 Timestamp: ${new Date().toISOString()}`);

    if (!userId || typeof userId !== 'string') {
      console.warn(`\n⚠️  [API /analyze/activities] Invalid request (${requestId})`);
      console.warn(`   User ID type: ${typeof userId}`);
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch recent activities from database
    console.log(`\n🔍 [API /analyze/activities] Fetching activities (${requestId})`);
    const supabase = await getServerSupabase();

    const { data: activities, error } = await supabase
      .from('run_logged')
      .select('*')
      .eq('user_id', userId)
      .order('activity_date', { ascending: false })
      .limit(30); // Last 30 activities

    if (error) {
      console.error(`\n❌ [API /analyze/activities] Database error (${requestId})`);
      console.error(`   Error: ${error.message}`);
      throw new Error(`Failed to fetch activities: ${error.message}`);
    }

    if (!activities || activities.length === 0) {
      console.warn(`\n⚠️  [API /analyze/activities] No activities found (${requestId})`);
      return NextResponse.json({
        success: true,
        analysis: "I don't see any logged activities yet. Once you sync your Strava activities or log some runs, I'll be able to analyze your training patterns and provide personalized recommendations!",
        activityCount: 0
      });
    }

    console.log(`\n📈 [API /analyze/activities] Found ${activities.length} activities (${requestId})`);

    // Prepare activity summary for Groq
    const activitySummary = activities.map((activity, index) => {
      const date = new Date(activity.activity_date).toLocaleDateString();
      const pace = activity.duration_minutes && activity.distance_km
        ? (activity.duration_minutes / activity.distance_km).toFixed(2)
        : 'N/A';

      return `${index + 1}. ${date}: ${activity.distance_km}km in ${activity.duration_minutes}min (pace: ${pace} min/km)${activity.avg_hr ? `, avg HR: ${activity.avg_hr}` : ''}${activity.max_hr ? `, max HR: ${activity.max_hr}` : ''}`;
    }).join('\n');

    // Calculate summary stats
    const totalDistance = activities.reduce((sum, a) => sum + (a.distance_km || 0), 0);
    const totalDuration = activities.reduce((sum, a) => sum + (a.duration_minutes || 0), 0);
    const avgDistance = totalDistance / activities.length;
    const avgPace = totalDuration / totalDistance;
    const activitiesWithHR = activities.filter(a => a.avg_hr).length;
    const avgHR = activitiesWithHR > 0
      ? activities.reduce((sum, a) => sum + (a.avg_hr || 0), 0) / activitiesWithHR
      : null;

    const summaryStats = `
Summary Statistics (last ${activities.length} activities):
- Total Distance: ${totalDistance.toFixed(1)}km
- Average Distance per Run: ${avgDistance.toFixed(2)}km
- Average Pace: ${avgPace.toFixed(2)} min/km
${avgHR ? `- Average Heart Rate: ${Math.round(avgHR)} bpm` : ''}
- Activities per week: ${(activities.length / 4).toFixed(1)}
`;

    // Create analysis prompt for Groq
    const analysisPrompt = `You are an expert running coach analyzing an athlete's training data. Based on the following activity log, provide a comprehensive analysis with specific, actionable recommendations.

${summaryStats}

Recent Activities:
${activitySummary}

Please provide:
1. **Training Volume Analysis**: Comment on their weekly mileage and consistency
2. **Pace & Intensity**: Analyze their pace progression and training intensity
3. **Recovery & Load**: Assess if they're recovering adequately between runs
4. **Specific Recommendations**: Give 3-5 concrete, actionable recommendations to improve their training (e.g., "Add one easy recovery run of 5-6km at 6:30 min/km pace each week")
5. **Red Flags**: Mention any concerning patterns (e.g., rapid mileage increases, lack of easy runs, etc.)

Be specific, use their actual numbers, and provide practical guidance they can implement immediately.`;

    console.log(`\n🤖 [API /analyze/activities] Sending to Groq for analysis (${requestId})`);
    const analysis = await llmService.generateCoachResponse(analysisPrompt);

    const duration = Date.now() - requestStartTime;

    console.log(`\n✅ [API /analyze/activities] Success (${requestId})`);
    console.log(`   📝 Analysis length: ${analysis.length} characters`);
    console.log(`   📊 Activities analyzed: ${activities.length}`);
    console.log(`   ⏱️  Total duration: ${duration}ms`);

    return NextResponse.json({
      success: true,
      analysis,
      activityCount: activities.length,
      stats: {
        totalDistance: totalDistance.toFixed(1),
        avgDistance: avgDistance.toFixed(2),
        avgPace: avgPace.toFixed(2),
        avgHR: avgHR ? Math.round(avgHR) : null
      }
    });
  } catch (error) {
    const duration = Date.now() - requestStartTime;
    console.error(`\n❌ [API /analyze/activities] Error (${requestId}) - ${duration}ms`);
    console.error(`   Error type: ${error instanceof Error ? error.constructor.name : typeof error}`);
    console.error(`   Error message: ${error instanceof Error ? error.message : String(error)}`);
    console.error(`   Stack trace:`, error instanceof Error ? error.stack : 'N/A');

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to analyze activities',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
