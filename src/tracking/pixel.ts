/**
 * Attribution pixel for tracking conversions across platforms
 */

interface PixelConfig {
  platformUrl: string
  brandId: string
}

interface AttributionData {
  event: string
  value?: number
  currency?: string
  orderId?: string
  items?: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
  metadata?: Record<string, unknown>
}

let pixelConfig: PixelConfig | null = null

/**
 * Initialize the attribution pixel
 */
export function initializePixel(config: PixelConfig): void {
  pixelConfig = config

  // Load tracking script
  if (typeof window !== 'undefined') {
    const script = document.createElement('script')
    script.src = `${config.platformUrl}/pixel.js`
    script.async = true
    script.dataset.brandId = config.brandId
    document.head.appendChild(script)
  }
}

/**
 * Track a page view
 */
export function trackPixelPageView(path?: string): void {
  if (typeof window === 'undefined' || !pixelConfig) return

  sendPixelEvent({
    event: 'page_view',
    metadata: {
      path: path || window.location.pathname,
      referrer: document.referrer,
      url: window.location.href,
    },
  })
}

/**
 * Track a product view
 */
export function trackPixelProductView(
  productId: string,
  productName: string,
  price?: number
): void {
  sendPixelEvent({
    event: 'view_item',
    value: price,
    items: [
      {
        id: productId,
        name: productName,
        price: price || 0,
        quantity: 1,
      },
    ],
  })
}

/**
 * Track add to cart
 */
export function trackPixelAddToCart(
  productId: string,
  productName: string,
  price: number,
  quantity: number
): void {
  sendPixelEvent({
    event: 'add_to_cart',
    value: price * quantity,
    items: [
      {
        id: productId,
        name: productName,
        price,
        quantity,
      },
    ],
  })
}

/**
 * Track checkout initiation
 */
export function trackPixelCheckoutStart(
  cartValue: number,
  items: AttributionData['items']
): void {
  sendPixelEvent({
    event: 'begin_checkout',
    value: cartValue,
    items,
  })
}

/**
 * Track purchase completion
 */
export function trackPixelPurchase(
  orderId: string,
  value: number,
  currency: string,
  items: AttributionData['items']
): void {
  sendPixelEvent({
    event: 'purchase',
    orderId,
    value,
    currency,
    items,
  })
}

/**
 * Track custom event
 */
export function trackPixelCustomEvent(
  eventName: string,
  data?: Record<string, unknown>
): void {
  sendPixelEvent({
    event: eventName,
    metadata: data,
  })
}

/**
 * Send pixel event to platform
 */
function sendPixelEvent(data: AttributionData): void {
  if (typeof window === 'undefined' || !pixelConfig) return

  // Use sendBeacon for reliable delivery
  const payload = JSON.stringify({
    ...data,
    brandId: pixelConfig.brandId,
    timestamp: Date.now(),
    sessionId: getSessionId(),
    url: window.location.href,
    userAgent: navigator.userAgent,
  })

  const endpoint = `${pixelConfig.platformUrl}/api/pixel/track`

  if (navigator.sendBeacon) {
    navigator.sendBeacon(endpoint, payload)
  } else {
    fetch(endpoint, {
      method: 'POST',
      body: payload,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }).catch(() => {})
  }
}

/**
 * Get or create session ID
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return ''

  const key = 'adsurf_session_id'
  let sessionId = sessionStorage.getItem(key)

  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem(key, sessionId)
  }

  return sessionId
}
