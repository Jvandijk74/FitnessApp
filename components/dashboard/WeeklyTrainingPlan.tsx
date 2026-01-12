'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { getWeekWorkouts, CombinedDayWorkout } from '@/app/actions/plan-helpers';
import { ScheduledWorkout } from '@/app/actions/scheduled-workouts';
import { TemplateDay } from '@/app/actions/templates';

interface WeeklyTrainingPlanProps {
  userId: string;
}

export function WeeklyTrainingPlan({ userId }: WeeklyTrainingPlanProps) {
  const [workouts, setWorkouts] = useState<CombinedDayWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Prevent double-fetching in development strict mode
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    async function fetchWorkouts() {
      setLoading(true);
      try {
        // Calculate current week
        const now = new Date();
        console.log('[WeeklyTrainingPlan] 📅 Current date:', now.toISOString());
        console.log('[WeeklyTrainingPlan] 📅 Current date (local):', now.toString());

        const onejan = new Date(now.getFullYear(), 0, 1);
        const week = Math.ceil((((now.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
        const year = now.getFullYear();

        console.log('[WeeklyTrainingPlan] 🔢 Calculated week number:', week);
        console.log('[WeeklyTrainingPlan] 🔢 Year:', year);
        console.log('[WeeklyTrainingPlan] ⚙️  Calling getWeekWorkouts...');

        const data = await getWeekWorkouts(userId, week, year);

        console.log('[WeeklyTrainingPlan] ✅ Received', data.length, 'workouts');
        if (data.length > 0) {
          console.log('[WeeklyTrainingPlan] 📋 Workouts received:');
          data.forEach((w, i) => {
            console.log(`  ${i + 1}. ${w.day_of_week} (${w.day}) - ${(w.workout as any).name || 'Rest'} [source: ${w.source}]`);
          });
        } else {
          console.log('[WeeklyTrainingPlan] ⚠️  No workouts returned from server');
        }

        setWorkouts(data);
      } catch (error) {
        console.error('[WeeklyTrainingPlan] ❌ Error loading workouts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchWorkouts();
  }, [userId]);

  const dayLabels: Record<string, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  };

  const dayAbbrev: Record<string, string> = {
    monday: 'MON',
    tuesday: 'TUE',
    wednesday: 'WED',
    thursday: 'THU',
    friday: 'FRI',
    saturday: 'SAT',
    sunday: 'SUN',
  };

  const typeIcons = {
    strength: '💪',
    run: '🏃',
    rest: '😴'
  };

  const typeColors = {
    strength: 'bg-accent-500/10 border-accent-500/20',
    run: 'bg-primary-500/10 border-primary-500/20',
    rest: 'bg-surface-elevated/50 border-surface-elevated'
  };

  const getWeekDateString = () => {
    const now = new Date();
    const onejan = new Date(now.getFullYear(), 0, 1);
    const week = Math.ceil((((now.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
    const startDate = new Date(now.getFullYear(), 0, 1 + (week - 1) * 7);
    return `Week starting ${startDate.toISOString().split('T')[0]}`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-text-primary">Weekly Training Plan</h2>
        </div>
        <div className="text-center py-12">
          <p className="text-text-tertiary">Loading...</p>
        </div>
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Weekly Training Plan</h2>
            <p className="text-sm text-text-tertiary mt-1">{getWeekDateString()}</p>
          </div>
          <Link href="/create-training" className="btn-secondary text-sm">
            + Schedule Workout
          </Link>
        </div>
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-text-secondary mb-2">No workouts planned this week</p>
          <p className="text-text-tertiary text-sm">Create a training plan to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Weekly Training Plan</h2>
          <p className="text-sm text-text-tertiary mt-1">{getWeekDateString()}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/create-training?mode=schedule-workout" className="btn-secondary text-sm">
            + Schedule Workout
          </Link>
          <Link href="/plan" className="btn-primary text-sm">
            View This Week
          </Link>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {workouts.map((combinedWorkout) => {
            const isScheduled = combinedWorkout.source === 'scheduled';
            const scheduledWorkout = isScheduled ? (combinedWorkout.workout as ScheduledWorkout) : null;
            const templateDay = !isScheduled ? (combinedWorkout.workout as TemplateDay) : null;

            const workoutType = isScheduled ? scheduledWorkout!.workout_type : templateDay!.type;
            const workoutName = isScheduled ? scheduledWorkout!.name : '';
            const exercises = isScheduled ? scheduledWorkout!.exercises : templateDay!.exercises;
            const isCompleted = isScheduled ? scheduledWorkout!.completed : false;

            // Check if this is today
            const today = new Date().toISOString().split('T')[0];
            const isToday = combinedWorkout.day === today;

            // Run details (only available for scheduled workouts)
            const runDuration = isScheduled ? scheduledWorkout!.run_duration_minutes : undefined;
            const runDistance = isScheduled ? scheduledWorkout!.run_distance_km : undefined;
            const runIntensity = isScheduled ? scheduledWorkout!.run_intensity : undefined;
            const runRpe = isScheduled ? scheduledWorkout!.run_target_rpe : undefined;
            const runPace = isScheduled ? scheduledWorkout!.run_target_pace : undefined;

            return (
              <Link
                key={combinedWorkout.day}
                href="/plan"
                className="flex-none w-72 snap-start block"
              >
                <div className={`h-full p-5 rounded-xl border-2 transition-all hover:border-primary-500/50 cursor-pointer ${
                  isToday ? 'bg-primary-500/5 border-primary-500/30' : typeColors[workoutType]
                }`}>
                  {/* Day Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-xs font-medium text-text-tertiary uppercase tracking-wide">
                        {dayAbbrev[combinedWorkout.day_of_week]}
                      </div>
                      <div className="text-lg font-bold text-text-primary mt-0.5">
                        {dayLabels[combinedWorkout.day_of_week]}
                      </div>
                    </div>
                    <div className="text-3xl">
                      {typeIcons[workoutType]}
                    </div>
                  </div>

                  {/* Workout Content */}
                  <div className="space-y-3">
                    {/* Workout Title */}
                    <div>
                      <h3 className={`font-bold text-lg ${
                        workoutType === 'strength' ? 'text-accent-400' :
                        workoutType === 'run' ? 'text-primary-400' :
                        'text-text-secondary'
                      }`}>
                        {workoutName || (workoutType === 'strength' ? 'Strength' : workoutType === 'run' ? 'Easy Run' : 'Rest day')}
                      </h3>
                      {workoutType === 'rest' && (
                        <p className="text-sm text-text-tertiary mt-1">
                          Recovery
                        </p>
                      )}
                    </div>

                    {/* Run Details */}
                    {workoutType === 'run' && (
                      <div className="text-sm text-text-secondary space-y-1">
                        {runDuration && (
                          <p>{runDuration} min • RPE {runRpe || 6}</p>
                        )}
                        {runDistance && (
                          <p>{runDistance} km</p>
                        )}
                        {runIntensity && (
                          <p className="text-text-tertiary capitalize">{runIntensity}</p>
                        )}
                        {runPace && (
                          <p className="text-text-tertiary">Target: {runPace}</p>
                        )}
                      </div>
                    )}

                    {/* Strength Exercises */}
                    {workoutType === 'strength' && exercises && exercises.length > 0 && (
                      <div className="space-y-2">
                        {exercises.slice(0, 3).map((ex: any, i: number) => (
                          <div key={i} className="text-sm">
                            <p className="font-medium text-text-primary">{ex.exercise_name}</p>
                            <p className="text-text-tertiary text-xs">
                              {ex.sets}×{ex.reps}
                            </p>
                          </div>
                        ))}
                        {exercises.length > 3 && (
                          <p className="text-xs text-text-tertiary italic">
                            +{exercises.length - 3} more exercises
                          </p>
                        )}
                      </div>
                    )}

                    {/* Status */}
                    {isCompleted && (
                      <div className="pt-2 border-t border-surface-elevated">
                        <span className="text-xs text-semantic-success flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Completed
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Scroll indicator dots */}
        <div className="flex justify-center gap-2 mt-3">
          {workouts.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                const container = scrollContainerRef.current;
                if (container) {
                  const scrollWidth = container.scrollWidth;
                  const containerWidth = container.clientWidth;
                  const scrollPosition = (scrollWidth / workouts.length) * index;
                  container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
                }
              }}
              className="w-2 h-2 rounded-full bg-surface-elevated hover:bg-primary-500/50 transition-colors"
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
