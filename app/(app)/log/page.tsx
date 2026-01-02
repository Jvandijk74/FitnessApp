import { getActivities } from '@/app/actions/activities';
import { ActivityLogList } from '@/components/activity/ActivityLogList';

const DEMO_USER = 'demo-user';

export default async function ActivityLogPage() {
  // Fetch real activities from database
  const activities = await getActivities(DEMO_USER);

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
      <ActivityLogList activities={activities} userId={DEMO_USER} />

      {/* Load More */}
      <div className="flex justify-center">
        <button className="btn-secondary">Load More</button>
      </div>
    </div>
  );
}
