'use client';

import { useState } from 'react';

interface RacePaceEstimates {
  pace5k: number;
  pace10k: number;
  paceHalfMarathon: number;
  paceMarathon: number;
  basedOnDistance: number;
  confidence: 'high' | 'medium' | 'low';
  explanation: string;
}

interface LactateThresholds {
  lt1Pace: number;
  lt1HR: number;
  lt2Pace: number;
  lt2HR: number;
  maxHR: number;
  confidence: 'high' | 'medium' | 'low';
  explanation: string;
}

interface RacePacesAndThresholdsProps {
  racePaces: RacePaceEstimates;
  lactateThresholds: LactateThresholds;
}

function formatPace(pace: number): string {
  if (pace === 0) return 'N/A';
  const minutes = Math.floor(pace);
  const seconds = Math.round((pace % 1) * 60);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function getConfidenceColor(confidence: 'high' | 'medium' | 'low'): string {
  switch (confidence) {
    case 'high':
      return 'bg-semantic-success text-semantic-success';
    case 'medium':
      return 'bg-semantic-warning text-semantic-warning';
    case 'low':
      return 'bg-semantic-error text-semantic-error';
  }
}

function getConfidenceBadge(confidence: 'high' | 'medium' | 'low'): string {
  switch (confidence) {
    case 'high':
      return '✓ High Accuracy';
    case 'medium':
      return '~ Medium Accuracy';
    case 'low':
      return '! Low Accuracy';
  }
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  explanation: string;
  confidence: 'high' | 'medium' | 'low';
  colorClass: string;
}

function MetricCard({ title, value, subtitle, icon, explanation, confidence, colorClass }: MetricCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className={`p-4 rounded-lg ${colorClass} border cursor-help transition-all hover:shadow-lg`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl">{icon}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${getConfidenceColor(confidence)} bg-opacity-20 font-medium`}>
            {getConfidenceBadge(confidence)}
          </span>
        </div>
        <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1">{title}</p>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
        {subtitle && <p className="text-xs text-text-secondary mt-1">{subtitle}</p>}
      </div>

      {/* Hover Tooltip */}
      {showTooltip && (
        <div className="absolute z-50 w-80 p-4 bg-surface-elevated border-2 border-primary-500/30 rounded-lg shadow-2xl -top-2 left-full ml-2 transform transition-all">
          <div className="flex items-start gap-2 mb-2">
            <div className="text-2xl">{icon}</div>
            <div>
              <h4 className="font-semibold text-text-primary mb-1">{title}</h4>
              <p className="text-xs text-text-tertiary uppercase tracking-wide mb-2">
                Accuracy: <span className="font-semibold">{confidence.toUpperCase()}</span>
              </p>
            </div>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">
            {explanation}
          </p>
          <div className="mt-3 pt-3 border-t border-surface text-xs text-text-tertiary">
            💡 Hover over metrics to see calculation details
          </div>
        </div>
      )}
    </div>
  );
}

export function RacePacesAndThresholds({ racePaces, lactateThresholds }: RacePacesAndThresholdsProps) {
  return (
    <div className="space-y-6">
      {/* Race Pace Predictions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">🏁 Predicted Race Paces</h3>
          <p className="text-xs text-text-tertiary">Hover for calculation details</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="5K Pace"
            value={`${formatPace(racePaces.pace5k)}/km`}
            subtitle={racePaces.pace5k > 0 ? `${Math.round(racePaces.pace5k * 5)} min total` : undefined}
            icon="🏃"
            explanation={racePaces.explanation}
            confidence={racePaces.confidence}
            colorClass="bg-blue-500/10 border-blue-500/20"
          />
          <MetricCard
            title="10K Pace"
            value={`${formatPace(racePaces.pace10k)}/km`}
            subtitle={racePaces.pace10k > 0 ? `${Math.round(racePaces.pace10k * 10)} min total` : undefined}
            icon="🏃‍♂️"
            explanation={racePaces.explanation}
            confidence={racePaces.confidence}
            colorClass="bg-green-500/10 border-green-500/20"
          />
          <MetricCard
            title="Half Marathon"
            value={`${formatPace(racePaces.paceHalfMarathon)}/km`}
            subtitle={racePaces.paceHalfMarathon > 0 ? `${Math.floor(racePaces.paceHalfMarathon * 21.1 / 60)}h ${Math.round(racePaces.paceHalfMarathon * 21.1 % 60)}m` : undefined}
            icon="🎽"
            explanation={racePaces.explanation}
            confidence={racePaces.confidence}
            colorClass="bg-purple-500/10 border-purple-500/20"
          />
          <MetricCard
            title="Marathon"
            value={`${formatPace(racePaces.paceMarathon)}/km`}
            subtitle={racePaces.paceMarathon > 0 ? `${Math.floor(racePaces.paceMarathon * 42.2 / 60)}h ${Math.round(racePaces.paceMarathon * 42.2 % 60)}m` : undefined}
            icon="🏅"
            explanation={racePaces.explanation}
            confidence={racePaces.confidence}
            colorClass="bg-orange-500/10 border-orange-500/20"
          />
        </div>
      </div>

      {/* Lactate Thresholds */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">⚡ Lactate Threshold Zones</h3>
          <p className="text-xs text-text-tertiary">Hover for calculation details</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="LT1 Pace"
            value={`${formatPace(lactateThresholds.lt1Pace)}/km`}
            subtitle="Aerobic Threshold"
            icon="🟢"
            explanation={lactateThresholds.explanation + ' LT1 (aerobic threshold) is the intensity where lactate begins to accumulate. Train below this for base building.'}
            confidence={lactateThresholds.confidence}
            colorClass="bg-green-500/10 border-green-500/20"
          />
          <MetricCard
            title="LT1 Heart Rate"
            value={`${lactateThresholds.lt1HR} bpm`}
            subtitle={`${Math.round((lactateThresholds.lt1HR / lactateThresholds.maxHR) * 100)}% of max HR`}
            icon="💚"
            explanation={lactateThresholds.explanation + ' At LT1, you should be able to maintain conversation comfortably.'}
            confidence={lactateThresholds.confidence}
            colorClass="bg-emerald-500/10 border-emerald-500/20"
          />
          <MetricCard
            title="LT2 Pace"
            value={`${formatPace(lactateThresholds.lt2Pace)}/km`}
            subtitle="Lactate Threshold"
            icon="🟡"
            explanation={lactateThresholds.explanation + ' LT2 (lactate threshold) is sustainable hard effort pace. Tempo runs target this zone.'}
            confidence={lactateThresholds.confidence}
            colorClass="bg-yellow-500/10 border-yellow-500/20"
          />
          <MetricCard
            title="LT2 Heart Rate"
            value={`${lactateThresholds.lt2HR} bpm`}
            subtitle={`${Math.round((lactateThresholds.lt2HR / lactateThresholds.maxHR) * 100)}% of max HR`}
            icon="💛"
            explanation={lactateThresholds.explanation + ' At LT2, you can speak only short sentences. This is your "comfortably hard" pace.'}
            confidence={lactateThresholds.confidence}
            colorClass="bg-amber-500/10 border-amber-500/20"
          />
        </div>
      </div>
    </div>
  );
}
