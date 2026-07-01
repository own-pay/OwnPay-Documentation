---
title: Webhooks & Events
---

# Webhooks & Events

OwnPay sends HTTP POST requests to your server whenever a payment event occurs. Webhooks let you react to events in real time - fulfil orders, send receipts, update balances - without polling the API.

## How Webhooks Work

```
Customer pays → OwnPay processes → POST to your endpoint
                                       ↓
                              Verify signature
                                       ↓
                              Handle event
                                       ↓
                              Return 200 OK
```

OwnPay considers delivery successful when your endpoint returns **HTTP 2xx** within **10 seconds**. On failure, it retries with exponential backoff: 1 min → 5 min → 30 min → 2 h → 12 h (5 attempts total).

## Configuring an Endpoint

1. Go to **Admin Panel → Developer Hub → Webhooks**
2. Click **Add Endpoint**
3. Enter your URL: `https://your-store.com/webhooks/ownpay`
4. Select the events you want to receive (or **All events**)
5. Copy the **Webhook Secret** - you'll need it to verify signatures

::: tip HTTPS Required
OwnPay only sends webhooks to `https://` endpoints. Use a service like [ngrok](https://ngrok.com/) for local development.
:::

## Webhook Request Format

Every webhook POST contains:

**Headers**

```
Content-Type: application/json
X-OwnPay-Signature: sha256=<hmac_hex>
X-OwnPay-Timestamp: 1718000000
X-OwnPay-Event: payment.paid
```

**Body**

```json
{
  "event": "payment.paid",
  "created_at": "2024-06-15T10:30:00Z",
  "data": {
    "id": "pi_01j0x8kz7m3wd4b9qfhec5rtg6",
    "status": "paid",
    "amount": 1500,
    "currency": "BDT",
    "description": "Order #1042",
    "customer": {
      "name": "Rahim Uddin",
      "email": "rahim@example.com"
    },
    "metadata": {
      "order_id": "1042"
    },
    "paid_at": "2024-06-15T10:29:58Z"
  }
}
```

## Signature Verification

::: danger Never Skip This
Anyone can POST to your webhook URL. Always verify the HMAC signature before processing any event.
:::

The signature is computed as:

```
HMAC-SHA256(secret, timestamp + "." + raw_request_body)
```

Then prefixed with `sha256=` in the header.

### PHP Verification

```php
<?php

declare(strict_types=1);

function verifyOwnPaySignature(string $secret): array
{
    $signature = $_SERVER['HTTP_X_OWNPAY_SIGNATURE'] ?? '';
    $timestamp  = $_SERVER['HTTP_X_OWNPAY_TIMESTAMP'] ?? '';
    $rawBody    = file_get_contents('php://input') ?: '';

    // Replay protection: reject events older than 5 minutes
    if (abs(time() - (int) $timestamp) > 300) {
        http_response_code(400);
        exit('Timestamp too old');
    }

    $expected = 'sha256=' . hash_hmac('sha256', $timestamp . '.' . $rawBody, $secret);

    if (!hash_equals($expected, $signature)) {
        http_response_code(401);
        exit('Invalid signature');
    }

    $event = json_decode($rawBody, true, 512, JSON_THROW_ON_ERROR);

    if (!is_array($event)) {
        http_response_code(400);
        exit('Invalid JSON');
    }

    return $event;
}

// --- Your endpoint ---
$secret = getenv('OWNPAY_WEBHOOK_SECRET') ?: throw new RuntimeException('Missing OWNPAY_WEBHOOK_SECRET');
$event  = verifyOwnPaySignature($secret);

match ($event['event']) {
    'payment.paid'      => handlePaymentPaid($event['data']),
    'payment.failed'    => handlePaymentFailed($event['data']),
    'payment.refunded'  => handlePaymentRefunded($event['data']),
    default             => null, // ignore unknown events
};

http_response_code(200);
echo 'OK';
```

### Node.js Verification

```typescript
import crypto from 'node:crypto'
import type { Request, Response } from 'express'

function verifyOwnPaySignature(
  req: Request,
  secret: string,
): boolean {
  const signature = req.headers['x-ownpay-signature'] as string | undefined
  const timestamp = req.headers['x-ownpay-timestamp'] as string | undefined

  if (!signature || !timestamp) return false

  // Replay protection: reject events older than 5 minutes
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false

  const rawBody = (req as any).rawBody as Buffer
  const hmac    = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody.toString()}`)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(`sha256=${hmac}`),
    Buffer.from(signature),
  )
}

// Express webhook handler
app.post(
  '/webhooks/ownpay',
  express.raw({ type: 'application/json' }), // preserve raw body
  (req: Request, res: Response) => {
    const secret = process.env.OWNPAY_WEBHOOK_SECRET!

    if (!verifyOwnPaySignature(req, secret)) {
      return res.status(401).send('Invalid signature')
    }

    const event = JSON.parse(req.body.toString())

    switch (event.event) {
      case 'payment.paid':
        handlePaymentPaid(event.data)
        break
      case 'payment.failed':
        handlePaymentFailed(event.data)
        break
      case 'payment.refunded':
        handlePaymentRefunded(event.data)
        break
    }

    res.status(200).send('OK')
  },
)
```

::: warning Raw Body Required
Signature verification must run against the **raw, unparsed request body**. If your framework parses JSON before the middleware runs, the byte representation may differ and the signature will fail. Configure your router to expose `req.rawBody`.
:::

## Event Types

| Event | Description |
|-------|-------------|
| `payment.pending` | Intent created; customer hasn't paid yet |
| `payment.processing` | Gateway confirmed; settlement in progress |
| `payment.paid` | Payment fully confirmed and settled |
| `payment.failed` | Payment attempt failed |
| `payment.cancelled` | Customer or merchant cancelled the intent |
| `payment.refunded` | Full refund issued |
| `payment.partial_refunded` | Partial refund issued |
| `link.visited` | A payment link was opened by a customer |
| `link.paid` | A payment via payment link completed |

## Idempotency

Webhook delivery is **at-least-once** - your handler may receive the same event more than once in rare cases (e.g. if your server timed out before returning 200). Make all handlers idempotent:

```php
function handlePaymentPaid(array $data): void
{
    $orderId = $data['metadata']['order_id'];

    // Guard: skip if already processed
    $order = Order::find($orderId);
    if ($order->status === 'fulfilled') {
        return;
    }

    // Process once
    $order->fulfill();
}
```

## Testing Webhooks Locally

Use [ngrok](https://ngrok.com/) to expose a local port:

```bash
ngrok http 8080
# → https://xxxx.ngrok-free.app
```

Add the ngrok URL as a webhook endpoint in the OwnPay admin panel for testing.

You can also replay recent webhook events from **Admin Panel → Developer Hub → Webhooks → Delivery Log**.
