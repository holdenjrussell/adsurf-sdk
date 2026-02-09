/**
 * Analytics and tracking utilities
 *
 * Supports GA4, Meta Pixel, and Microsoft Clarity
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
    clarity?: (...args: unknown[]) => void
  }
}

export interface AnalyticsConfig {
  ga4Id?: string
  metaPixelId?: string
  clarityId?: string
}

export interface EcommerceItem {
  item_id: string
  item_name: string
  item_brand?: string
  item_category?: string
  item_variant?: string
  price: number
  quantity: number
}

/**
 * Initialize analytics scripts
 */
export function initializeAnalytics(config: AnalyticsConfig): void {
  if (typeof window === 'undefined') return

  // GA4
  if (config.ga4Id && !window.gtag) {
    const script = document.createElement('script')
    script.src = `https://www.googletagmanager.com/gtag/js?id=${config.ga4Id}`
    script.async = true
    document.head.appendChild(script)

    window.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      ;(window as { dataLayer?: unknown[] }).dataLayer =
        (window as { dataLayer?: unknown[] }).dataLayer || []
      // eslint-disable-next-line prefer-rest-params
      ;(window as { dataLayer?: unknown[] }).dataLayer!.push(arguments)
    }
    window.gtag('js', new Date())
    window.gtag('config', config.ga4Id)
  }

  // Meta Pixel
  if (config.metaPixelId && !window.fbq) {
    const script = document.createElement('script')
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${config.metaPixelId}');
      fbq('track', 'PageView');
    `
    document.head.appendChild(script)
  }

  // Microsoft Clarity
  if (config.clarityId && !window.clarity) {
    const script = document.createElement('script')
    script.innerHTML = `
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${config.clarityId}");
    `
    document.head.appendChild(script)
  }
}

/**
 * Track page view
 */
export function trackPageView(pagePath: string, pageTitle?: string): void {
  if (typeof window === 'undefined') return

  // GA4
  window.gtag?.('event', 'page_view', {
    page_path: pagePath,
    page_title: pageTitle,
  })

  // Meta Pixel
  window.fbq?.('track', 'PageView')
}

/**
 * Track product view
 */
export function trackViewItem(item: EcommerceItem): void {
  if (typeof window === 'undefined') return

  // GA4
  window.gtag?.('event', 'view_item', {
    currency: 'USD',
    value: item.price,
    items: [item],
  })

  // Meta Pixel
  window.fbq?.('track', 'ViewContent', {
    content_ids: [item.item_id],
    content_name: item.item_name,
    content_type: 'product',
    value: item.price,
    currency: 'USD',
  })
}

/**
 * Track add to cart
 */
export function trackAddToCart(item: EcommerceItem): void {
  if (typeof window === 'undefined') return

  // GA4
  window.gtag?.('event', 'add_to_cart', {
    currency: 'USD',
    value: item.price * item.quantity,
    items: [item],
  })

  // Meta Pixel
  window.fbq?.('track', 'AddToCart', {
    content_ids: [item.item_id],
    content_name: item.item_name,
    content_type: 'product',
    value: item.price * item.quantity,
    currency: 'USD',
  })
}

/**
 * Track remove from cart
 */
export function trackRemoveFromCart(item: EcommerceItem): void {
  if (typeof window === 'undefined') return

  // GA4
  window.gtag?.('event', 'remove_from_cart', {
    currency: 'USD',
    value: item.price * item.quantity,
    items: [item],
  })
}

/**
 * Track begin checkout
 */
export function trackBeginCheckout(items: EcommerceItem[], value: number): void {
  if (typeof window === 'undefined') return

  // GA4
  window.gtag?.('event', 'begin_checkout', {
    currency: 'USD',
    value,
    items,
  })

  // Meta Pixel
  window.fbq?.('track', 'InitiateCheckout', {
    content_ids: items.map((i) => i.item_id),
    num_items: items.reduce((sum, i) => sum + i.quantity, 0),
    value,
    currency: 'USD',
  })
}

/**
 * Track purchase
 */
export function trackPurchase(
  transactionId: string,
  items: EcommerceItem[],
  value: number
): void {
  if (typeof window === 'undefined') return

  // GA4
  window.gtag?.('event', 'purchase', {
    transaction_id: transactionId,
    currency: 'USD',
    value,
    items,
  })

  // Meta Pixel
  window.fbq?.('track', 'Purchase', {
    content_ids: items.map((i) => i.item_id),
    content_type: 'product',
    num_items: items.reduce((sum, i) => sum + i.quantity, 0),
    value,
    currency: 'USD',
  })
}

/**
 * Track custom event
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === 'undefined') return

  // GA4
  window.gtag?.('event', eventName, params)
}
