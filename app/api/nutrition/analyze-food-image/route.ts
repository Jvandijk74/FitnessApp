import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Initialize Anthropic client
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY is not set');
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    // Extract base64 data from data URL
    const base64Data = image.split(',')[1];
    const mediaType = image.split(';')[0].split(':')[1];

    // Call Claude Vision API
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: `Analyze this food image and provide nutritional information. Identify all food items visible and estimate their quantities and nutritional content.

Return your response in this exact JSON format (no markdown, just raw JSON):
{
  "foodItems": [
    {
      "name": "Food item name",
      "calories": <number>,
      "protein": <number in grams>,
      "carbs": <number in grams>,
      "fat": <number in grams>,
      "servingSize": "Estimated portion (e.g., '1 cup', '150g', '1 medium apple')",
      "confidence": "High/Medium/Low"
    }
  ],
  "totalCalories": <sum of all calories>,
  "totalProtein": <sum of all protein>,
  "totalCarbs": <sum of all carbs>,
  "totalFat": <sum of all fat>
}

Be specific with food names. If you see multiple items, list each separately. Provide realistic portion size estimates based on visual appearance.`,
            },
          ],
        },
      ],
    });

    // Extract the response text
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse the JSON response
    let analysis;
    try {
      // Remove any markdown code blocks if present
      const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    // Validate the response structure
    if (!analysis.foodItems || !Array.isArray(analysis.foodItems)) {
      return NextResponse.json(
        { error: 'Invalid response from AI' },
        { status: 500 }
      );
    }

    // Round all numbers to 1 decimal place
    analysis.foodItems = analysis.foodItems.map((item: any) => ({
      ...item,
      calories: Math.round(item.calories),
      protein: Math.round(item.protein * 10) / 10,
      carbs: Math.round(item.carbs * 10) / 10,
      fat: Math.round(item.fat * 10) / 10,
    }));

    analysis.totalCalories = Math.round(analysis.totalCalories);
    analysis.totalProtein = Math.round(analysis.totalProtein * 10) / 10;
    analysis.totalCarbs = Math.round(analysis.totalCarbs * 10) / 10;
    analysis.totalFat = Math.round(analysis.totalFat * 10) / 10;

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error analyzing food image:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
