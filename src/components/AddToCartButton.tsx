'use client'

import React, { useState } from 'react'
import { useCart, type CartItem } from '../hooks/useCart'
import { trackAddToCart } from '../tracking/analytics'

export interface AddToCartButtonProps {
  product: {
    id: string
    title: string
    handle: string
    images?: Array<{ url: string; altText: string | null }>
  }
  variant: {
    id: string
    title: string
    price: number
    compareAtPrice: number | null
    availableForSale: boolean
  }
  quantity?: number
  className?: string
  children?: React.ReactNode
  onAdd?: () => void
}

export function AddToCartButton({
  product,
  variant,
  quantity = 1,
  className,
  children,
  onAdd,
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const { addItem, openCart } = useCart()

  const handleClick = async () => {
    if (!variant.availableForSale) return

    setIsAdding(true)

    // Add to cart
    const cartItem: Omit<CartItem, 'quantity'> = {
      variantId: variant.id,
      productId: product.id,
      title: product.title,
      variantTitle: variant.title,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      handle: product.handle,
      image: product.images?.[0],
    }

    addItem(cartItem, quantity)

    // Track analytics
    trackAddToCart({
      item_id: variant.id,
      item_name: product.title,
      item_variant: variant.title,
      price: variant.price,
      quantity,
    })

    // Optional callback
    onAdd?.()

    // Open cart drawer
    openCart()

    // Reset loading state
    setTimeout(() => setIsAdding(false), 300)
  }

  const isDisabled = !variant.availableForSale || isAdding

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={className}
      type="button"
    >
      {children ||
        (isAdding
          ? 'Adding...'
          : variant.availableForSale
          ? 'Add to Cart'
          : 'Sold Out')}
    </button>
  )
}
