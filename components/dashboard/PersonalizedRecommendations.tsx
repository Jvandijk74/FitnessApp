'use client';

import { useState, useEffect } from 'react';

interface PersonalizedRecommendationsProps {
  userId: string;
}

interface Recommendation {
  category: 'nutrition' | 'recovery' | 'training' | 'hydration';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export function PersonalizedRecommendations({ userId }: PersonalizedRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, [userId]);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[PersonalizedRecommendations] 📊 Fetching recommendations...');

      const response = await fetch('/api/coach/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      console.log('[PersonalizedRecommendations] ✅ Recommendations received:', data.recommendations.length);
      setRecommendations(data.recommendations);
    } catch (err) {
      console.error('[PersonalizedRecommendations] ❌ Error:', err);
      setError('Unable to load recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const categoryIcons = {
    nutrition: '🍎',
    recovery: '💪',
    training: '🏃',
    hydration: '💧',
  };

  const categoryColors = {
    nutrition: 'bg-green-500/10 border-green-500/20 text-green-400',
    recovery: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    training: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    hydration: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
  };

  const priorityBadges = {
    high: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'High Priority' },
    medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Medium' },
    low: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Low' },
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">💡</span>
          <h2 className="text-2xl font-bold text-text-primary">Today's Recommendations</h2>
        </div>
        <div className="text-center py-8">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
          <p className="text-text-tertiary mt-4">Analyzing your day...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">💡</span>
          <h2 className="text-2xl font-bold text-text-primary">Today's Recommendations</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-red-400 mb-2">{error}</p>
          <button onClick={fetchRecommendations} className="btn-secondary text-sm">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Today's Recommendations</h2>
            <p className="text-sm text-text-tertiary">Personalized insights based on your data</p>
          </div>
        </div>
        <button
          onClick={fetchRecommendations}
          className="text-text-tertiary hover:text-text-primary transition"
          title="Refresh recommendations"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-text-secondary">
            Great job! No urgent recommendations at the moment. Keep up the good work!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${categoryColors[rec.category]}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{categoryIcons[rec.category]}</span>
                  <h3 className="font-semibold text-text-primary">{rec.title}</h3>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${priorityBadges[rec.priority].bg} ${priorityBadges[rec.priority].text}`}>
                  {priorityBadges[rec.priority].label}
                </span>
              </div>
              <p className="text-sm text-text-secondary ml-9">{rec.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
