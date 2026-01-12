'use client';

import { useEffect, useState } from 'react';
import { getProgressionMetrics, type ProgressionMetrics } from '@/app/actions/progression-metrics';

interface ProgressionMetricsProps {
  userId: string;
}

export function ProgressionMetricsDisplay({ userId }: ProgressionMetricsProps) {
  const [metrics, setMetrics] = useState<ProgressionMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMetrics() {
      try {
        setLoading(true);
        const data = await getProgressionMetrics(userId, 12);
        setMetrics(data);
      } catch (err) {
        console.error('[Progression Metrics] Error loading:', err);
        setError('Failed to load progression metrics');
      } finally {
        setLoading(false);
      }
    }

    loadMetrics();
  }, [userId]);

  if (loading) {
    return (
      <div className="card text-center py-12">
        <div className="inline-block animate-spin text-4xl mb-4">⚙️</div>
        <p className="text-text-secondary">Loading progression metrics...</p>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="card text-center py-12">
        <p className="text-red-400">{error || 'No metrics available'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Training Stress Balance - Most Important */}
      <div className="card">
        <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <span className="text-2xl">⚖️</span>
          Training Stress Balance
        </h3>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {/* Running Stress */}
          <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-4">
            <p className="text-xs text-text-tertiary mb-1">Running Stress</p>
            <p className="text-3xl font-bold text-primary-400">{metrics.trainingStress.runningStress.toFixed(0)}</p>
            <p className="text-xs text-text-tertiary mt-1">TRIMP Score</p>
          </div>

          {/* Strength Stress */}
          <div className="bg-accent-500/10 border border-accent-500/20 rounded-lg p-4">
            <p className="text-xs text-text-tertiary mb-1">Strength Stress</p>
            <p className="text-3xl font-bold text-accent-400">{metrics.trainingStress.strengthStress.toFixed(0)}</p>
            <p className="text-xs text-text-tertiary mt-1">Volume Load</p>
          </div>

          {/* Total Stress */}
          <div className="bg-surface-elevated border border-surface-elevated rounded-lg p-4">
            <p className="text-xs text-text-tertiary mb-1">Total Load</p>
            <p className="text-3xl font-bold text-text-primary">{metrics.trainingStress.totalStress.toFixed(0)}</p>
            <p className="text-xs text-text-tertiary mt-1">Combined Score</p>
          </div>
        </div>

        {/* Balance Indicator */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-tertiary">Training Balance</span>
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${
              metrics.trainingStress.balance === 'balanced'
                ? 'bg-semantic-success/10 text-semantic-success'
                : metrics.trainingStress.balance === 'run-heavy'
                ? 'bg-primary-500/10 text-primary-400'
                : 'bg-accent-500/10 text-accent-400'
            }`}>
              {metrics.trainingStress.balance === 'balanced' ? '✓ Balanced' :
               metrics.trainingStress.balance === 'run-heavy' ? '🏃 Run-Heavy' :
               '💪 Strength-Heavy'}
            </span>
          </div>

          {/* Visual balance bar */}
          <div className="h-4 bg-surface-elevated rounded-full overflow-hidden flex">
            <div
              className="bg-primary-500 transition-all"
              style={{
                width: `${(metrics.trainingStress.runningStress / metrics.trainingStress.totalStress) * 100}%`
              }}
            />
            <div
              className="bg-accent-500 transition-all"
              style={{
                width: `${(metrics.trainingStress.strengthStress / metrics.trainingStress.totalStress) * 100}%`
              }}
            />
          </div>
        </div>

        {/* Acute:Chronic Ratio */}
        <div className="bg-surface-elevated rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-primary">Acute:Chronic Workload Ratio</span>
            <span className={`text-2xl font-bold ${
              metrics.trainingStress.acuteChronicRatio > 1.5
                ? 'text-red-400'
                : metrics.trainingStress.acuteChronicRatio < 0.8
                ? 'text-yellow-400'
                : 'text-semantic-success'
            }`}>
              {metrics.trainingStress.acuteChronicRatio.toFixed(2)}
            </span>
          </div>
          <div className="text-xs text-text-tertiary mb-2">
            Safe range: 0.8 - 1.5 (Current: {
              metrics.trainingStress.acuteChronicRatio > 1.5 ? 'High Risk' :
              metrics.trainingStress.acuteChronicRatio < 0.8 ? 'Low Load' :
              'Optimal'
            })
          </div>
          <div className="h-2 bg-surface rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                metrics.trainingStress.acuteChronicRatio > 1.5
                  ? 'bg-red-500'
                  : metrics.trainingStress.acuteChronicRatio < 0.8
                  ? 'bg-yellow-500'
                  : 'bg-semantic-success'
              }`}
              style={{
                width: `${Math.min((metrics.trainingStress.acuteChronicRatio / 2) * 100, 100)}%`
              }}
            />
          </div>
        </div>

        {/* Recommendation */}
        <div className="bg-primary-500/5 border border-primary-500/20 rounded-lg p-4">
          <p className="text-sm text-text-secondary">{metrics.trainingStress.recommendation}</p>
        </div>
      </div>

      {/* Volume Progression */}
      <div className="card">
        <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <span className="text-2xl">📈</span>
          Volume Progression
        </h3>

        {metrics.weeklyVolume.length > 0 ? (
          <>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-tertiary">Volume Change (Last 4 Weeks)</span>
                <span className={`text-lg font-bold ${
                  metrics.volumeChange > 0 ? 'text-semantic-success' :
                  metrics.volumeChange < 0 ? 'text-red-400' : 'text-text-tertiary'
                }`}>
                  {metrics.volumeChange > 0 ? '+' : ''}{metrics.volumeChange.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Simple bar chart */}
            <div className="space-y-2">
              {metrics.weeklyVolume.slice(-8).map((week, index) => {
                const maxVolume = Math.max(...metrics.weeklyVolume.map(w => w.volume));
                const percentage = (week.volume / maxVolume) * 100;

                return (
                  <div key={week.week} className="flex items-center gap-3">
                    <div className="text-xs text-text-tertiary w-20 text-right">
                      {new Date(week.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex-1">
                      <div className="h-8 bg-surface-elevated rounded overflow-hidden">
                        <div
                          className="h-full bg-accent-500 transition-all flex items-center justify-end pr-2"
                          style={{ width: `${percentage}%` }}
                        >
                          {week.volume > 0 && (
                            <span className="text-xs font-medium text-white">
                              {week.volume.toFixed(0)} kg
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="text-text-tertiary text-center py-8">No volume data yet. Complete some strength workouts!</p>
        )}
      </div>

      {/* Strength Progression */}
      <div className="card">
        <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <span className="text-2xl">💪</span>
          Strength Progression
        </h3>

        {metrics.strengthProgression.length > 0 ? (
          <div className="space-y-3">
            {metrics.strengthProgression.map((exercise, index) => (
              <div key={index} className="bg-surface-elevated rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-text-primary">{exercise.exercise}</h4>
                  <span className={`text-lg font-bold ${
                    exercise.change > 0 ? 'text-semantic-success' :
                    exercise.change < 0 ? 'text-red-400' : 'text-text-tertiary'
                  }`}>
                    {exercise.change > 0 ? '+' : ''}{exercise.change.toFixed(1)} kg
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-text-tertiary">
                  <span>Previous: {exercise.previousWeight.toFixed(1)} kg</span>
                  <span>→</span>
                  <span>Current: {exercise.currentWeight.toFixed(1)} kg</span>
                  <span className={`ml-auto font-medium ${
                    exercise.changePercent > 0 ? 'text-semantic-success' :
                    exercise.changePercent < 0 ? 'text-red-400' : 'text-text-tertiary'
                  }`}>
                    {exercise.changePercent > 0 ? '+' : ''}{exercise.changePercent.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-tertiary text-center py-8">No progression data yet. Log more workouts!</p>
        )}
      </div>

      {/* Training Frequency */}
      <div className="card">
        <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <span className="text-2xl">📅</span>
          Training Frequency (Last 12 Weeks)
        </h3>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-surface-elevated rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-text-primary mb-1">
              {metrics.trainingFrequency.totalWorkouts}
            </p>
            <p className="text-xs text-text-tertiary">Total Workouts</p>
          </div>

          <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-primary-400 mb-1">
              {metrics.trainingFrequency.runWorkouts}
            </p>
            <p className="text-xs text-text-tertiary">Runs</p>
          </div>

          <div className="bg-accent-500/10 border border-accent-500/20 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-accent-400 mb-1">
              {metrics.trainingFrequency.strengthWorkouts}
            </p>
            <p className="text-xs text-text-tertiary">Strength Sessions</p>
          </div>

          <div className="bg-semantic-success/10 border border-semantic-success/20 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-semantic-success mb-1">
              {metrics.trainingFrequency.avgPerWeek.toFixed(1)}
            </p>
            <p className="text-xs text-text-tertiary">Avg/Week</p>
          </div>
        </div>
      </div>
    </div>
  );
}
