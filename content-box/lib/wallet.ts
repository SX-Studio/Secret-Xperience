import { createAdminClient } from '@/lib/supabase/admin';

// Server-only wallet helpers. All mutations go through the DB apply_ledger()
// function (atomic + idempotent). Never mutate balances directly.

export async function ensureWallet(ownerId: string, kind: 'user' | 'creator' = 'user'): Promise<string> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('ensure_wallet', { p_owner: ownerId, p_kind: kind });
  if (error || !data) throw new Error(`ensure_wallet failed: ${error?.message ?? 'no id'}`);
  return data as string;
}

export interface ApplyLedgerArgs {
  walletId: string;
  delta: number;
  reason: string;
  refType?: string | null;
  refId?: string | null;
  idempotencyKey?: string | null;
  vatCents?: number | null;
  vatCountry?: string | null;
}

export async function applyLedger(args: ApplyLedgerArgs) {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('apply_ledger', {
    p_wallet: args.walletId,
    p_delta: args.delta,
    p_reason: args.reason,
    p_ref_type: args.refType ?? null,
    p_ref_id: args.refId ?? null,
    p_idem: args.idempotencyKey ?? null,
    p_vat_cents: args.vatCents ?? null,
    p_vat_country: args.vatCountry ?? null,
  });
  if (error) throw new Error(error.message); // e.g. 'insufficient_balance'
  return data;
}
