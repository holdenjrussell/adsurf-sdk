'use client'

import React, { useState } from 'react'
import type { Product } from '../../client/api'
import { formatMoney } from '../../utils/money'

export interface SellingPlan {
  id: string
  name: string
  description?: string
  priceAdjustmentType: 'percentage' | 'fixed_amount' | 'price'
  priceAdjustmentValue: number
  deliveryFrequency: string
  deliveryInterval: 'day' | 'week' | 'month' | 'year'
  deliveryIntervalCount: number
}

export interface SubscribeWidgetProps {
  product: Product
  variant: Product['variants'][0]
  sellingPlans: SellingPlan[]
  className?: string
  onSubscribe?: (variantId: string, sellingPlanId: string, quantity: number) => void
  onOneTimePurchase?: (variantId: string, quantity: number) => void
  showOneTimePurchase?: boolean
  defaultSelection?: 'subscribe' | 'one-time'
  priceFormatter?: (amount: number, currency: string) => string
}

export function SubscribeWidget({
  product,
  variant,
  sellingPlans,
  className = '',
  onSubscribe,
  onOneTimePurchase,
  showOneTimePurchase = true,
  defaultSelection = 'subscribe',
  priceFormatter,
}: SubscribeWidgetProps) {
  const [purchaseType, setPurchaseType] = useState<'subscribe' | 'one-time'>(
    defaultSelection
  )
  const [selectedPlanId, setSelectedPlanId] = useState(sellingPlans[0]?.id || '')
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const formatPrice = (amount: number) => {
    if (priceFormatter) {
      return priceFormatter(amount, variant.currency)
    }
    return formatMoney(amount, { currency: variant.currency })
  }

  const calculateSubscriptionPrice = (plan: SellingPlan): number => {
    const basePrice = variant.price

    switch (plan.priceAdjustmentType) {
      case 'percentage':
        return basePrice * (1 - plan.priceAdjustmentValue / 100)
      case 'fixed_amount':
        return basePrice - plan.priceAdjustmentValue
      case 'price':
        return plan.priceAdjustmentValue
      default:
        return basePrice
    }
  }

  const selectedPlan = sellingPlans.find((p) => p.id === selectedPlanId)
  const subscriptionPrice = selectedPlan
    ? calculateSubscriptionPrice(selectedPlan)
    : variant.price
  const savings = variant.price - subscriptionPrice
  const savingsPercentage = Math.round((savings / variant.price) * 100)

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      if (purchaseType === 'subscribe' && selectedPlanId) {
        await onSubscribe?.(variant.id, selectedPlanId, quantity)
      } else {
        await onOneTimePurchase?.(variant.id, quantity)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const formatDeliveryInterval = (plan: SellingPlan): string => {
    const count = plan.deliveryIntervalCount
    const interval = plan.deliveryInterval

    if (count === 1) {
      return `Every ${interval}`
    }
    return `Every ${count} ${interval}s`
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Purchase type selection */}
      <div className="space-y-2">
        {/* Subscribe option */}
        <label
          className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
            purchaseType === 'subscribe'
              ? 'border-black bg-gray-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="purchase-type"
            value="subscribe"
            checked={purchaseType === 'subscribe'}
            onChange={() => setPurchaseType('subscribe')}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-medium">Subscribe & Save</span>
              {savingsPercentage > 0 && (
                <span className="text-sm font-medium text-green-600">
                  Save {savingsPercentage}%
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {formatPrice(subscriptionPrice)} per delivery
            </p>
          </div>
        </label>

        {/* One-time purchase option */}
        {showOneTimePurchase && (
          <label
            className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
              purchaseType === 'one-time'
                ? 'border-black bg-gray-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="purchase-type"
              value="one-time"
              checked={purchaseType === 'one-time'}
              onChange={() => setPurchaseType('one-time')}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">One-time purchase</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {formatPrice(variant.price)}
              </p>
            </div>
          </label>
        )}
      </div>

      {/* Subscription plan selection */}
      {purchaseType === 'subscribe' && sellingPlans.length > 1 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delivery Frequency
          </label>
          <select
            value={selectedPlanId}
            onChange={(e) => setSelectedPlanId(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          >
            {sellingPlans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {formatDeliveryInterval(plan)}
                {plan.priceAdjustmentType === 'percentage' &&
                  plan.priceAdjustmentValue > 0 &&
                  ` (${plan.priceAdjustmentValue}% off)`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Quantity selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quantity
        </label>
        <div className="flex items-center border rounded-lg w-fit">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-4 py-2 hover:bg-gray-50 transition-colors"
            disabled={quantity <= 1}
          >
            -
          </button>
          <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="px-4 py-2 hover:bg-gray-50 transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between py-3 border-t">
        <span className="font-medium">Total</span>
        <div className="text-right">
          <span className="text-lg font-semibold">
            {formatPrice(
              (purchaseType === 'subscribe' ? subscriptionPrice : variant.price) *
                quantity
            )}
          </span>
          {purchaseType === 'subscribe' && (
            <p className="text-sm text-gray-500">per delivery</p>
          )}
        </div>
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={isLoading || !variant.availableForSale}
        className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
          variant.availableForSale
            ? 'bg-black text-white hover:bg-gray-800'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isLoading
          ? 'Processing...'
          : !variant.availableForSale
          ? 'Sold Out'
          : purchaseType === 'subscribe'
          ? 'Subscribe Now'
          : 'Add to Cart'}
      </button>

      {/* Subscription benefits */}
      {purchaseType === 'subscribe' && (
        <div className="text-sm text-gray-600 space-y-1">
          <p className="flex items-center gap-2">
            <CheckIcon className="w-4 h-4 text-green-600" />
            Free shipping on all subscription orders
          </p>
          <p className="flex items-center gap-2">
            <CheckIcon className="w-4 h-4 text-green-600" />
            Cancel or pause anytime
          </p>
          <p className="flex items-center gap-2">
            <CheckIcon className="w-4 h-4 text-green-600" />
            Manage your subscription easily
          </p>
        </div>
      )}
    </div>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  )
}

export default SubscribeWidget
