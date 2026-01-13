'use client';

import { useState } from 'react';

interface OverloadFactors {
  volumeIncrease: number; // percentage change
  intensityIncrease: number; // percentage change
  frequencyConsistency: number; // 0-100
  recoveryQuality: number; // 0-100
}

interface ProgressiveOverloadScoreProps {
  factors: OverloadFactors;
  weekOverWeekChange: number;
}

function calculateOverloadScore(factors: OverloadFactors): {
  score: number;
  rating: string;
  color: string;
  recommendations: string[];
  risks: string[];
} {
  // Calculate weighted score
  let score = 5; // Start at middle

  // Volume increase (optimal 5-10%, dangerous >20%)
  if (factors.volumeIncrease >= 5 && factors.volumeIncrease <= 10) {
    score += 2;
  } else if (factors.volumeIncrease > 10 && factors.volumeIncrease <= 15) {
    score += 1;
  } else if (factors.volumeIncrease > 20) {
    score -= 2;
  } else if (factors.volumeIncrease < 0) {
    score -= 1;
  }

  // Intensity increase
  if (factors.intensityIncrease >= 2 && factors.intensityIncrease <= 5) {
    score += 1;
  } else if (factors.intensityIncrease > 10) {
    score -= 1;
  }

  // Frequency consistency
  if (factors.frequencyConsistency >= 80) {
    score += 1;
  } else if (factors.frequencyConsistency < 60) {
    score -= 1;
  }

  // Recovery quality
  if (factors.recoveryQuality >= 70) {
    score += 1;
  } else if (factors.recoveryQuality < 50) {
    score -= 2;
  }

  // Clamp score between 1-10
  score = Math.max(1, Math.min(10, score));

  // Determine rating and recommendations
  let rating = '';
  let color = '';
  const recommendations: string[] = [];
  const risks: string[] = [];

  if (score >= 8) {
    rating = 'Excellent';
    color = 'text-emerald-400';
    recommendations.push('Maintain current progression rate');
    recommendations.push('Continue tracking recovery metrics');
  } else if (score >= 6) {
    rating = 'Good';
    color = 'text-sky-400';
    recommendations.push('Steady progress - keep it up');
    if (factors.volumeIncrease < 5) {
      recommendations.push('Consider slight volume increase (5-10%)');
    }
  } else if (score >= 4) {
    rating = 'Moderate';
    color = 'text-yellow-400';
    recommendations.push('Progress is conservative');
    if (factors.volumeIncrease < 2) {
      recommendations.push('Increase training volume gradually');
    }
    if (factors.frequencyConsistency < 70) {
      recommendations.push('Improve training consistency');
    }
  } else {
    rating = 'Needs Attention';
    color = 'text-red-400';
    if (factors.volumeIncrease > 20) {
      risks.push('Volume increase too aggressive - risk of overtraining');
      recommendations.push('Reduce volume by 10-15%');
    }
    if (factors.recoveryQuality < 50) {
      risks.push('Poor recovery quality detected');
      recommendations.push('Add extra rest day or deload week');
    }
    if (factors.volumeIncrease < -10) {
      risks.push('Significant volume decrease - may lose adaptations');
      recommendations.push('Gradually rebuild training volume');
    }
  }

  return { score, rating, color, recommendations, risks };
}

export function ProgressiveOverloadScore({ factors, weekOverWeekChange }: ProgressiveOverloadScoreProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const { score, rating, color, recommendations, risks } = calculateOverloadScore(factors);

  const getScoreColor = (s: number) => {
    if (s >= 8) return '#10b981'; // emerald
    if (s >= 6) return '#0ea5e9'; // sky
    if (s >= 4) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const circumference = 2 * Math.PI * 54;
  const progress = (score / 10) * circumference;

  return (
    <div className="card">
      <h3 className="text-lg font-bold text-white mb-4">Progressive Overload Score</h3>

      <div className="flex items-center gap-6">
        {/* Score Circle */}
        <div
          className="relative cursor-pointer"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <svg className="w-32 h-32 transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="64"
              cy="64"
              r="54"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="64"
              cy="64"
              r="54"
              fill="none"
              stroke={getScoreColor(score)}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${color}`}>{score}</span>
            <span className="text-xs text-white/60">/10</span>
          </div>
        </div>

        {/* Rating Info */}
        <div className="flex-1">
          <div className="mb-4">
            <p className="text-sm text-white/60 mb-1">Rating</p>
            <p className={`text-2xl font-bold ${color}`}>{rating}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-white/50 mb-1">Volume Change</p>
              <p className={`font-medium ${factors.volumeIncrease > 15 ? 'text-yellow-400' : factors.volumeIncrease > 0 ? 'text-emerald-400' : 'text-white/70'}`}>
                {factors.volumeIncrease > 0 ? '+' : ''}{factors.volumeIncrease.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-white/50 mb-1">Consistency</p>
              <p className={`font-medium ${factors.frequencyConsistency >= 80 ? 'text-emerald-400' : 'text-white/70'}`}>
                {factors.frequencyConsistency}%
              </p>
            </div>
            <div>
              <p className="text-white/50 mb-1">Intensity</p>
              <p className={`font-medium ${factors.intensityIncrease > 10 ? 'text-yellow-400' : 'text-white/70'}`}>
                {factors.intensityIncrease > 0 ? '+' : ''}{factors.intensityIncrease.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-white/50 mb-1">Recovery</p>
              <p className={`font-medium ${factors.recoveryQuality >= 70 ? 'text-emerald-400' : factors.recoveryQuality < 50 ? 'text-red-400' : 'text-white/70'}`}>
                {factors.recoveryQuality}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip Content */}
      {showTooltip && (
        <div className="mt-6 p-4 bg-white/10 border border-white/20 rounded-lg animate-fadeIn">
          <h4 className="text-sm font-bold text-white mb-3">Score Breakdown</h4>

          {/* Risks */}
          {risks.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Risks Detected
              </p>
              <ul className="space-y-1">
                {risks.map((risk, i) => (
                  <li key={i} className="text-xs text-red-400/90 pl-6">• {risk}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          <div>
            <p className="text-xs font-semibold text-white/80 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Recommendations
            </p>
            <ul className="space-y-1">
              {recommendations.map((rec, i) => (
                <li key={i} className="text-xs text-white/70 pl-6">• {rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
