'use client';

import { useState } from 'react';
import { NutritionLog } from '@/lib/db/types';
import { logMeal, deleteMeal } from '@/app/actions/nutrition';
import { useRouter } from 'next/navigation';
import { ProductSearch } from './ProductSearch';
import { FoodImageCapture } from './FoodImageCapture';
import { SimplifiedProduct } from '@/lib/nutrition/openfoodfacts';

interface NutritionDashboardProps {
  userId: string;
  date: string;
  requirements: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  } | null;
  summary: {
    date: string;
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    meals: NutritionLog[];
  } | null;
  plannedWorkouts?: any[];
}

export function NutritionDashboard({ userId, date, requirements, summary, plannedWorkouts = [] }: NutritionDashboardProps) {
  const router = useRouter();
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isScanningFood, setIsScanningFood] = useState(false);
  const [defaultMealType, setDefaultMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);

  const handleAddProduct = async (product: SimplifiedProduct & { meal_type: string; quantity: number }) => {
    console.log('[NutritionDashboard] 📥 Received product to log:', product);
    setIsSubmitting(true);

    try {
      const mealData = {
        user_id: userId,
        log_date: date,
        meal_type: product.meal_type as 'breakfast' | 'lunch' | 'dinner' | 'snack',
        name: product.name,
        product_name: product.name,
        product_brand: product.brand,
        barcode: product.barcode || undefined,
        serving_size: product.quantity,
        serving_unit: product.servingSize || 'serving',
        openfoodfacts_id: product.barcode || undefined,
        calories: Math.round(product.calories * product.quantity),
        protein_grams: Math.round(product.protein * product.quantity * 10) / 10,
        carbs_grams: Math.round(product.carbs * product.quantity * 10) / 10,
        fat_grams: Math.round(product.fat * product.quantity * 10) / 10,
      };

      console.log('[NutritionDashboard] 📤 Sending meal data:', mealData);

      const result = await logMeal(mealData);

      if (result) {
        console.log('[NutritionDashboard] ✅ Product logged successfully');
        setIsAddingProduct(false);
        setIsScanningFood(false);
        router.refresh();
      } else {
        console.error('[NutritionDashboard] ❌ Failed to log product - logMeal returned null');
        alert('Failed to log food. Please check the console for details.');
      }
    } catch (error) {
      console.error('[NutritionDashboard] ❌ Error logging product:', error);
      alert('Error logging food. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await deleteMeal(productId);
      router.refresh();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleExplainGoals = async () => {
    if (explanation && showExplanation) {
      setShowExplanation(false);
      return;
    }

    if (explanation) {
      setShowExplanation(true);
      return;
    }

    setIsLoadingExplanation(true);
    setShowExplanation(true);

    try {
      let workoutContext = '';
      if (plannedWorkouts.length > 0) {
        workoutContext = '\n\nPlanned Workouts for Today:\n';
        plannedWorkouts.forEach((workout, index) => {
          workoutContext += `${index + 1}. ${workout.name || workout.workout_type}`;
          if (workout.workout_type === 'run') {
            if (workout.run_duration_minutes) workoutContext += ` - ${workout.run_duration_minutes} min`;
            if (workout.run_intensity) workoutContext += ` (${workout.run_intensity})`;
            if (workout.run_distance_km) workoutContext += ` - ${workout.run_distance_km}km`;
          }
          workoutContext += '\n';
        });
      } else {
        workoutContext = '\n\nNo workouts planned for today (rest day)';
      }

      const prompt = `Based on my profile and today's planned activities, explain in maximum 5 sentences why my daily nutrition goals are set to ${requirements?.calories} calories, ${requirements?.protein}g protein, ${requirements?.carbs}g carbs, and ${requirements?.fat}g fat. Reference my specific planned workouts for today.`;

      const response = await fetch('/api/nutrition/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          context: `User ID: ${userId}\nDate: ${date}\n\nDaily Goals:\n- Calories: ${requirements?.calories} kcal\n- Protein: ${requirements?.protein}g\n- Carbs: ${requirements?.carbs}g\n- Fat: ${requirements?.fat}g${workoutContext}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get explanation');
      }

      const data = await response.json();
      setExplanation(data.message);
    } catch (error) {
      console.error('Error getting explanation:', error);
      setExplanation('Unable to generate explanation at this time. Please try again later.');
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  if (!requirements) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <p className="text-text-secondary mb-4">
            Please complete your profile in Settings to see your daily nutrition requirements.
          </p>
          <p className="text-sm text-text-tertiary">
            We need your age, weight, height, and gender to calculate accurate recommendations.
          </p>
        </div>
      </div>
    );
  }

  const consumed = summary || {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    meals: [],
  };

  // Group products by meal type
  const productsByMealType = {
    breakfast: consumed.meals.filter(m => m.meal_type === 'breakfast'),
    lunch: consumed.meals.filter(m => m.meal_type === 'lunch'),
    dinner: consumed.meals.filter(m => m.meal_type === 'dinner'),
    snack: consumed.meals.filter(m => m.meal_type === 'snack'),
  };

  const caloriesRemaining = requirements.calories - consumed.totalCalories;
  const proteinRemaining = requirements.protein - consumed.totalProtein;
  const carbsRemaining = requirements.carbs - consumed.totalCarbs;
  const fatRemaining = requirements.fat - consumed.totalFat;

  const caloriesProgress = Math.min((consumed.totalCalories / requirements.calories) * 100, 100);
  const proteinProgress = Math.min((consumed.totalProtein / requirements.protein) * 100, 100);
  const carbsProgress = Math.min((consumed.totalCarbs / requirements.carbs) * 100, 100);
  const fatProgress = Math.min((consumed.totalFat / requirements.fat) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Daily Requirements Overview */}
      <div className="card">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Today's Nutrition Goals</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Calories */}
          <div>
            <p className="text-sm text-text-tertiary mb-1">Calories</p>
            <p className="text-2xl font-bold text-text-primary">{consumed.totalCalories}</p>
            <p className="text-sm text-text-secondary">/ {requirements.calories} kcal</p>
            <div className="mt-2 h-2 bg-surface-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 transition-all"
                style={{ width: `${caloriesProgress}%` }}
              />
            </div>
            <p className="text-xs text-text-tertiary mt-1">
              {caloriesRemaining > 0 ? `${caloriesRemaining} remaining` : 'Goal reached!'}
            </p>
          </div>

          {/* Protein */}
          <div>
            <p className="text-sm text-text-tertiary mb-1">Protein</p>
            <p className="text-2xl font-bold text-text-primary">{Math.round(consumed.totalProtein)}</p>
            <p className="text-sm text-text-secondary">/ {requirements.protein}g</p>
            <div className="mt-2 h-2 bg-surface-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${proteinProgress}%` }}
              />
            </div>
            <p className="text-xs text-text-tertiary mt-1">
              {proteinRemaining > 0 ? `${Math.round(proteinRemaining)}g remaining` : 'Goal reached!'}
            </p>
          </div>

          {/* Carbs */}
          <div>
            <p className="text-sm text-text-tertiary mb-1">Carbs</p>
            <p className="text-2xl font-bold text-text-primary">{Math.round(consumed.totalCarbs)}</p>
            <p className="text-sm text-text-secondary">/ {requirements.carbs}g</p>
            <div className="mt-2 h-2 bg-surface-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${carbsProgress}%` }}
              />
            </div>
            <p className="text-xs text-text-tertiary mt-1">
              {carbsRemaining > 0 ? `${Math.round(carbsRemaining)}g remaining` : 'Goal reached!'}
            </p>
          </div>

          {/* Fat */}
          <div>
            <p className="text-sm text-text-tertiary mb-1">Fat</p>
            <p className="text-2xl font-bold text-text-primary">{Math.round(consumed.totalFat)}</p>
            <p className="text-sm text-text-secondary">/ {requirements.fat}g</p>
            <div className="mt-2 h-2 bg-surface-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500 transition-all"
                style={{ width: `${fatProgress}%` }}
              />
            </div>
            <p className="text-xs text-text-tertiary mt-1">
              {fatRemaining > 0 ? `${Math.round(fatRemaining)}g remaining` : 'Goal reached!'}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-text-tertiary">
              💡 Your daily requirements are calculated based on your profile and today's planned activities.
            </p>
            <button
              onClick={handleExplainGoals}
              disabled={isLoadingExplanation}
              className="text-xs px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 transition disabled:opacity-50 whitespace-nowrap"
            >
              {isLoadingExplanation ? 'Loading...' : showExplanation ? 'Hide Explanation' : '🤖 Explain My Goals'}
            </button>
          </div>

          {showExplanation && (
            <div className="p-3 rounded-lg bg-surface border border-primary-500/20 animate-in slide-in-from-top">
              {isLoadingExplanation ? (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <div className="animate-pulse">Generating explanation...</div>
                </div>
              ) : (
                <p className="text-sm text-text-secondary whitespace-pre-wrap">
                  {explanation}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Products by Meal Type */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Today's Food Log</h3>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsScanningFood(!isScanningFood);
                setIsAddingProduct(false);
              }}
              className="btn-secondary text-sm flex items-center gap-1"
            >
              📸 Scan Food
            </button>
            <button
              onClick={() => {
                setIsAddingProduct(!isAddingProduct);
                setIsScanningFood(false);
              }}
              className="btn-primary text-sm"
            >
              {isAddingProduct ? 'Cancel' : '+ Add Food'}
            </button>
          </div>
        </div>

        {/* Scan Food Modal */}
        {isScanningFood && (
          <FoodImageCapture
            userId={userId}
            onFoodDetected={handleAddProduct}
            onCancel={() => setIsScanningFood(false)}
            defaultMealType={defaultMealType}
          />
        )}

        {/* Add Product Form */}
        {isAddingProduct && (
          <div className="mb-6 p-4 rounded-lg bg-surface-elevated">
            <ProductSearch
              onSelectProduct={handleAddProduct}
              onCancel={() => setIsAddingProduct(false)}
              defaultMealType={defaultMealType}
            />
          </div>
        )}

        {/* Products Grouped by Meal Type */}
        <div className="space-y-6">
          {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((mealType) => {
            const products = productsByMealType[mealType];
            const mealCalories = products.reduce((sum, p) => sum + p.calories, 0);
            const mealProtein = products.reduce((sum, p) => sum + p.protein_grams, 0);
            const mealCarbs = products.reduce((sum, p) => sum + p.carbs_grams, 0);
            const mealFat = products.reduce((sum, p) => sum + p.fat_grams, 0);

            return (
              <div key={mealType} className="border-b border-surface-elevated last:border-0 pb-4 last:pb-0">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-text-primary capitalize flex items-center gap-2">
                      {mealType === 'breakfast' && '🌅'}
                      {mealType === 'lunch' && '🌞'}
                      {mealType === 'dinner' && '🌙'}
                      {mealType === 'snack' && '🍎'}
                      {mealType}
                    </h4>
                    {products.length > 0 && (
                      <p className="text-xs text-text-tertiary mt-1">
                        {mealCalories} kcal • P: {Math.round(mealProtein)}g • C: {Math.round(mealCarbs)}g • F: {Math.round(mealFat)}g
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setDefaultMealType(mealType);
                      setIsAddingProduct(true);
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-elevated text-text-secondary transition"
                  >
                    + Add
                  </button>
                </div>

                {products.length === 0 ? (
                  <p className="text-sm text-text-tertiary italic">No items logged yet</p>
                ) : (
                  <div className="space-y-2">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-start justify-between p-3 rounded-lg bg-surface hover:bg-surface-elevated transition"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-text-primary">
                              {product.name}
                            </span>
                            {product.product_brand && (
                              <span className="text-xs text-text-tertiary">
                                ({product.product_brand})
                              </span>
                            )}
                          </div>
                          <div className="flex gap-4 text-sm text-text-secondary">
                            <span>{product.calories} kcal</span>
                            <span>P: {Math.round(product.protein_grams)}g</span>
                            <span>C: {Math.round(product.carbs_grams)}g</span>
                            <span>F: {Math.round(product.fat_grams)}g</span>
                          </div>
                          {product.serving_size && (
                            <p className="text-xs text-text-tertiary mt-1">
                              {product.serving_size} {product.serving_unit || 'serving'}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => product.id && handleDeleteProduct(product.id)}
                          className="text-red-500 hover:text-red-600 text-sm ml-3"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {consumed.meals.length === 0 && !isAddingProduct && (
          <div className="text-center py-8 text-text-tertiary">
            <p>No food logged yet today.</p>
            <p className="text-sm mt-2">Click "+ Add Food" to start tracking your nutrition.</p>
          </div>
        )}
      </div>
    </div>
  );
}
