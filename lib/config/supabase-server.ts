export function getServerSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL. Set it in your environment to connect to Supabase.');
  }

  if (!anonKey && !serviceRoleKey) {
    throw new Error(
      'Missing Supabase API key. Set NEXT_PUBLIC_SUPABASE_ANON_KEY (and optionally SUPABASE_SERVICE_ROLE_KEY for server-side tasks).'
    );
  }

  return { url, anonKey, serviceRoleKey };
}
