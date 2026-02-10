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

/**
 * Attribution pixel for tracking conversions across platforms
 */
interface PixelConfig {
    platformUrl: string;
    brandId: string;
}
interface AttributionData {
    event: string;
    value?: number;
    currency?: string;
    orderId?: string;
    items?: Array<{
        id: string;
        name: string;
        price: number;
        quantity: number;
    }>;
    metadata?: Record<string, unknown>;
}
/**
 * Initialize the attribution pixel
 */
declare function initializePixel(config: PixelConfig): void;
/**
 * Track a page view
 */
declare function trackPixelPageView(path?: string): void;
/**
 * Track a product view
 */
declare function trackPixelProductView(productId: string, productName: string, price?: number): void;
/**
 * Track add to cart
 */
declare function trackPixelAddToCart(productId: string, productName: string, price: number, quantity: number): void;
/**
 * Track checkout initiation
 */
declare function trackPixelCheckoutStart(cartValue: number, items: AttributionData['items']): void;
/**
 * Track purchase completion
 */
declare function trackPixelPurchase(orderId: string, value: number, currency: string, items: AttributionData['items']): void;
/**
 * Track custom event
 */
declare function trackPixelCustomEvent(eventName: string, data?: Record<string, unknown>): void;

export { type AnalyticsConfig, type EcommerceItem, initializeAnalytics, initializePixel, trackAddToCart, trackBeginCheckout, trackEvent, trackPageView, trackPixelAddToCart, trackPixelCheckoutStart, trackPixelCustomEvent, trackPixelPageView, trackPixelProductView, trackPixelPurchase, trackPurchase, trackRemoveFromCart, trackViewItem };
