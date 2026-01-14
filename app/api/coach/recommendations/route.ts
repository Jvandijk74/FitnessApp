import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/db/server-client';
import Groq from 'groq-sdk';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    console.log('[Recommendations API] 📊 Generating recommendations for user:', userId);

    // Initialize clients
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('[Recommendations API] GROQ_API_KEY is not set');
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey });
    const supabase = await getServerSupabase();

    // Gather comprehensive user context
    const today = new Date().toISOString().split('T')[0];

    // 1. User Profile
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    // 2. Today's nutrition
    const { data: todayNutrition } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', today);

    // 3. Today's workouts
    const { data: todayWorkouts } = await supabase
      .from('scheduled_workouts')
      .select('*')
      .eq('user_id', userId)
      .eq('workout_date', today);

    // 4. Recent workouts (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data: recentWorkouts } = await supabase
      .from('scheduled_workouts')
      .select('*')
      .eq('user_id', userId)
      .gte('workout_date', sevenDaysAgo.toISOString().split('T')[0])
      .order('workout_date', { ascending: false});

    // 5. Nutrition goals
    const { data: goals } = await supabase
      .from('nutrition_goals')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Calculate today's nutrition totals
    const todayTotals = todayNutrition?.reduce((acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein_grams,
      carbs: acc.carbs + meal.carbs_grams,
      fat: acc.fat + meal.fat_grams,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    // Build context for AI
    const context = `
USER DATA ANALYSIS:

Profile:
- Age: ${user?.age || 'Unknown'}
- Weight: ${user?.weight_kg ? `${user.weight_kg}kg` : 'Unknown'}
- Gender: ${user?.gender || 'Unknown'}
- Activity Level: ${user?.activity_level || 'Unknown'}

Today's Workouts:
${todayWorkouts && todayWorkouts.length > 0
  ? todayWorkouts.map(w => `- ${w.name} (${w.workout_type}, ${w.completed ? 'completed' : 'scheduled'})${w.run_duration_minutes ? `, ${w.run_duration_minutes}min` : ''}${w.run_distance_km ? `, ${w.run_distance_km}km` : ''}`).join('\n')
  : '- No workouts today'}

Today's Nutrition:
${todayNutrition && todayNutrition.length > 0
  ? `Meals logged: ${todayNutrition.length}
Total: ${todayTotals?.calories}kcal, P:${todayTotals?.protein}g, C:${todayTotals?.carbs}g, F:${todayTotals?.fat}g
Goals: ${goals ? `${goals.daily_calories}kcal, P:${goals.protein_grams}g, C:${goals.carbs_grams}g, F:${goals.fat_grams}g` : 'Not set'}`
  : '- No meals logged today'}

Recent Training Pattern (Last 7 days):
${recentWorkouts && recentWorkouts.length > 0
  ? `Total workouts: ${recentWorkouts.length}
Completed: ${recentWorkouts.filter(w => w.completed).length}
Types: ${recentWorkouts.map(w => w.workout_type).join(', ')}`
  : '- No recent workouts'}
`;

    const prompt = `Based on the following user data, generate 3-5 personalized recommendations for TODAY. Each recommendation should be specific, actionable, and prioritized.

${context}

Return ONLY a valid JSON array in this exact format (no markdown, no explanation):
[
  {
    "category": "nutrition|recovery|training|hydration",
    "title": "Short title (max 50 chars)",
    "description": "Specific actionable advice (max 120 chars)",
    "priority": "high|medium|low"
  }
]

Focus on:
- Nutrition gaps relative to goals and today's training
- Recovery needs based on recent workout intensity
- Hydration if intense training was done
- Training load if overtraining detected
- Encourage positive behaviors

Be specific and reference their actual data when possible.`;

    console.log('[Recommendations API] 🤖 Calling AI...');

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert fitness and nutrition coach. Generate personalized recommendations in valid JSON format only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: process.env.LLM_MODEL || 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content || '[]';

    // Parse JSON response
    let recommendations;
    try {
      const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      recommendations = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('[Recommendations API] Failed to parse AI response:', response);
      // Fallback recommendations
      recommendations = [
        {
          category: 'nutrition',
          title: 'Stay on track with your nutrition',
          description: 'Continue logging your meals to maintain awareness of your intake.',
          priority: 'medium',
        },
      ];
    }

    console.log('[Recommendations API] ✅ Generated', recommendations.length, 'recommendations');

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('[Recommendations API] ❌ Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
