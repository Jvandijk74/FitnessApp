import { NextRequest, NextResponse } from 'next/server';
import { ollamaService } from '@/lib/coach/ollama-service';

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const response = await ollamaService.generateCoachResponse(message, context);

    return NextResponse.json({
      success: true,
      response,
    });
  } catch (error) {
    console.error('Error in coach chat API:', error);

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
