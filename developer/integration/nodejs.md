---
title: Node.js Integration
---

# Node.js Integration

This guide covers integrating OwnPay into a Node.js 18+ application using the built-in `fetch` API. TypeScript type definitions are included.

## Prerequisites

- Node.js 18 or higher (for native `fetch`)
- An OwnPay API key from Admin → Developer Hub

No external HTTP library is required. If you're on Node.js 16 or earlier, substitute `fetch` with `node-fetch` or `axios`.

## TypeScript Types

Define the core types once and reuse them throughout your integration:

```typescript
// ownpay.types.ts

export interface OwnPayResponse<T = unknown> {
  success: boolean
  data: T
  message: string
}

export interface PaymentIntent {
  id: string
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled' | 'refunded'
  amount: number
  currency: string
  description: string | null
  checkout_url: string
  redirect_url: string
  metadata: Record<string, string>
  created_at: string
  updated_at: string
  paid_at: string | null
}

export interface PaymentLink {
  id: string
  url: string
  amount: number
  currency: string
  description: string | null
  expires_at: string | null
  status: 'active' | 'expired' | 'disabled'
}

export interface CreatePaymentIntentInput {
  amount: number
  currency: string
  description?: string
  customer?: {
    name?: string
    email?: string
    phone?: string
  }
  metadata?: Record<string, string>
  redirect_url: string
  cancel_url?: string
}

export interface CreatePaymentLinkInput {
  amount: number
  currency: string
  description?: string
  expires_at?: string
  redirect_url: string
}
```

## API Client

```typescript
// ownpay.client.ts
import type { OwnPayResponse, PaymentIntent, CreatePaymentIntentInput, PaymentLink, CreatePaymentLinkInput } from './ownpay.types.js'

export class OwnPayClient {
  private readonly baseUrl: string
  private readonly apiKey: string

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '') + '/api/v1'
    this.apiKey = apiKey
  }

  async createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntent> {
    const res = await this.post<PaymentIntent>('payment-intents', input)
    return res.data
  }

  async getPaymentIntent(id: string): Promise<PaymentIntent> {
    const res = await this.get<PaymentIntent>(`payment-intents/${id}`)
    return res.data
  }

  async createPaymentLink(input: CreatePaymentLinkInput): Promise<PaymentLink> {
    const res = await this.post<PaymentLink>('payment-links', input)
    return res.data
  }

  private async post<T>(endpoint: string, body: unknown): Promise<OwnPayResponse<T>> {
    return this.request<T>('POST', endpoint, body)
  }

  private async get<T>(endpoint: string): Promise<OwnPayResponse<T>> {
    return this.request<T>('GET', endpoint)
  }

  private async request<T>(method: string, endpoint: string, body?: unknown): Promise<OwnPayResponse<T>> {
    const url = `${this.baseUrl}/${endpoint.replace(/^\//, '')}`

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15_000),
    })

    const json = (await response.json()) as OwnPayResponse<T>

    if (!json.success) {
      throw new Error(`OwnPay API error: ${json.message}`)
    }

    return json
  }
}
```

## Creating a Payment Intent

```typescript
import { OwnPayClient } from './ownpay.client.js'

const client = new OwnPayClient(
  process.env.OWNPAY_BASE_URL!,
  process.env.OWNPAY_API_KEY!,
)

// Express.js example
app.post('/checkout', async (req, res) => {
  const { amount, currency, orderId } = req.body

  const intent = await client.createPaymentIntent({
    amount,
    currency,
    description: `Order #${orderId}`,
    customer: {
      name: req.user.name,
      email: req.user.email,
    },
    metadata: { order_id: String(orderId) },
    redirect_url: `${process.env.APP_URL}/payment/callback`,
    cancel_url:   `${process.env.APP_URL}/payment/cancel`,
  })

  // Store intent.id in your database before redirecting
  await db.orders.update(orderId, { payment_intent_id: intent.id })

  res.redirect(intent.checkout_url)
})
```

## Handling the Callback

After payment, OwnPay redirects to `redirect_url?intent_id=<id>&status=paid`. Verify by fetching the intent server-side — never trust query parameters alone:

```typescript
app.get('/payment/callback', async (req, res) => {
  const intentId = req.query.intent_id as string

  if (!intentId) {
    return res.status(400).send('Missing intent_id')
  }

  const intent = await client.getPaymentIntent(intentId)

  if (intent.status === 'paid') {
    const orderId = intent.metadata.order_id
    await fulfillOrder(orderId)
    return res.redirect(`/orders/${orderId}/success`)
  }

  res.redirect('/payment/failed')
})
```

## Error Handling

```typescript
import { OwnPayClient } from './ownpay.client.js'

async function safeCreateIntent(client: OwnPayClient, input: CreatePaymentIntentInput) {
  try {
    return await client.createPaymentIntent(input)
  } catch (error) {
    if (error instanceof Error) {
      // Network timeout
      if (error.name === 'TimeoutError') {
        throw new Error('Payment service timed out. Please try again.')
      }
      // API-level error (invalid params, auth failure, etc.)
      throw new Error(`Payment initialization failed: ${error.message}`)
    }
    throw error
  }
}
```

## CommonJS (require) Example

If you're not using ESM, substitute `import`/`export` with `require`:

```javascript
// No TypeScript — plain Node.js with require
const { OwnPayClient } = require('./ownpay.client.cjs')

const client = new OwnPayClient(
  process.env.OWNPAY_BASE_URL,
  process.env.OWNPAY_API_KEY,
)
```

## Environment Variables

```bash
# .env — never commit
OWNPAY_BASE_URL=https://pay.your-domain.com
OWNPAY_API_KEY=op_live_xxxxxxxxxxxxxxxxxxxxxxxx
APP_URL=https://your-store.com
```

Load with [dotenv](https://www.npmjs.com/package/dotenv) or your framework's built-in env loader.

## Next Steps

- [Webhook verification →](/developer/webhooks) — Receive server-push payment events
- [API Reference →](https://docs.ownpay.org) — Full OpenAPI spec
