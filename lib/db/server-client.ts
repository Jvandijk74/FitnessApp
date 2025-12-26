import { createServerClient } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';
import { getServerSupabaseConfig } from '@/lib/config/supabase-server';

export function getServerSupabase() {
  const { url, anonKey, serviceRoleKey } = getServerSupabaseConfig();
  const cookieStore = cookies();
  const headerList = headers();
  return createServerClient(url, serviceRoleKey || anonKey || '', {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: '', ...options });
      }
    },
    headers: new Headers(headerList)
  });
}
