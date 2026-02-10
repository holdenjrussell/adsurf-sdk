/**
 * Shopify Storefront API client for direct Shopify queries
 * Use this when you need to bypass the platform API
 */

export interface ShopifyClientConfig {
  storeDomain: string
  storefrontAccessToken: string
  apiVersion?: string
}

export interface ShopifyProduct {
  id: string
  title: string
  handle: string
  description: string
  descriptionHtml: string
  vendor: string
  productType: string
  tags: string[]
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string }
    maxVariantPrice: { amount: string; currencyCode: string }
  }
  images: Array<{ url: string; altText: string | null }>
  variants: Array<{
    id: string
    title: string
    availableForSale: boolean
    price: { amount: string; currencyCode: string }
    compareAtPrice: { amount: string; currencyCode: string } | null
    selectedOptions: Array<{ name: string; value: string }>
    image: { url: string; altText: string | null } | null
  }>
  options: Array<{ name: string; values: string[] }>
}

export interface ShopifyCollection {
  id: string
  title: string
  handle: string
  description: string
  image: { url: string; altText: string | null } | null
  products: ShopifyProduct[]
}

export interface ShopifyCart {
  id: string
  checkoutUrl: string
  lines: Array<{
    id: string
    quantity: number
    merchandise: {
      id: string
      title: string
      product: { title: string; handle: string }
      price: { amount: string; currencyCode: string }
      image: { url: string; altText: string | null } | null
    }
  }>
  cost: {
    totalAmount: { amount: string; currencyCode: string }
    subtotalAmount: { amount: string; currencyCode: string }
  }
}

interface GraphQLResponse<T> {
  data?: T
  errors?: Array<{ message: string }>
}

export class ShopifyClient {
  private storeDomain: string
  private storefrontAccessToken: string
  private apiVersion: string

  constructor(config: ShopifyClientConfig) {
    this.storeDomain = config.storeDomain
    this.storefrontAccessToken = config.storefrontAccessToken
    this.apiVersion = config.apiVersion || '2024-01'
  }

  private async query<T>(
    query: string,
    variables?: Record<string, unknown>
  ): Promise<T> {
    const response = await fetch(
      `https://${this.storeDomain}/api/${this.apiVersion}/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': this.storefrontAccessToken,
        },
        body: JSON.stringify({ query, variables }),
      }
    )

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`)
    }

    const json: GraphQLResponse<T> = await response.json()
    if (json.errors) {
      throw new Error(json.errors[0]?.message || 'GraphQL error')
    }

    return json.data as T
  }

  async getProducts(first = 50): Promise<ShopifyProduct[]> {
    const data = await this.query<{
      products: { edges: Array<{ node: ShopifyProduct }> }
    }>(
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
    )

    return data.products.edges.map(({ node }) => ({
      ...node,
      images: (node.images as unknown as { edges: Array<{ node: ShopifyProduct['images'][0] }> }).edges.map(
        (e) => e.node
      ),
      variants: (node.variants as unknown as { edges: Array<{ node: ShopifyProduct['variants'][0] }> }).edges.map(
        (e) => e.node
      ),
    }))
  }

  async getProduct(handle: string): Promise<ShopifyProduct | null> {
    const data = await this.query<{ product: ShopifyProduct | null }>(
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
    )

    if (!data.product) return null

    const product = data.product
    return {
      ...product,
      images: (product.images as unknown as { edges: Array<{ node: ShopifyProduct['images'][0] }> }).edges.map(
        (e) => e.node
      ),
      variants: (product.variants as unknown as { edges: Array<{ node: ShopifyProduct['variants'][0] }> }).edges.map(
        (e) => e.node
      ),
    }
  }

  async getCollections(first = 20): Promise<ShopifyCollection[]> {
    const data = await this.query<{
      collections: { edges: Array<{ node: Omit<ShopifyCollection, 'products'> }> }
    }>(
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
    )

    return data.collections.edges.map(({ node }) => ({
      ...node,
      products: [],
    }))
  }

  async getCollection(
    handle: string,
    productCount = 50
  ): Promise<ShopifyCollection | null> {
    const data = await this.query<{ collection: ShopifyCollection | null }>(
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
    )

    if (!data.collection) return null

    const collection = data.collection
    const productsWithEdges = collection.products as unknown as {
      edges: Array<{ node: ShopifyProduct }>
    }

    return {
      ...collection,
      products: productsWithEdges.edges.map(({ node }) => ({
        ...node,
        descriptionHtml: '',
        vendor: '',
        productType: '',
        tags: [],
        options: [],
        images: (node.images as unknown as { edges: Array<{ node: ShopifyProduct['images'][0] }> }).edges.map(
          (e) => e.node
        ),
        variants: (node.variants as unknown as { edges: Array<{ node: ShopifyProduct['variants'][0] }> }).edges.map(
          (e) => ({
            ...e.node,
            compareAtPrice: null,
            selectedOptions: [],
            image: null,
          })
        ),
      })),
    }
  }

  async createCart(
    lines?: Array<{ merchandiseId: string; quantity: number }>
  ): Promise<ShopifyCart> {
    const data = await this.query<{ cartCreate: { cart: ShopifyCart } }>(
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
    )

    const cart = data.cartCreate.cart
    const linesWithEdges = cart.lines as unknown as {
      edges: Array<{ node: ShopifyCart['lines'][0] }>
    }
    return {
      ...cart,
      lines: linesWithEdges.edges.map((e) => e.node),
    }
  }

  async addToCart(
    cartId: string,
    lines: Array<{ merchandiseId: string; quantity: number }>
  ): Promise<ShopifyCart> {
    const data = await this.query<{ cartLinesAdd: { cart: ShopifyCart } }>(
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
    )

    const cart = data.cartLinesAdd.cart
    const linesWithEdges = cart.lines as unknown as {
      edges: Array<{ node: ShopifyCart['lines'][0] }>
    }
    return {
      ...cart,
      lines: linesWithEdges.edges.map((e) => e.node),
    }
  }

  async updateCartLines(
    cartId: string,
    lines: Array<{ id: string; quantity: number }>
  ): Promise<ShopifyCart> {
    const data = await this.query<{ cartLinesUpdate: { cart: ShopifyCart } }>(
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
    )

    const cart = data.cartLinesUpdate.cart
    const linesWithEdges = cart.lines as unknown as {
      edges: Array<{ node: ShopifyCart['lines'][0] }>
    }
    return {
      ...cart,
      lines: linesWithEdges.edges.map((e) => e.node),
    }
  }

  async removeCartLines(
    cartId: string,
    lineIds: string[]
  ): Promise<ShopifyCart> {
    const data = await this.query<{ cartLinesRemove: { cart: ShopifyCart } }>(
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
    )

    const cart = data.cartLinesRemove.cart
    const linesWithEdges = cart.lines as unknown as {
      edges: Array<{ node: ShopifyCart['lines'][0] }>
    }
    return {
      ...cart,
      lines: linesWithEdges.edges.map((e) => e.node),
    }
  }

  async getCart(cartId: string): Promise<ShopifyCart | null> {
    const data = await this.query<{ cart: ShopifyCart | null }>(
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
    )

    if (!data.cart) return null

    const cart = data.cart
    const linesWithEdges = cart.lines as unknown as {
      edges: Array<{ node: ShopifyCart['lines'][0] }>
    }
    return {
      ...cart,
      lines: linesWithEdges.edges.map((e) => e.node),
    }
  }
}

export function createShopifyClient(config: ShopifyClientConfig): ShopifyClient {
  return new ShopifyClient(config)
}
