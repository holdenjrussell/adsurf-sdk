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

### CustomerPortal

Drop-in customer account portal with orders, subscriptions, and profile management.

```tsx
import { CustomerPortal } from '@adsurf/storefront-sdk'

export default function AccountPage() {
  return (
    <CustomerPortal
      onLoginRedirect={() => {
        window.location.href = '/account/login'
      }}
    />
  )
}
```

## Application Forms

Pre-built forms for creator/vendor onboarding and contact pages that submit to your platform API.

### CreatorApplicationForm

```tsx
import { CreatorApplicationForm } from '@adsurf/storefront-sdk'

export default function CreatorApplyPage() {
  return (
    <CreatorApplicationForm
      endpoint="/api/storefront/creators/apply"
      title="Join Our Creator Program"
      description="Partner with us and earn commission on sales."
      onSuccess={(data) => {
        // Handle success - redirect, show message, etc.
        console.log('Application submitted:', data)
      }}
    />
  )
}
```

### VendorApplicationForm

```tsx
import { VendorApplicationForm } from '@adsurf/storefront-sdk'

export default function VendorApplyPage() {
  return (
    <VendorApplicationForm
      endpoint="/api/storefront/vendors/apply"
      title="Wholesale Partnership"
      description="Apply to become a wholesale partner."
      onSuccess={() => router.push('/vendor-apply/thank-you')}
    />
  )
}
```

### ContactForm

```tsx
import { ContactForm } from '@adsurf/storefront-sdk'

export default function ContactPage() {
  return (
    <ContactForm
      endpoint="/api/storefront/contact"
      title="Get In Touch"
      description="We'd love to hear from you."
    />
  )
}
```

### Custom ApplicationForm

Build custom forms with any fields:

```tsx
import { ApplicationForm } from '@adsurf/storefront-sdk'

export default function CustomFormPage() {
  return (
    <ApplicationForm
      title="Custom Application"
      description="Tell us about yourself."
      endpoint="/api/storefront/custom-form"
      fields={[
        { name: 'name', label: 'Full Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'phone', label: 'Phone', type: 'tel' },
        {
          name: 'interest',
          label: 'Interest',
          type: 'select',
          required: true,
          options: [
            { value: 'retail', label: 'Retail' },
            { value: 'wholesale', label: 'Wholesale' },
            { value: 'other', label: 'Other' },
          ],
        },
        { name: 'message', label: 'Message', type: 'textarea' },
      ]}
      submitLabel="Apply Now"
      successMessage="Thanks! We'll be in touch soon."
      onSuccess={(data) => console.log('Submitted:', data)}
      onError={(err) => console.error('Error:', err)}
    />
  )
}
```

**Field Types:**
- `text` - Standard text input
- `email` - Email input with validation
- `tel` - Phone number input
- `url` - URL input with validation
- `number` - Numeric input
- `textarea` - Multi-line text
- `select` - Dropdown with options

**Styling:**
Pass custom class names via the `styles` prop:

```tsx
<ApplicationForm
  styles={{
    container: 'bg-white p-8 rounded-lg shadow',
    title: 'text-2xl font-bold',
    label: 'text-sm font-medium',
    input: 'border rounded px-4 py-2',
    button: 'bg-blue-600 text-white py-3 rounded',
    error: 'text-red-600 text-sm',
    success: 'text-green-600 text-sm',
  }}
  // ...
/>
```

## BookingWidget

Embeddable booking/scheduling widget for appointment scheduling.

```tsx
import { BookingWidget } from '@adsurf/storefront-sdk'

export default function BookPage() {
  return (
    <BookingWidget
      apiBaseUrl="https://your-platform.com/api"
      userSlug="team-member" // Optional: specific team member
      eventTypeId="evt_123" // Optional: pre-select event type
      onBookingComplete={(booking) => {
        console.log('Booked:', booking)
      }}
      onError={(err) => {
        console.error('Booking error:', err)
      }}
    />
  )
}
```

The widget handles:
- Event type selection
- Calendar date picking
- Time slot selection
- Guest information form
- Booking confirmation

Your platform API needs these endpoints:
- `GET /booking/{userSlug}/event-types` - List available event types
- `GET /booking/availability?eventTypeId=X&date=YYYY-MM-DD` - Get available slots
- `POST /booking/create` - Create a booking

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
