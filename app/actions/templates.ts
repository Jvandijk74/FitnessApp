'use server';

import { getServerSupabase } from '@/lib/db/server-client';
import { TrainingDay } from '@/lib/db/types';

export interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  description: string;
}

export interface TemplateExercise {
  id?: string;
  exercise_id: string;
  exercise_name?: string;
  muscle_group?: string;
  sets: number;
  reps: string;
  tempo: string;
  rest: string;
  target_rpe?: string;
  target_rir?: string;
  notes?: string;
  order_index: number;
}

export interface TemplateDay {
  id?: string;
  day_of_week: TrainingDay;
  type: 'strength' | 'run' | 'rest';
  notes?: string;
  exercises?: TemplateExercise[];
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  days?: TemplateDay[];
}

// Get all exercises grouped by muscle group
export async function getExercises(): Promise<Record<string, Exercise[]>> {
  const supabase = await getServerSupabase();

  const { data: exercises, error } = await supabase
    .from('exercises')
    .select('*')
    .order('name');

  if (error) {
    console.error('[Templates] Error fetching exercises:', error);
    return {};
  }

  const grouped: Record<string, Exercise[]> = {};
  exercises?.forEach((exercise) => {
    if (!grouped[exercise.muscle_group]) {
      grouped[exercise.muscle_group] = [];
    }
    grouped[exercise.muscle_group].push(exercise);
  });

  return grouped;
}

// Get user's workout templates
export async function getUserTemplates(userId: string): Promise<WorkoutTemplate[]> {
  const supabase = await getServerSupabase();

  const { data: templates, error } = await supabase
    .from('workout_templates')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Templates] Error fetching templates:', error);
    return [];
  }

  return templates || [];
}

// Get template details with all days and exercises
export async function getTemplateDetails(templateId: string): Promise<WorkoutTemplate | null> {
  const supabase = await getServerSupabase();

  // Get template
  const { data: template, error: templateError } = await supabase
    .from('workout_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (templateError || !template) {
    console.error('[Templates] Error fetching template:', templateError);
    return null;
  }

  // Get days
  const { data: days, error: daysError } = await supabase
    .from('workout_template_days')
    .select('*')
    .eq('template_id', templateId)
    .order('day_of_week');

  if (daysError) {
    console.error('[Templates] Error fetching days:', daysError);
    return template;
  }

  // Get exercises for each day
  const daysWithExercises = await Promise.all(
    (days || []).map(async (day) => {
      const { data: exercises, error: exercisesError } = await supabase
        .from('workout_template_exercises')
        .select(`
          *,
          exercises (
            id,
            name,
            muscle_group
          )
        `)
        .eq('day_id', day.id)
        .order('order_index');

      if (exercisesError) {
        console.error('[Templates] Error fetching exercises:', exercisesError);
        return { ...day, exercises: [] };
      }

      const formattedExercises = exercises?.map((ex: any) => ({
        id: ex.id,
        exercise_id: ex.exercise_id,
        exercise_name: ex.exercises?.name,
        muscle_group: ex.exercises?.muscle_group,
        sets: ex.sets,
        reps: ex.reps,
        tempo: ex.tempo,
        rest: ex.rest,
        target_rpe: ex.target_rpe,
        target_rir: ex.target_rir,
        notes: ex.notes,
        order_index: ex.order_index
      })) || [];

      return {
        ...day,
        exercises: formattedExercises
      };
    })
  );

  return {
    ...template,
    days: daysWithExercises
  };
}

// Create a new workout template
export async function createWorkoutTemplate(payload: {
  user_id: string;
  name: string;
  description?: string;
  days: TemplateDay[];
}): Promise<{ success: boolean; template_id?: string; error?: string }> {
  const supabase = await getServerSupabase();

  try {
    // Create template
    const { data: template, error: templateError } = await supabase
      .from('workout_templates')
      .insert({
        user_id: payload.user_id,
        name: payload.name,
        description: payload.description
      })
      .select()
      .single();

    if (templateError || !template) {
      console.error('[Templates] Error creating template:', templateError);
      return { success: false, error: 'Failed to create template' };
    }

    // Create days
    for (const day of payload.days) {
      const { data: dayData, error: dayError } = await supabase
        .from('workout_template_days')
        .insert({
          template_id: template.id,
          day_of_week: day.day_of_week,
          type: day.type,
          notes: day.notes
        })
        .select()
        .single();

      if (dayError || !dayData) {
        console.error('[Templates] Error creating day:', dayError);
        continue;
      }

      // Create exercises for this day
      if (day.exercises && day.exercises.length > 0) {
        const exercises = day.exercises.map((ex) => ({
          day_id: dayData.id,
          exercise_id: ex.exercise_id,
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
          .from('workout_template_exercises')
          .insert(exercises);

        if (exercisesError) {
          console.error('[Templates] Error creating exercises:', exercisesError);
        }
      }
    }

    return { success: true, template_id: template.id };
  } catch (error) {
    console.error('[Templates] Exception creating template:', error);
    return { success: false, error: 'Failed to create template' };
  }
}

// Activate a template for a specific week
export async function activateTemplate(userId: string, templateId: string, weekStartDate: string): Promise<{ success: boolean }> {
  const supabase = await getServerSupabase();

  const { error } = await supabase
    .from('user_active_templates')
    .upsert({
      user_id: userId,
      template_id: templateId,
      week_start_date: weekStartDate
    });

  if (error) {
    console.error('[Templates] Error activating template:', error);
    return { success: false };
  }

  return { success: true };
}

// Get active template for a user in a specific week
export async function getActiveTemplate(userId: string, weekStartDate: string): Promise<WorkoutTemplate | null> {
  const supabase = await getServerSupabase();

  const { data: activeTemplate, error } = await supabase
    .from('user_active_templates')
    .select('template_id')
    .eq('user_id', userId)
    .eq('week_start_date', weekStartDate)
    .single();

  if (error || !activeTemplate) {
    return null;
  }

  return getTemplateDetails(activeTemplate.template_id);
}

// Clone template for consecutive weeks
export async function cloneTemplateForWeeks(
  userId: string,
  templateId: string,
  weekStartDates: string[]
): Promise<{ success: boolean; activated_count: number }> {
  const supabase = await getServerSupabase();

  let activatedCount = 0;

  for (const weekStartDate of weekStartDates) {
    const { error } = await supabase
      .from('user_active_templates')
      .upsert({
        user_id: userId,
        template_id: templateId,
        week_start_date: weekStartDate
      });

    if (!error) {
      activatedCount++;
    }
  }

  return { success: true, activated_count: activatedCount };
}

// Delete a workout template
export async function deleteWorkoutTemplate(templateId: string): Promise<{ success: boolean }> {
  const supabase = await getServerSupabase();

  const { error } = await supabase
    .from('workout_templates')
    .delete()
    .eq('id', templateId);

  if (error) {
    console.error('[Templates] Error deleting template:', error);
    return { success: false };
  }

  return { success: true };
}

// Calculate weekly muscle group volume for a template
export async function calculateTemplateVolume(template: WorkoutTemplate): Promise<Record<string, number>> {
  const muscleGroupSets: Record<string, number> = {};

  template.days?.forEach((day) => {
    if (day.type === 'strength' && day.exercises) {
      day.exercises.forEach((exercise) => {
        const muscleGroup = exercise.muscle_group || 'Other';
        if (!muscleGroupSets[muscleGroup]) {
          muscleGroupSets[muscleGroup] = 0;
        }
        muscleGroupSets[muscleGroup] += exercise.sets;
      });
    }
  });

  return muscleGroupSets;
}
