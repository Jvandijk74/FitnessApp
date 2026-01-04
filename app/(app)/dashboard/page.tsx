import { RunLogForm } from '@/components/logging/RunLogForm';
import { StrengthLogForm } from '@/components/logging/StrengthLogForm';
import { InsightFeed } from '@/components/insights/InsightFeed';
import { AICoach } from '@/components/chat/AICoach';
import { StatsCard } from '@/components/stats/StatsCard';
import { WeeklyTrainingPlan } from '@/components/dashboard/WeeklyTrainingPlan';
import { logRun, logStrength } from '@/app/actions/plan';
import { getWeeklyStats, calculateHealthMetrics, generateInsights } from '@/app/actions/metrics';
import { assessInjuryRisk } from '@/app/actions/training-plan';
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
  // Fetch real metrics
  const weeklyStats = await getWeeklyStats(DEMO_USER);
  const healthMetrics = await calculateHealthMetrics(DEMO_USER);
  const insights = await generateInsights(DEMO_USER);
  const injuryRisk = await assessInjuryRisk(DEMO_USER);

  return (
    <section className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Dashboard</h1>
        <p className="text-text-secondary">Your training overview and weekly plan</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Weekly Distance"
          value={`${weeklyStats.totalDistance.toFixed(1)} km`}
          icon="🏃"
          variant="default"
        />
        <StatsCard
          title="Runs This Week"
          value={weeklyStats.totalRuns.toString()}
          icon="📊"
          variant="success"
        />
        <StatsCard
          title="Aerobic Fitness"
          value={`${healthMetrics.aerobicFitness}%`}
          icon="❤️"
          trend={
            healthMetrics.trend === 'improving'
              ? { value: 5, isPositive: true }
              : healthMetrics.trend === 'declining'
              ? { value: 5, isPositive: false }
              : undefined
          }
          variant={
            healthMetrics.aerobicFitness >= 70
              ? 'success'
              : healthMetrics.aerobicFitness >= 50
              ? 'info'
              : 'warning'
          }
        />
        <StatsCard
          title="Training Load"
          value={`${healthMetrics.trainingLoad}%`}
          icon="⚡"
          variant={
            healthMetrics.trainingLoad >= 70
              ? 'success'
              : healthMetrics.trainingLoad >= 50
              ? 'info'
              : 'warning'
          }
        />
        <StatsCard
          title="Injury Risk"
          value={injuryRisk.riskLevel.charAt(0).toUpperCase() + injuryRisk.riskLevel.slice(1)}
          icon="🚨"
          variant={
            injuryRisk.riskLevel === 'low'
              ? 'success'
              : injuryRisk.riskLevel === 'moderate'
              ? 'warning'
              : 'default'
          }
        />
      </div>

      {/* Weekly Training Plan */}
      <WeeklyTrainingPlan userId={DEMO_USER} />

      {/* Insights Feed */}
      <InsightFeed
        insights={[
          ...insights,
          // Add injury risk insights if present
          ...(injuryRisk.riskLevel !== 'low' && injuryRisk.riskFactors.length > 0
            ? [
                {
                  id: 'injury-risk',
                  title: `${injuryRisk.riskLevel === 'high' ? '⚠️ High' : 'Moderate'} Injury Risk Detected`,
                  detail: injuryRisk.riskFactors.join('. ') + '.',
                  type: (injuryRisk.riskLevel === 'high' ? 'warning' : 'info') as 'warning' | 'info',
                  timestamp: 'Just now',
                },
              ]
            : []),
        ]}
      />

      {/* Quick Log Forms */}
      <div className="grid md:grid-cols-2 gap-4">
        <RunLogForm action={saveRun} />
        <StrengthLogForm action={saveStrength} />
      </div>

      {/* AI Coach */}
      <AICoach compact />
    </section>
  );
}
