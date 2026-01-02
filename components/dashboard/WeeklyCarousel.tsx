'use client';

import { useState } from 'react';
import { WeeklyPlan } from '@/lib/coach/types';
import { TrainingDay } from '@/lib/db/types';

const dayLabels: Record<TrainingDay, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday'
};

const dayDescriptions: Record<TrainingDay, string> = {
  monday: 'Easy run',
  tuesday: 'Strength',
  wednesday: 'Tempo run',
  thursday: 'Strength',
  friday: 'Easy + Strength',
  saturday: 'Rest',
  sunday: 'Long run'
};

const dayIcons: Record<TrainingDay, JSX.Element> = {
  monday: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  tuesday: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  ),
  wednesday: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  thursday: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  ),
  friday: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
  saturday: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
  sunday: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
};

interface WeeklyCarouselProps {
  plan: WeeklyPlan;
}

export function WeeklyCarousel({ plan }: WeeklyCarouselProps) {
  const [currentDay, setCurrentDay] = useState(0);
  const days = Object.keys(dayLabels) as TrainingDay[];

  const nextDay = () => {
    setCurrentDay((prev) => (prev + 1) % days.length);
  };

  const prevDay = () => {
    setCurrentDay((prev) => (prev - 1 + days.length) % days.length);
  };

  const day = days[currentDay];
  const run = plan.runs.find((r) => r.day === day);
  const strength = plan.strength.find((s) => s.day === day);
  const hasWorkout = run || strength;

  return (
    <div className="card-highlight">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-white/60 mb-1">Week starting {plan.start}</p>
          <h2 className="text-2xl font-bold text-white">Weekly Training Overview</h2>
        </div>
        <span className="badge-primary">Fixed cadence</span>
      </div>

      {/* Carousel */}
      <div className="relative">
        {/* Navigation Buttons */}
        <button
          onClick={prevDay}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 h-12 w-12 rounded-full bg-surface/80 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all z-10"
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={nextDay}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 h-12 w-12 rounded-full bg-surface/80 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all z-10"
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Day Card */}
        <div className="glass rounded-xl p-8 min-h-[320px] transition-all">
          <div className="flex items-center gap-4 mb-6">
            <div className={`h-16 w-16 rounded-xl flex items-center justify-center ${
              hasWorkout ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/40'
            }`}>
              {dayIcons[day]}
            </div>
            <div className="flex-1">
              <h3 className="text-3xl font-bold text-white">{dayLabels[day]}</h3>
              <p className="text-white/60 mt-1">{dayDescriptions[day]}</p>
            </div>
            {!hasWorkout && <span className="badge bg-white/5 text-white/40 ring-white/10">Rest Day</span>}
          </div>

          {/* Workouts */}
          <div className="space-y-4">
            {run && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="badge-primary">Run</span>
                  <span className="badge bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/40">
                    {run.intensity}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-white text-lg">
                    <span className="font-bold">{run.durationMinutes} min</span> • Target RPE {run.targetRpe}
                  </p>
                  {run.notes && (
                    <p className="text-white/70 text-sm italic">{run.notes}</p>
                  )}
                </div>
              </div>
            )}

            {strength && (
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="badge-accent">Strength</span>
                </div>
                <div className="space-y-3">
                  {strength.exercises.map((ex, idx) => (
                    <div key={`${ex.name}-${idx}`} className="bg-white/5 rounded-lg p-3">
                      <p className="font-bold text-white mb-1">{ex.name}</p>
                      <p className="text-white/70 text-sm">
                        {ex.sets} <span className="text-white/40">•</span> {ex.tempo} <span className="text-white/40">•</span> {ex.rest}
                      </p>
                      <p className="text-white/60 text-xs mt-1">Target RPE: {ex.targetRpe}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!hasWorkout && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
                <svg className="w-12 h-12 text-white/40 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <p className="text-white/60">Rest and recovery day</p>
                <p className="text-white/40 text-sm mt-1">Allow your body to adapt and rebuild</p>
              </div>
            )}
          </div>
        </div>

        {/* Day Indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {days.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentDay(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentDay ? 'w-8 bg-primary' : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
