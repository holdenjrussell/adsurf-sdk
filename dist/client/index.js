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

// src/client/index.ts
var client_exports = {};
__export(client_exports, {
  GraphQLClient: () => GraphQLClient,
  GraphQLQueryError: () => GraphQLQueryError,
  PlatformClient: () => PlatformClient,
  ShopifyClient: () => ShopifyClient,
  createGid: () => createGid,
  createGraphQLClient: () => createGraphQLClient,
  createPlatformClient: () => createPlatformClient,
  createShopifyClient: () => createShopifyClient,
  extractNumericId: () => extractNumericId,
  gql: () => gql,
  parseGid: () => parseGid
});
module.exports = __toCommonJS(client_exports);

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GraphQLClient,
  GraphQLQueryError,
  PlatformClient,
  ShopifyClient,
  createGid,
  createGraphQLClient,
  createPlatformClient,
  createShopifyClient,
  extractNumericId,
  gql,
  parseGid
});
//# sourceMappingURL=index.js.map