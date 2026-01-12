'use client';

import { useState } from 'react';
import { ActivityDetailModal } from './ActivityDetailModal';

interface Activity {
  id: string;
  type: 'run' | 'strength';
  date: string;
  // Run fields
  distance?: number;
  duration?: number;
  avgHR?: number;
  maxHR?: number;
  rpe?: number;
  intensity?: string;
  targetRpe?: number;
  // Strength fields
  exercise?: string;
  sets?: string;
  exercises?: any[];
  totalVolume?: number;
  totalSets?: number;
  exerciseCount?: number;
  // Common fields
  name?: string;
  source?: string;
  stravaActivityId?: string;
  scheduledWorkoutId?: string;
  day?: string;
  aiFeedback?: string;
}

interface ActivityLogListProps {
  activities: Activity[];
  userId: string;
}

export function ActivityLogList({ activities, userId }: ActivityLogListProps) {
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const handleActivityClick = (activity: Activity) => {
    // Strava activities: show detail modal
    if (activity.source === 'strava' && activity.stravaActivityId) {
      setSelectedActivityId(activity.stravaActivityId);
      setIsModalOpen(true);
    }
    // Scheduled workouts with AI feedback: show feedback modal
    else if (activity.source === 'scheduled' && activity.aiFeedback) {
      setSelectedActivity(activity);
      setShowFeedbackModal(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedActivityId(null);
  };

  const handleCloseFeedbackModal = () => {
    setShowFeedbackModal(false);
    setSelectedActivity(null);
  };

  return (
    <>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            onClick={() => handleActivityClick(activity)}
            className={`card transition-colors ${
              (activity.source === 'strava' ||
               (activity.source === 'scheduled' && (activity.aiFeedback || (activity.type === 'strength' && activity.exercises))))
                ? 'hover:border-primary-500/20 cursor-pointer'
                : ''
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
                    <h3 className="font-semibold text-text-primary">
                      {activity.name || (activity.type === 'run' ? 'Run' : activity.exercise || 'Strength Training')}
                    </h3>
                    {activity.source === 'strava' && (
                      <span className="text-xs px-2 py-0.5 rounded bg-accent-500/10 text-accent-400 border border-accent-500/20">
                        Strava
                      </span>
                    )}
                    {activity.source === 'scheduled' && (
                      <span className="text-xs px-2 py-0.5 rounded bg-primary-500/10 text-primary-400 border border-primary-500/20">
                        Completed
                      </span>
                    )}
                    {activity.aiFeedback && (
                      <span className="text-xs px-2 py-0.5 rounded bg-semantic-success/10 text-semantic-success border border-semantic-success/20">
                        🤖 AI Feedback
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
                        {activity.distance && <span>• {activity.distance.toFixed(1)} km</span>}
                        {activity.duration && <span>• {activity.duration} min</span>}
                        {activity.avgHR && <span>• {activity.avgHR} bpm avg</span>}
                        {activity.rpe && <span>• RPE {activity.rpe}</span>}
                        {activity.intensity && <span>• {activity.intensity}</span>}
                      </>
                    )}

                    {activity.type === 'strength' && (
                      <>
                        {activity.exerciseCount && <span>• {activity.exerciseCount} exercises</span>}
                        {activity.totalSets && <span>• {activity.totalSets} sets</span>}
                        {activity.totalVolume && <span>• {activity.totalVolume.toFixed(0)} kg volume</span>}
                        {activity.exercise && !activity.exerciseCount && <span>• {activity.exercise}</span>}
                        {activity.sets && !activity.totalSets && <span>• {activity.sets}</span>}
                      </>
                    )}
                  </div>

                  {/* AI Feedback Preview */}
                  {activity.aiFeedback && (
                    <div className="mt-2 p-3 bg-surface-elevated rounded-lg text-xs text-text-secondary">
                      <p className="line-clamp-2">{activity.aiFeedback}</p>
                      <p className="text-primary-400 mt-1">Click to view full analysis →</p>
                    </div>
                  )}

                  {/* Strength Workout Details Hint */}
                  {activity.type === 'strength' && activity.exercises && activity.exercises.length > 0 && !activity.aiFeedback && (
                    <div className="mt-2 text-xs text-primary-400">
                      Click to view exercise details →
                    </div>
                  )}
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

      {/* Activity Detail Modal (for Strava) */}
      <ActivityDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        activityId={selectedActivityId}
        userId={userId}
      />

      {/* AI Feedback Modal (for scheduled workouts) */}
      {showFeedbackModal && selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-surface rounded-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-text-primary">
                  {selectedActivity.name || 'Workout Complete'}
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  {new Date(selectedActivity.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <button
                onClick={handleCloseFeedbackModal}
                className="p-2 hover:bg-surface-elevated rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {selectedActivity.type === 'strength' && (
                <>
                  <div className="bg-surface-elevated rounded-lg p-4">
                    <p className="text-xs text-text-tertiary mb-1">Exercises</p>
                    <p className="text-2xl font-bold text-text-primary">{selectedActivity.exerciseCount || 0}</p>
                  </div>
                  <div className="bg-surface-elevated rounded-lg p-4">
                    <p className="text-xs text-text-tertiary mb-1">Total Sets</p>
                    <p className="text-2xl font-bold text-text-primary">{selectedActivity.totalSets || 0}</p>
                  </div>
                  <div className="bg-surface-elevated rounded-lg p-4">
                    <p className="text-xs text-text-tertiary mb-1">Total Volume</p>
                    <p className="text-2xl font-bold text-text-primary">{selectedActivity.totalVolume?.toFixed(0) || 0} <span className="text-sm">kg</span></p>
                  </div>
                </>
              )}
              {selectedActivity.type === 'run' && (
                <>
                  {selectedActivity.distance && (
                    <div className="bg-surface-elevated rounded-lg p-4">
                      <p className="text-xs text-text-tertiary mb-1">Distance</p>
                      <p className="text-2xl font-bold text-text-primary">{selectedActivity.distance.toFixed(1)} <span className="text-sm">km</span></p>
                    </div>
                  )}
                  {selectedActivity.duration && (
                    <div className="bg-surface-elevated rounded-lg p-4">
                      <p className="text-xs text-text-tertiary mb-1">Duration</p>
                      <p className="text-2xl font-bold text-text-primary">{selectedActivity.duration} <span className="text-sm">min</span></p>
                    </div>
                  )}
                  {selectedActivity.intensity && (
                    <div className="bg-surface-elevated rounded-lg p-4">
                      <p className="text-xs text-text-tertiary mb-1">Intensity</p>
                      <p className="text-lg font-bold text-text-primary capitalize">{selectedActivity.intensity}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Exercise Details for Strength Workouts */}
            {selectedActivity.type === 'strength' && selectedActivity.exercises && selectedActivity.exercises.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-text-primary mb-4">Exercise Details</h3>
                <div className="space-y-4">
                  {selectedActivity.exercises.map((exercise: any, index: number) => (
                    <div key={index} className="bg-surface-elevated rounded-lg p-4 border border-white/10">
                      <h4 className="font-semibold text-text-primary mb-3">{exercise.exercise_name}</h4>

                      {exercise.logged_sets && exercise.logged_sets.length > 0 ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-12 gap-2 text-xs text-text-tertiary font-medium mb-2">
                            <div className="col-span-2">Set</div>
                            <div className="col-span-3">Weight (kg)</div>
                            <div className="col-span-3">Reps</div>
                            <div className="col-span-2">RPE</div>
                            <div className="col-span-2">Volume</div>
                          </div>
                          {exercise.logged_sets.map((set: any, setIndex: number) => (
                            <div key={setIndex} className="grid grid-cols-12 gap-2 text-sm">
                              <div className="col-span-2 text-text-tertiary">{setIndex + 1}</div>
                              <div className="col-span-3 text-text-primary font-semibold">{set.weight || 0} kg</div>
                              <div className="col-span-3 text-text-primary font-semibold">{set.reps || 0}</div>
                              <div className="col-span-2 text-text-secondary">{set.rpe || '-'}</div>
                              <div className="col-span-2 text-accent-400 font-medium">{((set.weight || 0) * (set.reps || 0)).toFixed(0)} kg</div>
                            </div>
                          ))}
                          <div className="mt-2 pt-2 border-t border-white/10 text-sm">
                            <span className="text-text-tertiary">Exercise Total: </span>
                            <span className="text-accent-400 font-bold">
                              {exercise.logged_sets.reduce((sum: number, set: any) => sum + (set.weight || 0) * (set.reps || 0), 0).toFixed(0)} kg
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-text-tertiary text-sm">No sets logged</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Feedback */}
            {selectedActivity.aiFeedback && (
              <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-6">
                <h3 className="text-lg font-bold text-primary-400 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🤖</span>
                  AI Coaching Feedback
                </h3>
                <div className="text-text-secondary whitespace-pre-line leading-relaxed">
                  {selectedActivity.aiFeedback}
                </div>
              </div>
            )}

            {/* Close Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCloseFeedbackModal}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
