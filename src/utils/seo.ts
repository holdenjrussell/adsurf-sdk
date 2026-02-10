/**
 * SEO utilities for storefronts
 */

export interface MetaTagsInput {
  title: string
  description: string
  image?: string
  url?: string
  type?: 'website' | 'product' | 'article'
  siteName?: string
  twitterHandle?: string
}

export interface ProductStructuredData {
  name: string
  description: string
  image: string[]
  sku?: string
  brand?: string
  price: string
  priceCurrency: string
  availability: 'InStock' | 'OutOfStock' | 'PreOrder'
  url?: string
  reviewCount?: number
  ratingValue?: number
}

export interface BreadcrumbItem {
  name: string
  url: string
}

/**
 * Generate meta tags object for Next.js metadata
 */
export function generateMetaTags(
  input: MetaTagsInput
): Record<string, string | object> {
  const {
    title,
    description,
    image,
    url,
    type = 'website',
    siteName,
    twitterHandle,
  } = input

  const metadata: Record<string, string | object> = {
    title,
    description,
    openGraph: {
      title,
      description,
      type,
      ...(url && { url }),
      ...(image && { images: [{ url: image }] }),
      ...(siteName && { siteName }),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(image && { images: [image] }),
      ...(twitterHandle && { creator: twitterHandle }),
    },
  }

  return metadata
}

/**
 * Generate Product structured data (JSON-LD)
 */
export function generateProductSchema(product: ProductStructuredData): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    ...(product.sku && { sku: product.sku }),
    ...(product.brand && {
      brand: {
        '@type': 'Brand',
        name: product.brand,
      },
    }),
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.priceCurrency,
      availability: `https://schema.org/${product.availability}`,
      ...(product.url && { url: product.url }),
    },
    ...(product.reviewCount &&
      product.ratingValue && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.ratingValue,
          reviewCount: product.reviewCount,
        },
      }),
  }
}

/**
 * Generate BreadcrumbList structured data
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/**
 * Generate Organization structured data
 */
export function generateOrganizationSchema(org: {
  name: string
  url: string
  logo?: string
  sameAs?: string[]
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org.name,
    url: org.url,
    ...(org.logo && { logo: org.logo }),
    ...(org.sameAs && { sameAs: org.sameAs }),
  }
}

/**
 * Generate canonical URL
 */
export function getCanonicalUrl(baseUrl: string, path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl.replace(/\/$/, '')}${cleanPath}`
}

/**
 * Truncate text for meta descriptions
 */
export function truncateForMeta(text: string, maxLength = 160): string {
  if (text.length <= maxLength) return text

  const truncated = text.slice(0, maxLength - 3)
  const lastSpace = truncated.lastIndexOf(' ')

  return (
    (lastSpace > maxLength / 2 ? truncated.slice(0, lastSpace) : truncated) +
    '...'
  )
}

/**
 * Generate robots meta content
 */
export function generateRobotsMeta(options: {
  index?: boolean
  follow?: boolean
  noarchive?: boolean
  nosnippet?: boolean
}): string {
  const directives: string[] = []

  if (options.index === false) directives.push('noindex')
  else directives.push('index')

  if (options.follow === false) directives.push('nofollow')
  else directives.push('follow')

  if (options.noarchive) directives.push('noarchive')
  if (options.nosnippet) directives.push('nosnippet')

  return directives.join(', ')
}
