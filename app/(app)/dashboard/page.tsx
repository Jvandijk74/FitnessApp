import { WeeklyPlanView } from '@/components/plan/WeeklyPlan';
import { RunLogForm } from '@/components/logging/RunLogForm';
import { StrengthLogForm } from '@/components/logging/StrengthLogForm';
import { InsightCards } from '@/components/insights/InsightCards';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { generateWeeklyPlan } from '@/lib/coach/engine';
import { AthleteProfile } from '@/lib/coach/types';
import { logRun, logStrength } from '@/app/actions/plan';
import { TrainingDay } from '@/lib/db/types';

const DEMO_USER = 'demo-user';

async function saveRun(formData: FormData) {
  'use server';
  const payload = {
    user_id: DEMO_USER,
    day: formData.get('day') as TrainingDay,
    distance_km: parseFloat(String(formData.get('distance_km'))),
    duration_minutes: parseInt(String(formData.get('duration_minutes')), 10),
    avg_hr: formData.get('avg_hr') ? parseInt(String(formData.get('avg_hr')), 10) : undefined,
    max_hr: formData.get('max_hr') ? parseInt(String(formData.get('max_hr')), 10) : undefined,
    rpe: formData.get('rpe') ? parseInt(String(formData.get('rpe')), 10) : undefined
  };
  await logRun(payload);
}

async function saveStrength(formData: FormData) {
  'use server';
  const setPayloads = Array.from(formData.getAll('sets')).map((set) => JSON.parse(String(set)) as {
    weight: number;
    reps: number;
    rpe?: number;
    rir?: number;
  });

  await logStrength({
    user_id: DEMO_USER,
    day: formData.get('day') as TrainingDay,
    exercise: String(formData.get('exercise')),
    sets: setPayloads
  });
}

export default async function DashboardPage() {
  const profile: AthleteProfile = {
    id: DEMO_USER,
    thresholdPace: 4.9,
    thresholdHr: 170,
    readinessScore: 0.62,
    recentRpeAverage: 6.5
  };

  const plan = generateWeeklyPlan(profile, {
    averageRunMinutes: 42,
    longRunMinutes: 75,
    highRpeCount: 1
  });

  const insights = [
    {
      id: 'tempo-pace',
      title: 'Tempo pace improving at same HR',
      detail: 'Last 3 tempo runs averaged 4:45/km at 170bpm vs 4:55/km previously.'
    },
    {
      id: 'strength-rpe',
      title: 'Strength RPE trending up → fatigue risk',
      detail: 'Average strength RPE 8.2. Coach will cap next Friday to RPE 6.'
    },
    {
      id: 'hr-drift',
      title: 'Long run HR drift rising',
      detail: 'Cardiac drift 9% vs 6% last month; consider more easy volume before progressing.'
    }
  ];

  return (
    <section className="grid gap-8">
      {/* Weekly Training Plan */}
      <div className="space-y-4">
        <div className="section-header">
          <div>
            <h2 className="section-title">Your Weekly Plan</h2>
            <p className="text-white/60 text-sm mt-1">Personalized training schedule based on your readiness</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="badge-success">Active</span>
          </div>
        </div>
        <WeeklyPlanView plan={plan} />
      </div>

      <div className="divider"></div>

      {/* Log Workouts Section */}
      <div className="space-y-4">
        <div className="section-header">
          <div>
            <h2 className="section-title">Log Your Workouts</h2>
            <p className="text-white/60 text-sm mt-1">Track your training progress and performance metrics</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <RunLogForm action={saveRun} />
          <StrengthLogForm action={saveStrength} />
        </div>
      </div>

      <div className="divider"></div>

      {/* Training Insights */}
      <div className="space-y-4">
        <div className="section-header">
          <div>
            <h2 className="section-title">Training Insights</h2>
            <p className="text-white/60 text-sm mt-1">AI-powered analysis of your performance trends</p>
          </div>
        </div>
        <InsightCards insights={insights} />
      </div>

      <div className="divider"></div>

      {/* AI Coach */}
      <div className="space-y-4">
        <div className="section-header">
          <div>
            <h2 className="section-title">AI Coach</h2>
            <p className="text-white/60 text-sm mt-1">Get personalized guidance and explanations</p>
          </div>
          <span className="badge-primary">Beta</span>
        </div>
        <ChatPanel />
      </div>
    </section>
  );
}
