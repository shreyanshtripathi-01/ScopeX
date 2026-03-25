import { createClient } from "@supabase/supabase-js";

// Note: This client uses the Service Role key and bypasses Row Level Security (RLS).
// Never expose this on the client or in components that aren't strictly server-side.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
