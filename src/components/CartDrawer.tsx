'use client'

import React from 'react'
import { useCart } from '../hooks/useCart'

export interface CartDrawerProps {
  onCheckout?: () => void
  className?: string
  overlayClassName?: string
  drawerClassName?: string
  formatPrice?: (price: number) => string
}

/**
 * Slide-out cart drawer component
 *
 * Provides a default styling but can be customized via className props
 */
export function CartDrawer({
  onCheckout,
  className,
  overlayClassName,
  drawerClassName,
  formatPrice = (p) => `$${p.toFixed(2)}`,
}: CartDrawerProps) {
  const { items, isOpen, closeCart, subtotal, updateQuantity, removeItem } = useCart()

  if (!isOpen) return null

  return (
    <div className={className}>
      {/* Overlay */}
      <div
        className={overlayClassName || 'fixed inset-0 bg-black/50 z-40'}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={
          drawerClassName ||
          'fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-xl flex flex-col'
        }
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Your Cart</h2>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-lg"
            aria-label="Close cart"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Your cart is empty
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-4">
                  {/* Image */}
                  {item.image && (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image.url}
                        alt={item.image.altText || item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {item.title}
                    </h3>
                    {item.variantTitle !== 'Default Title' && (
                      <p className="text-sm text-gray-500">{item.variantTitle}</p>
                    )}
                    <p className="font-medium mt-1">{formatPrice(item.price)}</p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.variantId, item.quantity - 1)
                        }
                        className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.variantId, item.quantity + 1)
                        }
                        className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-50"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="ml-auto text-sm text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex justify-between text-lg font-semibold">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
