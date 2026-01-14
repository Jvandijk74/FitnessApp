# AI Food Image Recognition

This feature allows users to take photos of their meals and automatically estimate calories and macronutrients using AI vision technology.

## Features

- 📸 **Camera Capture**: Take photos directly from your device's camera
- 🖼️ **Image Upload**: Upload existing food photos
- 🤖 **AI Analysis**: Automatically identify food items and estimate nutrition
- 📊 **Multi-Item Detection**: Recognizes multiple food items in a single image
- 🎯 **Meal Type Selection**: Categorize by breakfast, lunch, dinner, or snack
- ✅ **One-Click Logging**: Instantly log detected nutrition to your daily tracker

## How It Works

### Architecture

1. **Frontend Component** (`FoodImageCapture.tsx`):
   - Provides camera access and file upload interface
   - Displays AI analysis results
   - Allows user confirmation before logging

2. **API Endpoint** (`/api/nutrition/analyze-food-image`):
   - Receives the image (base64 encoded)
   - Sends to Claude Vision API (Anthropic)
   - Processes AI response and returns structured nutrition data

3. **AI Vision Processing**:
   - Uses Claude 3.5 Sonnet model with vision capabilities
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

### 1. Anthropic API Key

You must have an Anthropic API key set in your environment variables:

```bash
ANTHROPIC_API_KEY=your_api_key_here
```

Get your API key from: https://console.anthropic.com/

### 2. Dependencies

The following npm package is required:

```bash
npm install @anthropic-ai/sdk
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

- **Model**: Claude 3.5 Sonnet (`claude-3-5-sonnet-20241022`)
- **Max Tokens**: 1024 (for response)
- **Vision Capabilities**: Analyzes food composition, portion sizes, and visual characteristics

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

Each image analysis uses:
- **Input**: ~1,000-1,500 tokens (for the image)
- **Output**: ~200-500 tokens (for the structured response)

At current Claude API pricing:
- Cost per analysis: ~$0.01-0.03 USD

For high-volume usage, consider:
- Implementing usage limits
- Caching similar images
- Adding user quotas

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
  - ANTHROPIC_API_KEY not set
  - API quota exceeded
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

- Images are sent to Anthropic's API for processing
- Images are NOT stored permanently (only base64 in memory)
- No images are saved to the database
- Anthropic's data usage policy applies: https://www.anthropic.com/legal/privacy

## References

- Inspired by: [FoodCalorieEstimation](https://github.com/Nikhilchakravarthy1303/FoodCalorieEstimation)
- Claude Vision API: https://docs.anthropic.com/claude/docs/vision
- Anthropic SDK: https://www.npmjs.com/package/@anthropic-ai/sdk
