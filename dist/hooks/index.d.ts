import * as zustand_middleware from 'zustand/middleware';
import * as zustand from 'zustand';
import { b as Product, C as Collection } from '../api-BTVT5zs0.js';

interface CartItem {
    variantId: string;
    productId: string;
    title: string;
    variantTitle: string;
    price: number;
    compareAtPrice: number | null;
    quantity: number;
    image?: {
        url: string;
        altText: string | null;
    };
    handle: string;
}
interface CartState {
    items: CartItem[];
    isOpen: boolean;
    addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
    removeItem: (variantId: string) => void;
    updateQuantity: (variantId: string, quantity: number) => void;
    clearCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;
    getSubtotal: () => number;
    getItemCount: () => number;
}
declare const useCartStore: zustand.UseBoundStore<Omit<zustand.StoreApi<CartState>, "persist"> & {
    persist: {
        setOptions: (options: Partial<zustand_middleware.PersistOptions<CartState, {
            items: CartItem[];
        }>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: CartState) => void) => () => void;
        onFinishHydration: (fn: (state: CartState) => void) => () => void;
        getOptions: () => Partial<zustand_middleware.PersistOptions<CartState, {
            items: CartItem[];
        }>>;
    };
}>;
/**
 * Hook for cart state and actions
 */
declare function useCart(): {
    items: CartItem[];
    isOpen: boolean;
    subtotal: number;
    itemCount: number;
    addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
    removeItem: (variantId: string) => void;
    updateQuantity: (variantId: string, quantity: number) => void;
    clearCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;
};

interface UseProductOptions {
    apiKey: string;
    baseUrl?: string;
}
interface UseProductResult {
    product: Product | null;
    isLoading: boolean;
    error: string | null;
}
/**
 * Hook for fetching a single product by handle
 */
declare function useProduct(handle: string, options: UseProductOptions): UseProductResult;
/**
 * Hook for fetching all products
 */
declare function useProducts(options: UseProductOptions & {
    limit?: number;
}): {
    products: Product[];
    isLoading: boolean;
    error: string | null;
};

interface UseCollectionOptions {
    apiKey?: string;
    baseUrl?: string;
}
interface UseCollectionResult {
    collection: Collection | null;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}
interface UseCollectionsResult {
    collections: Collection[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}
declare function useCollection(handle: string, options?: UseCollectionOptions): UseCollectionResult;
declare function useCollections(options?: UseCollectionOptions): UseCollectionsResult;

interface CustomerOrder {
    id: string;
    orderNumber: number;
    processedAt: string;
    financialStatus: string;
    fulfillmentStatus: string;
    totalPrice: {
        amount: string;
        currencyCode: string;
    };
    lineItems: Array<{
        title: string;
        quantity: number;
        variant: {
            image: {
                url: string;
                altText: string;
            } | null;
            price: {
                amount: string;
                currencyCode: string;
            };
        };
    }>;
}
interface CustomerSubscription {
    id: string;
    status: string;
    nextBillingDate: string;
    product: {
        title: string;
    };
    price: {
        amount: string;
        currencyCode: string;
    };
}
interface CustomerProfile {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    acceptsMarketing: boolean;
    defaultAddress: {
        address1: string;
        address2: string | null;
        city: string;
        province: string;
        zip: string;
        country: string;
    } | null;
}
interface UseCustomerOptions {
    apiKey?: string;
    baseUrl?: string;
}
declare function useCustomer(options?: UseCustomerOptions): {
    login: (accessToken: string) => void;
    logout: () => void;
    refetch: () => void;
    updateProfile: (updates: Partial<Pick<CustomerProfile, "firstName" | "lastName" | "phone" | "acceptsMarketing">>) => Promise<any>;
    isLoggedIn: boolean;
    accessToken: string | null;
    profile: CustomerProfile | null;
    orders: CustomerOrder[];
    subscriptions: CustomerSubscription[];
    loading: boolean;
    error: Error | null;
};

interface SubscriptionProduct {
    variantId: string;
    quantity: number;
    sellingPlanId: string;
}
interface SubscriptionResult {
    subscriptionId: string;
    status: string;
    nextBillingDate: string;
}
interface UseSubscriptionOptions {
    apiKey?: string;
    baseUrl?: string;
}
declare function useSubscription(options?: UseSubscriptionOptions): {
    loading: boolean;
    error: Error | null;
    subscribe: (customerToken: string, products: SubscriptionProduct[]) => Promise<SubscriptionResult>;
    cancelSubscription: (customerToken: string, subscriptionId: string) => Promise<{
        success: boolean;
    }>;
    pauseSubscription: (customerToken: string, subscriptionId: string, resumeDate?: string) => Promise<{
        success: boolean;
        resumeDate: string;
    }>;
    resumeSubscription: (customerToken: string, subscriptionId: string) => Promise<{
        success: boolean;
    }>;
    updateSubscriptionFrequency: (customerToken: string, subscriptionId: string, sellingPlanId: string) => Promise<{
        success: boolean;
    }>;
    skipNextDelivery: (customerToken: string, subscriptionId: string) => Promise<{
        success: boolean;
        nextBillingDate: string;
    }>;
};

export { type CartItem, type CartState, type CustomerOrder, type CustomerProfile, type CustomerSubscription, type SubscriptionProduct, type SubscriptionResult, useCart, useCartStore, useCollection, useCollections, useCustomer, useProduct, useProducts, useSubscription };
