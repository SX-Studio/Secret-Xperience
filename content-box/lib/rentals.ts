import { createAdminClient } from '@/lib/supabase/admin';

// VAT rate (basis points) applied at redemption. Per-buyer-country resolution is
// a tax/accountant-gated follow-up; until set, VAT_BPS defaults to 0 so nothing
// is silently mis-collected. The ledger records whatever rate is supplied.
export function vatBps(): number {
  const n = Number(process.env.VAT_BPS);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : 0;
}

export async function purchaseCart(
  userId: string,
  contentIds: string[],
  idemPrefix: string,
  vatCountry: string | null = null,
) {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('purchase_cart', {
    p_user: userId,
    p_content_ids: contentIds,
    p_idem_prefix: idemPrefix,
    p_vat_bps: vatBps(),
    p_vat_country: vatCountry,
  });
  if (error) throw new Error(error.message); // 'insufficient_balance', 'content_not_available', ...
  return data;
}

export async function expireRentals(): Promise<number> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('expire_rentals');
  if (error) throw new Error(error.message);
  return (data as number) ?? 0;
}
