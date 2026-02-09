// Client
export {
  PlatformClient,
  createPlatformClient,
  type PlatformClientConfig,
  type Product,
  type Collection,
  type BrandConfig,
} from './client'

// Hooks
export {
  useCart,
  useCartStore,
  useProduct,
  useProducts,
  type CartItem,
  type CartState,
} from './hooks'

// Components
export { AddToCartButton, CartDrawer } from './components'
export type { AddToCartButtonProps, CartDrawerProps } from './components'

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
  type AnalyticsConfig,
  type EcommerceItem,
} from './tracking'

// Utils
export { formatMoney, calculateDiscount, formatDiscount } from './utils'
export type { FormatMoneyOptions } from './utils'
