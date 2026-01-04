'use server';

import { getScheduledWorkouts, ScheduledWorkout } from './scheduled-workouts';
import { getActiveTemplate, WorkoutTemplate, TemplateDay } from './templates';

export interface CombinedDayWorkout {
  day: string; // ISO date string or day name
  day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  source: 'template' | 'scheduled';
  workout: TemplateDay | ScheduledWorkout;
}

// Get week start date from week number
function getWeekStartDate(week: number, year: number): string {
  const jan4 = new Date(year, 0, 4);
  const daysToAdd = (week - 1) * 7 - jan4.getDay() + 1;
  const weekStart = new Date(year, 0, 4 + daysToAdd);
  return weekStart.toISOString().split('T')[0];
}

// Get date range for a week
function getWeekDateRange(week: number, year: number): { startDate: string; endDate: string; dates: string[] } {
  const startDate = getWeekStartDate(week, year);
  const start = new Date(startDate);
  const dates: string[] = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }

  const endDate = dates[6];

  return { startDate, endDate, dates };
}

// Map date to day of week
function getDayOfWeek(dateString: string): 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' {
  const date = new Date(dateString);
  const days: Array<'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'> = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
}

// Get combined workouts for a week (scheduled workouts override templates)
export async function getWeekWorkouts(
  userId: string,
  week: number,
  year: number
): Promise<CombinedDayWorkout[]> {
  try {
    const { startDate, endDate, dates } = getWeekDateRange(week, year);

    // Fetch scheduled workouts for the week
    const scheduledWorkouts = await getScheduledWorkouts(userId, startDate, endDate);

    // Fetch active template for the week
    const activeTemplate = await getActiveTemplate(userId, startDate);

    // Create a map of scheduled workouts by day
    const scheduledByDay = new Map<string, ScheduledWorkout>();
    scheduledWorkouts.forEach(workout => {
      const dayOfWeek = getDayOfWeek(workout.workout_date);
      scheduledByDay.set(dayOfWeek, workout);
    });

    // Create combined workouts array in Monday-Sunday order
    const dayOrder: Array<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'> =
      ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    const combined: CombinedDayWorkout[] = [];

    dayOrder.forEach((dayOfWeek, index) => {
      const dateForDay = dates[(index + 1) % 7]; // Adjust for week starting on Monday

      // Check if there's a scheduled workout for this day
      if (scheduledByDay.has(dayOfWeek)) {
        const scheduledWorkout = scheduledByDay.get(dayOfWeek)!;
        combined.push({
          day: dateForDay,
          day_of_week: dayOfWeek,
          source: 'scheduled',
          workout: scheduledWorkout
        });
      }
      // Otherwise, check if there's a template workout
      else if (activeTemplate && activeTemplate.days) {
        const templateDay = activeTemplate.days.find(d => d.day_of_week === dayOfWeek);
        if (templateDay) {
          combined.push({
            day: dateForDay,
            day_of_week: dayOfWeek,
            source: 'template',
            workout: templateDay
          });
        }
      }
      // If neither, create a rest day placeholder
      else {
        combined.push({
          day: dateForDay,
          day_of_week: dayOfWeek,
          source: 'template',
          workout: {
            day_of_week: dayOfWeek,
            type: 'rest'
          } as TemplateDay
        });
      }
    });

    return combined;
  } catch (error) {
    console.error('[Plan Helpers] Error fetching week workouts:', error);
    return [];
  }
}
