"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  AddToCartButton: () => AddToCartButton,
  ApplicationForm: () => ApplicationForm,
  BookingWidget: () => BookingWidget,
  CartDrawer: () => CartDrawer,
  ContactForm: () => ContactForm,
  CreatorApplicationForm: () => CreatorApplicationForm,
  CustomerPortal: () => CustomerPortal,
  GraphQLClient: () => GraphQLClient,
  GraphQLQueryError: () => GraphQLQueryError,
  PlatformClient: () => PlatformClient,
  ProductCard: () => ProductCard,
  ShopifyClient: () => ShopifyClient,
  SubscribeWidget: () => SubscribeWidget,
  VendorApplicationForm: () => VendorApplicationForm,
  calculateDiscount: () => calculateDiscount,
  createGid: () => createGid,
  createGraphQLClient: () => createGraphQLClient,
  createPlatformClient: () => createPlatformClient,
  createShopifyClient: () => createShopifyClient,
  extractNumericId: () => extractNumericId,
  formatDiscount: () => formatDiscount,
  formatMoney: () => formatMoney,
  generateBreadcrumbSchema: () => generateBreadcrumbSchema,
  generateMetaTags: () => generateMetaTags,
  generateOrganizationSchema: () => generateOrganizationSchema,
  generateProductSchema: () => generateProductSchema,
  generateRobotsMeta: () => generateRobotsMeta,
  getCanonicalUrl: () => getCanonicalUrl,
  getOptimizedImageProps: () => getOptimizedImageProps,
  getPlaceholderDataUrl: () => getPlaceholderDataUrl,
  getShopifyImageUrl: () => getShopifyImageUrl,
  getShopifySrcSet: () => getShopifySrcSet,
  gql: () => gql,
  initializeAnalytics: () => initializeAnalytics,
  initializePixel: () => initializePixel,
  isValidImageUrl: () => isValidImageUrl,
  parseGid: () => parseGid,
  preloadImage: () => preloadImage,
  trackAddToCart: () => trackAddToCart,
  trackBeginCheckout: () => trackBeginCheckout,
  trackEvent: () => trackEvent,
  trackPageView: () => trackPageView,
  trackPixelAddToCart: () => trackPixelAddToCart,
  trackPixelCheckoutStart: () => trackPixelCheckoutStart,
  trackPixelCustomEvent: () => trackPixelCustomEvent,
  trackPixelPageView: () => trackPixelPageView,
  trackPixelProductView: () => trackPixelProductView,
  trackPixelPurchase: () => trackPixelPurchase,
  trackPurchase: () => trackPurchase,
  trackRemoveFromCart: () => trackRemoveFromCart,
  trackViewItem: () => trackViewItem,
  truncateForMeta: () => truncateForMeta,
  useCart: () => useCart,
  useCartStore: () => useCartStore,
  useCollection: () => useCollection,
  useCollections: () => useCollections,
  useCustomer: () => useCustomer,
  useProduct: () => useProduct,
  useProducts: () => useProducts,
  useSubscription: () => useSubscription
});
module.exports = __toCommonJS(src_exports);

// src/client/api.ts
var PlatformClient = class {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://adsurf.ai";
  }
  async fetch(endpoint, options) {
    const url = `${this.baseUrl}/api/storefront${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "x-brand-api-key": this.apiKey,
        ...options?.headers
      }
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || `API error: ${response.status}`);
    }
    return response.json();
  }
  /**
   * Get brand configuration
   */
  async getConfig() {
    return this.fetch("/config");
  }
  /**
   * Get all products
   */
  async getProducts(limit = 50) {
    return this.fetch(`/products?limit=${limit}`);
  }
  /**
   * Get a single product by handle
   */
  async getProduct(handle) {
    return this.fetch(`/products/${encodeURIComponent(handle)}`);
  }
  /**
   * Get all collections
   */
  async getCollections(limit = 50) {
    return this.fetch(`/collections?limit=${limit}`);
  }
  /**
   * Get a collection with its products
   */
  async getCollection(handle, productLimit = 50) {
    return this.fetch(
      `/collections/${encodeURIComponent(handle)}?productLimit=${productLimit}`
    );
  }
};
function createPlatformClient(config) {
  return new PlatformClient(config);
}

// src/client/shopify.ts
var ShopifyClient = class {
  constructor(config) {
    this.storeDomain = config.storeDomain;
    this.storefrontAccessToken = config.storefrontAccessToken;
    this.apiVersion = config.apiVersion || "2024-01";
  }
  async query(query, variables) {
    const response = await fetch(
      `https://${this.storeDomain}/api/${this.apiVersion}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": this.storefrontAccessToken
        },
        body: JSON.stringify({ query, variables })
      }
    );
    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`);
    }
    const json = await response.json();
    if (json.errors) {
      throw new Error(json.errors[0]?.message || "GraphQL error");
    }
    return json.data;
  }
  async getProducts(first = 50) {
    const data = await this.query(
      `
      query getProducts($first: Int!) {
        products(first: $first) {
          edges {
            node {
              id
              title
              handle
              description
              descriptionHtml
              vendor
              productType
              tags
              priceRange {
                minVariantPrice { amount currencyCode }
                maxVariantPrice { amount currencyCode }
              }
              images(first: 10) {
                edges { node { url altText } }
              }
              variants(first: 20) {
                edges {
                  node {
                    id
                    title
                    availableForSale
                    price { amount currencyCode }
                    compareAtPrice { amount currencyCode }
                    selectedOptions { name value }
                    image { url altText }
                  }
                }
              }
              options { name values }
            }
          }
        }
      }
    `,
      { first }
    );
    return data.products.edges.map(({ node }) => ({
      ...node,
      images: node.images.edges.map(
        (e) => e.node
      ),
      variants: node.variants.edges.map(
        (e) => e.node
      )
    }));
  }
  async getProduct(handle) {
    const data = await this.query(
      `
      query getProduct($handle: String!) {
        product(handle: $handle) {
          id
          title
          handle
          description
          descriptionHtml
          vendor
          productType
          tags
          priceRange {
            minVariantPrice { amount currencyCode }
            maxVariantPrice { amount currencyCode }
          }
          images(first: 10) {
            edges { node { url altText } }
          }
          variants(first: 20) {
            edges {
              node {
                id
                title
                availableForSale
                price { amount currencyCode }
                compareAtPrice { amount currencyCode }
                selectedOptions { name value }
                image { url altText }
              }
            }
          }
          options { name values }
        }
      }
    `,
      { handle }
    );
    if (!data.product) return null;
    const product = data.product;
    return {
      ...product,
      images: product.images.edges.map(
        (e) => e.node
      ),
      variants: product.variants.edges.map(
        (e) => e.node
      )
    };
  }
  async getCollections(first = 20) {
    const data = await this.query(
      `
      query getCollections($first: Int!) {
        collections(first: $first) {
          edges {
            node {
              id
              title
              handle
              description
              image { url altText }
            }
          }
        }
      }
    `,
      { first }
    );
    return data.collections.edges.map(({ node }) => ({
      ...node,
      products: []
    }));
  }
  async getCollection(handle, productCount = 50) {
    const data = await this.query(
      `
      query getCollection($handle: String!, $first: Int!) {
        collection(handle: $handle) {
          id
          title
          handle
          description
          image { url altText }
          products(first: $first) {
            edges {
              node {
                id
                title
                handle
                description
                priceRange {
                  minVariantPrice { amount currencyCode }
                  maxVariantPrice { amount currencyCode }
                }
                images(first: 1) {
                  edges { node { url altText } }
                }
                variants(first: 5) {
                  edges {
                    node {
                      id
                      title
                      availableForSale
                      price { amount currencyCode }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
      { handle, first: productCount }
    );
    if (!data.collection) return null;
    const collection = data.collection;
    const productsWithEdges = collection.products;
    return {
      ...collection,
      products: productsWithEdges.edges.map(({ node }) => ({
        ...node,
        descriptionHtml: "",
        vendor: "",
        productType: "",
        tags: [],
        options: [],
        images: node.images.edges.map(
          (e) => e.node
        ),
        variants: node.variants.edges.map(
          (e) => ({
            ...e.node,
            compareAtPrice: null,
            selectedOptions: [],
            image: null
          })
        )
      }))
    };
  }
  async createCart(lines) {
    const data = await this.query(
      `
      mutation cartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      product { title handle }
                      price { amount currencyCode }
                      image { url altText }
                    }
                  }
                }
              }
            }
            cost {
              totalAmount { amount currencyCode }
              subtotalAmount { amount currencyCode }
            }
          }
        }
      }
    `,
      { input: { lines: lines || [] } }
    );
    const cart = data.cartCreate.cart;
    const linesWithEdges = cart.lines;
    return {
      ...cart,
      lines: linesWithEdges.edges.map((e) => e.node)
    };
  }
  async addToCart(cartId, lines) {
    const data = await this.query(
      `
      mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            id
            checkoutUrl
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      product { title handle }
                      price { amount currencyCode }
                      image { url altText }
                    }
                  }
                }
              }
            }
            cost {
              totalAmount { amount currencyCode }
              subtotalAmount { amount currencyCode }
            }
          }
        }
      }
    `,
      { cartId, lines }
    );
    const cart = data.cartLinesAdd.cart;
    const linesWithEdges = cart.lines;
    return {
      ...cart,
      lines: linesWithEdges.edges.map((e) => e.node)
    };
  }
  async updateCartLines(cartId, lines) {
    const data = await this.query(
      `
      mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            id
            checkoutUrl
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      product { title handle }
                      price { amount currencyCode }
                      image { url altText }
                    }
                  }
                }
              }
            }
            cost {
              totalAmount { amount currencyCode }
              subtotalAmount { amount currencyCode }
            }
          }
        }
      }
    `,
      { cartId, lines }
    );
    const cart = data.cartLinesUpdate.cart;
    const linesWithEdges = cart.lines;
    return {
      ...cart,
      lines: linesWithEdges.edges.map((e) => e.node)
    };
  }
  async removeCartLines(cartId, lineIds) {
    const data = await this.query(
      `
      mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            id
            checkoutUrl
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      product { title handle }
                      price { amount currencyCode }
                      image { url altText }
                    }
                  }
                }
              }
            }
            cost {
              totalAmount { amount currencyCode }
              subtotalAmount { amount currencyCode }
            }
          }
        }
      }
    `,
      { cartId, lineIds }
    );
    const cart = data.cartLinesRemove.cart;
    const linesWithEdges = cart.lines;
    return {
      ...cart,
      lines: linesWithEdges.edges.map((e) => e.node)
    };
  }
  async getCart(cartId) {
    const data = await this.query(
      `
      query getCart($cartId: ID!) {
        cart(id: $cartId) {
          id
          checkoutUrl
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    product { title handle }
                    price { amount currencyCode }
                    image { url altText }
                  }
                }
              }
            }
          }
          cost {
            totalAmount { amount currencyCode }
            subtotalAmount { amount currencyCode }
          }
        }
      }
    `,
      { cartId }
    );
    if (!data.cart) return null;
    const cart = data.cart;
    const linesWithEdges = cart.lines;
    return {
      ...cart,
      lines: linesWithEdges.edges.map((e) => e.node)
    };
  }
};
function createShopifyClient(config) {
  return new ShopifyClient(config);
}

// src/client/graphql.ts
var GraphQLClient = class {
  constructor(config) {
    this.endpoint = config.endpoint;
    this.headers = {
      "Content-Type": "application/json",
      ...config.headers
    };
  }
  async query(query, variables) {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({ query, variables })
    });
    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status}`);
    }
    const json = await response.json();
    if (json.errors && json.errors.length > 0) {
      throw new GraphQLQueryError(json.errors);
    }
    return json.data;
  }
  async mutate(mutation, variables) {
    return this.query(mutation, variables);
  }
  /**
   * Execute a batch of queries in parallel
   */
  async batchQuery(queries) {
    const promises = queries.map((q) => this.query(q.query, q.variables));
    return Promise.all(promises);
  }
  /**
   * Update the headers for subsequent requests
   */
  setHeaders(headers) {
    this.headers = {
      ...this.headers,
      ...headers
    };
  }
  /**
   * Set a single header value
   */
  setHeader(key, value) {
    this.headers[key] = value;
  }
  /**
   * Remove a header
   */
  removeHeader(key) {
    delete this.headers[key];
  }
};
var GraphQLQueryError = class extends Error {
  constructor(errors) {
    super(errors[0]?.message || "GraphQL error");
    this.errors = errors;
    this.name = "GraphQLQueryError";
  }
  /**
   * Get all error messages as a single string
   */
  getMessages() {
    return this.errors.map((e) => e.message).join("; ");
  }
  /**
   * Check if a specific field path had an error
   */
  hasErrorAtPath(path) {
    return this.errors.some(
      (e) => e.path && e.path.length === path.length && e.path.every((p, i) => p === path[i])
    );
  }
};
function gql(strings, ...values) {
  return strings.reduce(
    (acc, str, i) => acc + str + (values[i] !== void 0 ? String(values[i]) : ""),
    ""
  );
}
function createGraphQLClient(config) {
  return new GraphQLClient(config);
}
function parseGid(gid) {
  const match = gid.match(/gid:\/\/shopify\/(\w+)\/(\d+)/);
  if (!match) return null;
  return { type: match[1], id: match[2] };
}
function createGid(type, id) {
  return `gid://shopify/${type}/${id}`;
}
function extractNumericId(gid) {
  const parsed = parseGid(gid);
  return parsed?.id || null;
}

// src/hooks/useCart.ts
var import_zustand = require("zustand");
var import_middleware = require("zustand/middleware");
var useCartStore = (0, import_zustand.create)()(
  (0, import_middleware.persist)(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (item, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.variantId === item.variantId
          );
          if (existingIndex >= 0) {
            const newItems = [...state.items];
            newItems[existingIndex] = {
              ...newItems[existingIndex],
              quantity: newItems[existingIndex].quantity + quantity
            };
            return { items: newItems };
          }
          return {
            items: [...state.items, { ...item, quantity }]
          };
        });
      },
      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId)
        }));
      },
      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        set((state) => ({
          items: state.items.map(
            (item) => item.variantId === variantId ? { ...item, quantity } : item
          )
        }));
      },
      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      }
    }),
    {
      name: "adsurf-cart",
      partialize: (state) => ({ items: state.items })
    }
  )
);
function useCart() {
  const store = useCartStore();
  return {
    items: store.items,
    isOpen: store.isOpen,
    subtotal: store.getSubtotal(),
    itemCount: store.getItemCount(),
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    openCart: store.openCart,
    closeCart: store.closeCart,
    toggleCart: store.toggleCart
  };
}

// src/hooks/useProduct.ts
var import_react = require("react");
function useProduct(handle, options) {
  const [product, setProduct] = (0, import_react.useState)(null);
  const [isLoading, setIsLoading] = (0, import_react.useState)(true);
  const [error, setError] = (0, import_react.useState)(null);
  (0, import_react.useEffect)(() => {
    if (!handle) {
      setIsLoading(false);
      return;
    }
    const baseUrl = options.baseUrl || "https://adsurf.ai";
    async function fetchProduct() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${baseUrl}/api/storefront/products/${encodeURIComponent(handle)}`,
          {
            headers: {
              "x-brand-api-key": options.apiKey
            }
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }
        const data = await response.json();
        setProduct(data.product);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProduct();
  }, [handle, options.apiKey, options.baseUrl]);
  return { product, isLoading, error };
}
function useProducts(options) {
  const [products, setProducts] = (0, import_react.useState)([]);
  const [isLoading, setIsLoading] = (0, import_react.useState)(true);
  const [error, setError] = (0, import_react.useState)(null);
  (0, import_react.useEffect)(() => {
    const baseUrl = options.baseUrl || "https://adsurf.ai";
    const limit = options.limit || 50;
    async function fetchProducts() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${baseUrl}/api/storefront/products?limit=${limit}`,
          {
            headers: {
              "x-brand-api-key": options.apiKey
            }
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setProducts(data.products);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, [options.apiKey, options.baseUrl, options.limit]);
  return { products, isLoading, error };
}

// src/hooks/useCollection.ts
var import_react2 = require("react");
function useCollection(handle, options = {}) {
  const [collection, setCollection] = (0, import_react2.useState)(null);
  const [loading, setLoading] = (0, import_react2.useState)(true);
  const [error, setError] = (0, import_react2.useState)(null);
  const apiKey = options.apiKey || process.env.NEXT_PUBLIC_PLATFORM_API_KEY || "";
  const baseUrl = options.baseUrl || process.env.NEXT_PUBLIC_PLATFORM_URL;
  const fetchCollection = (0, import_react2.useCallback)(async () => {
    if (!handle) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const client = createPlatformClient({
        apiKey,
        baseUrl
      });
      const result = await client.getCollection(handle);
      setCollection(result.collection);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch collection")
      );
    } finally {
      setLoading(false);
    }
  }, [handle, apiKey, baseUrl]);
  (0, import_react2.useEffect)(() => {
    fetchCollection();
  }, [fetchCollection]);
  return { collection, loading, error, refetch: fetchCollection };
}
function useCollections(options = {}) {
  const [collections, setCollections] = (0, import_react2.useState)([]);
  const [loading, setLoading] = (0, import_react2.useState)(true);
  const [error, setError] = (0, import_react2.useState)(null);
  const apiKey = options.apiKey || process.env.NEXT_PUBLIC_PLATFORM_API_KEY || "";
  const baseUrl = options.baseUrl || process.env.NEXT_PUBLIC_PLATFORM_URL;
  const fetchCollections = (0, import_react2.useCallback)(async () => {
    try {
      setLoading(true);
      setError(null);
      const client = createPlatformClient({
        apiKey,
        baseUrl
      });
      const result = await client.getCollections();
      setCollections(result.collections);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch collections")
      );
    } finally {
      setLoading(false);
    }
  }, [apiKey, baseUrl]);
  (0, import_react2.useEffect)(() => {
    fetchCollections();
  }, [fetchCollections]);
  return { collections, loading, error, refetch: fetchCollections };
}

// src/hooks/useCustomer.ts
var import_react3 = require("react");
var STORAGE_KEY = "adsurf-customer-token";
function useCustomer(options = {}) {
  const [state, setState] = (0, import_react3.useState)({
    isLoggedIn: false,
    accessToken: null,
    profile: null,
    orders: [],
    subscriptions: [],
    loading: true,
    error: null
  });
  const baseUrl = options.baseUrl || process.env.NEXT_PUBLIC_PLATFORM_URL || "";
  const apiKey = options.apiKey || process.env.NEXT_PUBLIC_PLATFORM_API_KEY || "";
  const fetchCustomerData = (0, import_react3.useCallback)(
    async (token) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const profileRes = await fetch(
          `${baseUrl}/api/storefront/customer/profile?token=${encodeURIComponent(token)}`,
          { headers: { "x-brand-api-key": apiKey } }
        );
        const profileData = await profileRes.json();
        const ordersRes = await fetch(
          `${baseUrl}/api/storefront/customer/orders?token=${encodeURIComponent(token)}`,
          { headers: { "x-brand-api-key": apiKey } }
        );
        const ordersData = await ordersRes.json();
        const subsRes = await fetch(
          `${baseUrl}/api/storefront/customer/subscriptions?token=${encodeURIComponent(token)}`,
          { headers: { "x-brand-api-key": apiKey } }
        );
        const subsData = await subsRes.json();
        setState((prev) => ({
          ...prev,
          profile: profileData.customer || null,
          orders: ordersData.orders || [],
          subscriptions: subsData.subscriptions || [],
          loading: false
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err : new Error("Failed to fetch customer data"),
          loading: false
        }));
      }
    },
    [baseUrl, apiKey]
  );
  (0, import_react3.useEffect)(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem(STORAGE_KEY);
    if (token) {
      setState((prev) => ({ ...prev, isLoggedIn: true, accessToken: token }));
      fetchCustomerData(token);
    } else {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [fetchCustomerData]);
  const login = (0, import_react3.useCallback)(
    (accessToken) => {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, accessToken);
      }
      setState((prev) => ({ ...prev, isLoggedIn: true, accessToken }));
      fetchCustomerData(accessToken);
    },
    [fetchCustomerData]
  );
  const logout = (0, import_react3.useCallback)(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    setState({
      isLoggedIn: false,
      accessToken: null,
      profile: null,
      orders: [],
      subscriptions: [],
      loading: false,
      error: null
    });
  }, []);
  const refetch = (0, import_react3.useCallback)(() => {
    if (state.accessToken) {
      fetchCustomerData(state.accessToken);
    }
  }, [state.accessToken, fetchCustomerData]);
  const updateProfile = (0, import_react3.useCallback)(
    async (updates) => {
      if (!state.accessToken) {
        throw new Error("Not logged in");
      }
      const response = await fetch(
        `${baseUrl}/api/storefront/customer/profile`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-brand-api-key": apiKey,
            "x-customer-token": state.accessToken
          },
          body: JSON.stringify(updates)
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      const data = await response.json();
      setState((prev) => ({
        ...prev,
        profile: data.customer || prev.profile
      }));
      return data.customer;
    },
    [state.accessToken, baseUrl, apiKey]
  );
  return {
    ...state,
    login,
    logout,
    refetch,
    updateProfile
  };
}

// src/hooks/useSubscription.ts
var import_react4 = require("react");
function useSubscription(options = {}) {
  const [loading, setLoading] = (0, import_react4.useState)(false);
  const [error, setError] = (0, import_react4.useState)(null);
  const baseUrl = options.baseUrl || process.env.NEXT_PUBLIC_PLATFORM_URL || "";
  const apiKey = options.apiKey || process.env.NEXT_PUBLIC_PLATFORM_API_KEY || "";
  const subscribe = (0, import_react4.useCallback)(
    async (customerToken, products) => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `${baseUrl}/api/storefront/customer/subscribe`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-brand-api-key": apiKey,
              "x-customer-token": customerToken
            },
            body: JSON.stringify({ products })
          }
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || "Failed to create subscription"
          );
        }
        return await response.json();
      } catch (err) {
        const error2 = err instanceof Error ? err : new Error("Subscription failed");
        setError(error2);
        throw error2;
      } finally {
        setLoading(false);
      }
    },
    [baseUrl, apiKey]
  );
  const cancelSubscription = (0, import_react4.useCallback)(
    async (customerToken, subscriptionId) => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `${baseUrl}/api/storefront/customer/subscriptions/${subscriptionId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "x-brand-api-key": apiKey,
              "x-customer-token": customerToken
            }
          }
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || "Failed to cancel subscription"
          );
        }
        return await response.json();
      } catch (err) {
        const error2 = err instanceof Error ? err : new Error("Cancellation failed");
        setError(error2);
        throw error2;
      } finally {
        setLoading(false);
      }
    },
    [baseUrl, apiKey]
  );
  const pauseSubscription = (0, import_react4.useCallback)(
    async (customerToken, subscriptionId, resumeDate) => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `${baseUrl}/api/storefront/customer/subscriptions/${subscriptionId}/pause`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-brand-api-key": apiKey,
              "x-customer-token": customerToken
            },
            body: JSON.stringify({ resumeDate })
          }
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to pause subscription");
        }
        return await response.json();
      } catch (err) {
        const error2 = err instanceof Error ? err : new Error("Pause failed");
        setError(error2);
        throw error2;
      } finally {
        setLoading(false);
      }
    },
    [baseUrl, apiKey]
  );
  const resumeSubscription = (0, import_react4.useCallback)(
    async (customerToken, subscriptionId) => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `${baseUrl}/api/storefront/customer/subscriptions/${subscriptionId}/resume`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-brand-api-key": apiKey,
              "x-customer-token": customerToken
            }
          }
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to resume subscription");
        }
        return await response.json();
      } catch (err) {
        const error2 = err instanceof Error ? err : new Error("Resume failed");
        setError(error2);
        throw error2;
      } finally {
        setLoading(false);
      }
    },
    [baseUrl, apiKey]
  );
  const updateSubscriptionFrequency = (0, import_react4.useCallback)(
    async (customerToken, subscriptionId, sellingPlanId) => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `${baseUrl}/api/storefront/customer/subscriptions/${subscriptionId}/frequency`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "x-brand-api-key": apiKey,
              "x-customer-token": customerToken
            },
            body: JSON.stringify({ sellingPlanId })
          }
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || "Failed to update subscription frequency"
          );
        }
        return await response.json();
      } catch (err) {
        const error2 = err instanceof Error ? err : new Error("Update failed");
        setError(error2);
        throw error2;
      } finally {
        setLoading(false);
      }
    },
    [baseUrl, apiKey]
  );
  const skipNextDelivery = (0, import_react4.useCallback)(
    async (customerToken, subscriptionId) => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `${baseUrl}/api/storefront/customer/subscriptions/${subscriptionId}/skip`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-brand-api-key": apiKey,
              "x-customer-token": customerToken
            }
          }
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to skip delivery");
        }
        return await response.json();
      } catch (err) {
        const error2 = err instanceof Error ? err : new Error("Skip failed");
        setError(error2);
        throw error2;
      } finally {
        setLoading(false);
      }
    },
    [baseUrl, apiKey]
  );
  return {
    loading,
    error,
    subscribe,
    cancelSubscription,
    pauseSubscription,
    resumeSubscription,
    updateSubscriptionFrequency,
    skipNextDelivery
  };
}

// src/components/AddToCartButton.tsx
var import_react5 = require("react");

// src/tracking/analytics.ts
function initializeAnalytics(config) {
  if (typeof window === "undefined") return;
  if (config.ga4Id && !window.gtag) {
    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${config.ga4Id}`;
    script.async = true;
    document.head.appendChild(script);
    window.gtag = function() {
      ;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(arguments);
    };
    window.gtag("js", /* @__PURE__ */ new Date());
    window.gtag("config", config.ga4Id);
  }
  if (config.metaPixelId && !window.fbq) {
    const script = document.createElement("script");
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
    `;
    document.head.appendChild(script);
  }
  if (config.clarityId && !window.clarity) {
    const script = document.createElement("script");
    script.innerHTML = `
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${config.clarityId}");
    `;
    document.head.appendChild(script);
  }
}
function trackPageView(pagePath, pageTitle) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", "page_view", {
    page_path: pagePath,
    page_title: pageTitle
  });
  window.fbq?.("track", "PageView");
}
function trackViewItem(item) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", "view_item", {
    currency: "USD",
    value: item.price,
    items: [item]
  });
  window.fbq?.("track", "ViewContent", {
    content_ids: [item.item_id],
    content_name: item.item_name,
    content_type: "product",
    value: item.price,
    currency: "USD"
  });
}
function trackAddToCart(item) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", "add_to_cart", {
    currency: "USD",
    value: item.price * item.quantity,
    items: [item]
  });
  window.fbq?.("track", "AddToCart", {
    content_ids: [item.item_id],
    content_name: item.item_name,
    content_type: "product",
    value: item.price * item.quantity,
    currency: "USD"
  });
}
function trackRemoveFromCart(item) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", "remove_from_cart", {
    currency: "USD",
    value: item.price * item.quantity,
    items: [item]
  });
}
function trackBeginCheckout(items, value) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", "begin_checkout", {
    currency: "USD",
    value,
    items
  });
  window.fbq?.("track", "InitiateCheckout", {
    content_ids: items.map((i) => i.item_id),
    num_items: items.reduce((sum, i) => sum + i.quantity, 0),
    value,
    currency: "USD"
  });
}
function trackPurchase(transactionId, items, value) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", "purchase", {
    transaction_id: transactionId,
    currency: "USD",
    value,
    items
  });
  window.fbq?.("track", "Purchase", {
    content_ids: items.map((i) => i.item_id),
    content_type: "product",
    num_items: items.reduce((sum, i) => sum + i.quantity, 0),
    value,
    currency: "USD"
  });
}
function trackEvent(eventName, params) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", eventName, params);
}

// src/components/AddToCartButton.tsx
var import_jsx_runtime = require("react/jsx-runtime");
function AddToCartButton({
  product,
  variant,
  quantity = 1,
  className,
  children,
  onAdd
}) {
  const [isAdding, setIsAdding] = (0, import_react5.useState)(false);
  const { addItem, openCart } = useCart();
  const handleClick = async () => {
    if (!variant.availableForSale) return;
    setIsAdding(true);
    const cartItem = {
      variantId: variant.id,
      productId: product.id,
      title: product.title,
      variantTitle: variant.title,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      handle: product.handle,
      image: product.images?.[0]
    };
    addItem(cartItem, quantity);
    trackAddToCart({
      item_id: variant.id,
      item_name: product.title,
      item_variant: variant.title,
      price: variant.price,
      quantity
    });
    onAdd?.();
    openCart();
    setTimeout(() => setIsAdding(false), 300);
  };
  const isDisabled = !variant.availableForSale || isAdding;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "button",
    {
      onClick: handleClick,
      disabled: isDisabled,
      className,
      type: "button",
      children: children || (isAdding ? "Adding..." : variant.availableForSale ? "Add to Cart" : "Sold Out")
    }
  );
}

// src/components/CartDrawer.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
function CartDrawer({
  onCheckout,
  className,
  overlayClassName,
  drawerClassName,
  formatPrice = (p) => `$${p.toFixed(2)}`
}) {
  const { items, isOpen, closeCart, subtotal, updateQuantity, removeItem } = useCart();
  if (!isOpen) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className, children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      "div",
      {
        className: overlayClassName || "fixed inset-0 bg-black/50 z-40",
        onClick: closeCart
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
      "div",
      {
        className: drawerClassName || "fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-xl flex flex-col",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center justify-between p-4 border-b", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h2", { className: "text-lg font-semibold", children: "Your Cart" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "button",
              {
                onClick: closeCart,
                className: "p-2 hover:bg-gray-100 rounded-lg",
                "aria-label": "Close cart",
                children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                  "svg",
                  {
                    className: "w-5 h-5",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24",
                    children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                      "path",
                      {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: 2,
                        d: "M6 18L18 6M6 6l12 12"
                      }
                    )
                  }
                )
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "flex-1 overflow-y-auto p-4", children: items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "text-center py-12 text-gray-500", children: "Your cart is empty" }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "space-y-4", children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex gap-4", children: [
            item.image && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "img",
              {
                src: item.image.url,
                alt: item.image.altText || item.title,
                className: "w-full h-full object-cover"
              }
            ) }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h3", { className: "font-medium text-gray-900 truncate", children: item.title }),
              item.variantTitle !== "Default Title" && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "text-sm text-gray-500", children: item.variantTitle }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "font-medium mt-1", children: formatPrice(item.price) }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center gap-2 mt-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                  "button",
                  {
                    onClick: () => updateQuantity(item.variantId, item.quantity - 1),
                    className: "w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-50",
                    children: "-"
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "w-8 text-center", children: item.quantity }),
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                  "button",
                  {
                    onClick: () => updateQuantity(item.variantId, item.quantity + 1),
                    className: "w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-50",
                    children: "+"
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                  "button",
                  {
                    onClick: () => removeItem(item.variantId),
                    className: "ml-auto text-sm text-red-600 hover:text-red-700",
                    children: "Remove"
                  }
                )
              ] })
            ] })
          ] }, item.variantId)) }) }),
          items.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "border-t p-4 space-y-4", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex justify-between text-lg font-semibold", children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "Subtotal" }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: formatPrice(subtotal) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "button",
              {
                onClick: onCheckout,
                className: "w-full py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors",
                children: "Checkout"
              }
            )
          ] })
        ]
      }
    )
  ] });
}

// src/utils/money.ts
function formatMoney(amount, options = {}) {
  const { currency = "USD", locale = "en-US", showCents = true } = options;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0
  }).format(amount);
}
function calculateDiscount(originalPrice, salePrice) {
  if (originalPrice <= 0 || salePrice >= originalPrice) return 0;
  return Math.round((originalPrice - salePrice) / originalPrice * 100);
}
function formatDiscount(originalPrice, salePrice) {
  const discount = calculateDiscount(originalPrice, salePrice);
  return discount > 0 ? `${discount}% OFF` : "";
}

// src/components/ProductCard/index.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
function ProductCard({
  product,
  className = "",
  showAddToCart = true,
  onProductClick,
  imageClassName = "",
  priceFormatter
}) {
  const mainImage = product.images[0];
  const mainVariant = product.variants[0];
  const price = mainVariant?.price ?? product.price;
  const currency = mainVariant?.currency ?? product.currency;
  const compareAtPrice = mainVariant?.compareAtPrice;
  const hasDiscount = compareAtPrice !== null && compareAtPrice > price;
  const formatPrice = (amount, curr) => {
    if (priceFormatter) {
      return priceFormatter(amount, curr);
    }
    return formatMoney(amount, { currency: curr });
  };
  const handleClick = () => {
    if (onProductClick) {
      onProductClick(product);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: `group ${className}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
      "div",
      {
        className: `relative aspect-square overflow-hidden bg-gray-100 cursor-pointer ${imageClassName}`,
        onClick: handleClick,
        children: [
          mainImage ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            "img",
            {
              src: mainImage.url,
              alt: mainImage.altText || product.title,
              className: "h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            }
          ) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "h-full w-full flex items-center justify-center text-gray-400", children: "No image" }),
          hasDiscount && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded", children: "Sale" })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "mt-4", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "h3",
        {
          className: "text-sm font-medium text-gray-900 cursor-pointer hover:underline",
          onClick: handleClick,
          children: product.title
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "mt-1 flex items-center gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-sm font-medium text-gray-900", children: formatPrice(price, currency) }),
        hasDiscount && compareAtPrice !== null && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-sm text-gray-500 line-through", children: formatPrice(compareAtPrice, currency) })
      ] }),
      showAddToCart && mainVariant && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "mt-3", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        AddToCartButton,
        {
          product,
          variant: mainVariant,
          className: "w-full py-2 px-4 bg-black text-white text-sm hover:bg-gray-800 transition-colors"
        }
      ) })
    ] })
  ] });
}

// src/components/CustomerPortal/index.tsx
var import_react6 = require("react");
var import_jsx_runtime4 = require("react/jsx-runtime");
function CustomerPortal({
  className = "",
  apiKey,
  baseUrl,
  onLoginRedirect,
  formatPrice
}) {
  const [activeTab, setActiveTab] = (0, import_react6.useState)("orders");
  const customer = useCustomer({ apiKey, baseUrl });
  const subscription = useSubscription({ apiKey, baseUrl });
  const defaultFormatPrice = (amount, currency) => {
    if (formatPrice) return formatPrice(amount, currency);
    return formatMoney(parseFloat(amount), { currency });
  };
  if (customer.loading) {
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: `flex items-center justify-center py-12 ${className}`, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" }) });
  }
  if (!customer.isLoggedIn) {
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: `text-center py-12 ${className}`, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h2", { className: "text-xl font-semibold mb-4", children: "Please log in to view your account" }),
      onLoginRedirect && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "button",
        {
          onClick: onLoginRedirect,
          className: "px-6 py-2 bg-black text-white hover:bg-gray-800 transition-colors",
          children: "Log In"
        }
      )
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className, children: [
    customer.profile && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "mb-8", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("h1", { className: "text-2xl font-semibold", children: [
        "Welcome, ",
        customer.profile.firstName || "Customer"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "text-gray-600", children: customer.profile.email })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "border-b mb-6", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("nav", { className: "flex gap-8", children: ["orders", "subscriptions", "profile"].map((tab) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      "button",
      {
        onClick: () => setActiveTab(tab),
        className: `py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === tab ? "border-black text-black" : "border-transparent text-gray-500 hover:text-gray-700"}`,
        children: tab.charAt(0).toUpperCase() + tab.slice(1)
      },
      tab
    )) }) }),
    activeTab === "orders" && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(OrdersTab, { orders: customer.orders, formatPrice: defaultFormatPrice }),
    activeTab === "subscriptions" && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      SubscriptionsTab,
      {
        subscriptions: customer.subscriptions,
        customerToken: customer.accessToken || "",
        subscriptionActions: subscription,
        formatPrice: defaultFormatPrice,
        onRefresh: customer.refetch
      }
    ),
    activeTab === "profile" && customer.profile && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      ProfileTab,
      {
        profile: customer.profile,
        onUpdate: customer.updateProfile,
        onLogout: customer.logout
      }
    )
  ] });
}
function OrdersTab({
  orders,
  formatPrice
}) {
  if (orders.length === 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "text-center py-12 text-gray-500", children: "You haven't placed any orders yet." });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "space-y-6", children: orders.map((order) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "border rounded-lg p-6", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex justify-between items-start mb-4", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("h3", { className: "font-medium", children: [
          "Order #",
          order.orderNumber
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "text-sm text-gray-500", children: new Date(order.processedAt).toLocaleDateString() })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "text-right", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: `inline-block px-2 py-1 text-xs rounded ${order.fulfillmentStatus === "fulfilled" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`, children: order.fulfillmentStatus || "Unfulfilled" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "mt-1 font-medium", children: formatPrice(order.totalPrice.amount, order.totalPrice.currencyCode) })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "space-y-3", children: order.lineItems.map((item, idx) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex gap-4", children: [
      item.variant.image && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "img",
        {
          src: item.variant.image.url,
          alt: item.variant.image.altText || item.title,
          className: "w-16 h-16 object-cover rounded"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "font-medium", children: item.title }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("p", { className: "text-sm text-gray-500", children: [
          "Qty: ",
          item.quantity
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "font-medium", children: formatPrice(item.variant.price.amount, item.variant.price.currencyCode) })
    ] }, idx)) })
  ] }, order.id)) });
}
function SubscriptionsTab({
  subscriptions,
  customerToken,
  subscriptionActions,
  formatPrice,
  onRefresh
}) {
  const [actionLoading, setActionLoading] = (0, import_react6.useState)(null);
  const handleAction = async (subscriptionId, action) => {
    setActionLoading(`${subscriptionId}-${action}`);
    try {
      switch (action) {
        case "pause":
          await subscriptionActions.pauseSubscription(customerToken, subscriptionId);
          break;
        case "resume":
          await subscriptionActions.resumeSubscription(customerToken, subscriptionId);
          break;
        case "cancel":
          if (window.confirm("Are you sure you want to cancel this subscription?")) {
            await subscriptionActions.cancelSubscription(customerToken, subscriptionId);
          }
          break;
        case "skip":
          await subscriptionActions.skipNextDelivery(customerToken, subscriptionId);
          break;
      }
      onRefresh();
    } catch {
    } finally {
      setActionLoading(null);
    }
  };
  if (subscriptions.length === 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "text-center py-12 text-gray-500", children: "You don't have any active subscriptions." });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "space-y-6", children: subscriptions.map((sub) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "border rounded-lg p-6", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex justify-between items-start mb-4", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h3", { className: "font-medium", children: sub.product.title }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("p", { className: "text-sm text-gray-500", children: [
          "Next billing: ",
          new Date(sub.nextBillingDate).toLocaleDateString()
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "text-right", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: `inline-block px-2 py-1 text-xs rounded ${sub.status === "active" ? "bg-green-100 text-green-800" : sub.status === "paused" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}`, children: sub.status }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "mt-1 font-medium", children: formatPrice(sub.price.amount, sub.price.currencyCode) })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex gap-3 flex-wrap", children: [
      sub.status === "active" && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "button",
          {
            onClick: () => handleAction(sub.id, "skip"),
            disabled: actionLoading !== null,
            className: "px-4 py-2 text-sm border rounded hover:bg-gray-50 disabled:opacity-50",
            children: actionLoading === `${sub.id}-skip` ? "Skipping..." : "Skip Next"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "button",
          {
            onClick: () => handleAction(sub.id, "pause"),
            disabled: actionLoading !== null,
            className: "px-4 py-2 text-sm border rounded hover:bg-gray-50 disabled:opacity-50",
            children: actionLoading === `${sub.id}-pause` ? "Pausing..." : "Pause"
          }
        )
      ] }),
      sub.status === "paused" && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "button",
        {
          onClick: () => handleAction(sub.id, "resume"),
          disabled: actionLoading !== null,
          className: "px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50",
          children: actionLoading === `${sub.id}-resume` ? "Resuming..." : "Resume"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "button",
        {
          onClick: () => handleAction(sub.id, "cancel"),
          disabled: actionLoading !== null,
          className: "px-4 py-2 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50 disabled:opacity-50",
          children: actionLoading === `${sub.id}-cancel` ? "Cancelling..." : "Cancel"
        }
      )
    ] })
  ] }, sub.id)) });
}
function ProfileTab({
  profile,
  onUpdate,
  onLogout
}) {
  const [editing, setEditing] = (0, import_react6.useState)(false);
  const [saving, setSaving] = (0, import_react6.useState)(false);
  const [formData, setFormData] = (0, import_react6.useState)({
    firstName: profile.firstName || "",
    lastName: profile.lastName || "",
    phone: profile.phone || "",
    acceptsMarketing: profile.acceptsMarketing
  });
  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(formData);
      setEditing(false);
    } catch {
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "max-w-md", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "space-y-4", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Email" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "input",
          {
            type: "email",
            value: profile.email,
            disabled: true,
            className: "w-full px-3 py-2 border rounded bg-gray-50 text-gray-500"
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "First Name" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            "input",
            {
              type: "text",
              value: editing ? formData.firstName : profile.firstName || "",
              disabled: !editing,
              onChange: (e) => setFormData({ ...formData, firstName: e.target.value }),
              className: `w-full px-3 py-2 border rounded ${editing ? "bg-white" : "bg-gray-50 text-gray-500"}`
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Last Name" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            "input",
            {
              type: "text",
              value: editing ? formData.lastName : profile.lastName || "",
              disabled: !editing,
              onChange: (e) => setFormData({ ...formData, lastName: e.target.value }),
              className: `w-full px-3 py-2 border rounded ${editing ? "bg-white" : "bg-gray-50 text-gray-500"}`
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Phone" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "input",
          {
            type: "tel",
            value: editing ? formData.phone : profile.phone || "",
            disabled: !editing,
            onChange: (e) => setFormData({ ...formData, phone: e.target.value }),
            className: `w-full px-3 py-2 border rounded ${editing ? "bg-white" : "bg-gray-50 text-gray-500"}`
          }
        )
      ] }),
      editing && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "input",
          {
            type: "checkbox",
            id: "marketing",
            checked: formData.acceptsMarketing,
            onChange: (e) => setFormData({ ...formData, acceptsMarketing: e.target.checked }),
            className: "rounded"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("label", { htmlFor: "marketing", className: "text-sm text-gray-700", children: "Receive marketing emails" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "flex gap-3 pt-4", children: editing ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "button",
          {
            onClick: handleSave,
            disabled: saving,
            className: "px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50",
            children: saving ? "Saving..." : "Save Changes"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "button",
          {
            onClick: () => setEditing(false),
            disabled: saving,
            className: "px-4 py-2 border rounded hover:bg-gray-50",
            children: "Cancel"
          }
        )
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "button",
        {
          onClick: () => setEditing(true),
          className: "px-4 py-2 border rounded hover:bg-gray-50",
          children: "Edit Profile"
        }
      ) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "mt-8 pt-8 border-t", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      "button",
      {
        onClick: onLogout,
        className: "text-red-600 hover:text-red-700",
        children: "Log Out"
      }
    ) })
  ] });
}

// src/components/SubscribeWidget/index.tsx
var import_react7 = require("react");
var import_jsx_runtime5 = require("react/jsx-runtime");
function SubscribeWidget({
  product,
  variant,
  sellingPlans,
  className = "",
  onSubscribe,
  onOneTimePurchase,
  showOneTimePurchase = true,
  defaultSelection = "subscribe",
  priceFormatter
}) {
  const [purchaseType, setPurchaseType] = (0, import_react7.useState)(
    defaultSelection
  );
  const [selectedPlanId, setSelectedPlanId] = (0, import_react7.useState)(sellingPlans[0]?.id || "");
  const [quantity, setQuantity] = (0, import_react7.useState)(1);
  const [isLoading, setIsLoading] = (0, import_react7.useState)(false);
  const formatPrice = (amount) => {
    if (priceFormatter) {
      return priceFormatter(amount, variant.currency);
    }
    return formatMoney(amount, { currency: variant.currency });
  };
  const calculateSubscriptionPrice = (plan) => {
    const basePrice = variant.price;
    switch (plan.priceAdjustmentType) {
      case "percentage":
        return basePrice * (1 - plan.priceAdjustmentValue / 100);
      case "fixed_amount":
        return basePrice - plan.priceAdjustmentValue;
      case "price":
        return plan.priceAdjustmentValue;
      default:
        return basePrice;
    }
  };
  const selectedPlan = sellingPlans.find((p) => p.id === selectedPlanId);
  const subscriptionPrice = selectedPlan ? calculateSubscriptionPrice(selectedPlan) : variant.price;
  const savings = variant.price - subscriptionPrice;
  const savingsPercentage = Math.round(savings / variant.price * 100);
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (purchaseType === "subscribe" && selectedPlanId) {
        await onSubscribe?.(variant.id, selectedPlanId, quantity);
      } else {
        await onOneTimePurchase?.(variant.id, quantity);
      }
    } finally {
      setIsLoading(false);
    }
  };
  const formatDeliveryInterval = (plan) => {
    const count = plan.deliveryIntervalCount;
    const interval = plan.deliveryInterval;
    if (count === 1) {
      return `Every ${interval}`;
    }
    return `Every ${count} ${interval}s`;
  };
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: `space-y-4 ${className}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "space-y-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
        "label",
        {
          className: `flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${purchaseType === "subscribe" ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"}`,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
              "input",
              {
                type: "radio",
                name: "purchase-type",
                value: "subscribe",
                checked: purchaseType === "subscribe",
                onChange: () => setPurchaseType("subscribe"),
                className: "mt-1"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex-1", children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "font-medium", children: "Subscribe & Save" }),
                savingsPercentage > 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { className: "text-sm font-medium text-green-600", children: [
                  "Save ",
                  savingsPercentage,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("p", { className: "text-sm text-gray-600 mt-1", children: [
                formatPrice(subscriptionPrice),
                " per delivery"
              ] })
            ] })
          ]
        }
      ),
      showOneTimePurchase && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
        "label",
        {
          className: `flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${purchaseType === "one-time" ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"}`,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
              "input",
              {
                type: "radio",
                name: "purchase-type",
                value: "one-time",
                checked: purchaseType === "one-time",
                onChange: () => setPurchaseType("one-time"),
                className: "mt-1"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex-1", children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "font-medium", children: "One-time purchase" }) }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "text-sm text-gray-600 mt-1", children: formatPrice(variant.price) })
            ] })
          ]
        }
      )
    ] }),
    purchaseType === "subscribe" && sellingPlans.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Delivery Frequency" }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
        "select",
        {
          value: selectedPlanId,
          onChange: (e) => setSelectedPlanId(e.target.value),
          className: "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black",
          children: sellingPlans.map((plan) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("option", { value: plan.id, children: [
            formatDeliveryInterval(plan),
            plan.priceAdjustmentType === "percentage" && plan.priceAdjustmentValue > 0 && ` (${plan.priceAdjustmentValue}% off)`
          ] }, plan.id))
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Quantity" }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex items-center border rounded-lg w-fit", children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          "button",
          {
            type: "button",
            onClick: () => setQuantity(Math.max(1, quantity - 1)),
            className: "px-4 py-2 hover:bg-gray-50 transition-colors",
            disabled: quantity <= 1,
            children: "-"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "px-4 py-2 min-w-[3rem] text-center", children: quantity }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          "button",
          {
            type: "button",
            onClick: () => setQuantity(quantity + 1),
            className: "px-4 py-2 hover:bg-gray-50 transition-colors",
            children: "+"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex items-center justify-between py-3 border-t", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "font-medium", children: "Total" }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "text-right", children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "text-lg font-semibold", children: formatPrice(
          (purchaseType === "subscribe" ? subscriptionPrice : variant.price) * quantity
        ) }),
        purchaseType === "subscribe" && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "text-sm text-gray-500", children: "per delivery" })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      "button",
      {
        onClick: handleSubmit,
        disabled: isLoading || !variant.availableForSale,
        className: `w-full py-3 px-6 rounded-lg font-medium transition-colors ${variant.availableForSale ? "bg-black text-white hover:bg-gray-800" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`,
        children: isLoading ? "Processing..." : !variant.availableForSale ? "Sold Out" : purchaseType === "subscribe" ? "Subscribe Now" : "Add to Cart"
      }
    ),
    purchaseType === "subscribe" && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "text-sm text-gray-600 space-y-1", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("p", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(CheckIcon, { className: "w-4 h-4 text-green-600" }),
        "Free shipping on all subscription orders"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("p", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(CheckIcon, { className: "w-4 h-4 text-green-600" }),
        "Cancel or pause anytime"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("p", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(CheckIcon, { className: "w-4 h-4 text-green-600" }),
        "Manage your subscription easily"
      ] })
    ] })
  ] });
}
function CheckIcon({ className }) {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
    "svg",
    {
      className,
      fill: "none",
      stroke: "currentColor",
      viewBox: "0 0 24 24",
      children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
        "path",
        {
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: 2,
          d: "M5 13l4 4L19 7"
        }
      )
    }
  );
}

// src/components/ApplicationForm/index.tsx
var import_react8 = require("react");
var import_jsx_runtime6 = require("react/jsx-runtime");
function ApplicationForm({
  title,
  description,
  fields,
  endpoint,
  method = "POST",
  additionalData = {},
  submitLabel = "Submit",
  submittingLabel = "Submitting...",
  successMessage = "Your application has been submitted successfully.",
  onSuccess,
  onError,
  headerContent,
  footerContent,
  className = "",
  styles = {}
}) {
  const [formData, setFormData] = (0, import_react8.useState)(() => {
    const initial = {};
    fields.forEach((field) => {
      initial[field.name] = "";
    });
    return initial;
  });
  const [isSubmitting, setIsSubmitting] = (0, import_react8.useState)(false);
  const [message, setMessage] = (0, import_react8.useState)(null);
  const [fieldErrors, setFieldErrors] = (0, import_react8.useState)({});
  const validateField = (field, value) => {
    if (field.required && !value.trim()) {
      return `${field.label} is required`;
    }
    if (field.validation) {
      return field.validation(value);
    }
    if (field.type === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return "Please enter a valid email address";
      }
    }
    if (field.type === "url" && value) {
      try {
        new URL(value);
      } catch {
        return "Please enter a valid URL";
      }
    }
    return null;
  };
  const validateAllFields = () => {
    const errors = {};
    let isValid = true;
    fields.forEach((field) => {
      const error = validateField(field, formData[field.name] || "");
      if (error) {
        errors[field.name] = error;
        isValid = false;
      }
    });
    setFieldErrors(errors);
    return isValid;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (!validateAllFields()) {
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          ...additionalData
        })
      });
      const data = await response.json();
      if (response.ok && data.success !== false) {
        setMessage({ type: "success", text: data.message || successMessage });
        const resetData = {};
        fields.forEach((field) => {
          resetData[field.name] = "";
        });
        setFormData(resetData);
        setFieldErrors({});
        onSuccess?.(data);
      } else {
        const errorText = data.error || data.message || "Failed to submit form";
        setMessage({ type: "error", text: errorText });
        onError?.(new Error(errorText));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit form";
      setMessage({ type: "error", text: errorMessage });
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };
  const renderField = (field) => {
    const baseInputClass = styles.input || "w-full border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent";
    const errorClass = fieldErrors[field.name] ? "border-red-500" : "";
    switch (field.type) {
      case "textarea":
        return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          "textarea",
          {
            value: formData[field.name] || "",
            onChange: (e) => handleChange(field.name, e.target.value),
            required: field.required,
            placeholder: field.placeholder,
            rows: 4,
            className: `${baseInputClass} ${errorClass}`
          }
        );
      case "select":
        return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
          "select",
          {
            value: formData[field.name] || "",
            onChange: (e) => handleChange(field.name, e.target.value),
            required: field.required,
            className: `${baseInputClass} ${errorClass}`,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("option", { value: "", children: "Select..." }),
              field.options?.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("option", { value: opt.value, children: opt.label }, opt.value))
            ]
          }
        );
      default:
        return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          "input",
          {
            type: field.type,
            value: formData[field.name] || "",
            onChange: (e) => handleChange(field.name, e.target.value),
            required: field.required,
            placeholder: field.placeholder,
            className: `${baseInputClass} ${errorClass}`
          }
        );
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: styles.container || `bg-white border border-gray-200 p-8 lg:p-12 ${className}`, children: [
    headerContent,
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "mb-8 text-center", children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("h1", { className: styles.title || "text-3xl lg:text-4xl font-bold text-gray-900 uppercase", children: title }),
      description && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: styles.description || "text-sm text-gray-500 mt-3", children: description })
    ] }),
    message && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      "div",
      {
        className: message.type === "success" ? styles.success || "mb-6 p-4 text-sm bg-green-50 border border-green-200 text-green-700" : styles.error || "mb-6 p-4 text-sm bg-red-50 border border-red-200 text-red-700",
        children: message.text
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("form", { onSubmit: handleSubmit, className: "space-y-5", children: [
      fields.map((field) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: styles.field, children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("label", { className: styles.label || "block text-sm text-gray-900 mb-2 uppercase font-medium", children: [
          field.label,
          field.required && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "text-red-500 ml-1", children: "*" })
        ] }),
        renderField(field),
        fieldErrors[field.name] && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "text-red-500 text-sm mt-1", children: fieldErrors[field.name] })
      ] }, field.name)),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
        "button",
        {
          type: "submit",
          disabled: isSubmitting,
          className: styles.button || "w-full bg-black text-white text-sm uppercase tracking-wider py-4 hover:opacity-90 transition-opacity disabled:opacity-50",
          children: isSubmitting ? submittingLabel : submitLabel
        }
      )
    ] }),
    footerContent
  ] });
}
function CreatorApplicationForm({
  endpoint,
  title = "Creator Application",
  description = "Join our creator program and start earning.",
  onSuccess,
  onError,
  ...props
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
    ApplicationForm,
    {
      title,
      description,
      endpoint,
      fields: [
        { name: "name", label: "Full Name", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "phone", label: "Phone Number", type: "tel" },
        { name: "instagram", label: "Instagram Handle", type: "text", placeholder: "@username" },
        { name: "tiktok", label: "TikTok Handle", type: "text", placeholder: "@username" },
        { name: "followers", label: "Total Followers", type: "number", placeholder: "Approximate total" },
        { name: "message", label: "Why do you want to partner with us?", type: "textarea" }
      ],
      onSuccess,
      onError,
      ...props
    }
  );
}
function VendorApplicationForm({
  endpoint,
  title = "Vendor Application",
  description = "Apply to become a wholesale partner.",
  onSuccess,
  onError,
  ...props
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
    ApplicationForm,
    {
      title,
      description,
      endpoint,
      fields: [
        { name: "businessName", label: "Business Name", type: "text", required: true },
        { name: "contactName", label: "Contact Name", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "phone", label: "Phone Number", type: "tel", required: true },
        { name: "website", label: "Website", type: "url" },
        {
          name: "businessType",
          label: "Business Type",
          type: "select",
          required: true,
          options: [
            { value: "retail", label: "Retail Store" },
            { value: "salon", label: "Salon/Spa" },
            { value: "gym", label: "Gym/Fitness" },
            { value: "online", label: "Online Retailer" },
            { value: "other", label: "Other" }
          ]
        },
        { name: "message", label: "Tell us about your business", type: "textarea" }
      ],
      onSuccess,
      onError,
      ...props
    }
  );
}
function ContactForm({
  endpoint,
  title = "Contact Us",
  description = "We'd love to hear from you.",
  onSuccess,
  onError,
  ...props
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
    ApplicationForm,
    {
      title,
      description,
      endpoint,
      submitLabel: "Send Message",
      submittingLabel: "Sending...",
      successMessage: "Your message has been sent. We'll get back to you soon.",
      fields: [
        { name: "name", label: "Name", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "subject", label: "Subject", type: "text", required: true },
        { name: "message", label: "Message", type: "textarea", required: true }
      ],
      onSuccess,
      onError,
      ...props
    }
  );
}

// src/components/BookingWidget/index.tsx
var import_react9 = require("react");
var import_jsx_runtime7 = require("react/jsx-runtime");
function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}
function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}
function getDaysInMonth(year, month) {
  const days = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}
function BookingWidget({
  apiBaseUrl,
  eventTypeId: preselectedEventTypeId,
  userSlug,
  onBookingComplete,
  onError,
  headerContent,
  footerContent,
  className = "",
  styles = {}
}) {
  const [step, setStep] = (0, import_react9.useState)("eventType");
  const [eventTypes, setEventTypes] = (0, import_react9.useState)([]);
  const [selectedEventType, setSelectedEventType] = (0, import_react9.useState)(null);
  const [selectedDate, setSelectedDate] = (0, import_react9.useState)(null);
  const [availableSlots, setAvailableSlots] = (0, import_react9.useState)([]);
  const [selectedSlot, setSelectedSlot] = (0, import_react9.useState)(null);
  const [isLoading, setIsLoading] = (0, import_react9.useState)(false);
  const [error, setError] = (0, import_react9.useState)(null);
  const [formData, setFormData] = (0, import_react9.useState)({
    name: "",
    email: "",
    phone: "",
    notes: ""
  });
  const [currentMonth, setCurrentMonth] = (0, import_react9.useState)(() => {
    const now = /* @__PURE__ */ new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  (0, import_react9.useEffect)(() => {
    async function fetchEventTypes() {
      try {
        setIsLoading(true);
        const url = userSlug ? `${apiBaseUrl}/booking/${userSlug}/event-types` : `${apiBaseUrl}/booking/event-types`;
        const response = await fetch(url);
        const data = await response.json();
        setEventTypes(data.eventTypes || []);
        if (preselectedEventTypeId) {
          const preselected = data.eventTypes?.find((et) => et.id === preselectedEventTypeId);
          if (preselected) {
            setSelectedEventType(preselected);
            setStep("calendar");
          }
        }
      } catch (err) {
        setError("Failed to load event types");
        onError?.(err instanceof Error ? err : new Error("Failed to load event types"));
      } finally {
        setIsLoading(false);
      }
    }
    fetchEventTypes();
  }, [apiBaseUrl, userSlug, preselectedEventTypeId, onError]);
  (0, import_react9.useEffect)(() => {
    if (!selectedDate || !selectedEventType) return;
    const date = selectedDate;
    const eventType = selectedEventType;
    async function fetchAvailability() {
      try {
        setIsLoading(true);
        const dateStr = date.toISOString().split("T")[0];
        const url = `${apiBaseUrl}/booking/availability?eventTypeId=${eventType.id}&date=${dateStr}`;
        const response = await fetch(url);
        const data = await response.json();
        setAvailableSlots(data.slots || []);
        setStep("time");
      } catch (err) {
        setError("Failed to load available times");
        onError?.(err instanceof Error ? err : new Error("Failed to load availability"));
      } finally {
        setIsLoading(false);
      }
    }
    fetchAvailability();
  }, [selectedDate, selectedEventType, apiBaseUrl, onError]);
  const handleSelectEventType = (eventType) => {
    setSelectedEventType(eventType);
    setStep("calendar");
  };
  const handleSelectDate = (date) => {
    setSelectedDate(date);
  };
  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
    setStep("form");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEventType || !selectedSlot) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${apiBaseUrl}/booking/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventTypeId: selectedEventType.id,
          slotId: selectedSlot.id,
          startTime: selectedSlot.startTime,
          ...formData
        })
      });
      const data = await response.json();
      if (response.ok && data.success !== false) {
        setStep("confirmation");
        onBookingComplete?.(data);
      } else {
        throw new Error(data.error || "Failed to create booking");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking");
      onError?.(err instanceof Error ? err : new Error("Failed to create booking"));
    } finally {
      setIsLoading(false);
    }
  };
  const goBack = () => {
    switch (step) {
      case "calendar":
        setStep("eventType");
        setSelectedEventType(null);
        break;
      case "time":
        setStep("calendar");
        setSelectedDate(null);
        break;
      case "form":
        setStep("time");
        setSelectedSlot(null);
        break;
    }
  };
  const renderEventTypeSelection = () => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "space-y-4", children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h2", { className: "text-xl font-semibold", children: "Select a Service" }),
    eventTypes.map((et) => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
      "button",
      {
        onClick: () => handleSelectEventType(et),
        className: "w-full text-left p-4 border border-gray-200 rounded-lg hover:border-black transition-colors",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "font-medium", children: et.title }),
          et.description && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "text-sm text-gray-500 mt-1", children: et.description }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "text-sm text-gray-600 mt-2", children: [
            et.duration,
            " minutes",
            et.price && ` \u2022 $${et.price}`
          ] })
        ]
      },
      et.id
    ))
  ] });
  const renderCalendar = () => {
    const days = getDaysInMonth(currentMonth.year, currentMonth.month);
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: styles.calendar, children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          "button",
          {
            onClick: goBack,
            className: "text-sm text-gray-500 hover:text-black",
            children: "\u2190 Back"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h2", { className: "text-xl font-semibold", children: "Select a Date" }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", {})
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          "button",
          {
            onClick: () => {
              const newMonth = currentMonth.month === 0 ? 11 : currentMonth.month - 1;
              const newYear = currentMonth.month === 0 ? currentMonth.year - 1 : currentMonth.year;
              setCurrentMonth({ year: newYear, month: newMonth });
            },
            className: "p-2 hover:bg-gray-100 rounded",
            children: "\u2190"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "font-medium", children: new Date(currentMonth.year, currentMonth.month).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric"
        }) }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          "button",
          {
            onClick: () => {
              const newMonth = currentMonth.month === 11 ? 0 : currentMonth.month + 1;
              const newYear = currentMonth.month === 11 ? currentMonth.year + 1 : currentMonth.year;
              setCurrentMonth({ year: newYear, month: newMonth });
            },
            className: "p-2 hover:bg-gray-100 rounded",
            children: "\u2192"
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "grid grid-cols-7 gap-1", children: [
        ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "text-center text-sm text-gray-500 py-2", children: day }, day)),
        Array.from({ length: days[0].getDay() }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", {}, `empty-${i}`)),
        days.map((day) => {
          const isPast = day < today;
          const isSelected = selectedDate?.toDateString() === day.toDateString();
          return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            "button",
            {
              onClick: () => !isPast && handleSelectDate(day),
              disabled: isPast,
              className: `
                  p-2 text-center rounded-lg transition-colors
                  ${isPast ? "text-gray-300 cursor-not-allowed" : "hover:bg-gray-100"}
                  ${isSelected ? "bg-black text-white hover:bg-black" : ""}
                `,
              children: day.getDate()
            },
            day.toISOString()
          );
        })
      ] })
    ] });
  };
  const renderTimeSlots = () => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
        "button",
        {
          onClick: goBack,
          className: "text-sm text-gray-500 hover:text-black",
          children: "\u2190 Back"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h2", { className: "text-xl font-semibold", children: "Select a Time" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", {})
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "text-gray-600 mb-4", children: selectedDate && formatDate(selectedDate) }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "grid grid-cols-2 gap-2", children: availableSlots.filter((slot) => slot.available).map((slot) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
      "button",
      {
        onClick: () => handleSelectSlot(slot),
        className: `
                p-3 border rounded-lg text-center transition-colors
                ${selectedSlot?.id === slot.id ? "bg-black text-white border-black" : "border-gray-200 hover:border-black"}
              `,
        children: formatTime(slot.startTime)
      },
      slot.id
    )) }),
    availableSlots.filter((s) => s.available).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "text-gray-500 text-center py-8", children: "No available times for this date. Please select another date." })
  ] });
  const renderForm = () => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
        "button",
        {
          onClick: goBack,
          className: "text-sm text-gray-500 hover:text-black",
          children: "\u2190 Back"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h2", { className: "text-xl font-semibold", children: "Your Details" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", {})
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "bg-gray-50 p-4 rounded-lg mb-6", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "font-medium", children: selectedEventType?.title }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "text-sm text-gray-600", children: [
        selectedDate && formatDate(selectedDate),
        " at ",
        selectedSlot && formatTime(selectedSlot.startTime)
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Name *" }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          "input",
          {
            type: "text",
            required: true,
            value: formData.name,
            onChange: (e) => setFormData((prev) => ({ ...prev, name: e.target.value })),
            className: "w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Email *" }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          "input",
          {
            type: "email",
            required: true,
            value: formData.email,
            onChange: (e) => setFormData((prev) => ({ ...prev, email: e.target.value })),
            className: "w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Phone" }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          "input",
          {
            type: "tel",
            value: formData.phone,
            onChange: (e) => setFormData((prev) => ({ ...prev, phone: e.target.value })),
            className: "w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Notes" }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          "textarea",
          {
            value: formData.notes,
            onChange: (e) => setFormData((prev) => ({ ...prev, notes: e.target.value })),
            rows: 3,
            className: "w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
        "button",
        {
          type: "submit",
          disabled: isLoading,
          className: styles.button || "w-full bg-black text-white py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity",
          children: isLoading ? "Booking..." : "Confirm Booking"
        }
      )
    ] })
  ] });
  const renderConfirmation = () => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "text-center py-8", children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "text-4xl mb-4", children: "\u2713" }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h2", { className: "text-2xl font-semibold mb-2", children: "Booking Confirmed!" }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "text-gray-600 mb-4", children: "You'll receive a confirmation email shortly." }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "bg-gray-50 p-4 rounded-lg text-left", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "font-medium", children: selectedEventType?.title }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "text-sm text-gray-600", children: [
        selectedDate && formatDate(selectedDate),
        " at ",
        selectedSlot && formatTime(selectedSlot.startTime)
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "text-sm text-gray-600 mt-2", children: [
        formData.name,
        " \u2022 ",
        formData.email
      ] })
    ] })
  ] });
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: styles.container || `bg-white border border-gray-200 rounded-lg p-6 ${className}`, children: [
    headerContent,
    error && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm", children: error }),
    isLoading && step === "eventType" ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "text-center py-8 text-gray-500", children: "Loading..." }) : /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_jsx_runtime7.Fragment, { children: [
      step === "eventType" && renderEventTypeSelection(),
      step === "calendar" && renderCalendar(),
      step === "time" && renderTimeSlots(),
      step === "form" && renderForm(),
      step === "confirmation" && renderConfirmation()
    ] }),
    footerContent
  ] });
}

// src/tracking/pixel.ts
var pixelConfig = null;
function initializePixel(config) {
  pixelConfig = config;
  if (typeof window !== "undefined") {
    const script = document.createElement("script");
    script.src = `${config.platformUrl}/pixel.js`;
    script.async = true;
    script.dataset.brandId = config.brandId;
    document.head.appendChild(script);
  }
}
function trackPixelPageView(path) {
  if (typeof window === "undefined" || !pixelConfig) return;
  sendPixelEvent({
    event: "page_view",
    metadata: {
      path: path || window.location.pathname,
      referrer: document.referrer,
      url: window.location.href
    }
  });
}
function trackPixelProductView(productId, productName, price) {
  sendPixelEvent({
    event: "view_item",
    value: price,
    items: [
      {
        id: productId,
        name: productName,
        price: price || 0,
        quantity: 1
      }
    ]
  });
}
function trackPixelAddToCart(productId, productName, price, quantity) {
  sendPixelEvent({
    event: "add_to_cart",
    value: price * quantity,
    items: [
      {
        id: productId,
        name: productName,
        price,
        quantity
      }
    ]
  });
}
function trackPixelCheckoutStart(cartValue, items) {
  sendPixelEvent({
    event: "begin_checkout",
    value: cartValue,
    items
  });
}
function trackPixelPurchase(orderId, value, currency, items) {
  sendPixelEvent({
    event: "purchase",
    orderId,
    value,
    currency,
    items
  });
}
function trackPixelCustomEvent(eventName, data) {
  sendPixelEvent({
    event: eventName,
    metadata: data
  });
}
function sendPixelEvent(data) {
  if (typeof window === "undefined" || !pixelConfig) return;
  const payload = JSON.stringify({
    ...data,
    brandId: pixelConfig.brandId,
    timestamp: Date.now(),
    sessionId: getSessionId(),
    url: window.location.href,
    userAgent: navigator.userAgent
  });
  const endpoint = `${pixelConfig.platformUrl}/api/pixel/track`;
  if (navigator.sendBeacon) {
    navigator.sendBeacon(endpoint, payload);
  } else {
    fetch(endpoint, {
      method: "POST",
      body: payload,
      headers: { "Content-Type": "application/json" },
      keepalive: true
    }).catch(() => {
    });
  }
}
function getSessionId() {
  if (typeof window === "undefined") return "";
  const key = "adsurf_session_id";
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(key, sessionId);
  }
  return sessionId;
}

// src/utils/images.ts
function getShopifyImageUrl(url, options = {}) {
  if (!url) return "";
  if (!url.includes("cdn.shopify.com")) {
    return url;
  }
  const { width, height, crop, scale } = options;
  let sizeSuffix = "";
  if (width && height) {
    sizeSuffix = `_${width}x${height}`;
    if (crop) {
      sizeSuffix += `_crop_${crop}`;
    }
  } else if (width) {
    sizeSuffix = `_${width}x`;
  } else if (height) {
    sizeSuffix = `_x${height}`;
  }
  if (scale && scale > 1) {
    sizeSuffix += `@${scale}x`;
  }
  const lastDotIndex = url.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return url + sizeSuffix;
  }
  return url.slice(0, lastDotIndex) + sizeSuffix + url.slice(lastDotIndex);
}
function getShopifySrcSet(url, widths = [320, 640, 960, 1280, 1920]) {
  if (!url || !url.includes("cdn.shopify.com")) {
    return "";
  }
  return widths.map((w) => `${getShopifyImageUrl(url, { width: w })} ${w}w`).join(", ");
}
function getOptimizedImageProps(url, alt, options = {}) {
  return {
    src: getShopifyImageUrl(url, options),
    alt,
    width: options.width,
    height: options.height,
    srcSet: getShopifySrcSet(url)
  };
}
function preloadImage(url, options) {
  if (typeof window === "undefined") return;
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = options ? getShopifyImageUrl(url, options) : url;
  document.head.appendChild(link);
}
function getPlaceholderDataUrl(width = 10, height = 10) {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Crect fill='%23f3f4f6' width='${width}' height='${height}'/%3E%3C/svg%3E`;
}
async function isValidImageUrl(url) {
  if (!url) return false;
  try {
    const response = await fetch(url, { method: "HEAD" });
    const contentType = response.headers.get("content-type");
    return response.ok && !!contentType?.startsWith("image/");
  } catch {
    return false;
  }
}

// src/utils/seo.ts
function generateMetaTags(input) {
  const {
    title,
    description,
    image,
    url,
    type = "website",
    siteName,
    twitterHandle
  } = input;
  const metadata = {
    title,
    description,
    openGraph: {
      title,
      description,
      type,
      ...url && { url },
      ...image && { images: [{ url: image }] },
      ...siteName && { siteName }
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...image && { images: [image] },
      ...twitterHandle && { creator: twitterHandle }
    }
  };
  return metadata;
}
function generateProductSchema(product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    ...product.sku && { sku: product.sku },
    ...product.brand && {
      brand: {
        "@type": "Brand",
        name: product.brand
      }
    },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.priceCurrency,
      availability: `https://schema.org/${product.availability}`,
      ...product.url && { url: product.url }
    },
    ...product.reviewCount && product.ratingValue && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.ratingValue,
        reviewCount: product.reviewCount
      }
    }
  };
}
function generateBreadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}
function generateOrganizationSchema(org) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: org.name,
    url: org.url,
    ...org.logo && { logo: org.logo },
    ...org.sameAs && { sameAs: org.sameAs }
  };
}
function getCanonicalUrl(baseUrl, path) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl.replace(/\/$/, "")}${cleanPath}`;
}
function truncateForMeta(text, maxLength = 160) {
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > maxLength / 2 ? truncated.slice(0, lastSpace) : truncated) + "...";
}
function generateRobotsMeta(options) {
  const directives = [];
  if (options.index === false) directives.push("noindex");
  else directives.push("index");
  if (options.follow === false) directives.push("nofollow");
  else directives.push("follow");
  if (options.noarchive) directives.push("noarchive");
  if (options.nosnippet) directives.push("nosnippet");
  return directives.join(", ");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AddToCartButton,
  ApplicationForm,
  BookingWidget,
  CartDrawer,
  ContactForm,
  CreatorApplicationForm,
  CustomerPortal,
  GraphQLClient,
  GraphQLQueryError,
  PlatformClient,
  ProductCard,
  ShopifyClient,
  SubscribeWidget,
  VendorApplicationForm,
  calculateDiscount,
  createGid,
  createGraphQLClient,
  createPlatformClient,
  createShopifyClient,
  extractNumericId,
  formatDiscount,
  formatMoney,
  generateBreadcrumbSchema,
  generateMetaTags,
  generateOrganizationSchema,
  generateProductSchema,
  generateRobotsMeta,
  getCanonicalUrl,
  getOptimizedImageProps,
  getPlaceholderDataUrl,
  getShopifyImageUrl,
  getShopifySrcSet,
  gql,
  initializeAnalytics,
  initializePixel,
  isValidImageUrl,
  parseGid,
  preloadImage,
  trackAddToCart,
  trackBeginCheckout,
  trackEvent,
  trackPageView,
  trackPixelAddToCart,
  trackPixelCheckoutStart,
  trackPixelCustomEvent,
  trackPixelPageView,
  trackPixelProductView,
  trackPixelPurchase,
  trackPurchase,
  trackRemoveFromCart,
  trackViewItem,
  truncateForMeta,
  useCart,
  useCartStore,
  useCollection,
  useCollections,
  useCustomer,
  useProduct,
  useProducts,
  useSubscription
});
//# sourceMappingURL=index.js.map