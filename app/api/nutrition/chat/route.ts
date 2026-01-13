import { NextRequest, NextResponse } from 'next/server';
import { llmService } from '@/lib/coach/llm-service';

export async function POST(request: NextRequest) {
  const requestStartTime = Date.now();
  const requestId = `nutri_req_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  try {
    const { messages, context } = await request.json();

    console.log(`\n🥗 [API /nutrition/chat] Incoming request (${requestId})`);
    console.log(`   💬 Messages count: ${messages?.length || 0}`);
    console.log(`   📍 Context: ${context ? 'Provided' : 'None'}`);
    console.log(`   🕐 Timestamp: ${new Date().toISOString()}`);

    if (!messages || !Array.isArray(messages)) {
      console.warn(`\n⚠️  [API /nutrition/chat] Invalid request (${requestId})`);
      console.warn(`   Messages type: ${typeof messages}`);
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Get the last user message
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (!lastUserMessage) {
      return NextResponse.json(
        { error: 'No user message found' },
        { status: 400 }
      );
    }

    // Build system prompt for nutrition coaching
    const systemPrompt = `You are an AI Nutrition Coach assistant. You provide personalized nutrition advice, meal recommendations, and answer questions about diet and nutrition.

Your role is to:
- Recommend meals and snacks based on the user's daily nutrition goals
- Suggest foods that fit within their remaining macros (calories, protein, carbs, fat)
- Answer questions about nutrition, meal timing, and food choices
- Provide practical, actionable advice for meal planning
- Consider the user's training schedule and recommend appropriate nutrition (e.g., more carbs on high-activity days)
- Educate users about nutrition principles in simple terms

You should:
- Be specific with meal suggestions (include portion sizes when relevant)
- Consider macronutrient balance in recommendations
- Provide variety in meal suggestions
- Be practical and realistic with recommendations
- Explain the "why" behind your recommendations

${context ? `\nCurrent user context:\n${context}` : ''}

Be concise, supportive, and practical in your responses. Focus on helping the user make good nutrition choices today.`;

    // Build messages array with system prompt
    const llmMessages = [
      {
        role: 'system' as const,
        content: systemPrompt,
      },
      ...messages.map((m: any) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    console.log(`\n🔄 [API /nutrition/chat] Processing with LLM service (${requestId})`);
    const response = await llmService.chat(llmMessages);
    const duration = Date.now() - requestStartTime;

    console.log(`\n✅ [API /nutrition/chat] Success (${requestId})`);
    console.log(`   📝 Response: "${response.substring(0, 100)}${response.length > 100 ? '...' : ''}"`);
    console.log(`   📏 Response length: ${response.length} characters`);
    console.log(`   ⏱️  Total duration: ${duration}ms`);

    return NextResponse.json({
      success: true,
      message: response,
    });
  } catch (error) {
    const duration = Date.now() - requestStartTime;
    console.error(`\n❌ [API /nutrition/chat] Error (${requestId}) - ${duration}ms`);
    console.error(`   Error type: ${error instanceof Error ? error.constructor.name : typeof error}`);
    console.error(`   Error message: ${error instanceof Error ? error.message : String(error)}`);
    console.error(`   Stack trace:`, error instanceof Error ? error.stack : 'N/A');

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to generate response',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
