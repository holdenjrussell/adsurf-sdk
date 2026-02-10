export { B as BrandConfig, C as Collection, P as PlatformClient, a as PlatformClientConfig, b as Product, c as createPlatformClient } from '../api-BTVT5zs0.js';

/**
 * Shopify Storefront API client for direct Shopify queries
 * Use this when you need to bypass the platform API
 */
interface ShopifyClientConfig {
    storeDomain: string;
    storefrontAccessToken: string;
    apiVersion?: string;
}
interface ShopifyProduct {
    id: string;
    title: string;
    handle: string;
    description: string;
    descriptionHtml: string;
    vendor: string;
    productType: string;
    tags: string[];
    priceRange: {
        minVariantPrice: {
            amount: string;
            currencyCode: string;
        };
        maxVariantPrice: {
            amount: string;
            currencyCode: string;
        };
    };
    images: Array<{
        url: string;
        altText: string | null;
    }>;
    variants: Array<{
        id: string;
        title: string;
        availableForSale: boolean;
        price: {
            amount: string;
            currencyCode: string;
        };
        compareAtPrice: {
            amount: string;
            currencyCode: string;
        } | null;
        selectedOptions: Array<{
            name: string;
            value: string;
        }>;
        image: {
            url: string;
            altText: string | null;
        } | null;
    }>;
    options: Array<{
        name: string;
        values: string[];
    }>;
}
interface ShopifyCollection {
    id: string;
    title: string;
    handle: string;
    description: string;
    image: {
        url: string;
        altText: string | null;
    } | null;
    products: ShopifyProduct[];
}
interface ShopifyCart {
    id: string;
    checkoutUrl: string;
    lines: Array<{
        id: string;
        quantity: number;
        merchandise: {
            id: string;
            title: string;
            product: {
                title: string;
                handle: string;
            };
            price: {
                amount: string;
                currencyCode: string;
            };
            image: {
                url: string;
                altText: string | null;
            } | null;
        };
    }>;
    cost: {
        totalAmount: {
            amount: string;
            currencyCode: string;
        };
        subtotalAmount: {
            amount: string;
            currencyCode: string;
        };
    };
}
declare class ShopifyClient {
    private storeDomain;
    private storefrontAccessToken;
    private apiVersion;
    constructor(config: ShopifyClientConfig);
    private query;
    getProducts(first?: number): Promise<ShopifyProduct[]>;
    getProduct(handle: string): Promise<ShopifyProduct | null>;
    getCollections(first?: number): Promise<ShopifyCollection[]>;
    getCollection(handle: string, productCount?: number): Promise<ShopifyCollection | null>;
    createCart(lines?: Array<{
        merchandiseId: string;
        quantity: number;
    }>): Promise<ShopifyCart>;
    addToCart(cartId: string, lines: Array<{
        merchandiseId: string;
        quantity: number;
    }>): Promise<ShopifyCart>;
    updateCartLines(cartId: string, lines: Array<{
        id: string;
        quantity: number;
    }>): Promise<ShopifyCart>;
    removeCartLines(cartId: string, lineIds: string[]): Promise<ShopifyCart>;
    getCart(cartId: string): Promise<ShopifyCart | null>;
}
declare function createShopifyClient(config: ShopifyClientConfig): ShopifyClient;

/**
 * GraphQL utilities for custom queries
 */
interface GraphQLClientConfig {
    endpoint: string;
    headers?: Record<string, string>;
}
interface GraphQLErrorDetail {
    message: string;
    locations?: Array<{
        line: number;
        column: number;
    }>;
    path?: string[];
}
interface GraphQLResponse<T> {
    data?: T;
    errors?: GraphQLErrorDetail[];
}
declare class GraphQLClient {
    private endpoint;
    private headers;
    constructor(config: GraphQLClientConfig);
    query<T = unknown>(query: string, variables?: Record<string, unknown>): Promise<T>;
    mutate<T = unknown>(mutation: string, variables?: Record<string, unknown>): Promise<T>;
    /**
     * Execute a batch of queries in parallel
     */
    batchQuery<T extends Record<string, unknown>>(queries: Array<{
        query: string;
        variables?: Record<string, unknown>;
    }>): Promise<T[]>;
    /**
     * Update the headers for subsequent requests
     */
    setHeaders(headers: Record<string, string>): void;
    /**
     * Set a single header value
     */
    setHeader(key: string, value: string): void;
    /**
     * Remove a header
     */
    removeHeader(key: string): void;
}
declare class GraphQLQueryError extends Error {
    errors: GraphQLErrorDetail[];
    constructor(errors: GraphQLErrorDetail[]);
    /**
     * Get all error messages as a single string
     */
    getMessages(): string;
    /**
     * Check if a specific field path had an error
     */
    hasErrorAtPath(path: string[]): boolean;
}
/**
 * Template literal tag for GraphQL queries
 * Provides syntax highlighting in supported editors
 */
declare function gql(strings: TemplateStringsArray, ...values: unknown[]): string;
/**
 * Create a GraphQL client instance
 */
declare function createGraphQLClient(config: GraphQLClientConfig): GraphQLClient;
/**
 * Parse a GraphQL ID to extract the numeric ID
 * Shopify IDs are in the format: gid://shopify/Product/123456789
 */
declare function parseGid(gid: string): {
    type: string;
    id: string;
} | null;
/**
 * Create a Shopify GID from type and numeric ID
 */
declare function createGid(type: string, id: string | number): string;
/**
 * Extract numeric ID from a Shopify GID
 */
declare function extractNumericId(gid: string): string | null;

export { GraphQLClient, type GraphQLClientConfig, type GraphQLErrorDetail, GraphQLQueryError, type GraphQLResponse, type ShopifyCart, ShopifyClient, type ShopifyClientConfig, type ShopifyCollection, type ShopifyProduct, createGid, createGraphQLClient, createShopifyClient, extractNumericId, gql, parseGid };
