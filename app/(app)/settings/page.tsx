import { StravaConnect } from '@/components/integrations/StravaConnect';
import { getStravaConnection, syncStravaActivities } from '@/app/actions/strava';
import { getUserProfile } from '@/app/actions/nutrition';
import { ProfileSettings } from '@/components/settings/ProfileSettings';

const DEMO_USER = 'demo-user';

export default async function SettingsPage() {
  // Check Strava connection status
  let stravaConnection = null;
  try {
    stravaConnection = await getStravaConnection(DEMO_USER);
  } catch (error) {
    console.error('[Settings] Error fetching Strava connection:', error);
  }

  // Fetch user profile
  let userProfile = null;
  try {
    userProfile = await getUserProfile(DEMO_USER);
  } catch (error) {
    console.error('[Settings] Error fetching user profile:', error);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Settings</h1>
        <p className="text-text-secondary">Manage your preferences and account settings</p>
      </div>

      {/* Profile Settings with Body Metrics */}
      {!userProfile && (
        <div className="card border-2 border-yellow-500/50 bg-yellow-500/10">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Database Migration Required</h3>
              <p className="text-sm text-text-secondary mb-3">
                The nutrition tracking features require a database migration to add profile fields (age, weight, height, gender).
              </p>
              <div className="space-y-2">
                <p className="text-sm text-text-secondary">
                  <strong>To enable profile settings and nutrition tracking:</strong>
                </p>
                <ol className="list-decimal list-inside text-sm text-text-secondary space-y-1 ml-2">
                  <li>Open your Supabase dashboard</li>
                  <li>Navigate to SQL Editor</li>
                  <li>Run the migration file: <code className="px-2 py-1 bg-surface rounded text-xs">supabase/migrations/006_nutrition_tables.sql</code></li>
                </ol>
                <p className="text-xs text-text-tertiary mt-3">
                  See <code className="px-1 bg-surface rounded">supabase/migrations/README.md</code> for detailed instructions.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {userProfile && <ProfileSettings user={userProfile} />}

      {/* Training Settings */}
      <div className="card">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Training Thresholds</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Threshold Pace (min/km)
            </label>
            <input
              type="text"
              defaultValue="4:54"
              className="w-full px-4 py-2 rounded-lg border border-surface-elevated bg-surface text-text-primary focus:outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Threshold Heart Rate (bpm)
            </label>
            <input
              type="number"
              defaultValue="170"
              className="w-full px-4 py-2 rounded-lg border border-surface-elevated bg-surface text-text-primary focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="card">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary">Units</p>
              <p className="text-sm text-text-tertiary">Distance measurement system</p>
            </div>
            <select className="px-4 py-2 rounded-lg border border-surface-elevated bg-surface text-text-primary focus:outline-none focus:border-primary-500">
              <option>Metric (km)</option>
              <option>Imperial (miles)</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary">Email Notifications</p>
              <p className="text-sm text-text-tertiary">Receive workout reminders</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-500">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6"></span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary">Weekly Summary</p>
              <p className="text-sm text-text-tertiary">Get weekly progress emails</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-surface-elevated">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1"></span>
            </button>
          </div>
        </div>
      </div>

      {/* Strava Integration */}
      <StravaConnectWrapper
        isConnected={!!stravaConnection}
        athleteId={stravaConnection?.athleteId}
      />

      {/* Other Integrations */}
      <div className="card">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Other Integrations</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated opacity-50">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⌚</span>
              <div>
                <p className="font-medium text-text-primary">Garmin</p>
                <p className="text-sm text-text-tertiary">Coming soon</p>
              </div>
            </div>
            <span className="text-xs text-text-tertiary px-2 py-1 rounded bg-surface">
              Not available
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated opacity-50">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💓</span>
              <div>
                <p className="font-medium text-text-primary">Apple Health</p>
                <p className="text-sm text-text-tertiary">Coming soon</p>
              </div>
            </div>
            <span className="text-xs text-text-tertiary px-2 py-1 rounded bg-surface">
              Not available
            </span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button className="btn-secondary">Cancel</button>
        <button className="btn-primary">Save Changes</button>
      </div>
    </div>
  );
}

async function syncActivities() {
  'use server';
  try {
    console.log('[Settings] syncActivities action called');
    const result = await syncStravaActivities(DEMO_USER);
    console.log('[Settings] syncActivities completed successfully:', result);
    return result;
  } catch (error) {
    console.error('[Settings] syncActivities failed:', error);
    throw error;
  }
}

function StravaConnectWrapper({
  isConnected,
  athleteId
}: {
  isConnected: boolean;
  athleteId?: number;
}) {
  return (
    <StravaConnect
      isConnected={isConnected}
      athleteId={athleteId}
      onSync={async () => {
        'use server';
        await syncActivities();
      }}
    />
  );
}
