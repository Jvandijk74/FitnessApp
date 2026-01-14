'use client';

import { useState, useRef } from 'react';
import { SimplifiedProduct } from '@/lib/nutrition/openfoodfacts';

interface FoodImageCaptureProps {
  userId: string;
  onFoodDetected: (product: SimplifiedProduct & { meal_type: string; quantity: number }) => void;
  onCancel: () => void;
  defaultMealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  confidence: string;
}

interface FoodAnalysis {
  foodItems: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export function FoodImageCapture({ userId, onFoodDetected, onCancel, defaultMealType }: FoodImageCaptureProps) {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [editableFoodItems, setEditableFoodItems] = useState<FoodItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>(defaultMealType);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isUsingCamera, setIsUsingCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsUsingCamera(true);
      setError(null);
    } catch (err) {
      setError('Unable to access camera. Please use file upload instead.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsUsingCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setImage(imageData);
      stopCamera();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/nutrition/analyze-food-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data: FoodAnalysis = await response.json();
      setAnalysis(data);
      setEditableFoodItems(data.foodItems);
    } catch (err) {
      setError('Failed to analyze food. Please try again or enter manually.');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateFoodItem = (index: number, field: keyof FoodItem, value: string | number) => {
    const updated = [...editableFoodItems];
    updated[index] = { ...updated[index], [field]: value };
    setEditableFoodItems(updated);
  };

  const calculateTotals = () => {
    return editableFoodItems.reduce(
      (acc, item) => ({
        calories: acc.calories + (Number(item.calories) || 0),
        protein: acc.protein + (Number(item.protein) || 0),
        carbs: acc.carbs + (Number(item.carbs) || 0),
        fat: acc.fat + (Number(item.fat) || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const handleConfirm = () => {
    if (!analysis || isSubmitting) return;

    const totals = calculateTotals();
    console.log('[FoodImageCapture] 🔍 Confirming food analysis:', { editableFoodItems, totals });
    setIsSubmitting(true);

    // Convert the analysis to the expected format using edited values
    const product: SimplifiedProduct & { meal_type: string; quantity: number } = {
      barcode: '', // Empty barcode for AI-detected food
      name: editableFoodItems.map(item => item.name).join(', '),
      brand: 'AI Estimated',
      calories: totals.calories,
      protein: totals.protein,
      carbs: totals.carbs,
      fat: totals.fat,
      servingSize: 'serving', // Just the unit, not '1 serving'
      imageUrl: undefined,
      meal_type: mealType,
      quantity: 1,
    };

    console.log('[FoodImageCapture] 📤 Sending product to handleAddProduct:', product);
    onFoodDetected(product);
  };

  const retake = () => {
    setImage(null);
    setAnalysis(null);
    setEditableFoodItems([]);
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-elevated rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-primary">📸 Scan Food</h2>
            <button
              onClick={() => {
                stopCamera();
                onCancel();
              }}
              className="text-text-tertiary hover:text-text-primary"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Camera/Image Section */}
          {!image && !isUsingCamera && (
            <div className="space-y-4">
              <p className="text-text-secondary text-center mb-6">
                Take a photo or upload an image of your food to automatically estimate calories and macros
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={startCamera}
                  className="btn-primary py-8 flex flex-col items-center gap-3"
                >
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-semibold">Use Camera</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary py-8 flex flex-col items-center gap-3"
                >
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold">Upload Image</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* Camera View */}
          {isUsingCamera && (
            <div className="space-y-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg bg-black"
              />
              <div className="flex gap-3">
                <button
                  onClick={capturePhoto}
                  className="btn-primary flex-1"
                >
                  📸 Capture Photo
                </button>
                <button
                  onClick={stopCamera}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Image Preview */}
          {image && !analysis && (
            <div className="space-y-4">
              <img src={image} alt="Food" className="w-full rounded-lg" />

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={analyzeImage}
                  disabled={isAnalyzing}
                  className="btn-primary flex-1"
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2 inline" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    '🔍 Analyze Food'
                  )}
                </button>
                <button
                  onClick={retake}
                  className="btn-secondary"
                >
                  Retake
                </button>
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-4">
              <img src={image!} alt="Food" className="w-full rounded-lg max-h-48 object-cover" />

              <div className="p-4 bg-primary-500/10 border border-primary-500/20 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-text-primary">AI Detection Results</h3>
                  <span className="text-xs text-text-tertiary">Tap values to edit</span>
                </div>

                {editableFoodItems.map((item, index) => (
                  <div key={index} className="mb-4 pb-4 border-b border-surface-elevated last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateFoodItem(index, 'name', e.target.value)}
                          className="font-medium text-text-primary bg-transparent border-b border-transparent hover:border-primary-500/50 focus:border-primary-500 focus:outline-none w-full mb-1"
                        />
                        <input
                          type="text"
                          value={item.servingSize}
                          onChange={(e) => updateFoodItem(index, 'servingSize', e.target.value)}
                          className="text-sm text-text-tertiary bg-transparent border-b border-transparent hover:border-primary-500/50 focus:border-primary-500 focus:outline-none w-full"
                          placeholder="e.g., 1 cup, 100g"
                        />
                      </div>
                      <span className="text-xs bg-surface-elevated px-2 py-1 rounded ml-2">
                        {item.confidence}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label className="text-text-tertiary text-xs block mb-1">Calories</label>
                        <input
                          type="number"
                          value={item.calories}
                          onChange={(e) => updateFoodItem(index, 'calories', Number(e.target.value))}
                          className="w-full bg-surface-elevated border border-surface-elevated hover:border-primary-500/50 focus:border-primary-500 focus:outline-none rounded px-2 py-1.5 text-sm font-semibold text-text-primary"
                        />
                      </div>
                      <div>
                        <label className="text-text-tertiary text-xs block mb-1">Protein (g)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={item.protein}
                          onChange={(e) => updateFoodItem(index, 'protein', Number(e.target.value))}
                          className="w-full bg-surface-elevated border border-surface-elevated hover:border-primary-500/50 focus:border-primary-500 focus:outline-none rounded px-2 py-1.5 text-sm font-semibold text-text-primary"
                        />
                      </div>
                      <div>
                        <label className="text-text-tertiary text-xs block mb-1">Carbs (g)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={item.carbs}
                          onChange={(e) => updateFoodItem(index, 'carbs', Number(e.target.value))}
                          className="w-full bg-surface-elevated border border-surface-elevated hover:border-primary-500/50 focus:border-primary-500 focus:outline-none rounded px-2 py-1.5 text-sm font-semibold text-text-primary"
                        />
                      </div>
                      <div>
                        <label className="text-text-tertiary text-xs block mb-1">Fat (g)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={item.fat}
                          onChange={(e) => updateFoodItem(index, 'fat', Number(e.target.value))}
                          className="w-full bg-surface-elevated border border-surface-elevated hover:border-primary-500/50 focus:border-primary-500 focus:outline-none rounded px-2 py-1.5 text-sm font-semibold text-text-primary"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {editableFoodItems.length > 1 && (() => {
                  const totals = calculateTotals();
                  return (
                    <div className="mt-3 pt-3 border-t border-primary-500/20">
                      <p className="font-semibold text-text-primary mb-2">Total</p>
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div>
                          <p className="text-text-tertiary text-xs">Calories</p>
                          <p className="font-bold text-primary-400">{totals.calories}</p>
                        </div>
                        <div>
                          <p className="text-text-tertiary text-xs">Protein</p>
                          <p className="font-bold text-primary-400">{totals.protein.toFixed(1)}g</p>
                        </div>
                        <div>
                          <p className="text-text-tertiary text-xs">Carbs</p>
                          <p className="font-bold text-primary-400">{totals.carbs.toFixed(1)}g</p>
                        </div>
                        <div>
                          <p className="text-text-tertiary text-xs">Fat</p>
                          <p className="font-bold text-primary-400">{totals.fat.toFixed(1)}g</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Meal Type Selection */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Meal Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setMealType(type)}
                      className={`py-2 px-3 rounded-lg border transition-colors ${
                        mealType === type
                          ? 'bg-primary-500 border-primary-500 text-white'
                          : 'bg-surface-elevated border-surface-elevated text-text-secondary hover:border-primary-500/50'
                      }`}
                    >
                      {type === 'breakfast' && '🌅'}
                      {type === 'lunch' && '🌞'}
                      {type === 'dinner' && '🌙'}
                      {type === 'snack' && '🍎'}
                      <span className="block text-xs mt-1 capitalize">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2 inline" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging...
                    </>
                  ) : (
                    '✓ Log Food'
                  )}
                </button>
                <button
                  onClick={retake}
                  disabled={isSubmitting}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Retake
                </button>
              </div>

              <p className="text-xs text-text-tertiary text-center">
                ✏️ Adjust portion sizes and nutrition values above before logging
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
