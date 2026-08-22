import { notFound } from 'next/navigation';
import { getAdminProfile } from '@/lib/session';

// First gate: you must be an active platform_admin even to know /admin exists.
// Non-admins get a 404 (no hint that an admin area is here). The SECOND gate —
// a fresh fingerprint (step-up) — is enforced per-page (see admin/page.tsx),
// so /admin/unlock can render without a redirect loop.
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getAdminProfile();
  if (!profile) notFound();
  return <>{children}</>;
}
