import { expireRentals } from '@/lib/rentals';

// Scheduled expiry sweep. Protect with a secret (Vercel Cron sends it as a
// header, or pass ?secret=). No secret set → endpoint is disabled.
export async function GET(req: Request) {
  return run(req);
}
export async function POST(req: Request) {
  return run(req);
}

async function run(req: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  if (!secret) return new Response('Disabled', { status: 503 });

  const url = new URL(req.url);
  const provided = req.headers.get('x-cron-secret') || url.searchParams.get('secret');
  if (provided !== secret) return new Response('Forbidden', { status: 403 });

  const expired = await expireRentals();
  return Response.json({ expired });
}
