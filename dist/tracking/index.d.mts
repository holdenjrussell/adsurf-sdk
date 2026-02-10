/**
 * Analytics and tracking utilities
 *
 * Supports GA4, Meta Pixel, and Microsoft Clarity
 */
declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
        fbq?: (...args: unknown[]) => void;
        clarity?: (...args: unknown[]) => void;
    }
}
interface AnalyticsConfig {
    ga4Id?: string;
    metaPixelId?: string;
    clarityId?: string;
}
interface EcommerceItem {
    item_id: string;
    item_name: string;
    item_brand?: string;
    item_category?: string;
    item_variant?: string;
    price: number;
    quantity: number;
}
/**
 * Initialize analytics scripts
 */
declare function initializeAnalytics(config: AnalyticsConfig): void;
/**
 * Track page view
 */
declare function trackPageView(pagePath: string, pageTitle?: string): void;
/**
 * Track product view
 */
declare function trackViewItem(item: EcommerceItem): void;
/**
 * Track add to cart
 */
declare function trackAddToCart(item: EcommerceItem): void;
/**
 * Track remove from cart
 */
declare function trackRemoveFromCart(item: EcommerceItem): void;
/**
 * Track begin checkout
 */
declare function trackBeginCheckout(items: EcommerceItem[], value: number): void;
/**
 * Track purchase
 */
declare function trackPurchase(transactionId: string, items: EcommerceItem[], value: number): void;
/**
 * Track custom event
 */
declare function trackEvent(eventName: string, params?: Record<string, unknown>): void;

export { type AnalyticsConfig, type EcommerceItem, initializeAnalytics, trackAddToCart, trackBeginCheckout, trackEvent, trackPageView, trackPurchase, trackRemoveFromCart, trackViewItem };
