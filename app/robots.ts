import { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { CANONICAL_ORIGIN, SHOP_ORIGIN, isShopHost } from './lib/domains'

export default function robots(): MetadataRoute.Robots {
  // The storefront is its own site with its own sitemap; pointing it at the
  // marketplace sitemap would invite crawlers to index marketplace URLs under
  // the .shop domain, which is exactly what that domain exists to avoid.
  if (isShopHost(headers().get('host'))) {
    return {
      rules: { userAgent: '*', allow: '/', disallow: ['/login', '/reset-password', '/auth/', '/sso/', '/api/'] },
      sitemap: `${SHOP_ORIGIN}/sitemap.xml`,
    }
  }

  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/dashboard', '/admin', '/messages', '/advertiser', '/api/'] },
    sitemap: `${CANONICAL_ORIGIN}/sitemap.xml`,
  }
}
