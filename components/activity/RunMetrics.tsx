'use client';

import { useEffect, useState } from 'react';
import { calculateAdvancedMetrics, type AdvancedRunMetrics } from '@/lib/metrics/running';

interface RunMetricsProps {
  detail: any;
  streams?: any;
}

export function RunMetrics({ detail, streams }: RunMetricsProps) {
  const [metrics, setMetrics] = useState<AdvancedRunMetrics | null>(null);

  useEffect(() => {
    if (detail) {
      const runData = {
        distance: detail.distance,
        duration: detail.moving_time,
        averageHR: detail.average_heartrate,
        maxHR: detail.max_heartrate,
        averageSpeed: detail.average_speed,
        totalElevationGain: detail.total_elevation_gain,
        splits: detail.splits_metric
      };

      const calculatedMetrics = calculateAdvancedMetrics(runData);
      setMetrics(calculatedMetrics);
    }
  }, [detail]);

  if (!metrics) {
    return (
      <div className="card">
        <p className="text-text-secondary text-center">Calculating metrics...</p>
      </div>
    );
  }

  const MetricCard = ({
    title,
    value,
    unit,
    category,
    description
  }: {
    title: string;
    value: number | null;
    unit: string;
    category?: string;
    description: string;
  }) => {
    const getCategoryColor = (cat: string) => {
      if (title.includes('Drift')) {
        if (cat === 'Excellent') return 'text-green-400';
        if (cat === 'Good') return 'text-blue-400';
        if (cat === 'Moderate') return 'text-yellow-400';
        if (cat === 'Poor') return 'text-red-400';
      } else if (title.includes('TRIMP')) {
        if (cat === 'Low') return 'text-blue-400';
        if (cat === 'Moderate') return 'text-green-400';
        if (cat === 'High') return 'text-yellow-400';
        if (cat === 'Very High') return 'text-red-400';
      }
      return 'text-text-secondary';
    };

    return (
      <div className="card">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="text-sm font-medium text-text-secondary mb-1">{title}</h4>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-text-primary">
                {value !== null ? value.toFixed(1) : 'N/A'}
              </span>
              <span className="text-sm text-text-tertiary">{unit}</span>
            </div>
          </div>
          {category && category !== 'N/A' && (
            <span className={`text-xs font-medium px-2 py-1 rounded ${getCategoryColor(category)} bg-surface-elevated`}>
              {category}
            </span>
          )}
        </div>
        <p className="text-xs text-text-tertiary">{description}</p>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3 className="text-lg font-semibold text-text-primary">Advanced Running Metrics</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* HR Drift */}
        <MetricCard
          title="Cardiac Drift"
          value={metrics.hrDrift}
          unit="%"
          category={metrics.hrDriftCategory}
          description="Heart rate increase from first to second half. Lower is better - indicates good aerobic fitness."
        />

        {/* TRIMP */}
        <MetricCard
          title="Training Load (TRIMP)"
          value={metrics.trimp}
          unit="score"
          category={metrics.trimpCategory}
          description="Training impulse - quantifies the training stress on your cardiovascular system."
        />

        {/* Aerobic Decoupling */}
        {metrics.aerobicDecoupling !== null && (
          <MetricCard
            title="Aerobic Decoupling"
            value={metrics.aerobicDecoupling}
            unit="%"
            description="Efficiency drift (pace/HR ratio). <5% is excellent aerobic fitness."
          />
        )}

        {/* Pace Variability */}
        {metrics.variabilityIndex !== null && (
          <MetricCard
            title="Pace Consistency"
            value={metrics.variabilityIndex}
            unit="CV%"
            description="Lower values indicate more even pacing. <5% is very consistent."
          />
        )}

        {/* VO2max Estimate */}
        {metrics.estimatedVO2max !== null && (
          <MetricCard
            title="Estimated VO2max"
            value={metrics.estimatedVO2max}
            unit="ml/kg/min"
            description="Estimated maximal oxygen uptake - a key indicator of aerobic fitness."
          />
        )}
      </div>

      {/* Metric Explanations */}
      <div className="card bg-surface-elevated/50 border border-surface-elevated">
        <h4 className="text-sm font-semibold text-text-primary mb-2">📊 Understanding Your Metrics</h4>
        <div className="space-y-2 text-xs text-text-secondary">
          <div>
            <strong className="text-text-primary">Cardiac Drift:</strong> Measures cardiovascular efficiency.
            Excellent runners show &lt;3% drift even on long runs.
          </div>
          <div>
            <strong className="text-text-primary">TRIMP Score:</strong> Higher scores indicate more training stress.
            Balance high-load days with recovery to avoid overtraining.
          </div>
          <div>
            <strong className="text-text-primary">Aerobic Decoupling:</strong> When pace slows relative to heart rate,
            it indicates declining aerobic efficiency. Train at lower intensities to improve.
          </div>
        </div>
      </div>
    </div>
  );
}
