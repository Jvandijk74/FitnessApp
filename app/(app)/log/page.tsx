'use client';

import { useEffect, useState } from 'react';
import { ActivityLogList } from '@/components/activity/ActivityLogList';
import { syncStravaActivities } from '@/app/actions/strava';
import { getActivities } from '@/app/actions/activities';

const DEMO_USER = 'demo-user';

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

export default function ActivityLogPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');

  // Auto-sync from Strava and load activities on mount
  useEffect(() => {
    async function initialize() {
      setIsLoading(true);
      setIsSyncing(true);

      try {
        // Auto-sync from Strava
        console.log('[Activity Log] Auto-syncing from Strava...');
        try {
          await syncStravaActivities(DEMO_USER);
          console.log('[Activity Log] Strava sync completed');
        } catch (error) {
          console.log('[Activity Log] Strava sync skipped (not connected or error):', error);
        }

        // Fetch all activities
        const data = await getActivities(DEMO_USER);
        setActivities(data);
        setFilteredActivities(data);
      } catch (error) {
        console.error('[Activity Log] Error loading activities:', error);
      } finally {
        setIsSyncing(false);
        setIsLoading(false);
      }
    }

    initialize();
  }, []);

  // Get unique months from activities
  const months = Array.from(
    new Set(
      activities.map((a) => {
        const date = new Date(a.date);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      })
    )
  ).sort((a, b) => b.localeCompare(a)); // Sort descending (most recent first)

  // Apply filters and sorting
  useEffect(() => {
    let result = [...activities];

    // Filter by type
    if (selectedType !== 'all') {
      result = result.filter((a) => a.type === selectedType);
    }

    // Filter by month
    if (selectedMonth !== 'all') {
      result = result.filter((a) => {
        const date = new Date(a.date);
        const activityMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return activityMonth === selectedMonth;
      });
    }

    // Sort
    switch (sortBy) {
      case 'date':
        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'longest':
        result.sort((a, b) => (b.distance || 0) - (a.distance || 0));
        break;
      case 'shortest':
        result.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        break;
      case 'fastest':
        // Fastest = lowest pace (duration/distance)
        result.sort((a, b) => {
          const paceA = a.distance && a.duration ? a.duration / a.distance : Infinity;
          const paceB = b.distance && b.duration ? b.duration / b.distance : Infinity;
          return paceA - paceB;
        });
        break;
    }

    setFilteredActivities(result);
  }, [activities, selectedType, selectedMonth, sortBy]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await syncStravaActivities(DEMO_USER);
      const data = await getActivities(DEMO_USER);
      setActivities(data);
    } catch (error) {
      console.error('[Activity Log] Manual sync error:', error);
      alert('Failed to sync with Strava. Please check your connection.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Activity Log</h1>
          <p className="text-text-secondary">
            View all your logged workouts and activities
            {isSyncing && (
              <span className="ml-2 text-primary-400 text-sm">
                <span className="inline-block animate-spin mr-1">⚙️</span>
                Syncing from Strava...
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="btn btn-secondary flex items-center gap-2"
          >
            {isSyncing ? (
              <>
                <span className="inline-block animate-spin">⚙️</span>
                Syncing...
              </>
            ) : (
              <>
                🔄 Sync Strava
              </>
            )}
          </button>
          <button className="btn btn-primary">+ Log Activity</button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-text-tertiary mb-2">
              Activity Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-surface-elevated bg-surface text-text-primary focus:outline-none focus:border-primary-500"
            >
              <option value="all">All Activities</option>
              <option value="run">Runs Only</option>
              <option value="strength">Strength Only</option>
            </select>
          </div>

          {/* Month Filter */}
          <div>
            <label className="block text-sm font-medium text-text-tertiary mb-2">
              Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-surface-elevated bg-surface text-text-primary focus:outline-none focus:border-primary-500"
            >
              <option value="all">All Months</option>
              {months.map((month) => {
                const [year, monthNum] = month.split('-');
                const date = new Date(parseInt(year), parseInt(monthNum) - 1);
                const monthName = date.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                });
                return (
                  <option key={month} value={month}>
                    {monthName}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-text-tertiary mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-surface-elevated bg-surface text-text-primary focus:outline-none focus:border-primary-500"
            >
              <option value="date">Most Recent</option>
              <option value="longest">Longest Distance</option>
              <option value="shortest">Shortest Distance</option>
              <option value="fastest">Fastest Pace</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(selectedType !== 'all' || selectedMonth !== 'all' || sortBy !== 'date') && (
          <div className="mt-4 pt-4 border-t border-surface-elevated">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-text-tertiary">Active filters:</span>
              {selectedType !== 'all' && (
                <span className="px-2 py-1 bg-primary-500/10 text-primary-400 rounded text-xs">
                  {selectedType === 'run' ? 'Runs' : 'Strength'}
                </span>
              )}
              {selectedMonth !== 'all' && (
                <span className="px-2 py-1 bg-primary-500/10 text-primary-400 rounded text-xs">
                  {(() => {
                    const [year, monthNum] = selectedMonth.split('-');
                    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
                    return date.toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    });
                  })()}
                </span>
              )}
              {sortBy !== 'date' && (
                <span className="px-2 py-1 bg-accent-500/10 text-accent-400 rounded text-xs">
                  Sorted by: {sortBy}
                </span>
              )}
              <button
                onClick={() => {
                  setSelectedType('all');
                  setSelectedMonth('all');
                  setSortBy('date');
                }}
                className="text-xs text-text-tertiary hover:text-primary-400 underline ml-2"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          Showing {filteredActivities.length} of {activities.length} activities
        </p>
      </div>

      {/* Activities List */}
      {isLoading ? (
        <div className="card text-center py-12">
          <div className="inline-block animate-spin text-4xl mb-4">⚙️</div>
          <p className="text-text-secondary">Loading activities...</p>
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-text-primary mb-2">
            No activities found
          </h3>
          <p className="text-text-secondary">
            {activities.length === 0
              ? 'Connect to Strava or log your first activity to get started.'
              : 'Try adjusting your filters to see more activities.'}
          </p>
        </div>
      ) : (
        <ActivityLogList activities={filteredActivities} userId={DEMO_USER} />
      )}
    </div>
  );
}
