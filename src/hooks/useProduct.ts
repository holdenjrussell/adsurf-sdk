'use client'

import { useState, useEffect } from 'react'
import type { Product } from '../client/api'

interface UseProductOptions {
  apiKey: string
  baseUrl?: string
}

interface UseProductResult {
  product: Product | null
  isLoading: boolean
  error: string | null
}

/**
 * Hook for fetching a single product by handle
 */
export function useProduct(
  handle: string,
  options: UseProductOptions
): UseProductResult {
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!handle) {
      setIsLoading(false)
      return
    }

    const baseUrl = options.baseUrl || 'https://adsurf.ai'

    async function fetchProduct() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `${baseUrl}/api/storefront/products/${encodeURIComponent(handle)}`,
          {
            headers: {
              'x-brand-api-key': options.apiKey,
            },
          }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch product')
        }

        const data = await response.json()
        setProduct(data.product)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [handle, options.apiKey, options.baseUrl])

  return { product, isLoading, error }
}

/**
 * Hook for fetching all products
 */
export function useProducts(
  options: UseProductOptions & { limit?: number }
): { products: Product[]; isLoading: boolean; error: string | null } {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const baseUrl = options.baseUrl || 'https://adsurf.ai'
    const limit = options.limit || 50

    async function fetchProducts() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `${baseUrl}/api/storefront/products?limit=${limit}`,
          {
            headers: {
              'x-brand-api-key': options.apiKey,
            },
          }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }

        const data = await response.json()
        setProducts(data.products)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [options.apiKey, options.baseUrl, options.limit])

  return { products, isLoading, error }
}
