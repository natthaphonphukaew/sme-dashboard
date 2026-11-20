import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client.
 *
 * Uses the public anon / publishable key: it can only SELECT from the
 * dashboard views (see supabase/02_views.sql). The env vars have no
 * NEXT_PUBLIC_ prefix, so they are never bundled into browser JavaScript.
 */
export function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "ยังไม่ได้ตั้งค่า SUPABASE_URL และ SUPABASE_ANON_KEY (ดู .env.example)",
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
