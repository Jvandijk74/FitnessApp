'use client';

import { createContext, useContext } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';

export const SupabaseContext = createContext<SupabaseClient | null>(null);

export const useSupabase = () => {
  const client = useContext(SupabaseContext);
  if (!client) throw new Error('Supabase client not available in this context');
  return client;
};
