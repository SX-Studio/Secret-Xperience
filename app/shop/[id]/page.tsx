import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import ProductDetail from './ProductDetail'
import { SHOP_ORIGIN, isShopHost } from '../../lib/domains'

/**
 * Server wrapper around the client-rendered product page. It exists so the
 * host can be read on the server: the storefront needs `standalone` before
 * first paint, otherwise the marketplace chrome renders and then swaps.
 */

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  // Shop content is canonical on the storefront regardless of which domain
  // served this request, so /shop/<id> on the marketplace defers to /p/<id>.
  const canonical = `${SHOP_ORIGIN}/p/${params.id}`

  let name: string | null = null
  let description: string | null = null
  let image: string | null = null
  try {
    const { data } = await db()
      .from('products')
      .select('name, description, images')
      .eq('id', params.id)
      .eq('active', true)
      .maybeSingle()
    name = data?.name ?? null
    description = data?.description ?? null
    image = data?.images?.[0] ?? null
  } catch { /* metadata is best-effort — never 500 the page over a title */ }

  const title = name ? `${name} | SecretXperience Boutique` : 'The Boutique | SecretXperience'
  const desc = description?.slice(0, 200) || 'Curated luxury accessories, intimate gifts, and premium wellness. Discreet EU shipping in plain packaging.'

  return {
    title,
    description: desc,
    alternates: { canonical },
    openGraph: {
      title,
      description: desc,
      url: canonical,
      ...(image ? { images: [{ url: image }] } : {}),
    },
  }
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const standalone = isShopHost(headers().get('host'))
  return <ProductDetail params={params} standalone={standalone} />
}
