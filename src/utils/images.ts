/**
 * Image optimization utilities for Shopify CDN and other sources
 */

export interface ImageTransformOptions {
  width?: number
  height?: number
  crop?: 'center' | 'top' | 'bottom' | 'left' | 'right'
  scale?: 1 | 2 | 3
  format?: 'jpg' | 'png' | 'webp' | 'avif'
  quality?: number
}

/**
 * Transform a Shopify CDN image URL with size parameters
 */
export function getShopifyImageUrl(
  url: string,
  options: ImageTransformOptions = {}
): string {
  if (!url) return ''

  // Check if it's a Shopify CDN URL
  if (!url.includes('cdn.shopify.com')) {
    return url
  }

  const { width, height, crop, scale } = options

  // Build size suffix
  let sizeSuffix = ''
  if (width && height) {
    sizeSuffix = `_${width}x${height}`
    if (crop) {
      sizeSuffix += `_crop_${crop}`
    }
  } else if (width) {
    sizeSuffix = `_${width}x`
  } else if (height) {
    sizeSuffix = `_x${height}`
  }

  // Add scale suffix for retina
  if (scale && scale > 1) {
    sizeSuffix += `@${scale}x`
  }

  // Insert size suffix before file extension
  const lastDotIndex = url.lastIndexOf('.')
  if (lastDotIndex === -1) {
    return url + sizeSuffix
  }

  return url.slice(0, lastDotIndex) + sizeSuffix + url.slice(lastDotIndex)
}

/**
 * Generate responsive image srcset for Shopify images
 */
export function getShopifySrcSet(
  url: string,
  widths: number[] = [320, 640, 960, 1280, 1920]
): string {
  if (!url || !url.includes('cdn.shopify.com')) {
    return ''
  }

  return widths
    .map((w) => `${getShopifyImageUrl(url, { width: w })} ${w}w`)
    .join(', ')
}

/**
 * Get optimized image props for Next.js Image component
 */
export function getOptimizedImageProps(
  url: string,
  alt: string,
  options: ImageTransformOptions = {}
): {
  src: string
  alt: string
  width?: number
  height?: number
  srcSet?: string
} {
  return {
    src: getShopifyImageUrl(url, options),
    alt,
    width: options.width,
    height: options.height,
    srcSet: getShopifySrcSet(url),
  }
}

/**
 * Preload critical images
 */
export function preloadImage(
  url: string,
  options?: ImageTransformOptions
): void {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = options ? getShopifyImageUrl(url, options) : url
  document.head.appendChild(link)
}

/**
 * Get placeholder/blur data URL for an image
 */
export function getPlaceholderDataUrl(width = 10, height = 10): string {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Crect fill='%23f3f4f6' width='${width}' height='${height}'/%3E%3C/svg%3E`
}

/**
 * Check if an image URL is valid
 */
export async function isValidImageUrl(url: string): Promise<boolean> {
  if (!url) return false

  try {
    const response = await fetch(url, { method: 'HEAD' })
    const contentType = response.headers.get('content-type')
    return response.ok && !!contentType?.startsWith('image/')
  } catch {
    return false
  }
}
