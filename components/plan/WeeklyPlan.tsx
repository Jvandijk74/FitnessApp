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

export function WeeklyPlanView({ plan }: { plan: WeeklyPlan }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/60">Week starting {plan.start}</p>
          <h2 className="text-2xl font-semibold">Prescriptions</h2>
        </div>
        <div className="text-xs text-white/60">Fixed cadence — days never move</div>
      </div>
      <div className="mt-4 grid gap-3">
        {Object.entries(dayLabels).map(([day, label]) => {
          const run = plan.runs.find((r) => r.day === day);
          const strength = plan.strength.find((s) => s.day === day);
          return (
            <div key={day} className="border border-white/5 rounded-lg p-4">
              <p className="font-semibold">{label}</p>
              {run ? (
                <p className="text-white/70 text-sm mt-1">
                  Run: {run.durationMinutes} min • {run.intensity} • Target RPE {run.targetRpe}
                  {run.notes ? ` — ${run.notes}` : ''}
                </p>
              ) : (
                <p className="text-white/70 text-sm mt-1">No run scheduled.</p>
              )}
              {strength ? (
                <div className="text-white/70 text-sm mt-2 space-y-1">
                  <p className="font-semibold text-white">Strength (strict format):</p>
                  {strength.exercises.map((ex) => (
                    <div key={ex.name}>
                      <p>{ex.name}</p>
                      <p>
                        {ex.sets}
                        <span className="text-white/60"> • {ex.tempo} • {ex.rest} • Target {ex.targetRpe}</span>
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
