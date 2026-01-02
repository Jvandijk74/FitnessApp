'use client';

import { useState } from 'react';

interface StravaConnectionProps {
  isConnected: boolean;
  athleteId?: number;
  onSync?: () => void;
}

export function StravaConnect({ isConnected, athleteId, onSync }: StravaConnectionProps) {
  const [syncing, setSyncing] = useState(false);

  const handleConnect = () => {
    window.location.href = '/api/strava/auth';
  };

  const handleSync = async () => {
    if (!onSync) return;
    setSyncing(true);
    try {
      await onSync();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" fill="#FC4C02"/>
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-white">Strava Integration</h3>
            <p className="text-sm text-gray-400">
              {isConnected
                ? `Connected • Athlete ID: ${athleteId}`
                : 'Connect your Strava account to sync activities'}
            </p>
          </div>
        </div>
        {isConnected ? (
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        ) : (
          <span className="h-3 w-3 rounded-full bg-gray-500"></span>
        )}
      </div>

      <div className="flex gap-3">
        {!isConnected ? (
          <button
            onClick={handleConnect}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Connect Strava
          </button>
        ) : (
          <>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {syncing ? 'Syncing...' : 'Sync Activities'}
            </button>
            <button
              className="btn-secondary text-sm"
              onClick={() => alert('Disconnect feature coming soon')}
            >
              Disconnect
            </button>
          </>
        )}
      </div>

      {isConnected && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-sm text-green-400">
            Your Strava account is connected. Click "Sync Activities" to import your recent runs.
          </p>
        </div>
      )}
    </div>
  );
}
