export default async function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Settings</h1>
        <p className="text-text-secondary">Manage your preferences and account settings</p>
      </div>

      {/* Profile Settings */}
      <div className="card">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Profile</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Name</label>
            <input
              type="text"
              defaultValue="Demo User"
              className="w-full px-4 py-2 rounded-lg border border-surface-elevated bg-surface text-text-primary focus:outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Email</label>
            <input
              type="email"
              defaultValue="demo@fitness.app"
              className="w-full px-4 py-2 rounded-lg border border-surface-elevated bg-surface text-text-primary focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>
      </div>

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

      {/* Integrations */}
      <div className="card">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Integrations</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏃</span>
              <div>
                <p className="font-medium text-text-primary">Strava</p>
                <p className="text-sm text-text-tertiary">Sync your activities</p>
              </div>
            </div>
            <span className="text-xs text-semantic-success px-2 py-1 rounded bg-semantic-success/10">
              Connected
            </span>
          </div>

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
