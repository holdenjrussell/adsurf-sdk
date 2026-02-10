'use client'

import React from 'react'
import type { Product } from '../../client/api'
import { formatMoney } from '../../utils/money'
import { AddToCartButton } from '../AddToCartButton'

export interface ProductCardProps {
  product: Product
  className?: string
  showAddToCart?: boolean
  onProductClick?: (product: Product) => void
  imageClassName?: string
  priceFormatter?: (amount: number, currency: string) => string
}

export function ProductCard({
  product,
  className = '',
  showAddToCart = true,
  onProductClick,
  imageClassName = '',
  priceFormatter,
}: ProductCardProps) {
  const mainImage = product.images[0]
  const mainVariant = product.variants[0]
  const price = mainVariant?.price ?? product.price
  const currency = mainVariant?.currency ?? product.currency
  const compareAtPrice = mainVariant?.compareAtPrice

  const hasDiscount = compareAtPrice !== null && compareAtPrice > price

  const formatPrice = (amount: number, curr: string) => {
    if (priceFormatter) {
      return priceFormatter(amount, curr)
    }
    return formatMoney(amount, { currency: curr })
  }

  const handleClick = () => {
    if (onProductClick) {
      onProductClick(product)
    }
  }

  return (
    <div className={`group ${className}`}>
      {/* Image */}
      <div
        className={`relative aspect-square overflow-hidden bg-gray-100 cursor-pointer ${imageClassName}`}
        onClick={handleClick}
      >
        {mainImage ? (
          <img
            src={mainImage.url}
            alt={mainImage.altText || product.title}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}

        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            Sale
          </span>
        )}
      </div>

      {/* Content */}
      <div className="mt-4">
        <h3
          className="text-sm font-medium text-gray-900 cursor-pointer hover:underline"
          onClick={handleClick}
        >
          {product.title}
        </h3>

        {/* Price */}
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">
            {formatPrice(price, currency)}
          </span>
          {hasDiscount && compareAtPrice !== null && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(compareAtPrice, currency)}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        {showAddToCart && mainVariant && (
          <div className="mt-3">
            <AddToCartButton
              product={product}
              variant={mainVariant}
              className="w-full py-2 px-4 bg-black text-white text-sm hover:bg-gray-800 transition-colors"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductCard
