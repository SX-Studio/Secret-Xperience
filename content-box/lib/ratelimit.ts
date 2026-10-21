import { createAdminClient } from '@/lib/supabase/admin';

// Fixed-window rate limit. Returns true if the action is allowed. Fails OPEN
// (allows) if the limiter itself errors, so a limiter outage never hard-blocks
// the whole app — the DB constraints remain the real safety net.
export async function checkRateLimit(key: string, max: number, windowSeconds: number): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc('check_rate_limit', {
      p_key: key,
      p_max: max,
      p_window: windowSeconds,
    });
    if (error) return true;
    return data !== false;
  } catch {
    return true;
  }
}

export const HOUR = 3600;
