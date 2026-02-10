'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPlatformClient, type Collection } from '../client/api'

interface UseCollectionOptions {
  apiKey?: string
  baseUrl?: string
}

interface UseCollectionResult {
  collection: Collection | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

interface UseCollectionsResult {
  collections: Collection[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useCollection(
  handle: string,
  options: UseCollectionOptions = {}
): UseCollectionResult {
  const [collection, setCollection] = useState<Collection | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const apiKey = options.apiKey || process.env.NEXT_PUBLIC_PLATFORM_API_KEY || ''
  const baseUrl = options.baseUrl || process.env.NEXT_PUBLIC_PLATFORM_URL

  const fetchCollection = useCallback(async () => {
    if (!handle) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const client = createPlatformClient({
        apiKey,
        baseUrl,
      })

      const result = await client.getCollection(handle)
      setCollection(result.collection)
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch collection')
      )
    } finally {
      setLoading(false)
    }
  }, [handle, apiKey, baseUrl])

  useEffect(() => {
    fetchCollection()
  }, [fetchCollection])

  return { collection, loading, error, refetch: fetchCollection }
}

export function useCollections(
  options: UseCollectionOptions = {}
): UseCollectionsResult {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const apiKey = options.apiKey || process.env.NEXT_PUBLIC_PLATFORM_API_KEY || ''
  const baseUrl = options.baseUrl || process.env.NEXT_PUBLIC_PLATFORM_URL

  const fetchCollections = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const client = createPlatformClient({
        apiKey,
        baseUrl,
      })

      const result = await client.getCollections()
      setCollections(result.collections)
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch collections')
      )
    } finally {
      setLoading(false)
    }
  }, [apiKey, baseUrl])

  useEffect(() => {
    fetchCollections()
  }, [fetchCollections])

  return { collections, loading, error, refetch: fetchCollections }
}
