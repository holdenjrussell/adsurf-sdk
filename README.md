# @adsurf/storefront-sdk

SDK for building storefronts on the Adsurf platform.

## Installation

```bash
npm install @adsurf/storefront-sdk
```

## Quick Start

```typescript
import {
  createPlatformClient,
  useCart,
  AddToCartButton,
  CartDrawer,
  initializeAnalytics,
} from '@adsurf/storefront-sdk'

// Initialize the platform client
const client = createPlatformClient({
  apiKey: process.env.NEXT_PUBLIC_PLATFORM_API_KEY!,
})

// Fetch products
const { products } = await client.getProducts()

// Initialize analytics (in your app layout)
initializeAnalytics({
  ga4Id: 'G-XXXXXX',
  metaPixelId: 'XXXXXXXX',
})
```

## API Client

```typescript
import { createPlatformClient } from '@adsurf/storefront-sdk'

const client = createPlatformClient({
  apiKey: 'sk_live_xxx',
  baseUrl: 'https://adsurf.ai', // Optional, defaults to adsurf.ai
})

// Get all products
const { products } = await client.getProducts(50)

// Get a single product
const { product } = await client.getProduct('product-handle')

// Get all collections
const { collections } = await client.getCollections()

// Get a collection with its products
const { collection } = await client.getCollection('collection-handle')

// Get brand configuration
const config = await client.getConfig()
```

## Cart Hook

```typescript
import { useCart } from '@adsurf/storefront-sdk'

function CartButton() {
  const { itemCount, openCart } = useCart()

  return (
    <button onClick={openCart}>
      Cart ({itemCount})
    </button>
  )
}

function ProductActions({ product, variant }) {
  const { addItem } = useCart()

  const handleAdd = () => {
    addItem({
      variantId: variant.id,
      productId: product.id,
      title: product.title,
      variantTitle: variant.title,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      handle: product.handle,
      image: product.images[0],
    })
  }

  return <button onClick={handleAdd}>Add to Cart</button>
}
```

## Components

### AddToCartButton

```tsx
import { AddToCartButton } from '@adsurf/storefront-sdk'

<AddToCartButton
  product={product}
  variant={selectedVariant}
  quantity={1}
  className="bg-black text-white px-6 py-3 rounded-lg"
/>
```

### CartDrawer

```tsx
import { CartDrawer } from '@adsurf/storefront-sdk'

function Layout({ children }) {
  const handleCheckout = () => {
    // Redirect to checkout
    window.location.href = '/checkout'
  }

  return (
    <>
      {children}
      <CartDrawer onCheckout={handleCheckout} />
    </>
  )
}
```

## Analytics

```typescript
import {
  initializeAnalytics,
  trackPageView,
  trackViewItem,
  trackAddToCart,
  trackPurchase,
} from '@adsurf/storefront-sdk'

// Initialize once in your app
initializeAnalytics({
  ga4Id: 'G-XXXXXX',
  metaPixelId: 'XXXXXXXX',
  clarityId: 'XXXXXXXX',
})

// Track page views
trackPageView('/products/my-product', 'My Product')

// Track product views
trackViewItem({
  item_id: 'variant-123',
  item_name: 'Product Name',
  price: 49.99,
  quantity: 1,
})

// Track purchases
trackPurchase('order-123', items, 149.99)
```

## Utilities

```typescript
import { formatMoney, calculateDiscount } from '@adsurf/storefront-sdk'

formatMoney(49.99) // "$49.99"
formatMoney(49.99, { currency: 'EUR', locale: 'de-DE' }) // "49,99 €"

calculateDiscount(100, 75) // 25
```

## TypeScript

The SDK is fully typed. Import types as needed:

```typescript
import type {
  Product,
  Collection,
  BrandConfig,
  CartItem,
} from '@adsurf/storefront-sdk'
```

## License

MIT
