'use client';

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    loadWorkouts();
  }, [userId]);

  async function loadWorkouts() {
    setLoading(true);
    try {
      const now = new Date();
      const onejan = new Date(now.getFullYear(), 0, 1);
      const week = Math.ceil((((now.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
      const year = now.getFullYear();

      const data = await getWeekWorkouts(userId, week, year);
      setWorkouts(data);
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setLoading(false);
    }
  }

  const dayLabels: Record<string, string> = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun',
  };

  const typeIcons = {
    strength: '💪',
    run: '🏃',
    rest: '😴'
  };

  const typeColors = {
    strength: 'bg-accent-500/20 border-accent-500/30',
    run: 'bg-primary-500/20 border-primary-500/30',
    rest: 'bg-surface-elevated border-surface-elevated'
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-text-primary">Weekly Training Plan</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-text-tertiary">Loading...</p>
        </div>
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-text-primary">Weekly Training Plan</h3>
          <Link href="/create-training" className="btn-secondary text-sm">
            Create Plan
          </Link>
        </div>
        <div className="text-center py-8">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-text-secondary mb-2">No workouts planned this week</p>
          <p className="text-text-tertiary text-sm">Create a training plan to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-text-primary">Weekly Training Plan</h3>
        <Link href="/plan" className="text-sm text-primary-400 hover:text-primary-300">
          View Full Plan →
        </Link>
      </div>

      <div className="grid gap-2">
        {workouts.map((combinedWorkout) => {
          const isScheduled = combinedWorkout.source === 'scheduled';
          const scheduledWorkout = isScheduled ? (combinedWorkout.workout as ScheduledWorkout) : null;
          const templateDay = !isScheduled ? (combinedWorkout.workout as TemplateDay) : null;

          const workoutType = isScheduled ? scheduledWorkout!.workout_type : templateDay!.type;
          const workoutName = isScheduled ? scheduledWorkout!.name : null;
          const exercises = isScheduled ? scheduledWorkout!.exercises : templateDay!.exercises;
          const isCompleted = isScheduled ? scheduledWorkout!.completed : false;

          // Check if this is today
          const today = new Date().toISOString().split('T')[0];
          const isToday = combinedWorkout.day === today;

          return (
            <Link
              key={combinedWorkout.day}
              href="/plan"
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:border-primary-500/50 ${
                isToday ? 'bg-primary-500/5 border-primary-500/30' : 'border-surface-elevated'
              } ${isCompleted ? 'opacity-60' : ''}`}
            >
              {/* Day */}
              <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg border ${
                isToday ? 'bg-primary-500/20 border-primary-500/50' : typeColors[workoutType]
              }`}>
                <div className="text-xs text-text-tertiary">{dayLabels[combinedWorkout.day_of_week]}</div>
                <div className="text-lg">{typeIcons[workoutType]}</div>
              </div>

              {/* Workout Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-text-primary truncate">
                    {workoutName || (workoutType === 'strength' ? `${exercises?.length || 0} exercises` : workoutType === 'rest' ? 'Rest day' : 'Run')}
                  </p>
                  {isCompleted && (
                    <span className="text-semantic-success text-sm">✓</span>
                  )}
                  {isToday && !isCompleted && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400">
                      Today
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-tertiary capitalize">
                  {workoutType === 'strength' ? 'Strength training' :
                   workoutType === 'run' ? 'Running workout' : 'Recovery'}
                </p>
              </div>

              {/* Status Icon */}
              <div className="text-text-tertiary">
                {isCompleted ? (
                  <span className="text-semantic-success">✓</span>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-surface-elevated flex gap-2">
        <Link href="/create-training?mode=schedule-workout" className="btn-secondary text-sm flex-1">
          + Schedule Workout
        </Link>
        <Link href="/plan" className="btn-primary text-sm flex-1">
          View This Week
        </Link>
      </div>
    </div>
  );
}
