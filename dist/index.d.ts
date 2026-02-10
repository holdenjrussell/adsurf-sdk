export { B as BrandConfig, C as Collection, P as PlatformClient, a as PlatformClientConfig, b as Product, c as createPlatformClient } from './api-BTVT5zs0.js';
export { GraphQLClient, GraphQLClientConfig, GraphQLErrorDetail, GraphQLQueryError, GraphQLResponse, ShopifyCart, ShopifyClient, ShopifyClientConfig, ShopifyCollection, ShopifyProduct, createGid, createGraphQLClient, createShopifyClient, extractNumericId, gql, parseGid } from './client/index.js';
export { CartItem, CartState, CustomerOrder, CustomerProfile, CustomerSubscription, SubscriptionProduct, SubscriptionResult, useCart, useCartStore, useCollection, useCollections, useCustomer, useProduct, useProducts, useSubscription } from './hooks/index.js';
export { AddToCartButton, AddToCartButtonProps, ApplicationField, ApplicationForm, ApplicationFormProps, BookingData, BookingWidget, BookingWidgetProps, CartDrawer, CartDrawerProps, ContactForm, CreatorApplicationForm, CustomerPortal, CustomerPortalProps, EventType, ProductCard, ProductCardProps, SellingPlan, SubscribeWidget, SubscribeWidgetProps, TimeSlot, VendorApplicationForm } from './components/index.js';
export { AnalyticsConfig, EcommerceItem, initializeAnalytics, initializePixel, trackAddToCart, trackBeginCheckout, trackEvent, trackPageView, trackPixelAddToCart, trackPixelCheckoutStart, trackPixelCustomEvent, trackPixelPageView, trackPixelProductView, trackPixelPurchase, trackPurchase, trackRemoveFromCart, trackViewItem } from './tracking/index.js';
import 'zustand/middleware';
import 'zustand';
import 'react/jsx-runtime';
import 'react';

/**
 * Money formatting utilities
 */
interface FormatMoneyOptions {
    currency?: string;
    locale?: string;
    showCents?: boolean;
}
/**
 * Format a price for display
 */
declare function formatMoney(amount: number, options?: FormatMoneyOptions): string;
/**
 * Calculate discount percentage
 */
declare function calculateDiscount(originalPrice: number, salePrice: number): number;
/**
 * Format discount for display
 */
declare function formatDiscount(originalPrice: number, salePrice: number): string;

/**
 * Image optimization utilities for Shopify CDN and other sources
 */
interface ImageTransformOptions {
    width?: number;
    height?: number;
    crop?: 'center' | 'top' | 'bottom' | 'left' | 'right';
    scale?: 1 | 2 | 3;
    format?: 'jpg' | 'png' | 'webp' | 'avif';
    quality?: number;
}
/**
 * Transform a Shopify CDN image URL with size parameters
 */
declare function getShopifyImageUrl(url: string, options?: ImageTransformOptions): string;
/**
 * Generate responsive image srcset for Shopify images
 */
declare function getShopifySrcSet(url: string, widths?: number[]): string;
/**
 * Get optimized image props for Next.js Image component
 */
declare function getOptimizedImageProps(url: string, alt: string, options?: ImageTransformOptions): {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    srcSet?: string;
};
/**
 * Preload critical images
 */
declare function preloadImage(url: string, options?: ImageTransformOptions): void;
/**
 * Get placeholder/blur data URL for an image
 */
declare function getPlaceholderDataUrl(width?: number, height?: number): string;
/**
 * Check if an image URL is valid
 */
declare function isValidImageUrl(url: string): Promise<boolean>;

/**
 * SEO utilities for storefronts
 */
interface MetaTagsInput {
    title: string;
    description: string;
    image?: string;
    url?: string;
    type?: 'website' | 'product' | 'article';
    siteName?: string;
    twitterHandle?: string;
}
interface ProductStructuredData {
    name: string;
    description: string;
    image: string[];
    sku?: string;
    brand?: string;
    price: string;
    priceCurrency: string;
    availability: 'InStock' | 'OutOfStock' | 'PreOrder';
    url?: string;
    reviewCount?: number;
    ratingValue?: number;
}
interface BreadcrumbItem {
    name: string;
    url: string;
}
/**
 * Generate meta tags object for Next.js metadata
 */
declare function generateMetaTags(input: MetaTagsInput): Record<string, string | object>;
/**
 * Generate Product structured data (JSON-LD)
 */
declare function generateProductSchema(product: ProductStructuredData): object;
/**
 * Generate BreadcrumbList structured data
 */
declare function generateBreadcrumbSchema(items: BreadcrumbItem[]): object;
/**
 * Generate Organization structured data
 */
declare function generateOrganizationSchema(org: {
    name: string;
    url: string;
    logo?: string;
    sameAs?: string[];
}): object;
/**
 * Generate canonical URL
 */
declare function getCanonicalUrl(baseUrl: string, path: string): string;
/**
 * Truncate text for meta descriptions
 */
declare function truncateForMeta(text: string, maxLength?: number): string;
/**
 * Generate robots meta content
 */
declare function generateRobotsMeta(options: {
    index?: boolean;
    follow?: boolean;
    noarchive?: boolean;
    nosnippet?: boolean;
}): string;

export { type BreadcrumbItem, type FormatMoneyOptions, type ImageTransformOptions, type MetaTagsInput, type ProductStructuredData, calculateDiscount, formatDiscount, formatMoney, generateBreadcrumbSchema, generateMetaTags, generateOrganizationSchema, generateProductSchema, generateRobotsMeta, getCanonicalUrl, getOptimizedImageProps, getPlaceholderDataUrl, getShopifyImageUrl, getShopifySrcSet, isValidImageUrl, preloadImage, truncateForMeta };
