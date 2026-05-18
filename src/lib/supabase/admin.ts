import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

/** Server-only client that bypasses RLS when `SUPABASE_SERVICE_ROLE_KEY` is configured. */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return null;
  }

  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
