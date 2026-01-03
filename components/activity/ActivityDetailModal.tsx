'use client';

import { useState, useEffect } from 'react';
import { getActivityDetails } from '@/app/actions/strava';
import { ActivityMap } from './ActivityMap';
import { ActivityCharts } from './ActivityCharts';

interface ActivityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityId: string | null;
  userId: string;
}

export function ActivityDetailModal({ isOpen, onClose, activityId, userId }: ActivityDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'charts'>('overview');

  useEffect(() => {
    if (isOpen && activityId) {
      fetchActivityData();
    }
  }, [isOpen, activityId]);

  const fetchActivityData = async () => {
    if (!activityId) return;

    setLoading(true);
    setError(null);

    try {
      console.log('[ActivityDetailModal] Fetching activity details for:', activityId);
      const result = await getActivityDetails(userId, activityId);
      setData(result);
      console.log('[ActivityDetailModal] Activity data loaded:', result);
    } catch (err) {
      console.error('[ActivityDetailModal] Error fetching activity:', err);
      setError(err instanceof Error ? err.message : 'Failed to load activity details');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-surface rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-elevated">
          <h2 className="text-2xl font-bold text-text-primary">
            {data?.detail?.name || 'Activity Details'}
          </h2>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-surface-elevated px-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'map'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Map
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'charts'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Charts
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-text-secondary">Loading activity details...</div>
            </div>
          )}

          {error && (
            <div className="bg-semantic-error/10 border border-semantic-error/20 rounded-lg p-4">
              <p className="text-semantic-error">{error}</p>
            </div>
          )}

          {!loading && !error && data && (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="card">
                      <div className="text-sm text-text-secondary mb-1">Distance</div>
                      <div className="text-2xl font-bold text-text-primary">
                        {(data.detail.distance / 1000).toFixed(2)} km
                      </div>
                    </div>
                    <div className="card">
                      <div className="text-sm text-text-secondary mb-1">Time</div>
                      <div className="text-2xl font-bold text-text-primary">
                        {Math.floor(data.detail.moving_time / 60)} min
                      </div>
                    </div>
                    <div className="card">
                      <div className="text-sm text-text-secondary mb-1">Avg Pace</div>
                      <div className="text-2xl font-bold text-text-primary">
                        {data.detail.average_speed
                          ? `${Math.floor(1000 / (data.detail.average_speed * 60))}:${String(Math.floor((1000 / data.detail.average_speed) % 60)).padStart(2, '0')}`
                          : 'N/A'
                        } /km
                      </div>
                    </div>
                    <div className="card">
                      <div className="text-sm text-text-secondary mb-1">Elevation</div>
                      <div className="text-2xl font-bold text-text-primary">
                        {Math.round(data.detail.total_elevation_gain || 0)} m
                      </div>
                    </div>
                  </div>

                  {/* Heart Rate & Calories */}
                  {(data.detail.average_heartrate || data.detail.calories) && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {data.detail.average_heartrate && (
                        <div className="card">
                          <div className="text-sm text-text-secondary mb-1">Avg Heart Rate</div>
                          <div className="text-2xl font-bold text-text-primary">
                            {Math.round(data.detail.average_heartrate)} bpm
                          </div>
                        </div>
                      )}
                      {data.detail.max_heartrate && (
                        <div className="card">
                          <div className="text-sm text-text-secondary mb-1">Max Heart Rate</div>
                          <div className="text-2xl font-bold text-text-primary">
                            {Math.round(data.detail.max_heartrate)} bpm
                          </div>
                        </div>
                      )}
                      {data.detail.calories && (
                        <div className="card">
                          <div className="text-sm text-text-secondary mb-1">Calories</div>
                          <div className="text-2xl font-bold text-text-primary">
                            {Math.round(data.detail.calories)} kcal
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Splits */}
                  {data.detail.splits_metric && data.detail.splits_metric.length > 0 && (
                    <div className="card">
                      <h3 className="text-lg font-semibold text-text-primary mb-4">Splits (per km)</h3>
                      <div className="space-y-2">
                        {data.detail.splits_metric.map((split: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between py-2 border-b border-surface-elevated last:border-0"
                          >
                            <span className="text-text-secondary">Km {index + 1}</span>
                            <span className="font-mono text-text-primary">
                              {Math.floor(split.elapsed_time / 60)}:{String(Math.floor(split.elapsed_time % 60)).padStart(2, '0')}
                            </span>
                            {split.average_heartrate && (
                              <span className="text-text-secondary">
                                {Math.round(split.average_heartrate)} bpm
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'map' && (
                <div className="h-[500px]">
                  {data.detail.map ? (
                    <ActivityMap polyline={data.detail.map} />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-surface-elevated rounded-lg">
                      <p className="text-text-secondary">No map data available for this activity</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'charts' && (
                <ActivityCharts streams={data.streams} detail={data.detail} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
