'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface StravaConnectionProps {
  isConnected: boolean;
  athleteId?: number;
  onSync?: () => void;
}

export function StravaConnect({ isConnected, athleteId, onSync }: StravaConnectionProps) {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for error in URL params
    const stravaError = searchParams.get('strava_error');
    if (stravaError) {
      setError(decodeURIComponent(stravaError));
      // Clear the URL param after 10 seconds
      setTimeout(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete('strava_error');
        window.history.replaceState({}, '', url.toString());
        setError(null);
      }, 10000);
    }

    // Check for success in URL params
    const connected = searchParams.get('connected');
    if (connected === 'strava') {
      setSuccess(true);
      // Clear the URL param after 5 seconds
      setTimeout(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete('connected');
        window.history.replaceState({}, '', url.toString());
        setSuccess(false);
      }, 5000);
    }
  }, [searchParams]);

  const handleConnect = () => {
    setError(null);
    window.location.href = '/api/strava/auth';
  };

  const handleSync = async () => {
    if (!onSync) return;
    setSyncing(true);
    setError(null);
    try {
      console.log('[StravaConnect] Starting sync...');
      await onSync();
      console.log('[StravaConnect] Sync completed successfully');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('[StravaConnect] Sync failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync activities';
      console.error('[StravaConnect] Error message:', errorMessage);
      setError(errorMessage);
    } finally {
      setSyncing(false);
    }
  };

  const handleDismissError = () => {
    setError(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('strava_error');
    window.history.replaceState({}, '', url.toString());
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" fill="#FC4C02"/>
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Strava Integration</h3>
            <p className="text-sm text-text-tertiary">
              {isConnected
                ? `Connected • Athlete ID: ${athleteId}`
                : 'Connect your Strava account to sync activities'}
            </p>
          </div>
        </div>
        {isConnected ? (
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-semantic-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-semantic-success"></span>
          </span>
        ) : (
          <span className="h-3 w-3 rounded-full bg-surface-elevated"></span>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-semantic-error/10 border border-semantic-error/30 rounded-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-semantic-error mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-semantic-error mb-1">Connection Failed</p>
                <p className="text-sm text-semantic-error/90">{error}</p>
                <p className="text-xs text-text-tertiary mt-2">
                  Please check your Strava app settings and ensure the redirect URI is correct.
                </p>
              </div>
            </div>
            <button
              onClick={handleDismissError}
              className="text-semantic-error/60 hover:text-semantic-error transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-3 bg-semantic-success/10 border border-semantic-success/20 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-semantic-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm text-semantic-success">
              Successfully connected to Strava!
            </p>
          </div>
        </div>
      )}

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

      {isConnected && !success && (
        <div className="mt-4 p-3 bg-semantic-success/10 border border-semantic-success/20 rounded-lg">
          <p className="text-sm text-semantic-success">
            Your Strava account is connected. Click "Sync Activities" to import your recent runs.
          </p>
        </div>
      )}
    </div>
  );
}
