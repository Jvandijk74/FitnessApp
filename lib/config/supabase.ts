type PublicSupabaseConfig = {
  url: string | null;
  anonKey: string | null;
  missing?: string[];
};

export function getPublicSupabaseConfig(): PublicSupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || null;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null;
  const missing: string[] = [];

  if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!anonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  if (missing.length > 0) {
    console.warn(`Missing Supabase client env vars: ${missing.join(', ')}`);
    return { url, anonKey, missing };
  }

  return { url, anonKey };
}
