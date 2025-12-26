'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useMemo, useEffect, useState } from 'react';
import { SupabaseContext } from '@/lib/db/supabase-context';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      ),
    []
  );

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
    setReady(true);
  }, []);

  if (!ready) return null;

  return <SupabaseContext.Provider value={supabase}>{children}</SupabaseContext.Provider>;
}
