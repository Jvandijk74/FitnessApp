'use server';

import { getServerSupabase } from '@/lib/db/server-client';
import { NutritionGoal, NutritionLog, User } from '@/lib/db/types';

/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
 * For men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
 * For women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
 */
export async function calculateBMR(userId: string): Promise<number | null> {
  const supabase = await getServerSupabase();

  const { data: user, error } = await supabase
    .from('users')
    .select('age, weight_kg, height_cm, gender')
    .eq('id', userId)
    .single();

  if (error || !user || !user.age || !user.weight_kg || !user.height_cm) {
    return null;
  }

  const { age, weight_kg, height_cm, gender } = user;

  const baseBMR = (10 * weight_kg) + (6.25 * height_cm) - (5 * age);

  if (gender === 'male') {
    return baseBMR + 5;
  } else if (gender === 'female') {
    return baseBMR - 161;
  } else {
    // For 'other', use average of male and female
    return baseBMR - 78;
  }
}

/**
 * Get activity multiplier based on planned workouts for a specific day
 * This looks at scheduled workouts to determine activity level
 */
export async function getDailyActivityMultiplier(userId: string, date: string): Promise<number> {
  const supabase = await getServerSupabase();

  // Get scheduled workouts for the day
  const { data: workouts, error } = await supabase
    .from('scheduled_workouts')
    .select('workout_type, run_duration_minutes, run_intensity')
    .eq('user_id', userId)
    .eq('workout_date', date)
    .eq('completed', false);

  if (error || !workouts || workouts.length === 0) {
    return 1.2; // Sedentary - no workouts planned
  }

  let multiplier = 1.2; // Start with sedentary baseline

  for (const workout of workouts) {
    if (workout.workout_type === 'strength') {
      multiplier += 0.15; // Add for strength training
    } else if (workout.workout_type === 'run') {
      const duration = workout.run_duration_minutes || 30;
      const intensity = workout.run_intensity || 'easy';

      if (duration >= 60) {
        multiplier += 0.25; // Long run
      } else if (duration >= 40) {
        multiplier += 0.15; // Medium run
      } else {
        multiplier += 0.10; // Short run
      }

      // Additional intensity bonus
      if (intensity.toLowerCase().includes('tempo') || intensity.toLowerCase().includes('threshold')) {
        multiplier += 0.05;
      } else if (intensity.toLowerCase().includes('interval') || intensity.toLowerCase().includes('speed')) {
        multiplier += 0.08;
      }
    }
  }

  return Math.min(multiplier, 1.9); // Cap at very active
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE) for a specific day
 * TDEE = BMR × Activity Multiplier
 */
export async function calculateDailyTDEE(userId: string, date: string): Promise<number | null> {
  const bmr = await calculateBMR(userId);
  if (!bmr) return null;

  const activityMultiplier = await getDailyActivityMultiplier(userId, date);
  return Math.round(bmr * activityMultiplier);
}

/**
 * Calculate recommended macronutrients based on TDEE
 * Protein: 2g per kg bodyweight for active individuals
 * Fat: 25-30% of total calories
 * Carbs: Remaining calories
 */
export async function calculateMacros(userId: string, date: string) {
  const supabase = await getServerSupabase();

  const tdee = await calculateDailyTDEE(userId, date);
  if (!tdee) return null;

  const { data: user } = await supabase
    .from('users')
    .select('weight_kg')
    .eq('id', userId)
    .single();

  if (!user || !user.weight_kg) return null;

  // Protein: 2g per kg bodyweight (for active individuals)
  const proteinGrams = Math.round(user.weight_kg * 2);
  const proteinCalories = proteinGrams * 4;

  // Fat: 28% of total calories (middle of 25-30% range)
  const fatCalories = Math.round(tdee * 0.28);
  const fatGrams = Math.round(fatCalories / 9);

  // Carbs: Remaining calories
  const carbCalories = tdee - proteinCalories - fatCalories;
  const carbGrams = Math.round(carbCalories / 4);

  return {
    calories: tdee,
    protein: proteinGrams,
    carbs: carbGrams,
    fat: fatGrams,
  };
}

/**
 * Get or create nutrition goals for a user
 */
export async function getNutritionGoals(userId: string): Promise<NutritionGoal | null> {
  const supabase = await getServerSupabase();

  const { data, error } = await supabase
    .from('nutrition_goals')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = not found
    console.error('Error fetching nutrition goals:', error);
    return null;
  }

  return data;
}

/**
 * Set or update nutrition goals for a user
 */
export async function setNutritionGoals(
  userId: string,
  goals: Omit<NutritionGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<NutritionGoal | null> {
  const supabase = await getServerSupabase();

  const { data, error } = await supabase
    .from('nutrition_goals')
    .upsert({
      user_id: userId,
      ...goals,
    }, {
      onConflict: 'user_id',
    })
    .select()
    .single();

  if (error) {
    console.error('Error setting nutrition goals:', error);
    return null;
  }

  return data;
}

/**
 * Log a meal
 */
export async function logMeal(meal: Omit<NutritionLog, 'id' | 'created_at'>): Promise<NutritionLog | null> {
  const supabase = await getServerSupabase();

  const { data, error } = await supabase
    .from('nutrition_logs')
    .insert(meal)
    .select()
    .single();

  if (error) {
    console.error('Error logging meal:', error);
    return null;
  }

  return data;
}

/**
 * Get all meals for a specific date
 */
export async function getMealsForDate(userId: string, date: string): Promise<NutritionLog[]> {
  const supabase = await getServerSupabase();

  const { data, error } = await supabase
    .from('nutrition_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('log_date', date)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching meals:', error);
    return [];
  }

  return data || [];
}

/**
 * Get daily nutrition summary for a specific date
 */
export async function getDailyNutritionSummary(userId: string, date: string) {
  const meals = await getMealsForDate(userId, date);

  const summary = meals.reduce(
    (acc, meal) => ({
      totalCalories: acc.totalCalories + meal.calories,
      totalProtein: acc.totalProtein + meal.protein_grams,
      totalCarbs: acc.totalCarbs + meal.carbs_grams,
      totalFat: acc.totalFat + meal.fat_grams,
    }),
    {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
    }
  );

  return {
    date,
    ...summary,
    meals,
  };
}

/**
 * Delete a meal log
 */
export async function deleteMeal(mealId: string): Promise<boolean> {
  const supabase = await getServerSupabase();

  const { error } = await supabase
    .from('nutrition_logs')
    .delete()
    .eq('id', mealId);

  if (error) {
    console.error('Error deleting meal:', error);
    return false;
  }

  return true;
}

/**
 * Get user profile for nutrition calculations
 */
export async function getUserProfile(userId: string): Promise<User | null> {
  const supabase = await getServerSupabase();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<User, 'age' | 'weight_kg' | 'height_cm' | 'gender' | 'activity_level'>>
): Promise<User | null> {
  const supabase = await getServerSupabase();

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    return null;
  }

  return data;
}
