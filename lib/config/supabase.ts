export function getPublicSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL. Set it in your environment to connect to Supabase.');
  }

  if (!anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Set it in your environment to connect to Supabase.');
  }

  return { url, anonKey };
}
