export { B as BrandConfig, C as Collection, P as PlatformClient, a as PlatformClientConfig, b as Product, c as createPlatformClient } from './api-BTVT5zs0.mjs';
export { GraphQLClient, GraphQLClientConfig, GraphQLErrorDetail, GraphQLQueryError, GraphQLResponse, ShopifyCart, ShopifyClient, ShopifyClientConfig, ShopifyCollection, ShopifyProduct, createGid, createGraphQLClient, createShopifyClient, extractNumericId, gql, parseGid } from './client/index.mjs';
export { CartItem, CartState, CustomerOrder, CustomerProfile, CustomerSubscription, SubscriptionProduct, SubscriptionResult, useCart, useCartStore, useCollection, useCollections, useCustomer, useProduct, useProducts, useSubscription } from './hooks/index.mjs';
export { AddToCartButton, AddToCartButtonProps, CartDrawer, CartDrawerProps, CustomerPortal, CustomerPortalProps, ProductCard, ProductCardProps, SellingPlan, SubscribeWidget, SubscribeWidgetProps } from './components/index.mjs';
export { AnalyticsConfig, EcommerceItem, initializeAnalytics, trackAddToCart, trackBeginCheckout, trackEvent, trackPageView, trackPurchase, trackRemoveFromCart, trackViewItem } from './tracking/index.mjs';
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

export { type FormatMoneyOptions, calculateDiscount, formatDiscount, formatMoney };
