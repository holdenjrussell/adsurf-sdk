'use client'

import React, { useState } from 'react'
import { useCustomer, type CustomerOrder, type CustomerSubscription } from '../../hooks/useCustomer'
import { useSubscription } from '../../hooks/useSubscription'
import { formatMoney } from '../../utils/money'

export interface CustomerPortalProps {
  className?: string
  apiKey?: string
  baseUrl?: string
  onLoginRedirect?: () => void
  formatPrice?: (amount: string, currency: string) => string
}

type TabType = 'orders' | 'subscriptions' | 'profile'

export function CustomerPortal({
  className = '',
  apiKey,
  baseUrl,
  onLoginRedirect,
  formatPrice,
}: CustomerPortalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('orders')
  const customer = useCustomer({ apiKey, baseUrl })
  const subscription = useSubscription({ apiKey, baseUrl })

  const defaultFormatPrice = (amount: string, currency: string) => {
    if (formatPrice) return formatPrice(amount, currency)
    return formatMoney(parseFloat(amount), { currency })
  }

  if (customer.loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  if (!customer.isLoggedIn) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <h2 className="text-xl font-semibold mb-4">Please log in to view your account</h2>
        {onLoginRedirect && (
          <button
            onClick={onLoginRedirect}
            className="px-6 py-2 bg-black text-white hover:bg-gray-800 transition-colors"
          >
            Log In
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Profile header */}
      {customer.profile && (
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">
            Welcome, {customer.profile.firstName || 'Customer'}
          </h1>
          <p className="text-gray-600">{customer.profile.email}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b mb-6">
        <nav className="flex gap-8">
          {(['orders', 'subscriptions', 'profile'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'orders' && (
        <OrdersTab orders={customer.orders} formatPrice={defaultFormatPrice} />
      )}
      {activeTab === 'subscriptions' && (
        <SubscriptionsTab
          subscriptions={customer.subscriptions}
          customerToken={customer.accessToken || ''}
          subscriptionActions={subscription}
          formatPrice={defaultFormatPrice}
          onRefresh={customer.refetch}
        />
      )}
      {activeTab === 'profile' && customer.profile && (
        <ProfileTab
          profile={customer.profile}
          onUpdate={customer.updateProfile}
          onLogout={customer.logout}
        />
      )}
    </div>
  )
}

// Orders Tab Component
function OrdersTab({
  orders,
  formatPrice,
}: {
  orders: CustomerOrder[]
  formatPrice: (amount: string, currency: string) => string
}) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        You haven&apos;t placed any orders yet.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <div key={order.id} className="border rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-medium">Order #{order.orderNumber}</h3>
              <p className="text-sm text-gray-500">
                {new Date(order.processedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-2 py-1 text-xs rounded ${
                order.fulfillmentStatus === 'fulfilled'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {order.fulfillmentStatus || 'Unfulfilled'}
              </span>
              <p className="mt-1 font-medium">
                {formatPrice(order.totalPrice.amount, order.totalPrice.currencyCode)}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {order.lineItems.map((item, idx) => (
              <div key={idx} className="flex gap-4">
                {item.variant.image && (
                  <img
                    src={item.variant.image.url}
                    alt={item.variant.image.altText || item.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium">
                  {formatPrice(item.variant.price.amount, item.variant.price.currencyCode)}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Subscriptions Tab Component
function SubscriptionsTab({
  subscriptions,
  customerToken,
  subscriptionActions,
  formatPrice,
  onRefresh,
}: {
  subscriptions: CustomerSubscription[]
  customerToken: string
  subscriptionActions: ReturnType<typeof useSubscription>
  formatPrice: (amount: string, currency: string) => string
  onRefresh: () => void
}) {
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleAction = async (
    subscriptionId: string,
    action: 'pause' | 'resume' | 'cancel' | 'skip'
  ) => {
    setActionLoading(`${subscriptionId}-${action}`)
    try {
      switch (action) {
        case 'pause':
          await subscriptionActions.pauseSubscription(customerToken, subscriptionId)
          break
        case 'resume':
          await subscriptionActions.resumeSubscription(customerToken, subscriptionId)
          break
        case 'cancel':
          if (window.confirm('Are you sure you want to cancel this subscription?')) {
            await subscriptionActions.cancelSubscription(customerToken, subscriptionId)
          }
          break
        case 'skip':
          await subscriptionActions.skipNextDelivery(customerToken, subscriptionId)
          break
      }
      onRefresh()
    } catch {
      // Error handled in hook
    } finally {
      setActionLoading(null)
    }
  }

  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        You don&apos;t have any active subscriptions.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {subscriptions.map((sub) => (
        <div key={sub.id} className="border rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-medium">{sub.product.title}</h3>
              <p className="text-sm text-gray-500">
                Next billing: {new Date(sub.nextBillingDate).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-2 py-1 text-xs rounded ${
                sub.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : sub.status === 'paused'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {sub.status}
              </span>
              <p className="mt-1 font-medium">
                {formatPrice(sub.price.amount, sub.price.currencyCode)}
              </p>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            {sub.status === 'active' && (
              <>
                <button
                  onClick={() => handleAction(sub.id, 'skip')}
                  disabled={actionLoading !== null}
                  className="px-4 py-2 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  {actionLoading === `${sub.id}-skip` ? 'Skipping...' : 'Skip Next'}
                </button>
                <button
                  onClick={() => handleAction(sub.id, 'pause')}
                  disabled={actionLoading !== null}
                  className="px-4 py-2 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  {actionLoading === `${sub.id}-pause` ? 'Pausing...' : 'Pause'}
                </button>
              </>
            )}
            {sub.status === 'paused' && (
              <button
                onClick={() => handleAction(sub.id, 'resume')}
                disabled={actionLoading !== null}
                className="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
              >
                {actionLoading === `${sub.id}-resume` ? 'Resuming...' : 'Resume'}
              </button>
            )}
            <button
              onClick={() => handleAction(sub.id, 'cancel')}
              disabled={actionLoading !== null}
              className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50 disabled:opacity-50"
            >
              {actionLoading === `${sub.id}-cancel` ? 'Cancelling...' : 'Cancel'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// Profile Tab Component
function ProfileTab({
  profile,
  onUpdate,
  onLogout,
}: {
  profile: NonNullable<ReturnType<typeof useCustomer>['profile']>
  onUpdate: ReturnType<typeof useCustomer>['updateProfile']
  onLogout: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    phone: profile.phone || '',
    acceptsMarketing: profile.acceptsMarketing,
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      await onUpdate(formData)
      setEditing(false)
    } catch {
      // Error handled by hook
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-md">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full px-3 py-2 border rounded bg-gray-50 text-gray-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={editing ? formData.firstName : (profile.firstName || '')}
              disabled={!editing}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className={`w-full px-3 py-2 border rounded ${
                editing ? 'bg-white' : 'bg-gray-50 text-gray-500'
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={editing ? formData.lastName : (profile.lastName || '')}
              disabled={!editing}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className={`w-full px-3 py-2 border rounded ${
                editing ? 'bg-white' : 'bg-gray-50 text-gray-500'
              }`}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            value={editing ? formData.phone : (profile.phone || '')}
            disabled={!editing}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className={`w-full px-3 py-2 border rounded ${
              editing ? 'bg-white' : 'bg-gray-50 text-gray-500'
            }`}
          />
        </div>

        {editing && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="marketing"
              checked={formData.acceptsMarketing}
              onChange={(e) => setFormData({ ...formData, acceptsMarketing: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="marketing" className="text-sm text-gray-700">
              Receive marketing emails
            </label>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setEditing(false)}
                disabled={saving}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 pt-8 border-t">
        <button
          onClick={onLogout}
          className="text-red-600 hover:text-red-700"
        >
          Log Out
        </button>
      </div>
    </div>
  )
}

export default CustomerPortal
