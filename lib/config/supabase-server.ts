type ServerSupabaseConfig = {
  url: string | null;
  anonKey: string | null;
  serviceRoleKey?: string | null;
  missing?: string[];
};

export function getServerSupabaseConfig(): ServerSupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || null;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || null;
  const missing: string[] = [];

  if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!anonKey && !serviceRoleKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY');

  if (missing.length > 0) {
    console.warn(`Missing Supabase server env vars: ${missing.join(', ')}`);
    return { url, anonKey, serviceRoleKey, missing };
  }

  return { url, anonKey, serviceRoleKey };
}
