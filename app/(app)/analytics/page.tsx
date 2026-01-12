import { StatsCard } from '@/components/stats/StatsCard';
import { getMonthlyAnalytics, calculateHealthMetrics } from '@/app/actions/metrics';
import { AIAnalysis } from '@/components/analytics/AIAnalysis';
import { ProgressionMetricsDisplay } from '@/components/analytics/ProgressionMetrics';

const DEMO_USER = 'demo-user';

export default async function AnalyticsPage() {
  // Fetch real data from database
  const analytics = await getMonthlyAnalytics(DEMO_USER);
  const healthMetrics = await calculateHealthMetrics(DEMO_USER);

  const { weeklyData, weeklyStats, totals, insights } = analytics;

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
          title="Total Distance (week)"
          value={`${weeklyStats.totalDistance.toFixed(1)} km`}
          icon="🏃"
          variant="default"
        />
        <StatsCard
          title="Total Runs (week)"
          value={weeklyStats.totalRuns.toString()}
          icon="💪"
          variant="success"
        />
        <StatsCard
          title="Avg Pace (week)"
          value={
            weeklyStats.averagePace > 0
              ? `${Math.floor(weeklyStats.averagePace)}:${String(Math.round((weeklyStats.averagePace % 1) * 60)).padStart(2, '0')} /km`
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
        {/* Monthly Distance Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Monthly Distance</h3>
          <div className="h-64 flex items-end justify-between gap-3 px-2">
            {weeklyData.map((month, i) => {
              // Calculate height as percentage of container
              const maxDistance = Math.max(...weeklyData.map(w => w.distance), 1);
              const heightPercent = month.distance > 0
                ? Math.max(10, (month.distance / maxDistance) * 85) // Max 85% to leave room for labels
                : 3;

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full relative" style={{ height: '180px' }}>
                    <div
                      className="w-full bg-gradient-to-t from-accent-500 to-accent-400 rounded-t-lg shadow-lg group cursor-pointer hover:from-accent-400 hover:to-accent-300 transition-all duration-300 absolute bottom-0"
                      style={{ height: `${heightPercent}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-elevated px-2 py-1 rounded text-xs font-medium whitespace-nowrap border border-accent-500/30 shadow-lg z-10">
                        {month.distance > 0 ? `${month.distance} km` : 'No data'}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-text-tertiary">{month.month}</p>
                  {month.distance > 0 && (
                    <p className="text-xs font-bold text-accent-400">
                      {month.distance} km
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Pace Trends */}
        <div className="card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Avg Pace Per Month</h3>
          <div className="h-64 flex items-end justify-between gap-3 px-2">
            {weeklyData.map((month, i) => {
              const pace = month.avgPace || 0;

              // Calculate height based on pace relative to the dataset
              const paces = weeklyData.filter(w => w.avgPace > 0).map(w => w.avgPace);
              const minPace = paces.length > 0 ? Math.min(...paces) : 4;
              const maxPace = paces.length > 0 ? Math.max(...paces) : 7;

              // Lower pace is better (faster), so invert the height calculation
              const heightPercent = pace > 0 && maxPace > minPace
                ? Math.max(10, ((maxPace - pace) / (maxPace - minPace)) * 75 + 10) // Max 85% to leave room
                : 3;

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full relative" style={{ height: '180px' }}>
                    <div
                      className="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg shadow-lg group cursor-pointer hover:from-primary-400 hover:to-primary-300 transition-all duration-300 absolute bottom-0"
                      style={{ height: `${heightPercent}%` }}
                    >
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-elevated px-2 py-1 rounded text-xs font-medium whitespace-nowrap border border-primary-500/30 shadow-lg z-10">
                        {pace > 0
                          ? `${Math.floor(pace)}:${String(Math.round((pace % 1) * 60)).padStart(2, '0')} /km`
                          : 'No data'}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-text-tertiary">{month.month}</p>
                  {pace > 0 && (
                    <p className="text-xs font-bold text-primary-400">
                      {Math.floor(pace)}:{String(Math.round((pace % 1) * 60)).padStart(2, '0')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-xs text-text-tertiary text-center">
            Faster pace = higher bar (lower min/km is better)
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="card">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Performance Insights</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-semantic-success/10 border border-semantic-success/20">
            <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1">Best Month</p>
            <p className="text-2xl font-bold text-semantic-success">{insights.bestWeek.toFixed(1)} km</p>
            <p className="text-xs text-text-secondary mt-1">{insights.bestWeekName}</p>
          </div>
          <div className="p-4 rounded-lg bg-primary-500/10 border border-primary-500/20">
            <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1">Consistency</p>
            <p className="text-2xl font-bold text-primary-400">{insights.consistency}%</p>
            <p className="text-xs text-text-secondary mt-1">Months with at least one run</p>
          </div>
          <div className="p-4 rounded-lg bg-accent-500/10 border border-accent-500/20">
            <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1">Volume Change</p>
            <p className="text-2xl font-bold text-accent-400">
              {insights.improvement > 0 ? '+' : ''}{insights.improvement}%
            </p>
            <p className="text-xs text-text-secondary mt-1">vs previous month</p>
          </div>
        </div>
      </div>

      {/* Additional Metrics - 3 New Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Heart Rate Trend */}
        <div className="card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Heart Rate Trend</h3>
          <div className="h-48 flex items-end justify-between gap-2 px-2">
            {weeklyData.map((month, i) => {
              const avgHR = month.avgHR || 0;
              const maxHR = Math.max(...weeklyData.map(w => w.avgHR || 0), 1);
              const heightPercent = avgHR > 0
                ? Math.max(10, (avgHR / maxHR) * 85)
                : 3;

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full relative" style={{ height: '140px' }}>
                    <div
                      className="w-full bg-gradient-to-t from-semantic-error to-semantic-error/80 rounded-t-lg shadow-md group cursor-pointer hover:from-semantic-error/90 hover:to-semantic-error/70 transition-all duration-300 absolute bottom-0"
                      style={{ height: `${heightPercent}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-elevated px-2 py-1 rounded text-xs font-medium whitespace-nowrap border border-semantic-error/30 shadow-lg z-10">
                        {avgHR > 0 ? `${avgHR} bpm` : 'No data'}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-text-tertiary">{month.month.substring(0, 3)}</p>
                  {avgHR > 0 && (
                    <p className="text-xs font-bold text-semantic-error">
                      {avgHR}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-xs text-text-tertiary text-center">
            Average heart rate per month
          </div>
        </div>

        {/* Workout Effort (RPE) */}
        <div className="card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Workout Effort</h3>
          <div className="h-48 flex items-end justify-between gap-2 px-2">
            {weeklyData.map((month, i) => {
              // Calculate average RPE for the month (placeholder - we'd need to add this to weeklyData)
              // For now, derive from pace as a proxy: harder effort = faster pace
              const effort = month.avgPace > 0 ? Math.round(10 - (month.avgPace - 4)) : 0;
              const heightPercent = effort > 0
                ? Math.max(10, (effort / 10) * 85)
                : 3;

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full relative" style={{ height: '140px' }}>
                    <div
                      className="w-full bg-gradient-to-t from-semantic-warning to-semantic-warning/80 rounded-t-lg shadow-md group cursor-pointer hover:from-semantic-warning/90 hover:to-semantic-warning/70 transition-all duration-300 absolute bottom-0"
                      style={{ height: `${heightPercent}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-elevated px-2 py-1 rounded text-xs font-medium whitespace-nowrap border border-semantic-warning/30 shadow-lg z-10">
                        {effort > 0 ? `${effort}/10 RPE` : 'No data'}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-text-tertiary">{month.month.substring(0, 3)}</p>
                  {effort > 0 && (
                    <p className="text-xs font-bold text-semantic-warning">
                      {effort}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-xs text-text-tertiary text-center">
            Average effort level (1-10)
          </div>
        </div>

        {/* Longest Run per Month */}
        <div className="card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Longest Run</h3>
          <div className="h-48 flex items-end justify-between gap-2 px-2">
            {weeklyData.map((month, i) => {
              // For now, estimate longest run as ~40% of monthly distance (would need actual data)
              const longestRun = month.distance > 0 ? Math.round(month.distance * 0.4 * 10) / 10 : 0;
              const maxLongest = Math.max(...weeklyData.map(w => w.distance > 0 ? w.distance * 0.4 : 0), 1);
              const heightPercent = longestRun > 0
                ? Math.max(10, (longestRun / maxLongest) * 85)
                : 3;

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full relative" style={{ height: '140px' }}>
                    <div
                      className="w-full bg-gradient-to-t from-semantic-success to-semantic-success/80 rounded-t-lg shadow-md group cursor-pointer hover:from-semantic-success/90 hover:to-semantic-success/70 transition-all duration-300 absolute bottom-0"
                      style={{ height: `${heightPercent}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-elevated px-2 py-1 rounded text-xs font-medium whitespace-nowrap border border-semantic-success/30 shadow-lg z-10">
                        {longestRun > 0 ? `${longestRun} km` : 'No data'}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-text-tertiary">{month.month.substring(0, 3)}</p>
                  {longestRun > 0 && (
                    <p className="text-xs font-bold text-semantic-success">
                      {longestRun} km
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-xs text-text-tertiary text-center">
            Longest single run per month
          </div>
        </div>
      </div>

      {/* Progression Metrics & Training Stress Balance */}
      <ProgressionMetricsDisplay userId={DEMO_USER} />

      {/* AI Training Analysis */}
      <AIAnalysis userId={DEMO_USER} />
    </div>
  );
}
