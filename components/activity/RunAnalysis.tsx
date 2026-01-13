'use client';

import { useEffect, useState } from 'react';
import { generateRunAnalysis } from '@/app/actions/run-analysis';

interface RunAnalysisProps {
  detail: any;
}

export function RunAnalysis({ detail }: RunAnalysisProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (detail) {
      fetchAnalysis();
    }
  }, [detail]);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const runData = {
        distance: detail.distance,
        duration: detail.moving_time,
        averageHR: detail.average_heartrate,
        maxHR: detail.max_heartrate,
        averageSpeed: detail.average_speed,
        totalElevationGain: detail.total_elevation_gain,
        splits: detail.splits_metric
      };

      const result = await generateRunAnalysis(runData);

      if (result.success && result.analysis) {
        setAnalysis(result.analysis);
      } else {
        setError(result.error || 'Failed to generate analysis');
      }
    } catch (err) {
      console.error('[RunAnalysis] Error:', err);
      setError('Failed to generate analysis');
    } finally {
      setLoading(false);
    }
  };

  const parseAnalysis = (text: string) => {
    // Split by sections
    const sections = text.split(/\n\n+/);

    let runAnalysisSection = '';
    let trainingBenefitSection = '';

    sections.forEach(section => {
      const trimmed = section.trim();
      if (trimmed.match(/^1\.|RUN ANALYSIS/i)) {
        runAnalysisSection = trimmed.replace(/^1\.\s*RUN ANALYSIS:?\s*/i, '').trim();
      } else if (trimmed.match(/^2\.|TRAINING BENEFIT/i)) {
        trainingBenefitSection = trimmed.replace(/^2\.\s*TRAINING BENEFIT:?\s*/i, '').trim();
      } else if (!runAnalysisSection && trimmed) {
        runAnalysisSection = trimmed;
      } else if (runAnalysisSection && !trainingBenefitSection && trimmed) {
        trainingBenefitSection = trimmed;
      }
    });

    return {
      runAnalysis: runAnalysisSection || sections[0]?.trim() || '',
      trainingBenefit: trainingBenefitSection || sections[1]?.trim() || ''
    };
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center gap-3">
          <div className="animate-spin text-primary-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <span className="text-text-secondary">AI Coach analyzing your run...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-semantic-error/10 border border-semantic-error/20">
        <p className="text-semantic-error text-sm">{error}</p>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  const { runAnalysis, trainingBenefit } = parseAnalysis(analysis);

  return (
    <div className="space-y-4">
      {/* AI Coach Header */}
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <h3 className="text-lg font-semibold text-text-primary">AI Coach Analysis</h3>
      </div>

      {/* Run Analysis Section */}
      {runAnalysis && (
        <div className="card bg-primary-500/5 border border-primary-500/20">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary mb-2">Run Analysis</h4>
              <p className="text-sm text-text-secondary leading-relaxed">{runAnalysis}</p>
            </div>
          </div>
        </div>
      )}

      {/* Training Benefit Section */}
      {trainingBenefit && (
        <div className="card bg-accent-500/5 border border-accent-500/20">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <svg className="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary mb-2">Training Benefit</h4>
              <p className="text-sm text-text-secondary leading-relaxed">{trainingBenefit}</p>
            </div>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <button
        onClick={fetchAnalysis}
        className="text-xs text-text-tertiary hover:text-primary-500 flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Regenerate analysis
      </button>
    </div>
  );
}
