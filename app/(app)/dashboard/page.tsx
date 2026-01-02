import { TrainingTimeline } from '@/components/plan/TrainingTimeline';
import { RunLogForm } from '@/components/logging/RunLogForm';
import { StrengthLogForm } from '@/components/logging/StrengthLogForm';
import { InsightFeed } from '@/components/insights/InsightFeed';
import { AICoach } from '@/components/chat/AICoach';
import { StravaConnect } from '@/components/integrations/StravaConnect';
import { StatsCard } from '@/components/stats/StatsCard';
import { generateWeeklyPlan } from '@/lib/coach/engine';
import { AthleteProfile } from '@/lib/coach/types';
import { logRun, logStrength } from '@/app/actions/plan';
import { getStravaConnection, syncStravaActivities } from '@/app/actions/strava';
import { getWeeklyStats, calculateHealthMetrics, generateInsights } from '@/app/actions/metrics';
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

  const profile: AthleteProfile = {
    id: DEMO_USER,
    thresholdPace: 4.9,
    thresholdHr: 170,
    readinessScore: 0.62,
    recentRpeAverage: 6.5
  };

  const plan = generateWeeklyPlan(profile, {
    averageRunMinutes: weeklyStats.totalDuration / Math.max(1, weeklyStats.totalRuns) || 42,
    longRunMinutes: 75,
    highRpeCount: 1
  });

  // Check Strava connection status
  let stravaConnection = null;
  try {
    console.log('[Dashboard] Fetching Strava connection...');
    stravaConnection = await getStravaConnection(DEMO_USER);
    console.log('[Dashboard] Strava connection status:', stravaConnection ? 'Connected' : 'Not connected');
  } catch (error) {
    console.error('[Dashboard] Error fetching Strava connection:', error);
    console.error('[Dashboard] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }

  return (
    <section className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Dashboard</h1>
        <p className="text-text-secondary">Your training overview and weekly plan</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div>

      {/* Strava Integration */}
      <StravaConnectWrapper
        isConnected={!!stravaConnection}
        athleteId={stravaConnection?.athleteId}
      />

      {/* Weekly Training Timeline */}
      <TrainingTimeline plan={plan} />

      {/* Insights Feed */}
      <InsightFeed insights={insights} />

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

async function syncActivities() {
  'use server';
  try {
    console.log('[Dashboard] syncActivities action called');
    const result = await syncStravaActivities(DEMO_USER);
    console.log('[Dashboard] syncActivities completed successfully:', result);
    return result;
  } catch (error) {
    console.error('[Dashboard] syncActivities failed:', error);
    console.error('[Dashboard] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

function StravaConnectWrapper({
  isConnected,
  athleteId
}: {
  isConnected: boolean;
  athleteId?: number;
}) {
  return <StravaConnect isConnected={isConnected} athleteId={athleteId} onSync={syncActivities} />;
}
