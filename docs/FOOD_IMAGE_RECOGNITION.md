# AI Food Image Recognition

This feature allows users to take photos of their meals and automatically estimate calories and macronutrients using AI vision technology powered by **Google Gemini (FREE)**.

## Features

- 📸 **Camera Capture**: Take photos directly from your device's camera
- 🖼️ **Image Upload**: Upload existing food photos
- 🤖 **AI Analysis**: Automatically identify food items and estimate nutrition
- 📊 **Multi-Item Detection**: Recognizes multiple food items in a single image
- 🎯 **Meal Type Selection**: Categorize by breakfast, lunch, dinner, or snack
- ✅ **One-Click Logging**: Instantly log detected nutrition to your daily tracker
- 💰 **FREE**: Uses Google Gemini's generous free tier

## How It Works

### Architecture

1. **Frontend Component** (`FoodImageCapture.tsx`):
   - Provides camera access and file upload interface
   - Displays AI analysis results
   - Allows user confirmation before logging

2. **API Endpoint** (`/api/nutrition/analyze-food-image`):
   - Receives the image (base64 encoded)
   - Sends to Google Gemini Vision API
   - Processes AI response and returns structured nutrition data

3. **AI Vision Processing**:
   - Uses Google Gemini 2.5 Flash model with vision capabilities
   - Analyzes the image to identify food items
   - Estimates portion sizes based on visual appearance
   - Calculates nutritional values for each item

4. **Nutrition Logging**:
   - Integrates with existing `logMeal` server action
   - Stores results in the nutrition_logs table
   - Displays in the NutritionDashboard

### Data Flow

```
User takes photo → FoodImageCapture component
                ↓
           Converts to base64
                ↓
    /api/nutrition/analyze-food-image
                ↓
         Claude Vision API
                ↓
    Returns structured JSON:
    {
      "foodItems": [
        {
          "name": "Grilled Chicken Breast",
          "calories": 165,
          "protein": 31,
          "carbs": 0,
          "fat": 3.6,
          "servingSize": "100g",
          "confidence": "High"
        }
      ],
      "totalCalories": 165,
      "totalProtein": 31,
      "totalCarbs": 0,
      "totalFat": 3.6
    }
                ↓
    User confirms and selects meal type
                ↓
         Logs to database
```

## Setup Requirements

### 1. Google API Key (FREE)

You must have a Google API key set in your environment variables:

```bash
GOOGLE_API_KEY=your_api_key_here
```

**Get your FREE API key:**
1. Go to https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to your `.env` file

**Free Tier Limits:**
- 15 requests per minute
- 1 million tokens per day
- 1,500 requests per day
- More than enough for personal use!

### 2. Dependencies

The following npm package is required:

```bash
npm install @google/generative-ai
```

Already installed in this project.

## Usage

### In the Nutrition Dashboard

1. Navigate to the Nutrition page
2. Click the **"📸 Scan Food"** button
3. Choose to either:
   - Use your camera to take a photo
   - Upload an existing image
4. Wait for AI analysis (typically 2-5 seconds)
5. Review the detected food items and nutritional estimates
6. Select the meal type (breakfast, lunch, dinner, snack)
7. Click **"✓ Log Food"** to add to your nutrition tracker

### Quick Add Per Meal

You can also use the quick "+ Add" buttons for each meal type, which will:
- Set the default meal type
- Open the product search or scanning interface

## Technical Details

### Image Processing

- **Supported Formats**: JPEG, PNG, GIF, WebP
- **Max Image Size**: Limited by browser/API constraints (typically ~10MB)
- **Image Quality**: Compressed to 80% JPEG quality before upload for performance
- **Camera Mode**: Uses `facingMode: 'environment'` to prefer rear camera on mobile

### AI Model

- **Model**: Google Gemini 2.5 Flash (`gemini-2.5-flash`)
- **Cost**: FREE (within generous limits)
- **Vision Capabilities**: Analyzes food composition, portion sizes, and visual characteristics
- **Performance**: Fast response times (typically 2-5 seconds)
- **Note**: Gemini 1.5 models were retired; now using the latest 2.5 generation

### Accuracy Considerations

AI estimates may vary based on:
- Image quality and lighting
- Portion size visibility
- Food preparation method (hidden ingredients)
- Regional food variations

**Recommendation**: The system provides a disclaimer that estimates may not be 100% accurate. Users can edit entries after logging if adjustments are needed.

## API Endpoint Documentation

### POST `/api/nutrition/analyze-food-image`

**Request Body:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Response:**
```json
{
  "foodItems": [
    {
      "name": "string",
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "servingSize": "string",
      "confidence": "High" | "Medium" | "Low"
    }
  ],
  "totalCalories": number,
  "totalProtein": number,
  "totalCarbs": number,
  "totalFat": number
}
```

**Error Responses:**
- `400`: No image provided
- `500`: AI service not configured or analysis failed

## Cost Considerations

### 💰 FREE! (with limits)

Each image analysis uses tokens, but Google Gemini offers a **generous free tier**:

**Free Tier Limits:**
- 15 requests per minute
- 1 million tokens per day
- 1,500 requests per day

**Cost per analysis:** $0.00 (FREE within limits)

**For most users**, the free tier is more than sufficient:
- 15 food scans per minute = ~900 scans per hour
- 1,500 scans per day = 45,000 scans per month
- Even power users won't hit these limits!

**If you exceed free tier**, Gemini pricing is very affordable:
- Input: $0.075 per million tokens
- Output: $0.30 per million tokens
- ~$0.001-0.002 per food scan (less than a penny)

## Future Enhancements

Potential improvements:
- [ ] Barcode scanning fallback for packaged foods
- [ ] Portion size comparison (e.g., "compared to your hand")
- [ ] Recipe suggestions based on detected ingredients
- [ ] Historical accuracy tracking and learning
- [ ] Batch processing for multiple images
- [ ] Integration with meal planning
- [ ] Nutritional goal warnings (e.g., "high in sodium")

## Troubleshooting

### Camera Not Working
- **Issue**: "Unable to access camera"
- **Solution**: Check browser permissions for camera access
- **Fallback**: Use the "Upload Image" option instead

### Analysis Fails
- **Issue**: "Failed to analyze food"
- **Possible Causes**:
  - GOOGLE_API_KEY not set
  - API quota exceeded (unlikely with free tier)
  - Network connectivity issues
  - Invalid image format
- **Solution**: Check server logs for detailed error messages

### Inaccurate Results
- **Issue**: AI misidentifies food or estimates are off
- **Solutions**:
  - Take photo from directly above the food
  - Ensure good lighting
  - Include reference objects (like a fork) for scale
  - Use the manual product search for precision

## Privacy & Security

- Images are sent to Google's Gemini API for processing
- Images are NOT stored permanently (only base64 in memory)
- No images are saved to the database
- Google's data usage policy applies: https://policies.google.com/privacy
- Google states: "When you use Gemini API, Google doesn't use your prompts or responses to train our models"

## References

- Inspired by: [FoodCalorieEstimation](https://github.com/Nikhilchakravarthy1303/FoodCalorieEstimation)
- Google Gemini API: https://ai.google.dev/gemini-api/docs/vision
- Gemini SDK: https://www.npmjs.com/package/@google/generative-ai
- Get Free API Key: https://aistudio.google.com/app/apikey
