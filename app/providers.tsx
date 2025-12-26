'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useMemo, useEffect, useState } from 'react';
import { getPublicSupabaseConfig } from '@/lib/config/supabase';
import { SupabaseContext } from '@/lib/db/supabase-context';

export default function Providers({ children }: { children: React.ReactNode }) {
  const { url, anonKey, missing } = getPublicSupabaseConfig();
  const [ready, setReady] = useState(false);
  const supabase = useMemo(() => {
    if (!url || !anonKey) return null;
    return createBrowserClient(url, anonKey);
  }, [url, anonKey]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
    setReady(true);
  }, []);

  if (missing?.length) {
    return (
      <div className="p-4 bg-red-900/40 text-red-100 rounded-md">
        <p className="font-semibold">Supabase configuration missing</p>
        <p className="text-sm">Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to load the app.</p>
      </div>
    );
  }

  if (!ready || !supabase) return null;

  return <SupabaseContext.Provider value={supabase}>{children}</SupabaseContext.Provider>;
}
