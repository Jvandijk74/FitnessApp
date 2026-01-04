'use client';

import { useEffect, useRef } from 'react';
import { syncStravaActivities } from '@/app/actions/strava';

interface StravaAutoSyncProps {
  userId: string;
}

export function StravaAutoSync({ userId }: StravaAutoSyncProps) {
  const hasSynced = useRef(false);

  useEffect(() => {
    // Only sync once per session
    if (hasSynced.current) return;

    async function autoSync() {
      try {
        console.log('[StravaAutoSync] Starting automatic Strava sync...');
        await syncStravaActivities(userId);
        console.log('[StravaAutoSync] Automatic sync completed successfully');
        hasSynced.current = true;
      } catch (error) {
        // Silently fail if Strava not connected or sync fails
        console.log('[StravaAutoSync] Auto-sync skipped:', error instanceof Error ? error.message : 'Unknown error');
        hasSynced.current = true; // Mark as attempted to avoid retries
      }
    }

    // Run sync in background without blocking UI
    autoSync();
  }, [userId]);

  // This component renders nothing
  return null;
}
