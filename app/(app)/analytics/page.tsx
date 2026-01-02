import { StatsCard } from '@/components/stats/StatsCard';
import { getMonthlyAnalytics, calculateHealthMetrics } from '@/app/actions/metrics';

const DEMO_USER = 'demo-user';

export default async function AnalyticsPage() {
  // Fetch real data from database
  const analytics = await getMonthlyAnalytics(DEMO_USER);
  const healthMetrics = await calculateHealthMetrics(DEMO_USER);

  const { weeklyData, totals, insights } = analytics;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Analytics</h1>
        <p className="text-text-secondary">Track your progress and performance trends</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Distance (30d)"
          value={`${totals.distance.toFixed(1)} km`}
          icon="🏃"
          trend={insights.improvement > 0 ? { value: insights.improvement, isPositive: true } : undefined}
          variant="default"
        />
        <StatsCard
          title="Total Runs (30d)"
          value={totals.runs.toString()}
          icon="💪"
          variant="success"
        />
        <StatsCard
          title="Avg Pace"
          value={
            totals.avgPace > 0
              ? `${Math.floor(totals.avgPace)}:${String(Math.round((totals.avgPace % 1) * 60)).padStart(2, '0')} /km`
              : 'N/A'
          }
          icon="⚡"
          variant="info"
        />
        <StatsCard
          title="Training Load"
          value={`${healthMetrics.trainingLoad}%`}
          icon="📊"
          variant={
            healthMetrics.trainingLoad >= 70
              ? 'success'
              : healthMetrics.trainingLoad >= 50
              ? 'info'
              : 'warning'
          }
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Distance Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Weekly Distance</h3>
          <div className="h-64 flex items-end justify-between gap-4">
            {weeklyData.map((week, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-surface-elevated rounded-t-lg relative group cursor-pointer hover:bg-primary-500/20 transition-colors"
                  style={{ height: `${(week.distance / 50) * 100}%` }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-elevated px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
                    {week.distance} km
                  </div>
                </div>
                <p className="text-xs text-text-tertiary">{week.week}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Heart Rate Trends */}
        <div className="card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Avg Heart Rate</h3>
          <div className="h-64 flex items-end justify-between gap-4">
            {weeklyData.map((week, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-semantic-error/20 rounded-t-lg relative group cursor-pointer hover:bg-semantic-error/30 transition-colors"
                  style={{ height: `${((week.avgHR - 150) / 30) * 100}%` }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-elevated px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
                    {week.avgHR} bpm
                  </div>
                </div>
                <p className="text-xs text-text-tertiary">{week.week}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="card">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Performance Insights</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-semantic-success/10 border border-semantic-success/20">
            <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1">Best Week</p>
            <p className="text-2xl font-bold text-semantic-success">{insights.bestWeek.toFixed(1)} km</p>
            <p className="text-xs text-text-secondary mt-1">{insights.bestWeekName}</p>
          </div>
          <div className="p-4 rounded-lg bg-primary-500/10 border border-primary-500/20">
            <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1">Consistency</p>
            <p className="text-2xl font-bold text-primary-400">{insights.consistency}%</p>
            <p className="text-xs text-text-secondary mt-1">Weeks with at least one run</p>
          </div>
          <div className="p-4 rounded-lg bg-accent-500/10 border border-accent-500/20">
            <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1">Volume Change</p>
            <p className="text-2xl font-bold text-accent-400">
              {insights.improvement > 0 ? '+' : ''}{insights.improvement}%
            </p>
            <p className="text-xs text-text-secondary mt-1">vs previous week</p>
          </div>
        </div>
      </div>
    </div>
  );
}
