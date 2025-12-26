import { WeeklyPlanView } from '@/components/plan/WeeklyPlan';
import { InsightCards } from '@/components/insights/InsightCards';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { generateWeeklyPlan } from '@/lib/coach/engine';
import { AthleteProfile } from '@/lib/coach/types';

const DEMO_USER = 'demo-user';

export default function TrainingPage() {
  const profile: AthleteProfile = {
    id: DEMO_USER,
    thresholdPace: 4.8,
    thresholdHr: 168,
    readinessScore: 0.68,
    recentRpeAverage: 6.1
  };

  const plan = generateWeeklyPlan(profile, {
    averageRunMinutes: 45,
    longRunMinutes: 80,
    highRpeCount: 1
  });

  const insights = [
    {
      id: 'load',
      title: 'Load holds steady',
      detail: 'Weekly minutes stay within 5% to avoid spikes while you adapt to the fixed cadence.'
    },
    {
      id: 'double-day',
      title: 'Friday double day is capped',
      detail: 'Easy volume and strength RPE are capped to keep fatigue manageable before the Sunday long run.'
    }
  ];

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-white/60">Training</p>
        <h1 className="text-3xl font-semibold">Your next planned week</h1>
        <p className="text-white/70">
          Fixed structure, deterministic progression, and strength sessions formatted for logging.
        </p>
      </header>
      <WeeklyPlanView plan={plan} />
      <InsightCards insights={insights} />
      <div className="card">
        <h2 className="text-xl font-semibold mb-2">Ask coach</h2>
        <p className="text-white/70 mb-4">Ask why a workout looks the way it does or request a clarification.</p>
        <ChatPanel />
      </div>
    </section>
  );
}
