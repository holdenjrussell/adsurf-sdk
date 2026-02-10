'use client'

import { useState, useEffect, useCallback } from 'react'

interface CustomerOrder {
  id: string
  orderNumber: number
  processedAt: string
  financialStatus: string
  fulfillmentStatus: string
  totalPrice: { amount: string; currencyCode: string }
  lineItems: Array<{
    title: string
    quantity: number
    variant: {
      image: { url: string; altText: string } | null
      price: { amount: string; currencyCode: string }
    }
  }>
}

interface CustomerSubscription {
  id: string
  status: string
  nextBillingDate: string
  product: { title: string }
  price: { amount: string; currencyCode: string }
}

interface CustomerProfile {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  acceptsMarketing: boolean
  defaultAddress: {
    address1: string
    address2: string | null
    city: string
    province: string
    zip: string
    country: string
  } | null
}

interface CustomerState {
  isLoggedIn: boolean
  accessToken: string | null
  profile: CustomerProfile | null
  orders: CustomerOrder[]
  subscriptions: CustomerSubscription[]
  loading: boolean
  error: Error | null
}

interface UseCustomerOptions {
  apiKey?: string
  baseUrl?: string
}

const STORAGE_KEY = 'adsurf-customer-token'

export function useCustomer(options: UseCustomerOptions = {}) {
  const [state, setState] = useState<CustomerState>({
    isLoggedIn: false,
    accessToken: null,
    profile: null,
    orders: [],
    subscriptions: [],
    loading: true,
    error: null,
  })

  const baseUrl =
    options.baseUrl || process.env.NEXT_PUBLIC_PLATFORM_URL || ''
  const apiKey =
    options.apiKey || process.env.NEXT_PUBLIC_PLATFORM_API_KEY || ''

  const fetchCustomerData = useCallback(
    async (token: string) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }))

        // Fetch customer profile
        const profileRes = await fetch(
          `${baseUrl}/api/storefront/customer/profile?token=${encodeURIComponent(token)}`,
          { headers: { 'x-brand-api-key': apiKey } }
        )
        const profileData = await profileRes.json()

        // Fetch orders
        const ordersRes = await fetch(
          `${baseUrl}/api/storefront/customer/orders?token=${encodeURIComponent(token)}`,
          { headers: { 'x-brand-api-key': apiKey } }
        )
        const ordersData = await ordersRes.json()

        // Fetch subscriptions
        const subsRes = await fetch(
          `${baseUrl}/api/storefront/customer/subscriptions?token=${encodeURIComponent(token)}`,
          { headers: { 'x-brand-api-key': apiKey } }
        )
        const subsData = await subsRes.json()

        setState((prev) => ({
          ...prev,
          profile: profileData.customer || null,
          orders: ordersData.orders || [],
          subscriptions: subsData.subscriptions || [],
          loading: false,
        }))
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error:
            err instanceof Error
              ? err
              : new Error('Failed to fetch customer data'),
          loading: false,
        }))
      }
    },
    [baseUrl, apiKey]
  )

  // Load token from storage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    const token = localStorage.getItem(STORAGE_KEY)
    if (token) {
      setState((prev) => ({ ...prev, isLoggedIn: true, accessToken: token }))
      fetchCustomerData(token)
    } else {
      setState((prev) => ({ ...prev, loading: false }))
    }
  }, [fetchCustomerData])

  const login = useCallback(
    (accessToken: string) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, accessToken)
      }
      setState((prev) => ({ ...prev, isLoggedIn: true, accessToken }))
      fetchCustomerData(accessToken)
    },
    [fetchCustomerData]
  )

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
    setState({
      isLoggedIn: false,
      accessToken: null,
      profile: null,
      orders: [],
      subscriptions: [],
      loading: false,
      error: null,
    })
  }, [])

  const refetch = useCallback(() => {
    if (state.accessToken) {
      fetchCustomerData(state.accessToken)
    }
  }, [state.accessToken, fetchCustomerData])

  const updateProfile = useCallback(
    async (updates: Partial<Pick<CustomerProfile, 'firstName' | 'lastName' | 'phone' | 'acceptsMarketing'>>) => {
      if (!state.accessToken) {
        throw new Error('Not logged in')
      }

      const response = await fetch(
        `${baseUrl}/api/storefront/customer/profile`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-brand-api-key': apiKey,
            'x-customer-token': state.accessToken,
          },
          body: JSON.stringify(updates),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const data = await response.json()
      setState((prev) => ({
        ...prev,
        profile: data.customer || prev.profile,
      }))

      return data.customer
    },
    [state.accessToken, baseUrl, apiKey]
  )

  return {
    ...state,
    login,
    logout,
    refetch,
    updateProfile,
  }
}

export type { CustomerOrder, CustomerSubscription, CustomerProfile }
