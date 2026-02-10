/**
 * Adsurf Platform API Client
 *
 * Used by storefronts to fetch data from the platform
 */
interface PlatformClientConfig {
    apiKey: string;
    brandId?: string;
    baseUrl?: string;
}
interface Product {
    id: string;
    title: string;
    handle: string;
    description: string;
    descriptionHtml: string;
    vendor: string;
    productType: string;
    tags: string[];
    images: Array<{
        url: string;
        altText: string | null;
        width: number;
        height: number;
    }>;
    variants: Array<{
        id: string;
        title: string;
        availableForSale: boolean;
        price: number;
        compareAtPrice: number | null;
        currency: string;
        selectedOptions: Array<{
            name: string;
            value: string;
        }>;
        sku: string;
    }>;
    price: number;
    maxPrice: number;
    currency: string;
}
interface Collection {
    id: string;
    title: string;
    handle: string;
    description: string;
    image: {
        url: string;
        altText: string | null;
    } | null;
    products?: Product[];
}
interface BrandConfig {
    brand: {
        id: string;
        name: string;
        slug: string;
    };
    branding: {
        logo: string;
        logoLight?: string;
        favicon?: string;
        primaryColor: string;
        secondaryColor?: string;
        companyName: string;
        supportEmail: string;
    };
    analytics: {
        ga4Id?: string;
        metaPixelId?: string;
        clarityId?: string;
    };
    features: {
        blog: boolean;
        scheduling: boolean;
    };
}
declare class PlatformClient {
    private apiKey;
    private baseUrl;
    constructor(config: PlatformClientConfig);
    private fetch;
    /**
     * Get brand configuration
     */
    getConfig(): Promise<BrandConfig>;
    /**
     * Get all products
     */
    getProducts(limit?: number): Promise<{
        products: Product[];
        count: number;
    }>;
    /**
     * Get a single product by handle
     */
    getProduct(handle: string): Promise<{
        product: Product;
    }>;
    /**
     * Get all collections
     */
    getCollections(limit?: number): Promise<{
        collections: Collection[];
        count: number;
    }>;
    /**
     * Get a collection with its products
     */
    getCollection(handle: string, productLimit?: number): Promise<{
        collection: Collection;
    }>;
}
/**
 * Create a platform client instance
 */
declare function createPlatformClient(config: PlatformClientConfig): PlatformClient;

export { type BrandConfig as B, type Collection as C, PlatformClient as P, type PlatformClientConfig as a, type Product as b, createPlatformClient as c };
