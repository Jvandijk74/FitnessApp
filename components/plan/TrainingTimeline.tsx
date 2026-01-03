import { WeeklyPlan } from '@/lib/coach/types';
import { TrainingDay } from '@/lib/db/types';

const dayConfig: Record<TrainingDay, { label: string; icon: string; shortLabel: string }> = {
  monday: { label: 'Monday', icon: '🏃', shortLabel: 'Mon' },
  tuesday: { label: 'Tuesday', icon: '💪', shortLabel: 'Tue' },
  wednesday: { label: 'Wednesday', icon: '🏃', shortLabel: 'Wed' },
  thursday: { label: 'Thursday', icon: '💪', shortLabel: 'Thu' },
  friday: { label: 'Friday', icon: '🏃', shortLabel: 'Fri' },
  saturday: { label: 'Saturday', icon: '😴', shortLabel: 'Sat' },
  sunday: { label: 'Sunday', icon: '🏃', shortLabel: 'Sun' },
};

const intensityColors: Record<string, string> = {
  easy: 'bg-semantic-success/10 border-semantic-success/30 text-semantic-success',
  tempo: 'bg-accent-500/10 border-accent-500/30 text-accent-400',
  long: 'bg-primary-500/10 border-primary-500/30 text-primary-400',
  rest: 'bg-surface-elevated border-text-tertiary/30 text-text-tertiary',
};

interface DayCardProps {
  day: TrainingDay;
  run?: { durationMinutes: number; intensity: string; targetRpe: number; notes?: string };
  strength?: { exercises: Array<{ name: string; sets: string; tempo: string; rest: string; targetRpe: string }> };
  isToday?: boolean;
}

function DayCard({ day, run, strength, isToday }: DayCardProps) {
  const config = dayConfig[day];
  const intensity = run?.intensity?.toLowerCase() || 'rest';
  const colorClass = intensityColors[intensity] || intensityColors.rest;

  return (
    <div
      className={`
        relative flex-shrink-0 w-64 rounded-xl border-2 p-4 transition-all duration-200
        hover:scale-105 hover:shadow-lg hover:shadow-primary-500/20
        ${isToday ? 'border-primary-500 bg-primary-500/5' : 'border-surface-elevated bg-surface'}
      `}
    >
      {/* Today indicator */}
      {isToday && (
        <div className="absolute -top-2 left-4 px-2 py-0.5 bg-primary-500 text-white text-xs font-semibold rounded-full">
          Today
        </div>
      )}

      {/* Day header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-text-tertiary uppercase tracking-wide">{config.shortLabel}</p>
          <p className="font-semibold text-text-primary">{config.label}</p>
        </div>
        <span className="text-3xl">{config.icon}</span>
      </div>

      {/* Workout details */}
      <div className="space-y-2">
        {run ? (
          <div className={`rounded-lg border p-3 ${colorClass}`}>
            <p className="font-medium text-sm capitalize">{run.intensity} Run</p>
            <p className="text-xs mt-1 opacity-90">{run.durationMinutes} min • RPE {run.targetRpe}</p>
            {run.notes && <p className="text-xs mt-1 opacity-75">{run.notes}</p>}
          </div>
        ) : day === 'saturday' ? (
          <div className="rounded-lg border p-3 bg-surface-elevated border-text-tertiary/30 text-text-tertiary">
            <p className="font-medium text-sm">Rest Day</p>
            <p className="text-xs mt-1 opacity-75">Active recovery</p>
          </div>
        ) : null}

        {strength && (
          <div className="rounded-lg border border-accent-500/30 bg-accent-500/5 p-3">
            <p className="font-medium text-sm text-accent-400">Strength</p>
            <div className="mt-1 space-y-1">
              {strength.exercises.map((ex, i) => (
                <div key={i} className="text-xs text-text-secondary">
                  <p className="font-medium">{ex.name}</p>
                  <p className="opacity-75">{ex.sets}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Progress indicator */}
      <div className="mt-3 flex gap-1">
        <div className="h-1 flex-1 rounded-full bg-surface-elevated">
          <div className="h-full w-0 rounded-full bg-primary-500 transition-all duration-500" />
        </div>
      </div>
    </div>
  );
}

export function TrainingTimeline({ plan }: { plan: WeeklyPlan }) {
  const days: TrainingDay[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as TrainingDay;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Weekly Training Plan</h2>
          <p className="text-sm text-text-secondary">Week starting {plan.start}</p>
        </div>
        <div className="text-xs text-text-tertiary px-3 py-1 bg-surface-elevated rounded-full">
          Fixed cadence — days never move
        </div>
      </div>

      {/* Horizontal scrollable timeline */}
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-surface-elevated scrollbar-track-transparent">
          {days.map((day) => {
            const run = plan.runs.find((r) => r.day === day);
            const strength = plan.strength.find((s) => s.day === day);
            return (
              <DayCard
                key={day}
                day={day}
                run={run}
                strength={strength}
                isToday={day === today}
              />
            );
          })}
        </div>

        {/* Scroll indicators */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {days.map((day) => (
            <div
              key={day}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                day === today ? 'bg-primary-500 w-3' : 'bg-surface-elevated'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
