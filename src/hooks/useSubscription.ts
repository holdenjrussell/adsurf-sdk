'use client'

import { useState, useCallback } from 'react'

interface SubscriptionProduct {
  variantId: string
  quantity: number
  sellingPlanId: string
}

interface SubscriptionResult {
  subscriptionId: string
  status: string
  nextBillingDate: string
}

interface UseSubscriptionOptions {
  apiKey?: string
  baseUrl?: string
}

export function useSubscription(options: UseSubscriptionOptions = {}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const baseUrl =
    options.baseUrl || process.env.NEXT_PUBLIC_PLATFORM_URL || ''
  const apiKey =
    options.apiKey || process.env.NEXT_PUBLIC_PLATFORM_API_KEY || ''

  const subscribe = useCallback(
    async (
      customerToken: string,
      products: SubscriptionProduct[]
    ): Promise<SubscriptionResult> => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `${baseUrl}/api/storefront/customer/subscribe`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-brand-api-key': apiKey,
              'x-customer-token': customerToken,
            },
            body: JSON.stringify({ products }),
          }
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(
            errorData.error || 'Failed to create subscription'
          )
        }

        return await response.json()
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Subscription failed')
        setError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [baseUrl, apiKey]
  )

  const cancelSubscription = useCallback(
    async (
      customerToken: string,
      subscriptionId: string
    ): Promise<{ success: boolean }> => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `${baseUrl}/api/storefront/customer/subscriptions/${subscriptionId}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'x-brand-api-key': apiKey,
              'x-customer-token': customerToken,
            },
          }
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(
            errorData.error || 'Failed to cancel subscription'
          )
        }

        return await response.json()
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Cancellation failed')
        setError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [baseUrl, apiKey]
  )

  const pauseSubscription = useCallback(
    async (
      customerToken: string,
      subscriptionId: string,
      resumeDate?: string
    ): Promise<{ success: boolean; resumeDate: string }> => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `${baseUrl}/api/storefront/customer/subscriptions/${subscriptionId}/pause`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-brand-api-key': apiKey,
              'x-customer-token': customerToken,
            },
            body: JSON.stringify({ resumeDate }),
          }
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to pause subscription')
        }

        return await response.json()
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Pause failed')
        setError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [baseUrl, apiKey]
  )

  const resumeSubscription = useCallback(
    async (
      customerToken: string,
      subscriptionId: string
    ): Promise<{ success: boolean }> => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `${baseUrl}/api/storefront/customer/subscriptions/${subscriptionId}/resume`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-brand-api-key': apiKey,
              'x-customer-token': customerToken,
            },
          }
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to resume subscription')
        }

        return await response.json()
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Resume failed')
        setError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [baseUrl, apiKey]
  )

  const updateSubscriptionFrequency = useCallback(
    async (
      customerToken: string,
      subscriptionId: string,
      sellingPlanId: string
    ): Promise<{ success: boolean }> => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `${baseUrl}/api/storefront/customer/subscriptions/${subscriptionId}/frequency`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'x-brand-api-key': apiKey,
              'x-customer-token': customerToken,
            },
            body: JSON.stringify({ sellingPlanId }),
          }
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(
            errorData.error || 'Failed to update subscription frequency'
          )
        }

        return await response.json()
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Update failed')
        setError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [baseUrl, apiKey]
  )

  const skipNextDelivery = useCallback(
    async (
      customerToken: string,
      subscriptionId: string
    ): Promise<{ success: boolean; nextBillingDate: string }> => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `${baseUrl}/api/storefront/customer/subscriptions/${subscriptionId}/skip`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-brand-api-key': apiKey,
              'x-customer-token': customerToken,
            },
          }
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to skip delivery')
        }

        return await response.json()
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Skip failed')
        setError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [baseUrl, apiKey]
  )

  return {
    loading,
    error,
    subscribe,
    cancelSubscription,
    pauseSubscription,
    resumeSubscription,
    updateSubscriptionFrequency,
    skipNextDelivery,
  }
}

export type { SubscriptionProduct, SubscriptionResult }
