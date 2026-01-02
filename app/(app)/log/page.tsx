export default async function ActivityLogPage() {
  // Mock data - in production, fetch from database
  const activities = [
    {
      id: '1',
      type: 'run',
      date: '2026-01-02',
      distance: 8.5,
      duration: 42,
      avgHR: 165,
      rpe: 6,
      source: 'manual',
    },
    {
      id: '2',
      type: 'strength',
      date: '2026-01-01',
      exercises: ['Back Squat', 'Bench Press', 'Romanian Deadlift'],
      duration: 55,
      rpe: 7,
    },
    {
      id: '3',
      type: 'run',
      date: '2025-12-30',
      distance: 15.2,
      duration: 78,
      avgHR: 162,
      rpe: 7,
      source: 'strava',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Activity Log</h1>
          <p className="text-text-secondary">View all your logged workouts and activities</p>
        </div>
        <button className="btn-primary">+ Log Activity</button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select className="px-4 py-2 rounded-lg border border-surface-elevated bg-surface text-text-primary focus:outline-none focus:border-primary-500">
          <option>All Activities</option>
          <option>Runs</option>
          <option>Strength</option>
        </select>
        <select className="px-4 py-2 rounded-lg border border-surface-elevated bg-surface text-text-primary focus:outline-none focus:border-primary-500">
          <option>Last 30 Days</option>
          <option>Last 7 Days</option>
          <option>This Month</option>
          <option>All Time</option>
        </select>
      </div>

      {/* Activities List */}
      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="card hover:border-primary-500/20 transition-colors cursor-pointer"
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
                    <span>{new Date(activity.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}</span>

                    {activity.type === 'run' && (
                      <>
                        <span>• {activity.distance} km</span>
                        <span>• {activity.duration} min</span>
                        {activity.avgHR && <span>• {activity.avgHR} bpm avg</span>}
                        <span>• RPE {activity.rpe}</span>
                      </>
                    )}

                    {activity.type === 'strength' && (
                      <>
                        <span>• {activity.duration} min</span>
                        <span>• {activity.exercises?.length} exercises</span>
                        <span>• RPE {activity.rpe}</span>
                      </>
                    )}
                  </div>

                  {activity.type === 'strength' && activity.exercises && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {activity.exercises.map((ex, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 rounded bg-surface-elevated text-text-secondary"
                        >
                          {ex}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <button className="text-text-tertiary hover:text-text-primary p-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="flex justify-center">
        <button className="btn-secondary">Load More</button>
      </div>
    </div>
  );
}
