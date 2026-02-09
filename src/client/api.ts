/**
 * Adsurf Platform API Client
 *
 * Used by storefronts to fetch data from the platform
 */

export interface PlatformClientConfig {
  apiKey: string
  brandId?: string
  baseUrl?: string
}

export interface Product {
  id: string
  title: string
  handle: string
  description: string
  descriptionHtml: string
  vendor: string
  productType: string
  tags: string[]
  images: Array<{
    url: string
    altText: string | null
    width: number
    height: number
  }>
  variants: Array<{
    id: string
    title: string
    availableForSale: boolean
    price: number
    compareAtPrice: number | null
    currency: string
    selectedOptions: Array<{ name: string; value: string }>
    sku: string
  }>
  price: number
  maxPrice: number
  currency: string
}

export interface Collection {
  id: string
  title: string
  handle: string
  description: string
  image: {
    url: string
    altText: string | null
  } | null
  products?: Product[]
}

export interface BrandConfig {
  brand: {
    id: string
    name: string
    slug: string
  }
  branding: {
    logo: string
    logoLight?: string
    favicon?: string
    primaryColor: string
    secondaryColor?: string
    companyName: string
    supportEmail: string
  }
  analytics: {
    ga4Id?: string
    metaPixelId?: string
    clarityId?: string
  }
  features: {
    blog: boolean
    scheduling: boolean
  }
}

export class PlatformClient {
  private apiKey: string
  private baseUrl: string

  constructor(config: PlatformClientConfig) {
    this.apiKey = config.apiKey
    this.baseUrl = config.baseUrl || 'https://adsurf.ai'
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}/api/storefront${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-brand-api-key': this.apiKey,
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(error.error || `API error: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Get brand configuration
   */
  async getConfig(): Promise<BrandConfig> {
    return this.fetch('/config')
  }

  /**
   * Get all products
   */
  async getProducts(limit = 50): Promise<{ products: Product[]; count: number }> {
    return this.fetch(`/products?limit=${limit}`)
  }

  /**
   * Get a single product by handle
   */
  async getProduct(handle: string): Promise<{ product: Product }> {
    return this.fetch(`/products/${encodeURIComponent(handle)}`)
  }

  /**
   * Get all collections
   */
  async getCollections(limit = 50): Promise<{ collections: Collection[]; count: number }> {
    return this.fetch(`/collections?limit=${limit}`)
  }

  /**
   * Get a collection with its products
   */
  async getCollection(
    handle: string,
    productLimit = 50
  ): Promise<{ collection: Collection }> {
    return this.fetch(
      `/collections/${encodeURIComponent(handle)}?productLimit=${productLimit}`
    )
  }
}

/**
 * Create a platform client instance
 */
export function createPlatformClient(config: PlatformClientConfig): PlatformClient {
  return new PlatformClient(config)
}
