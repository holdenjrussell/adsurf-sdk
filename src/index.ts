// Client
export {
  PlatformClient,
  createPlatformClient,
  type PlatformClientConfig,
  type Product,
  type Collection,
  type BrandConfig,
  // Shopify client
  ShopifyClient,
  createShopifyClient,
  type ShopifyClientConfig,
  type ShopifyProduct,
  type ShopifyCollection,
  type ShopifyCart,
  // GraphQL utilities
  GraphQLClient,
  GraphQLQueryError,
  createGraphQLClient,
  gql,
  parseGid,
  createGid,
  extractNumericId,
  type GraphQLClientConfig,
  type GraphQLErrorDetail,
  type GraphQLResponse,
} from './client'

// Hooks
export {
  useCart,
  useCartStore,
  useProduct,
  useProducts,
  useCollection,
  useCollections,
  useCustomer,
  useSubscription,
  type CartItem,
  type CartState,
  type CustomerOrder,
  type CustomerSubscription,
  type CustomerProfile,
  type SubscriptionProduct,
  type SubscriptionResult,
} from './hooks'

// Components
export {
  AddToCartButton,
  CartDrawer,
  ProductCard,
  CustomerPortal,
  SubscribeWidget,
} from './components'
export type {
  AddToCartButtonProps,
  CartDrawerProps,
  ProductCardProps,
  CustomerPortalProps,
  SubscribeWidgetProps,
  SellingPlan,
} from './components'

// Tracking
export {
  initializeAnalytics,
  trackPageView,
  trackViewItem,
  trackAddToCart,
  trackRemoveFromCart,
  trackBeginCheckout,
  trackPurchase,
  trackEvent,
  // Pixel tracking
  initializePixel,
  trackPixelPageView,
  trackPixelProductView,
  trackPixelAddToCart,
  trackPixelCheckoutStart,
  trackPixelPurchase,
  trackPixelCustomEvent,
  type AnalyticsConfig,
  type EcommerceItem,
} from './tracking'

// Utils
export {
  formatMoney,
  calculateDiscount,
  formatDiscount,
  // Image utilities
  getShopifyImageUrl,
  getShopifySrcSet,
  getOptimizedImageProps,
  preloadImage,
  getPlaceholderDataUrl,
  isValidImageUrl,
  // SEO utilities
  generateMetaTags,
  generateProductSchema,
  generateBreadcrumbSchema,
  generateOrganizationSchema,
  getCanonicalUrl,
  truncateForMeta,
  generateRobotsMeta,
} from './utils'
export type {
  FormatMoneyOptions,
  ImageTransformOptions,
  MetaTagsInput,
  ProductStructuredData,
  BreadcrumbItem,
} from './utils'
