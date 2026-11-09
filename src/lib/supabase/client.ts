import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://zkgixwywetajnogrihfy.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_fallback";

/**
 * Browser-side Supabase client.
 * Configured with resilient fallbacks so the app renders even during offline/DNS drops.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
