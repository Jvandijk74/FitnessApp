'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useMemo, useEffect, useState } from 'react';
import { getPublicSupabaseConfig } from '@/lib/config/supabase';
import { SupabaseContext } from '@/lib/db/supabase-context';

export default function Providers({ children }: { children: React.ReactNode }) {
  const { url, anonKey } = getPublicSupabaseConfig();
  const [ready, setReady] = useState(false);
  const supabase = useMemo(() => createBrowserClient(url, anonKey), [url, anonKey]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
    setReady(true);
  }, []);

  if (!ready) return null;

  return <SupabaseContext.Provider value={supabase}>{children}</SupabaseContext.Provider>;
}
