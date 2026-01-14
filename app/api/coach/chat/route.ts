import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, userId, conversationHistory = [] } = await request.json();

    if (!message || !userId) {
      return NextResponse.json(
        { error: 'Message and userId are required' },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Gather comprehensive user context
    const today = new Date().toISOString().split('T')[0];

    // Get user profile
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    // Get today's nutrition
    const { data: todayNutrition } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', today);

    // Get today's scheduled workouts
    const { data: todayWorkouts } = await supabase
      .from('scheduled_workouts')
      .select('*')
      .eq('user_id', userId)
      .eq('workout_date', today);

    // Get recent completed workouts (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data: recentWorkouts } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    // Get recent recovery data (last 7 days)
    const { data: recentRecovery } = await supabase
      .from('recovery_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('log_date', sevenDaysAgo.toISOString().split('T')[0])
      .order('log_date', { ascending: false });

    // Calculate total nutrition for today
    const totalCalories = todayNutrition?.reduce((sum, log) => sum + (log.calories || 0), 0) || 0;
    const totalProtein = todayNutrition?.reduce((sum, log) => sum + (log.protein_grams || 0), 0) || 0;
    const totalCarbs = todayNutrition?.reduce((sum, log) => sum + (log.carbs_grams || 0), 0) || 0;
    const totalFat = todayNutrition?.reduce((sum, log) => sum + (log.fat_grams || 0), 0) || 0;

    // Build context string
    const userContext = `
User Profile:
- Age: ${user?.age || 'N/A'}
- Weight: ${user?.weight ? user.weight + ' kg' : 'N/A'}
- Height: ${user?.height ? user.height + ' cm' : 'N/A'}
- Running Level: ${user?.running_level || 'N/A'}
- Weekly Mileage Goal: ${user?.weekly_mileage || 'N/A'} km
- Personal Records: ${JSON.stringify(user?.personal_records || {})}

Today's Nutrition (${today}):
- Total Calories: ${totalCalories} kcal
- Protein: ${totalProtein.toFixed(1)}g
- Carbs: ${totalCarbs.toFixed(1)}g
- Fat: ${totalFat.toFixed(1)}g
- Meals Logged: ${todayNutrition?.length || 0}
${todayNutrition && todayNutrition.length > 0 ? `- Details: ${JSON.stringify(todayNutrition.map(n => ({ meal: n.meal_type, name: n.name, calories: n.calories })))}` : ''}

Today's Scheduled Workouts:
${todayWorkouts && todayWorkouts.length > 0
  ? todayWorkouts.map(w => `- ${w.workout_type}: ${w.name || 'Unnamed'} (${w.status})`).join('\n')
  : '- No workouts scheduled'}

Recent Workout History (Last 7 Days):
${recentWorkouts && recentWorkouts.length > 0
  ? recentWorkouts.map(w => `- ${new Date(w.created_at).toLocaleDateString()}: ${w.distance_km}km in ${w.duration_minutes}min, Avg HR: ${w.avg_heart_rate || 'N/A'}`).join('\n')
  : '- No recent workouts'}

Recent Recovery Data (Last 7 Days):
${recentRecovery && recentRecovery.length > 0
  ? recentRecovery.map(r => `- ${r.log_date}: Sleep ${r.sleep_hours}h (${r.sleep_quality}/5), Energy ${r.energy_level}/5, Soreness ${r.soreness_level}/5`).join('\n')
  : '- No recovery data'}
`;

    const systemPrompt = `You are an expert AI fitness and nutrition coach. You have access to comprehensive information about the user including their profile, workouts, nutrition, and recovery data.

Your role is to:
1. Provide personalized advice based on the user's complete context
2. Answer questions about their training, nutrition, and recovery
3. Offer encouragement and motivation
4. Help them optimize their performance and health
5. Be concise but informative - aim for 2-4 sentences unless more detail is needed

Current User Context:
${userContext}

Respond naturally and conversationally. If the user asks about something not in the data, acknowledge the limitation and provide general guidance.`;

    // Build conversation messages
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg: Message) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages: messages,
      model: process.env.LLM_MODEL || 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 500,
    });

    const assistantMessage = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    return NextResponse.json({
      message: assistantMessage,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[AI Coach Chat] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
