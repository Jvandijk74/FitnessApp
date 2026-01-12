'use server';

import { getServerSupabase } from '@/lib/db/server-client';
import { revalidatePath } from 'next/cache';

export interface ScheduledWorkoutExercise {
  id?: string;
  exercise_id: string;
  exercise_name: string;
  muscle_group?: string;
  sets: number;
  reps: string;
  tempo: string;
  rest: string;
  target_rpe?: string;
  target_rir?: string;
  notes?: string;
  order_index: number;
  logged_sets?: Array<{ weight: number; reps: number; rpe?: number; rir?: number }>;
  completed?: boolean;
}

export interface ScheduledWorkout {
  id?: string;
  user_id: string;
  workout_date: string;
  workout_type: 'strength' | 'run' | 'rest';
  name: string;
  description?: string;
  run_duration_minutes?: number;
  run_distance_km?: number;
  run_intensity?: string;
  run_target_pace?: string;
  run_target_rpe?: number;
  template_day_id?: string;
  completed?: boolean;
  completed_at?: string;
  ai_feedback?: string;
  exercises?: ScheduledWorkoutExercise[];
}

export interface DayTemplate {
  id?: string;
  user_id: string;
  name: string;
  description?: string;
  workout_type: 'strength' | 'run' | 'rest';
  run_duration_minutes?: number;
  run_distance_km?: number;
  run_intensity?: string;
  run_target_pace?: string;
  run_target_rpe?: number;
  is_favorite?: boolean;
  exercises?: ScheduledWorkoutExercise[];
}

// Create a scheduled workout for a specific date
export async function scheduleWorkout(workout: ScheduledWorkout) {
  try {
    console.log('[scheduleWorkout] ===== STARTING =====');
    console.log('[scheduleWorkout] Input workout:', {
      user_id: workout.user_id,
      workout_date: workout.workout_date,
      workout_type: workout.workout_type,
      name: workout.name,
      has_exercises: !!workout.exercises,
      exercise_count: workout.exercises?.length || 0
    });
    console.log('[scheduleWorkout] Full workout object:', JSON.stringify(workout, null, 2));

    const supabase = await getServerSupabase();

    // Prepare insert data
    const insertData = {
      user_id: workout.user_id,
      workout_date: workout.workout_date,
      workout_type: workout.workout_type,
      name: workout.name,
      description: workout.description,
      run_duration_minutes: workout.run_duration_minutes,
      run_distance_km: workout.run_distance_km,
      run_intensity: workout.run_intensity,
      run_target_pace: workout.run_target_pace,
      run_target_rpe: workout.run_target_rpe,
      template_day_id: workout.template_day_id
    };

    console.log('[scheduleWorkout] Inserting into scheduled_workouts table:', insertData);

    // Insert the workout
    const { data: workoutData, error: workoutError } = await supabase
      .from('scheduled_workouts')
      .insert(insertData)
      .select()
      .single();

    if (workoutError) {
      console.error('[scheduleWorkout] ERROR inserting workout!');
      console.error('[scheduleWorkout] Error code:', workoutError.code);
      console.error('[scheduleWorkout] Error message:', workoutError.message);
      console.error('[scheduleWorkout] Error details:', workoutError.details);
      console.error('[scheduleWorkout] Error hint:', workoutError.hint);
      console.error('[scheduleWorkout] Full error object:', JSON.stringify(workoutError, null, 2));
      throw workoutError;
    }

    console.log('[scheduleWorkout] ✅ Workout inserted successfully!');
    console.log('[scheduleWorkout] Returned workout data:', workoutData);
    console.log('[scheduleWorkout] Workout ID:', workoutData.id);
    console.log('[scheduleWorkout] Saved workout_date:', workoutData.workout_date);

    // Insert exercises if it's a strength workout
    if (workout.workout_type === 'strength' && workout.exercises && workout.exercises.length > 0) {
      console.log('[scheduleWorkout] Inserting', workout.exercises.length, 'exercises...');

      const exercisesData = workout.exercises.map(ex => ({
        scheduled_workout_id: workoutData.id,
        exercise_id: ex.exercise_id,
        exercise_name: ex.exercise_name,
        muscle_group: ex.muscle_group,
        sets: ex.sets,
        reps: ex.reps,
        tempo: ex.tempo,
        rest: ex.rest,
        target_rpe: ex.target_rpe,
        target_rir: ex.target_rir,
        notes: ex.notes,
        order_index: ex.order_index
      }));

      const { error: exercisesError } = await supabase
        .from('scheduled_workout_exercises')
        .insert(exercisesData);

      if (exercisesError) {
        console.error('[scheduleWorkout] ERROR inserting exercises!');
        console.error('[scheduleWorkout] Exercises error:', exercisesError);
        throw exercisesError;
      }

      console.log('[scheduleWorkout] ✅ Exercises inserted successfully');
    } else {
      console.log('[scheduleWorkout] No exercises to insert (not a strength workout or no exercises)');
    }

    console.log('[scheduleWorkout] Revalidating paths: /plan and /dashboard');
    revalidatePath('/plan');
    revalidatePath('/dashboard');

    console.log('[scheduleWorkout] ===== SUCCESS =====');
    console.log('[scheduleWorkout] Returning:', { success: true, workout_id: workoutData.id });

    return { success: true, workout_id: workoutData.id };
  } catch (error) {
    console.error('[scheduleWorkout] ===== EXCEPTION =====');
    console.error('[scheduleWorkout] Exception type:', error?.constructor?.name);
    console.error('[scheduleWorkout] Exception message:', error instanceof Error ? error.message : 'Unknown');
    console.error('[scheduleWorkout] Exception stack:', error instanceof Error ? error.stack : undefined);
    console.error('[scheduleWorkout] Full exception:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Get scheduled workouts for a date range
export async function getScheduledWorkouts(userId: string, startDate: string, endDate: string): Promise<ScheduledWorkout[]> {
  try {
    console.log('[getScheduledWorkouts] ===== STARTING =====');
    console.log('[getScheduledWorkouts] Query params:', { userId, startDate, endDate });
    console.log('[getScheduledWorkouts] Date types:', {
      startDate: typeof startDate,
      endDate: typeof endDate
    });

    const supabase = await getServerSupabase();

    console.log('[getScheduledWorkouts] Executing query with filters:');
    console.log('  - user_id =', userId);
    console.log('  - workout_date >=', startDate);
    console.log('  - workout_date <=', endDate);

    const { data: workouts, error } = await supabase
      .from('scheduled_workouts')
      .select('*')
      .eq('user_id', userId)
      .gte('workout_date', startDate)
      .lte('workout_date', endDate)
      .order('workout_date');

    if (error) {
      console.error('[getScheduledWorkouts] ERROR fetching workouts!');
      console.error('[getScheduledWorkouts] Error code:', error.code);
      console.error('[getScheduledWorkouts] Error message:', error.message);
      console.error('[getScheduledWorkouts] Error details:', error.details);
      console.error('[getScheduledWorkouts] Full error:', JSON.stringify(error, null, 2));
      return [];
    }

    console.log('[getScheduledWorkouts] Query returned', workouts?.length || 0, 'workouts');

    if (workouts && workouts.length > 0) {
      console.log('[getScheduledWorkouts] Found workouts:');
      workouts.forEach((w, i) => {
        console.log(`  ${i + 1}. "${w.name}" on ${w.workout_date} (ID: ${w.id})`);
      });
    } else {
      console.log('[getScheduledWorkouts] ⚠️  NO WORKOUTS FOUND in date range!');
      console.log('[getScheduledWorkouts] Double-checking: querying all workouts for this user...');

      // Debug query: get ALL workouts for this user to see what dates exist
      const { data: allWorkouts } = await supabase
        .from('scheduled_workouts')
        .select('id, name, workout_date')
        .eq('user_id', userId)
        .order('workout_date');

      if (allWorkouts && allWorkouts.length > 0) {
        console.log('[getScheduledWorkouts] 🔍 User HAS scheduled workouts in database:');
        allWorkouts.forEach((w, i) => {
          console.log(`  ${i + 1}. "${w.name}" on ${w.workout_date} (ID: ${w.id})`);
        });
        console.log('[getScheduledWorkouts] ⚠️  But NONE fall within date range', startDate, 'to', endDate);
      } else {
        console.log('[getScheduledWorkouts] User has NO scheduled workouts at all in database');
      }
    }

    // Fetch exercises for each workout
    console.log('[getScheduledWorkouts] Fetching exercises for strength workouts...');
    const workoutsWithExercises = await Promise.all(
      (workouts || []).map(async (workout) => {
        if (workout.workout_type === 'strength') {
          const { data: exercises } = await supabase
            .from('scheduled_workout_exercises')
            .select('*')
            .eq('scheduled_workout_id', workout.id)
            .order('order_index');

          console.log(`[getScheduledWorkouts] Workout "${workout.name}" has ${exercises?.length || 0} exercises`);
          return { ...workout, exercises: exercises || [] };
        }
        return workout;
      })
    );

    console.log('[getScheduledWorkouts] ===== COMPLETE =====');
    console.log('[getScheduledWorkouts] Returning', workoutsWithExercises.length, 'workouts');

    return workoutsWithExercises;
  } catch (error) {
    console.error('[getScheduledWorkouts] ===== EXCEPTION =====');
    console.error('[getScheduledWorkouts] Exception:', error);
    console.error('[getScheduledWorkouts] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined
    });
    return [];
  }
}

// Get a single scheduled workout with details
export async function getScheduledWorkout(workoutId: string): Promise<ScheduledWorkout | null> {
  try {
    const supabase = await getServerSupabase();

    const { data: workout, error } = await supabase
      .from('scheduled_workouts')
      .select('*')
      .eq('id', workoutId)
      .single();

    if (error || !workout) {
      console.error('[Scheduled Workouts] Error fetching workout:', error);
      return null;
    }

    // Fetch exercises if it's a strength workout
    if (workout.workout_type === 'strength') {
      const { data: exercises } = await supabase
        .from('scheduled_workout_exercises')
        .select('*')
        .eq('scheduled_workout_id', workoutId)
        .order('order_index');

      workout.exercises = exercises || [];
    }

    return workout;
  } catch (error) {
    console.error('[Scheduled Workouts] Exception:', error);
    return null;
  }
}

// Complete a workout and generate AI feedback
export async function completeWorkout(workoutId: string, userId: string) {
  try {
    const supabase = await getServerSupabase();

    // Get the workout details
    const workout = await getScheduledWorkout(workoutId);
    if (!workout) {
      throw new Error('Workout not found');
    }

    // Mark as completed
    const { error: updateError } = await supabase
      .from('scheduled_workouts')
      .update({
        completed: true,
        completed_at: new Date().toISOString()
      })
      .eq('id', workoutId);

    if (updateError) throw updateError;

    // Generate AI feedback
    const feedback = await generateAIFeedback(workout);

    // Save AI feedback
    const { error: feedbackError } = await supabase
      .from('scheduled_workouts')
      .update({
        ai_feedback: feedback,
        ai_feedback_generated_at: new Date().toISOString()
      })
      .eq('id', workoutId);

    if (feedbackError) throw feedbackError;

    // Track progress
    if (workout.workout_type === 'strength' && workout.exercises) {
      await trackWorkoutProgress(userId, workout);
    }

    revalidatePath('/plan');
    revalidatePath('/dashboard');

    return { success: true, feedback };
  } catch (error) {
    console.error('[Scheduled Workouts] Error completing workout:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Generate AI coaching feedback based on workout performance
async function generateAIFeedback(workout: ScheduledWorkout): Promise<string> {
  // Calculate performance metrics
  if (workout.workout_type === 'strength' && workout.exercises) {
    const completedExercises = workout.exercises.filter(ex => ex.completed).length;
    const totalExercises = workout.exercises.length;
    const completionRate = (completedExercises / totalExercises) * 100;

    let totalVolume = 0;
    let totalSets = 0;
    let avgRPE = 0;
    let rpeCount = 0;

    workout.exercises.forEach(ex => {
      if (ex.logged_sets) {
        ex.logged_sets.forEach(set => {
          totalVolume += set.weight * set.reps;
          totalSets++;
          if (set.rpe) {
            avgRPE += set.rpe;
            rpeCount++;
          }
        });
      }
    });

    avgRPE = rpeCount > 0 ? avgRPE / rpeCount : 0;

    // Generate personalized feedback
    let feedback = `Great job completing ${completionRate.toFixed(0)}% of your planned workout! `;

    if (completionRate === 100) {
      feedback += `You completed all ${totalExercises} exercises. `;
    }

    feedback += `\n\n📊 **Performance Summary:**\n`;
    feedback += `- Total Volume: ${totalVolume.toFixed(0)} kg\n`;
    feedback += `- Total Sets: ${totalSets}\n`;
    if (avgRPE > 0) {
      feedback += `- Average RPE: ${avgRPE.toFixed(1)}/10\n`;
    }

    feedback += `\n💪 **Coaching Insights:**\n`;

    if (avgRPE >= 8) {
      feedback += `- You pushed hard today with an average RPE of ${avgRPE.toFixed(1)}. Make sure to prioritize recovery before your next session.\n`;
    } else if (avgRPE >= 6 && avgRPE < 8) {
      feedback += `- Good intensity management! Your RPE of ${avgRPE.toFixed(1)} suggests sustainable training.\n`;
    } else if (avgRPE > 0) {
      feedback += `- Your RPE was relatively low at ${avgRPE.toFixed(1)}. Consider increasing intensity if you're feeling recovered.\n`;
    }

    if (completionRate < 80) {
      feedback += `- You completed ${completionRate.toFixed(0)}% of planned exercises. If this is due to fatigue, consider adjusting volume or intensity next time.\n`;
    }

    feedback += `\n🎯 **Next Steps:**\n`;
    feedback += `- Monitor recovery over the next 24-48 hours\n`;
    feedback += `- Stay hydrated and prioritize protein intake\n`;
    feedback += `- Review your progress to identify strength gains\n`;

    return feedback;
  } else if (workout.workout_type === 'run') {
    let feedback = `Nice work on your run! `;

    if (workout.run_duration_minutes) {
      feedback += `You completed ${workout.run_duration_minutes} minutes. `;
    }

    feedback += `\n\n🏃 **Run Summary:**\n`;
    if (workout.run_distance_km) {
      feedback += `- Distance: ${workout.run_distance_km} km\n`;
    }
    if (workout.run_intensity) {
      feedback += `- Intensity: ${workout.run_intensity}\n`;
    }
    if (workout.run_target_rpe) {
      feedback += `- Target RPE: ${workout.run_target_rpe}/10\n`;
    }

    feedback += `\n💡 **Recovery Tips:**\n`;
    feedback += `- Stretch and foam roll post-run\n`;
    feedback += `- Monitor your heart rate variability tomorrow\n`;
    feedback += `- Easy pace for recovery runs this week\n`;

    return feedback;
  }

  return 'Great work on completing your workout! Keep up the consistency.';
}

// Track progress for repeated workouts
async function trackWorkoutProgress(userId: string, workout: ScheduledWorkout) {
  try {
    const supabase = await getServerSupabase();

    let totalVolume = 0;
    let totalRPE = 0;
    let rpeCount = 0;

    workout.exercises?.forEach(ex => {
      ex.logged_sets?.forEach(set => {
        totalVolume += set.weight * set.reps;
        if (set.rpe) {
          totalRPE += set.rpe;
          rpeCount++;
        }
      });
    });

    const avgRPE = rpeCount > 0 ? totalRPE / rpeCount : 0;

    await supabase.from('workout_progress').insert({
      user_id: userId,
      workout_name: workout.name,
      completed_date: workout.workout_date,
      total_volume: totalVolume,
      average_rpe: avgRPE,
      duration_minutes: workout.run_duration_minutes
    });

    console.log('[Scheduled Workouts] Progress tracked for:', workout.name);
  } catch (error) {
    console.error('[Scheduled Workouts] Error tracking progress:', error);
  }
}

// ============ DAY TEMPLATES ============

// Create a day template
export async function createDayTemplate(template: DayTemplate) {
  try {
    console.log('[Day Templates] Creating template:', template.name);
    const supabase = await getServerSupabase();

    const { data: templateData, error: templateError } = await supabase
      .from('day_templates')
      .insert({
        user_id: template.user_id,
        name: template.name,
        description: template.description,
        workout_type: template.workout_type,
        run_duration_minutes: template.run_duration_minutes,
        run_distance_km: template.run_distance_km,
        run_intensity: template.run_intensity,
        run_target_pace: template.run_target_pace,
        run_target_rpe: template.run_target_rpe,
        is_favorite: template.is_favorite || false
      })
      .select()
      .single();

    if (templateError) throw templateError;

    // Insert exercises if it's a strength template
    if (template.workout_type === 'strength' && template.exercises && template.exercises.length > 0) {
      const exercisesData = template.exercises.map(ex => ({
        day_template_id: templateData.id,
        exercise_id: ex.exercise_id,
        exercise_name: ex.exercise_name,
        muscle_group: ex.muscle_group,
        sets: ex.sets,
        reps: ex.reps,
        tempo: ex.tempo,
        rest: ex.rest,
        target_rpe: ex.target_rpe,
        target_rir: ex.target_rir,
        notes: ex.notes,
        order_index: ex.order_index
      }));

      const { error: exercisesError } = await supabase
        .from('day_template_exercises')
        .insert(exercisesData);

      if (exercisesError) throw exercisesError;
    }

    console.log('[Day Templates] Template created:', templateData.id);
    return { success: true, template_id: templateData.id };
  } catch (error) {
    console.error('[Day Templates] Error creating template:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Get all day templates for a user
export async function getDayTemplates(userId: string): Promise<DayTemplate[]> {
  try {
    const supabase = await getServerSupabase();

    const { data: templates, error } = await supabase
      .from('day_templates')
      .select('*')
      .eq('user_id', userId)
      .order('is_favorite', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Day Templates] Error fetching templates:', error);
      return [];
    }

    // Fetch exercises for each template
    const templatesWithExercises = await Promise.all(
      (templates || []).map(async (template) => {
        if (template.workout_type === 'strength') {
          const { data: exercises } = await supabase
            .from('day_template_exercises')
            .select('*')
            .eq('day_template_id', template.id)
            .order('order_index');

          return { ...template, exercises: exercises || [] };
        }
        return template;
      })
    );

    return templatesWithExercises;
  } catch (error) {
    console.error('[Day Templates] Error:', error);
    return [];
  }
}

// Schedule a workout from a template
export async function scheduleFromTemplate(
  userId: string,
  templateId: string,
  workoutDate: string
) {
  try {
    console.log('[scheduleFromTemplate] ===== STARTING =====');
    console.log('[scheduleFromTemplate] Input params:', { userId, templateId, workoutDate });
    console.log('[scheduleFromTemplate] Date type:', typeof workoutDate);
    console.log('[scheduleFromTemplate] Date value:', workoutDate);

    const supabase = await getServerSupabase();

    // Check if a workout already exists for this date
    console.log('[scheduleFromTemplate] Checking for existing workout on', workoutDate);
    const { data: existingWorkout } = await supabase
      .from('scheduled_workouts')
      .select('id')
      .eq('user_id', userId)
      .eq('workout_date', workoutDate)
      .single();

    // If a workout exists, delete it first
    if (existingWorkout) {
      console.log('[scheduleFromTemplate] Found existing workout, deleting:', existingWorkout.id);
      await supabase
        .from('scheduled_workouts')
        .delete()
        .eq('id', existingWorkout.id);
    } else {
      console.log('[scheduleFromTemplate] No existing workout found for this date');
    }

    // Get the template
    console.log('[scheduleFromTemplate] Fetching template:', templateId);
    const { data: template, error: templateError } = await supabase
      .from('day_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError || !template) {
      console.error('[scheduleFromTemplate] Template not found!', templateError);
      throw new Error('Template not found');
    }

    console.log('[scheduleFromTemplate] Template found:', {
      name: template.name,
      type: template.workout_type
    });

    // Get exercises if it's a strength template
    let exercises: ScheduledWorkoutExercise[] = [];
    if (template.workout_type === 'strength') {
      console.log('[scheduleFromTemplate] Fetching template exercises...');
      const { data: templateExercises, error: exError } = await supabase
        .from('day_template_exercises')
        .select('*')
        .eq('day_template_id', templateId)
        .order('order_index');

      if (!exError && templateExercises) {
        exercises = templateExercises;
        console.log('[scheduleFromTemplate] Found', exercises.length, 'exercises');
      } else {
        console.log('[scheduleFromTemplate] No exercises found or error:', exError);
      }
    }

    // Schedule the workout
    const workout: ScheduledWorkout = {
      user_id: userId,
      workout_date: workoutDate,
      workout_type: template.workout_type,
      name: template.name,
      description: template.description,
      run_duration_minutes: template.run_duration_minutes,
      run_distance_km: template.run_distance_km,
      run_intensity: template.run_intensity,
      run_target_pace: template.run_target_pace,
      run_target_rpe: template.run_target_rpe,
      exercises
    };

    console.log('[scheduleFromTemplate] Workout object prepared:', {
      user_id: workout.user_id,
      workout_date: workout.workout_date,
      workout_type: workout.workout_type,
      name: workout.name,
      exercise_count: exercises.length
    });

    console.log('[scheduleFromTemplate] Calling scheduleWorkout()...');
    const result = await scheduleWorkout(workout);

    console.log('[scheduleFromTemplate] scheduleWorkout() returned:', result);
    console.log('[scheduleFromTemplate] ===== COMPLETE =====');

    return result;
  } catch (error) {
    console.error('[scheduleFromTemplate] ===== ERROR =====');
    console.error('[scheduleFromTemplate] Exception:', error);
    console.error('[scheduleFromTemplate] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined
    });
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Delete a scheduled workout
export async function deleteScheduledWorkout(workoutId: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[Scheduled Workouts] Deleting scheduled workout:', workoutId);
    const supabase = await getServerSupabase();

    const { error } = await supabase
      .from('scheduled_workouts')
      .delete()
      .eq('id', workoutId);

    if (error) {
      console.error('[Scheduled Workouts] Error deleting workout:', error);
      return { success: false, error: error.message };
    }

    console.log('[Scheduled Workouts] Workout deleted successfully');
    revalidatePath('/plan');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('[Scheduled Workouts] Exception deleting workout:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Delete a day template
export async function deleteDayTemplate(templateId: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[Day Templates] Deleting template:', templateId);
    const supabase = await getServerSupabase();

    const { error } = await supabase
      .from('day_templates')
      .delete()
      .eq('id', templateId);

    if (error) {
      console.error('[Day Templates] Error deleting template:', error);
      return { success: false, error: error.message };
    }

    console.log('[Day Templates] Template deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('[Day Templates] Exception deleting template:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Update a day template
export async function updateDayTemplate(templateId: string, template: Partial<DayTemplate>): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[Day Templates] Updating template:', templateId);
    const supabase = await getServerSupabase();

    // Update template basic info
    const updateData: any = {};
    if (template.name !== undefined) updateData.name = template.name;
    if (template.description !== undefined) updateData.description = template.description;
    if (template.workout_type !== undefined) updateData.workout_type = template.workout_type;
    if (template.run_duration_minutes !== undefined) updateData.run_duration_minutes = template.run_duration_minutes;
    if (template.run_distance_km !== undefined) updateData.run_distance_km = template.run_distance_km;
    if (template.run_intensity !== undefined) updateData.run_intensity = template.run_intensity;
    if (template.run_target_pace !== undefined) updateData.run_target_pace = template.run_target_pace;
    if (template.run_target_rpe !== undefined) updateData.run_target_rpe = template.run_target_rpe;
    if (template.is_favorite !== undefined) updateData.is_favorite = template.is_favorite;

    const { error: updateError } = await supabase
      .from('day_templates')
      .update(updateData)
      .eq('id', templateId);

    if (updateError) {
      console.error('[Day Templates] Error updating template:', updateError);
      return { success: false, error: updateError.message };
    }

    // Update exercises if provided
    if (template.exercises !== undefined) {
      // Delete existing exercises
      await supabase
        .from('day_template_exercises')
        .delete()
        .eq('day_template_id', templateId);

      // Insert new exercises
      if (template.exercises.length > 0) {
        const exercisesData = template.exercises.map(ex => ({
          day_template_id: templateId,
          exercise_id: ex.exercise_id,
          exercise_name: ex.exercise_name,
          muscle_group: ex.muscle_group,
          sets: ex.sets,
          reps: ex.reps,
          tempo: ex.tempo,
          rest: ex.rest,
          target_rpe: ex.target_rpe,
          target_rir: ex.target_rir,
          notes: ex.notes,
          order_index: ex.order_index
        }));

        const { error: exercisesError } = await supabase
          .from('day_template_exercises')
          .insert(exercisesData);

        if (exercisesError) {
          console.error('[Day Templates] Error updating exercises:', exercisesError);
          return { success: false, error: exercisesError.message };
        }
      }
    }

    console.log('[Day Templates] Template updated successfully');
    return { success: true };
  } catch (error) {
    console.error('[Day Templates] Exception updating template:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
