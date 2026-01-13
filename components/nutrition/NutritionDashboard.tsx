'use client';

import { useState } from 'react';
import { NutritionLog } from '@/lib/db/types';
import { logMeal, deleteMeal } from '@/app/actions/nutrition';
import { useRouter } from 'next/navigation';

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
}

export function NutritionDashboard({ userId, date, requirements, summary }: NutritionDashboardProps) {
  const router = useRouter();
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [mealForm, setMealForm] = useState({
    meal_type: 'breakfast' as 'breakfast' | 'lunch' | 'dinner' | 'snack',
    meal_name: '',
    calories: '',
    protein_grams: '',
    carbs_grams: '',
    fat_grams: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await logMeal({
        user_id: userId,
        log_date: date,
        meal_type: mealForm.meal_type,
        meal_name: mealForm.meal_name,
        calories: parseInt(mealForm.calories),
        protein_grams: parseFloat(mealForm.protein_grams),
        carbs_grams: parseFloat(mealForm.carbs_grams),
        fat_grams: parseFloat(mealForm.fat_grams),
      });

      // Reset form
      setMealForm({
        meal_type: 'breakfast',
        meal_name: '',
        calories: '',
        protein_grams: '',
        carbs_grams: '',
        fat_grams: '',
      });
      setIsAddingMeal(false);

      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error('Error logging meal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (!confirm('Are you sure you want to delete this meal?')) return;

    try {
      await deleteMeal(mealId);
      router.refresh();
    } catch (error) {
      console.error('Error deleting meal:', error);
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

        <div className="mt-4 p-3 rounded-lg bg-surface-elevated">
          <p className="text-xs text-text-tertiary">
            💡 Your daily requirements are calculated based on your profile and today's planned activities.
            Higher activity days will show increased calorie and carb targets.
          </p>
        </div>
      </div>

      {/* Meal Log */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Today's Meals</h3>
          <button
            onClick={() => setIsAddingMeal(!isAddingMeal)}
            className="btn-primary text-sm"
          >
            {isAddingMeal ? 'Cancel' : '+ Add Meal'}
          </button>
        </div>

        {/* Add Meal Form */}
        {isAddingMeal && (
          <form onSubmit={handleSubmitMeal} className="mb-6 p-4 rounded-lg bg-surface-elevated">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Meal Type
                </label>
                <select
                  value={mealForm.meal_type}
                  onChange={(e) => setMealForm({ ...mealForm, meal_type: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg border border-surface-elevated bg-surface text-text-primary focus:outline-none focus:border-primary-500"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Meal Name
                </label>
                <input
                  type="text"
                  required
                  value={mealForm.meal_name}
                  onChange={(e) => setMealForm({ ...mealForm, meal_name: e.target.value })}
                  placeholder="e.g., Oatmeal with berries"
                  className="w-full px-4 py-2 rounded-lg border border-surface-elevated bg-surface text-text-primary focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Calories
                </label>
                <input
                  type="number"
                  required
                  value={mealForm.calories}
                  onChange={(e) => setMealForm({ ...mealForm, calories: e.target.value })}
                  placeholder="e.g., 350"
                  className="w-full px-4 py-2 rounded-lg border border-surface-elevated bg-surface text-text-primary focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Protein (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={mealForm.protein_grams}
                  onChange={(e) => setMealForm({ ...mealForm, protein_grams: e.target.value })}
                  placeholder="e.g., 15"
                  className="w-full px-4 py-2 rounded-lg border border-surface-elevated bg-surface text-text-primary focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={mealForm.carbs_grams}
                  onChange={(e) => setMealForm({ ...mealForm, carbs_grams: e.target.value })}
                  placeholder="e.g., 45"
                  className="w-full px-4 py-2 rounded-lg border border-surface-elevated bg-surface text-text-primary focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Fat (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={mealForm.fat_grams}
                  onChange={(e) => setMealForm({ ...mealForm, fat_grams: e.target.value })}
                  placeholder="e.g., 8"
                  className="w-full px-4 py-2 rounded-lg border border-surface-elevated bg-surface text-text-primary focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Meal'}
            </button>
          </form>
        )}

        {/* Meals List */}
        {consumed.meals.length === 0 ? (
          <div className="text-center py-8 text-text-tertiary">
            <p>No meals logged yet today.</p>
            <p className="text-sm mt-2">Click "Add Meal" to start tracking your nutrition.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {consumed.meals.map((meal) => (
              <div
                key={meal.id}
                className="flex items-start justify-between p-4 rounded-lg bg-surface-elevated"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-text-tertiary uppercase">
                      {meal.meal_type}
                    </span>
                    <span className="text-sm font-semibold text-text-primary">
                      {meal.meal_name}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-text-secondary">
                    <span>{meal.calories} kcal</span>
                    <span>P: {Math.round(meal.protein_grams)}g</span>
                    <span>C: {Math.round(meal.carbs_grams)}g</span>
                    <span>F: {Math.round(meal.fat_grams)}g</span>
                  </div>
                </div>
                <button
                  onClick={() => meal.id && handleDeleteMeal(meal.id)}
                  className="text-red-500 hover:text-red-600 text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
