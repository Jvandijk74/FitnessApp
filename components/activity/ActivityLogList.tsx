'use client';

import { useState } from 'react';
import { ActivityDetailModal } from './ActivityDetailModal';

interface Activity {
  id: string;
  type: 'run' | 'strength';
  date: string;
  distance?: number;
  duration?: number;
  avgHR?: number;
  maxHR?: number;
  rpe?: number;
  source?: string;
  stravaActivityId?: string;
  day?: string;
  exercise?: string;
  sets?: string;
}

interface ActivityLogListProps {
  activities: Activity[];
  userId: string;
}

export function ActivityLogList({ activities, userId }: ActivityLogListProps) {
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleActivityClick = (activity: Activity) => {
    if (activity.source === 'strava' && activity.stravaActivityId) {
      setSelectedActivityId(activity.stravaActivityId);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedActivityId(null);
  };

  return (
    <>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            onClick={() => handleActivityClick(activity)}
            className={`card transition-colors ${
              activity.source === 'strava' ? 'hover:border-primary-500/20 cursor-pointer' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-4 flex-1">
                {/* Icon */}
                <div className="flex-shrink-0">
                  {activity.type === 'run' ? (
                    <div className="w-12 h-12 rounded-full bg-primary-500/10 flex items-center justify-center text-2xl">
                      🏃
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-accent-500/10 flex items-center justify-center text-2xl">
                      💪
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-text-primary capitalize">
                      {activity.type === 'run' ? 'Run' : 'Strength Training'}
                    </h3>
                    {activity.type === 'run' && activity.source === 'strava' && (
                      <span className="text-xs px-2 py-0.5 rounded bg-accent-500/10 text-accent-400 border border-accent-500/20">
                        Strava
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                    <span>
                      {new Date(activity.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>

                    {activity.type === 'run' && (
                      <>
                        <span>• {activity.distance?.toFixed(1)} km</span>
                        <span>• {activity.duration} min</span>
                        {activity.avgHR && <span>• {activity.avgHR} bpm avg</span>}
                        {activity.rpe && <span>• RPE {activity.rpe}</span>}
                      </>
                    )}

                    {activity.type === 'strength' && (
                      <>
                        <span>• {activity.exercise}</span>
                        <span>• {activity.sets}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <button className="text-text-tertiary hover:text-text-primary p-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Detail Modal */}
      <ActivityDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        activityId={selectedActivityId}
        userId={userId}
      />
    </>
  );
}
