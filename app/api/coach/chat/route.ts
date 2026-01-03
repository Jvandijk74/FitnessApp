import { NextRequest, NextResponse } from 'next/server';
import { llmService } from '@/lib/coach/llm-service';

export async function POST(request: NextRequest) {
  const requestStartTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  try {
    const { message, context } = await request.json();

    console.log(`\n📬 [API /coach/chat] Incoming request (${requestId})`);
    console.log(`   💬 Message: "${message?.substring(0, 100)}${message?.length > 100 ? '...' : ''}"`);
    console.log(`   📍 Context: ${context ? 'Provided' : 'None'}`);
    console.log(`   🕐 Timestamp: ${new Date().toISOString()}`);

    if (!message || typeof message !== 'string') {
      console.warn(`\n⚠️  [API /coach/chat] Invalid request (${requestId})`);
      console.warn(`   Message type: ${typeof message}`);
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log(`\n🔄 [API /coach/chat] Processing with LLM service (${requestId})`);
    const response = await llmService.generateCoachResponse(message, context);
    const duration = Date.now() - requestStartTime;

    console.log(`\n✅ [API /coach/chat] Success (${requestId})`);
    console.log(`   📝 Response: "${response.substring(0, 100)}${response.length > 100 ? '...' : ''}"`);
    console.log(`   📏 Response length: ${response.length} characters`);
    console.log(`   ⏱️  Total duration: ${duration}ms`);

    return NextResponse.json({
      success: true,
      response,
    });
  } catch (error) {
    const duration = Date.now() - requestStartTime;
    console.error(`\n❌ [API /coach/chat] Error (${requestId}) - ${duration}ms`);
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
