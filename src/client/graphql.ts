/**
 * GraphQL utilities for custom queries
 */

export interface GraphQLClientConfig {
  endpoint: string
  headers?: Record<string, string>
}

export interface GraphQLErrorDetail {
  message: string
  locations?: Array<{ line: number; column: number }>
  path?: string[]
}

export interface GraphQLResponse<T> {
  data?: T
  errors?: GraphQLErrorDetail[]
}

export class GraphQLClient {
  private endpoint: string
  private headers: Record<string, string>

  constructor(config: GraphQLClientConfig) {
    this.endpoint = config.endpoint
    this.headers = {
      'Content-Type': 'application/json',
      ...config.headers,
    }
  }

  async query<T = unknown>(
    query: string,
    variables?: Record<string, unknown>
  ): Promise<T> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ query, variables }),
    })

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status}`)
    }

    const json: GraphQLResponse<T> = await response.json()

    if (json.errors && json.errors.length > 0) {
      throw new GraphQLQueryError(json.errors)
    }

    return json.data as T
  }

  async mutate<T = unknown>(
    mutation: string,
    variables?: Record<string, unknown>
  ): Promise<T> {
    return this.query<T>(mutation, variables)
  }

  /**
   * Execute a batch of queries in parallel
   */
  async batchQuery<T extends Record<string, unknown>>(
    queries: Array<{ query: string; variables?: Record<string, unknown> }>
  ): Promise<T[]> {
    const promises = queries.map((q) => this.query<T>(q.query, q.variables))
    return Promise.all(promises)
  }

  /**
   * Update the headers for subsequent requests
   */
  setHeaders(headers: Record<string, string>): void {
    this.headers = {
      ...this.headers,
      ...headers,
    }
  }

  /**
   * Set a single header value
   */
  setHeader(key: string, value: string): void {
    this.headers[key] = value
  }

  /**
   * Remove a header
   */
  removeHeader(key: string): void {
    delete this.headers[key]
  }
}

export class GraphQLQueryError extends Error {
  errors: GraphQLErrorDetail[]

  constructor(errors: GraphQLErrorDetail[]) {
    super(errors[0]?.message || 'GraphQL error')
    this.errors = errors
    this.name = 'GraphQLQueryError'
  }

  /**
   * Get all error messages as a single string
   */
  getMessages(): string {
    return this.errors.map((e) => e.message).join('; ')
  }

  /**
   * Check if a specific field path had an error
   */
  hasErrorAtPath(path: string[]): boolean {
    return this.errors.some(
      (e) =>
        e.path &&
        e.path.length === path.length &&
        e.path.every((p, i) => p === path[i])
    )
  }
}

/**
 * Template literal tag for GraphQL queries
 * Provides syntax highlighting in supported editors
 */
export function gql(
  strings: TemplateStringsArray,
  ...values: unknown[]
): string {
  return strings.reduce(
    (acc, str, i) => acc + str + (values[i] !== undefined ? String(values[i]) : ''),
    ''
  )
}

/**
 * Create a GraphQL client instance
 */
export function createGraphQLClient(config: GraphQLClientConfig): GraphQLClient {
  return new GraphQLClient(config)
}

/**
 * Parse a GraphQL ID to extract the numeric ID
 * Shopify IDs are in the format: gid://shopify/Product/123456789
 */
export function parseGid(gid: string): { type: string; id: string } | null {
  const match = gid.match(/gid:\/\/shopify\/(\w+)\/(\d+)/)
  if (!match) return null
  return { type: match[1], id: match[2] }
}

/**
 * Create a Shopify GID from type and numeric ID
 */
export function createGid(type: string, id: string | number): string {
  return `gid://shopify/${type}/${id}`
}

/**
 * Extract numeric ID from a Shopify GID
 */
export function extractNumericId(gid: string): string | null {
  const parsed = parseGid(gid)
  return parsed?.id || null
}
