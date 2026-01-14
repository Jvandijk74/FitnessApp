import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Initialize Google Gemini client
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_API_KEY is not set');
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Extract base64 data from data URL
    const base64Data = image.split(',')[1];
    const mimeType = image.split(';')[0].split(':')[1];

    // Prepare the prompt
    const prompt = `Analyze this food image and provide nutritional information. Identify all food items visible and estimate their quantities and nutritional content.

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

Be specific with food names. If you see multiple items, list each separately. Provide realistic portion size estimates based on visual appearance.`;

    // Call Gemini Vision API
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      },
    ]);

    const response = await result.response;
    const responseText = response.text();

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
