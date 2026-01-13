'use client';

import { useState } from 'react';

interface AIAnalysisProps {
  userId: string;
}

export function AIAnalysis({ userId }: AIAnalysisProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    totalDistance?: string;
    avgDistance?: string;
    avgPace?: string;
    avgHR?: number | null;
  } | null>(null);

  const analyzeActivities = async () => {
    setIsLoading(true);
    setError(null);

    console.log('\n🔍 [AI Analysis UI] Requesting activity analysis');
    console.log(`   User ID: ${userId}`);

    try {
      const startTime = Date.now();

      const response = await fetch('/api/analyze/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        console.error(`❌ [AI Analysis UI] API returned error status: ${response.status}`);
        throw new Error('Failed to analyze activities');
      }

      const data = await response.json();

      console.log(`✅ [AI Analysis UI] Analysis received (${duration}ms)`);
      console.log(`   Activities analyzed: ${data.activityCount}`);
      console.log(`   Analysis length: ${data.analysis?.length || 0} characters`);

      setAnalysis(data.analysis);
      setStats(data.stats || null);
    } catch (err) {
      console.error('❌ [AI Analysis UI] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze activities');
    } finally {
      setIsLoading(false);
    }
  };

  // Format the analysis text with proper markdown-style formatting
  const formatAnalysis = (text: string) => {
    return text.split('\n').map((line, index) => {
      // Bold headers (lines starting with ** or numbers followed by .)
      if (line.match(/^\*\*.*\*\*:?/) || line.match(/^\d+\.\s\*\*/)) {
        const boldText = line.replace(/\*\*/g, '');
        return (
          <p key={index} className="font-bold text-text-primary mt-4 mb-2">
            {boldText}
          </p>
        );
      }
      // Bullet points
      if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
        return (
          <li key={index} className="ml-6 text-text-secondary mb-1">
            {line.replace(/^[-•]\s*/, '')}
          </li>
        );
      }
      // Empty lines
      if (line.trim() === '') {
        return <div key={index} className="h-2" />;
      }
      // Regular text
      return (
        <p key={index} className="text-text-secondary mb-2">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">AI Training Analysis</h3>
          <p className="text-sm text-text-tertiary mt-1">
            Get personalized insights and recommendations powered by Groq AI
          </p>
        </div>
        <button
          onClick={analyzeActivities}
          disabled={isLoading}
          className="btn btn-primary"
        >
          {isLoading ? (
            <>
              <span className="inline-block animate-spin mr-2">⚙️</span>
              Analyzing...
            </>
          ) : (
            <>
              <span className="mr-2">🤖</span>
              Analyze My Training
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-semantic-error/10 border border-semantic-error/20 rounded-lg">
          <p className="text-semantic-error text-sm">
            ❌ {error}
          </p>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 p-4 bg-surface-elevated rounded-lg">
          <div>
            <p className="text-xs text-text-tertiary uppercase">Total Distance</p>
            <p className="text-xl font-bold text-primary-400">{stats.totalDistance} km</p>
          </div>
          <div>
            <p className="text-xs text-text-tertiary uppercase">Avg Distance</p>
            <p className="text-xl font-bold text-primary-400">{stats.avgDistance} km</p>
          </div>
          <div>
            <p className="text-xs text-text-tertiary uppercase">Avg Pace</p>
            <p className="text-xl font-bold text-primary-400">{stats.avgPace} min/km</p>
          </div>
          {stats.avgHR && (
            <div>
              <p className="text-xs text-text-tertiary uppercase">Avg Heart Rate</p>
              <p className="text-xl font-bold text-primary-400">{stats.avgHR} bpm</p>
            </div>
          )}
        </div>
      )}

      {analysis && (
        <div className="prose prose-invert max-w-none">
          <div className="p-6 bg-surface-elevated rounded-lg border border-primary-500/20">
            <div className="flex items-start gap-3 mb-4">
              <div className="text-2xl">🎯</div>
              <div className="flex-1">
                {formatAnalysis(analysis)}
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-surface-elevated">
              <p className="text-xs text-text-tertiary">
                💡 Analysis powered by Groq AI (Llama 3.1)
              </p>
            </div>
          </div>
        </div>
      )}

      {!analysis && !isLoading && !error && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏃‍♂️📊</div>
          <p className="text-text-secondary mb-2">
            Click "Analyze My Training" to get AI-powered insights
          </p>
          <p className="text-sm text-text-tertiary">
            Based on your recent Strava activities
          </p>
        </div>
      )}
    </div>
  );
}
