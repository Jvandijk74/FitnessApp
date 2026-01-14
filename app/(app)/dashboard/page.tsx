import { InsightFeed } from '@/components/insights/InsightFeed';
import { StatsCard } from '@/components/stats/StatsCard';
import { WeeklyTrainingPlan } from '@/components/dashboard/WeeklyTrainingPlan';
import { QuickNutritionInput } from '@/components/dashboard/QuickNutritionInput';
import { AICoachChat } from '@/components/dashboard/AICoachChat';
import { PersonalizedRecommendations } from '@/components/dashboard/PersonalizedRecommendations';
import { getWeeklyStats, calculateHealthMetrics, generateInsights } from '@/app/actions/metrics';
import { assessInjuryRisk } from '@/app/actions/training-plan';

const DEMO_USER = 'demo-user';

export default async function DashboardPage() {
  console.log('[Dashboard] Starting dashboard page render...');

  // Fetch metrics with error handling
  let weeklyStats: Awaited<ReturnType<typeof getWeeklyStats>>;
  let healthMetrics: Awaited<ReturnType<typeof calculateHealthMetrics>>;
  let insights: Awaited<ReturnType<typeof generateInsights>>;
  let injuryRisk: Awaited<ReturnType<typeof assessInjuryRisk>>;

  try {
    console.log('[Dashboard] Fetching weekly stats...');
    weeklyStats = await getWeeklyStats(DEMO_USER);
    console.log('[Dashboard] Weekly stats:', weeklyStats);
  } catch (error) {
    console.error('[Dashboard] ERROR fetching weekly stats:', error);
    weeklyStats = { totalDistance: 0, totalDuration: 0, totalRuns: 0, averagePace: 0, averageHR: 0 };
  }

  try {
    console.log('[Dashboard] Fetching health metrics...');
    healthMetrics = await calculateHealthMetrics(DEMO_USER);
    console.log('[Dashboard] Health metrics:', healthMetrics);
  } catch (error) {
    console.error('[Dashboard] ERROR fetching health metrics:', error);
    healthMetrics = { aerobicFitness: 0, trainingLoad: 0, trend: 'stable' };
  }

  try {
    console.log('[Dashboard] Fetching insights...');
    insights = await generateInsights(DEMO_USER);
    console.log('[Dashboard] Insights count:', insights?.length || 0);
  } catch (error) {
    console.error('[Dashboard] ERROR fetching insights:', error);
    insights = [];
  }

  try {
    console.log('[Dashboard] Assessing injury risk...');
    injuryRisk = await assessInjuryRisk(DEMO_USER);
    console.log('[Dashboard] Injury risk:', injuryRisk);
  } catch (error) {
    console.error('[Dashboard] ERROR assessing injury risk:', error);
    injuryRisk = { riskScore: 0, riskLevel: 'low', riskFactors: [] };
  }

  console.log('[Dashboard] Dashboard page render complete');

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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <QuickNutritionInput userId={DEMO_USER} date={new Date().toISOString().split('T')[0]} />
        <AICoachChat userId={DEMO_USER} />
      </div>

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

      {/* Personalized Recommendations */}
      <PersonalizedRecommendations userId={DEMO_USER} />
    </section>
  );
}
