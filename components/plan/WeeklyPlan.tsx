import { WeeklyPlan } from '@/lib/coach/types';
import { TrainingDay } from '@/lib/db/types';

const dayLabels: Record<TrainingDay, string> = {
  monday: 'Monday — Easy run',
  tuesday: 'Tuesday — Strength',
  wednesday: 'Wednesday — Tempo run',
  thursday: 'Thursday — Strength',
  friday: 'Friday — Easy + Strength',
  saturday: 'Saturday — Rest',
  sunday: 'Sunday — Long run'
};

const dayIcons: Record<TrainingDay, JSX.Element> = {
  monday: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  tuesday: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  ),
  wednesday: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  thursday: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  ),
  friday: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
  saturday: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
  sunday: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
};

export function WeeklyPlanView({ plan }: { plan: WeeklyPlan }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-white/60 mb-1">Week starting {plan.start}</p>
          <h2 className="text-2xl font-bold text-white">Your Prescriptions</h2>
        </div>
        <span className="badge-primary">Fixed cadence</span>
      </div>
      <div className="grid gap-3">
        {Object.entries(dayLabels).map(([day, label]) => {
          const run = plan.runs.find((r) => r.day === day);
          const strength = plan.strength.find((s) => s.day === day);
          const hasWorkout = run || strength;

          return (
            <div key={day} className={`glass rounded-lg p-4 transition-all ${hasWorkout ? 'hover:bg-white/[0.08]' : ''}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                  hasWorkout ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/40'
                }`}>
                  {dayIcons[day as TrainingDay]}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white">{label}</p>
                </div>
                {!hasWorkout && <span className="badge bg-white/5 text-white/40 ring-white/10">Rest</span>}
              </div>

              {run && (
                <div className="ml-11 space-y-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge-primary text-xs">Run</span>
                    <span className="badge bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/40 text-xs">
                      {run.intensity}
                    </span>
                  </div>
                  <p className="text-white/80 text-sm">
                    <span className="font-medium">{run.durationMinutes} min</span> • Target RPE {run.targetRpe}
                  </p>
                  {run.notes && (
                    <p className="text-white/60 text-sm italic">{run.notes}</p>
                  )}
                </div>
              )}

              {strength && (
                <div className={`ml-11 space-y-2 ${run ? 'mt-3 pt-3 border-t border-white/10' : ''}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge-accent text-xs">Strength</span>
                  </div>
                  {strength.exercises.map((ex, idx) => (
                    <div key={`${ex.name}-${idx}`} className="bg-white/5 rounded-lg p-2 space-y-1">
                      <p className="font-semibold text-white text-sm">{ex.name}</p>
                      <p className="text-white/70 text-xs">
                        {ex.sets} <span className="text-white/50">•</span> {ex.tempo} <span className="text-white/50">•</span> {ex.rest}
                      </p>
                      <p className="text-white/60 text-xs">Target RPE: {ex.targetRpe}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
