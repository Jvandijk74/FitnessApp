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
      detail: 'Last 3 tempo runs averaged 4:45/km at 170bpm vs 4:55/km previously.',
      type: 'success' as const,
      timestamp: '2 hours ago'
    },
    {
      id: 'strength-rpe',
      title: 'Strength RPE trending up → fatigue risk',
      detail: 'Average strength RPE 8.2. Coach will cap next Friday to RPE 6.',
      type: 'warning' as const,
      timestamp: '5 hours ago'
    },
    {
      id: 'hr-drift',
      title: 'Long run HR drift rising',
      detail: 'Cardiac drift 9% vs 6% last month; consider more easy volume before progressing.',
      type: 'info' as const,
      timestamp: '1 day ago'
    }
  ];

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
          title="Weekly Volume"
          value="42.5 km"
          icon="🏃"
          trend={{ value: 12, isPositive: true }}
          variant="default"
        />
        <StatsCard
          title="Total Runs"
          value="23"
          icon="📊"
          trend={{ value: 5, isPositive: true }}
          variant="success"
        />
        <StatsCard
          title="Avg Heart Rate"
          value="165 bpm"
          icon="❤️"
          trend={{ value: 2, isPositive: false }}
          variant="info"
        />
        <StatsCard
          title="Readiness"
          value="62%"
          icon="⚡"
          trend={{ value: 8, isPositive: false }}
          variant="warning"
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
