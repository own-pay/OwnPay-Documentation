# Initiate Payment

Create a new payment intent. Your server calls this endpoint, receives a `payment_url`, and redirects the customer to complete payment.

## Endpoint

```http
POST /api/v1/payment-intents
```

## Authentication

Requires a valid Bearer API key. See [Authentication →](/api-reference/authentication)

## Request Headers

| Header | Value |
|--------|-------|
| `Authorization` | `Bearer op_<your-key>` |
| `Content-Type` | `application/json` |

## Request Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `gateway` | `string` | Yes | Gateway slug (e.g., `stripe`, `bkash`, `manual`) |
| `amount` | `number` | Yes | Payment amount as a decimal number |
| `currency` | `string` | Yes | ISO 4217 currency code (e.g., `USD`, `BDT`) |
| `order_id` | `string` | Yes | Your unique order/invoice reference |
| `customer_name` | `string` | Yes | Customer's full name |
| `customer_email` | `string` | Yes | Customer's email address |
| `customer_phone` | `string` | No | Customer's phone number |
| `description` | `string` | No | Payment description shown on checkout page |
| `return_url` | `string` | Yes | URL to redirect customer after payment |
| `cancel_url` | `string` | No | URL to redirect customer on cancellation |
| `metadata` | `object` | No | Arbitrary key-value pairs stored with the transaction |

## Example Request

```json
{
  "gateway": "stripe",
  "amount": 99.99,
  "currency": "USD",
  "order_id": "ORDER-20240615-001",
  "customer_name": "Jane Smith",
  "customer_email": "jane@example.com",
  "customer_phone": "+1-555-0100",
  "description": "Annual subscription — Professional Plan",
  "return_url": "https://yoursite.com/order/success",
  "cancel_url": "https://yoursite.com/order/cancel",
  "metadata": {
    "user_id": "42",
    "plan": "professional"
  }
}
```

## Response

### `201 Created` — Success

```json
{
  "success": true,
  "transaction_id": "txn_9f2c3a4b5d6e7f8a",
  "payment_url": "https://pay.yourstore.com/checkout/txn_9f2c3a4b5d6e7f8a",
  "status": "pending",
  "expires_at": "2024-06-15T14:30:00Z"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `transaction_id` | `string` | OwnPay's unique transaction identifier |
| `payment_url` | `string` | Redirect your customer to this URL to complete payment |
| `status` | `string` | Always `pending` on creation |
| `expires_at` | `string` | ISO 8601 timestamp — link expires after this time |

### `400 Bad Request` — Validation Error

```json
{
  "error": true,
  "message": "Validation failed.",
  "code": "VALIDATION_ERROR",
  "errors": {
    "amount": ["The amount field is required."],
    "currency": ["Invalid currency code."]
  }
}
```

### `404 Not Found` — Gateway Inactive

```json
{
  "error": true,
  "message": "Gateway 'stripe' is not configured or inactive.",
  "code": "GATEWAY_NOT_FOUND"
}
```

## PHP Integration Example

```php
<?php
$apiKey  = getenv('OWNPAY_API_KEY');
$baseUrl = getenv('OWNPAY_BASE_URL');

$payload = json_encode([
    'gateway'        => 'stripe',
    'amount'         => 99.99,
    'currency'       => 'USD',
    'order_id'       => 'ORDER-001',
    'customer_name'  => 'Jane Smith',
    'customer_email' => 'jane@example.com',
    'return_url'     => 'https://yoursite.com/success',
]);

$opts = [
    'http' => [
        'method'  => 'POST',
        'header'  => "Authorization: Bearer {$apiKey}\r\nContent-Type: application/json\r\n",
        'content' => $payload,
    ],
];

$context  = stream_context_create($opts);
$response = file_get_contents("{$baseUrl}/api/v1/payment-intents", false, $context);
$result   = json_decode($response, true);

// Redirect customer to payment page
header("Location: {$result['payment_url']}");
exit;
```

## Node.js Integration Example

```javascript
const response = await fetch(
  `${process.env.OWNPAY_BASE_URL}/api/v1/payment-intents`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OWNPAY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      gateway: 'stripe',
      amount: 99.99,
      currency: 'USD',
      order_id: 'ORDER-001',
      customer_name: 'Jane Smith',
      customer_email: 'jane@example.com',
      return_url: 'https://yoursite.com/success',
    }),
  }
);

const { payment_url } = await response.json();
res.redirect(payment_url);
```

## Webhook Event After Payment

OwnPay sends a `POST` to your configured endpoint when payment completes:

```json
{
  "event": "payment.completed",
  "transaction_id": "txn_9f2c3a4b5d6e7f8a",
  "order_id": "ORDER-20240615-001",
  "amount": 99.99,
  "currency": "USD",
  "status": "completed",
  "paid_at": "2024-06-15T14:22:45Z",
  "gateway": "stripe"
}
```

Always verify the `X-OwnPay-Signature` header before processing. See [API Overview → Webhooks](/api-reference/#webhooks).

## Related

- [Authentication →](/api-reference/authentication)
- [API Overview →](/api-reference/)
- [Developer Hub (Admin UI) →](/user-guide/developers/developer-hub)
