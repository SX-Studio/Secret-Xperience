-- One purchase credit per payment order, enforced by the database.
--
-- Both payment webhooks (Verotel, NOWPayments) guarded against double-crediting by
-- SELECTing the ledger and then INSERTing. That is a read-then-write race: two
-- overlapping IPN retries both see no row, and both credit the wallet. A failed
-- ledger insert after a successful wallet credit had the same effect on retry.
--
-- Scoped to type='purchase' on purpose: a 'spend' row legitimately repeats a
-- reference_id (boosting the same listing twice), so a global unique index on
-- (reference_id, type) would reject valid writes.
--
-- APPLIED LIVE 2026-09-15 to duwuzaelmggldhkgoebn (0 duplicate groups existed).
create unique index if not exists token_ledger_purchase_reference_uniq
  on public.token_ledger (reference_id)
  where type = 'purchase' and reference_id is not null;
