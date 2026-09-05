import { createAdminClient } from '@/lib/supabase/admin';

// Append-only audit log writer. Server-only (uses the service role).
// Every sensitive/staff action and every original-media view must call this.
export interface AuditEntry {
  actorId?: string | null;
  actorCode?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  reason?: string | null;
  result?: string | null;
  meta?: Record<string, unknown>;
}

export async function writeAudit(entry: AuditEntry): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from('audit_log').insert({
    actor_id: entry.actorId ?? null,
    actor_code: entry.actorCode ?? null,
    action: entry.action,
    target_type: entry.targetType ?? null,
    target_id: entry.targetId ?? null,
    reason: entry.reason ?? null,
    result: entry.result ?? null,
    meta: entry.meta ?? {},
  });
  // Auditing must never silently vanish; surface failures to server logs.
  if (error) {
    console.error('[audit] failed to write entry', entry.action, error.message);
    throw new Error('audit write failed');
  }
}
