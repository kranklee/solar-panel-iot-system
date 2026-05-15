// Supabase client factory split into browser and server variants
// Browser client uses anon key, server client uses service role for trusted writes
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type GameKey = 'starblast' | 'ageofwar' | 'dronesim';

export interface ScoreRow {
  id: string;
  player_name: string;
  game: GameKey;
  score: number;
  created_at: string;
}

let browserClient: SupabaseClient | null = null;

export function getBrowserSupabase(): SupabaseClient {
  if (browserClient) return browserClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error('Missing public Supabase environment variables');
  }
  browserClient = createClient(url, anon, {
    auth: { persistSession: false },
    realtime: { params: { eventsPerSecond: 5 } }
  });
  return browserClient;
}

export function getServerSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Missing Supabase environment variables');
  }
  return createClient(url, key, {
    auth: { persistSession: false }
  });
}
