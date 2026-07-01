---
title: REST API Integration
---

# OwnPay Merchant REST API

The OwnPay Merchant API lets you programmatically initiate payments, query transactions, issue refunds, manage customers, and manage API keys - all from any language or platform.

> **Full interactive reference:** [docs.ownpay.org](https://docs.ownpay.org)

---

## Base URL

The API is served from **your brand's own custom domain**:

```
https://{your_brand_domain}/api/v1
```

Every brand gets its own isolated API endpoint. Replace `{your_brand_domain}` with the domain configured in **Admin → System → Domains** (e.g. `pay.yourbrand.com`).

---

## Authentication

All endpoints require a **Bearer API key** in the `Authorization` header:

```http
Authorization: Bearer op.xxxxxxxxxxxxx
```

API keys carry scopes - `read`, `write`, and `admin`. Most endpoints require `read` or `write`. Key management endpoints additionally require **`write` + `admin`** scopes and a special `X-Super-Admin-Email` header.

**Get your API key:** Admin Panel → Developer Hub → API Keys → Generate

> ⚠️ API keys are shown **once** at creation. Store them in a secrets manager immediately.

---

## Response Format

All responses are JSON. Successful responses wrap data in a `data` key:

```json
{
  "success": true,
  "data": { ... }
}
```

Error responses include an `error` string and an optional `errors` array with per-field details:

```json
{
  "success": false,
  "error": "amount must be a positive number",
  "errors": [
    {
      "code": "INVALID_AMOUNT",
      "message": "amount must be a positive number",
      "field": "amount"
    }
  ],
  "request_id": "8f5a2e9b0c7d4e5f"
}
```

**HTTP status codes used:**

| Code | Meaning |
|------|---------|
| `200` | OK |
| `201` | Created |
| `400` | Bad request / business rule violation |
| `401` | Missing or invalid API key |
| `403` | Insufficient scope / permission |
| `404` | Resource not found (or belongs to another brand) |
| `409` | Conflict (e.g. duplicate email) |
| `422` | Validation failure |
| `500` | Server error |
| `503` | System degraded |

---

## Endpoints

### Health Check

```http
GET /health
```

Returns system status - database connectivity, active gateway count, paired mobile devices, and the running version. No authentication required.

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "0.1.0",
    "db": "connected",
    "mobile": {
      "connected": true,
      "active_devices": 2
    },
    "gateways": 3,
    "customers": 142,
    "time": "2026-06-23T14:15:45Z"
  }
}
```

`status` is `healthy` (200) or `degraded` (503).

---

### Payments

#### Initiate Payment Intent

```http
POST /payments
```

Creates a new payment session and returns a secure, white-labeled checkout URL to redirect your customer to.

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | string | ✅ | Positive numeric string, 2 decimal places. e.g. `"500.00"` |
| `currency` | string | ✅ | ISO 4217 code supported by your brand. e.g. `"BDT"`, `"USD"` |
| `callback_url` | string (URI) | | Webhook URL for payment completion callbacks (HTTP/HTTPS) |
| `redirect_url` | string (URI) | | Where to send the customer after a successful payment |
| `cancel_url` | string (URI) | | Where to send the customer if they cancel |
| `customer_email` | string (email) | | Customer email for identity mapping |
| `customer_name` | string | | Customer full name (max 150 chars) |
| `customer_phone` | string | | Customer phone number (max 30 chars) |
| `reference` | string | | Your internal order/invoice ID. e.g. `"INV-10029"` |
| `gateway` | string | | Route to a specific gateway slug. e.g. `"bkash-merchant"` |
| `metadata` | object | | Arbitrary key-value map for your own data |

**Example request:**

```http
POST /api/v1/payments
Authorization: Bearer op_live_...
Content-Type: application/json

{
  "amount": "500.00",
  "currency": "BDT",
  "callback_url": "https://my-store.com/webhooks/ownpay",
  "redirect_url": "https://my-store.com/checkout/success",
  "cancel_url": "https://my-store.com/checkout/cancel",
  "customer_email": "customer@example.com",
  "customer_name": "John Doe",
  "reference": "INV-10029",
  "metadata": {
    "store_id": "dhaka-branch"
  }
}
```

**Response `201`:**

```json
{
  "success": true,
  "data": {
    "payment_id": "a810b445-564a-4e20-80a5-f1261d7b328a",
    "token": "tok_4821a8f902bd3f46",
    "checkout_url": "https://pay.yourbrand.com/checkout/tok_4821a8f902bd3f46",
    "status": "created"
  }
}
```

Redirect your customer to `checkout_url`. The payment session is valid until the customer completes or cancels payment.

---

#### Retrieve Payment Details

```http
GET /payments/{payment_id}
```

Looks up a payment intent by its UUID. If a transaction has been completed, returns transaction details; otherwise returns the pending intent state.

**Path parameter:** `payment_id` - UUID of the payment intent.

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "id": 45,
    "trx_id": "OP-481029304",
    "gateway_trx_id": "A8K9D2J3S",
    "amount": "500.00",
    "currency": "BDT",
    "fee": "7.50",
    "status": "completed",
    "gateway": "bkash",
    "method": "app",
    "reference": "INV-10029",
    "created_at": "2026-06-23T14:15:45Z",
    "completed_at": "2026-06-23T14:17:12Z",
    "customer": {
      "name": "John Doe",
      "email": "customer@example.com"
    }
  }
}
```

`id`, `trx_id`, and `gateway_trx_id` are `null` if payment has not completed yet.

---

### Transactions

#### List Transactions

```http
GET /transactions
```

Returns a paginated list of all transactions for your brand.

**Query parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number |
| `per_page` | integer | `25` | Records per page (max 100) |
| `status` | string | | Filter: `completed`, `pending`, `failed`, `cancelled`, `processing` |
| `gateway` | string | | Filter by gateway slug |
| `from` | date (YYYY-MM-DD) | | Start date boundary |
| `to` | date (YYYY-MM-DD) | | End date boundary |

**Example:**

```http
GET /api/v1/transactions?status=completed&from=2026-06-01&to=2026-06-30&per_page=50
Authorization: Bearer op.xxxxx
```

**Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "id": 45,
      "trx_id": "OP-481029304",
      "gateway_trx_id": "A8K9D2J3S",
      "amount": "500.00",
      "currency": "BDT",
      "fee": "7.50",
      "net_amount": "492.50",
      "status": "completed",
      "gateway": "bkash",
      "method": "app",
      "reference": "INV-10029",
      "created_at": "2026-06-23T14:15:45Z",
      "updated_at": "2026-06-23T14:17:15Z"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 25,
    "total": 120,
    "total_pages": 5
  }
}
```

---

#### Retrieve Transaction

```http
GET /transactions/{trx_id}
```

Looks up a single transaction by OwnPay reference (`OP-481029304`) or gateway transaction ID. OwnPay IDs are matched first.

**Response `200`:** same shape as a single item in the list above.

---

### Refunds

#### List Refunds

```http
GET /refunds
```

Returns a paginated list of refunds for your brand.

**Query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number (default: 1) |
| `per_page` | integer | Max 100 (default: 25) |
| `status` | string | `completed`, `pending`, `failed` |
| `trx_id` | string | Filter by transaction reference |
| `transaction_id` | integer | Filter by internal transaction ID |
| `from` | date | Start boundary (YYYY-MM-DD) |
| `to` | date | End boundary (YYYY-MM-DD) |

---

#### Request Refund

```http
POST /refunds
```

Issues a full or partial refund on a completed transaction. The refund amount cannot exceed the remaining refundable balance.

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `trx_id` | string | ✅ | OwnPay transaction reference (`OP-12345`) or gateway transaction ID |
| `transaction_id` | integer | | Alternative: internal transaction integer ID |
| `amount` | string | | Partial refund amount. Omit for a full refund. |
| `reason` | string | | Reason for the refund |

**Example request:**

```http
POST /api/v1/refunds
Authorization: Bearer op.xxxxx
Content-Type: application/json

{
  "trx_id": "OP-481029304",
  "amount": "150.00",
  "reason": "Customer requested return"
}
```

**Response `201`:**

```json
{
  "success": true,
  "data": {
    "id": 12,
    "uuid": "d2f44778-d421-4f1e-9271-70bf8e3b123a",
    "transaction_id": 45,
    "trx_id": "OP-481029304",
    "gateway_trx_id": "A8K9D2J3S",
    "amount": "150.00",
    "reason": "Customer requested return",
    "status": "completed",
    "processed_at": "2026-06-23T14:20:00Z",
    "created_at": "2026-06-23T14:19:55Z"
  }
}
```

---

#### Retrieve Refund

```http
GET /refunds/{trx_id}
```

Returns the latest refund record for a transaction, by OwnPay or gateway transaction ID.

---

### Customers

Customer PII (name, email, phone) is stored **AES-256-GCM encrypted** at rest and only decrypted on explicit retrieval.

#### List Customers

```http
GET /customers?page=1&per_page=25
```

Returns masked PII in the list for safe display (`email_masked`, `phone_masked`). Full values require a dedicated lookup.

**Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "id": 58,
      "uuid": "83b9c9d2-b2f4-4df1-bc1e-b810d1c810d1",
      "name": "Alice Smith",
      "email_masked": "a***e@example.com",
      "phone_masked": "+88018******00",
      "created_at": "2026-06-23T14:15:45Z"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 25,
    "total": 98
  }
}
```

---

#### Create Customer

```http
POST /customers
```

Creates a new customer profile. Email must be unique within the brand.

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Customer full display name |
| `email` | string (email) | | Must be unique per brand |
| `phone` | string | | Customer phone number |

**Response `201`:**

```json
{
  "success": true,
  "data": {
    "id": 58,
    "uuid": "83b9c9d2-b2f4-4df1-bc1e-b810d1c810d1"
  }
}
```

---

#### Retrieve Customer

```http
GET /customers/{identifier}
```

Looks up a customer by **email address** or **phone number** (URL-encoded). Returns fully decrypted PII.

- If `identifier` contains `@` → searches by email hash
- Otherwise → searches by phone number hash

**Example:**

```http
GET /api/v1/customers/customer%40example.com
Authorization: Bearer op.xxxxxx
```

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "id": 58,
    "uuid": "83b9c9d2-b2f4-4df1-bc1e-b810d1c810d1",
    "name": "Alice Smith",
    "email": "alice@example.com",
    "phone": "+8801800000000",
    "created_at": "2026-06-23T14:15:45Z"
  }
}
```

---

### API Keys

> **Requires `write` + `admin` scopes** and the `X-Super-Admin-Email` header on all key management endpoints.

#### List API Keys

```http
GET /api-keys
X-Super-Admin-Email: admin@yourdomain.com
```

Returns metadata for all brand API keys. Key secrets are never returned.

**Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "id": 4,
      "name": "POS-System-Integration",
      "prefix": "op.xxx",
      "status": "active",
      "last_used": "2026-06-23T14:18:22Z",
      "expires_at": null,
      "created_at": "2026-06-21T09:00:00Z"
    }
  ]
}
```

---

#### Generate API Key

```http
POST /api-keys
X-Super-Admin-Email: admin@yourdomain.com
```

**Request body:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Friendly label for the key |
| `scopes` | string[] | `["read"]`, `["read","write"]`, or `["read","write","admin"]` |

**Response `201`:**

```json
{
  "success": true,
  "data": {
    "key": "op.xxxxx.xxxxxx",
    "prefix": "op.xxxxxx",
    "warning": "Store this key securely. It cannot be retrieved again."
  }
}
```

> ⚠️ The full key is returned **exactly once**. Copy it immediately.

---

#### Revoke API Key

```http
DELETE /api-keys/{id}
X-Super-Admin-Email: admin@yourdomain.com
```

Revokes a key immediately by its integer ID. Revoked keys return `401` on all subsequent requests.

---

### Webhooks

#### Dispatch Test Webhook

```http
POST /webhooks/tests
```

Fires a sample `payment.completed` payload to your configured brand callback URL. Useful for verifying your webhook endpoint is reachable and returns `200`.

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "status_code": 200,
    "response_time_ms": 245
  }
}
```

---

#### Webhook Delivery Log

```http
GET /webhooks/deliveries
```

Returns the 50 most recent webhook delivery attempts for your brand - including the payload sent, the HTTP status received, retry count, and delivery status.

**Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1024,
      "transaction_id": 45,
      "event": "payment.completed",
      "url": "https://my-store.com/webhooks/ownpay",
      "payload": "{\"event\":\"payment.completed\",\"data\":{\"trx_id\":\"OP-481029304\",\"amount\":\"500.00\"}}",
      "response_status": 200,
      "response_body": "OK",
      "attempts": 1,
      "status": "success",
      "created_at": "2026-06-23T14:17:15Z"
    }
  ]
}
```

---

## Webhook Events

OwnPay POSTs a JSON payload to your `callback_url` when a payment is completed. Your endpoint must return HTTP `2xx` within 10 seconds. Failed deliveries are retried automatically (see delivery log).

**Payload shape:**

```json
{
  "event": "payment.completed",
  "data": {
    "trx_id": "OP-481029304",
    "gateway_trx_id": "A8K9D2J3S",
    "amount": "500.00",
    "currency": "BDT",
    "status": "completed",
    "reference": "INV-10029",
    "gateway": "bkash"
  }
}
```

> Always verify the payload by querying `GET /payments/{payment_id}` or `GET /transactions/{trx_id}` before fulfilling an order - never trust the webhook payload alone.

---

## Quick Reference

| Endpoint | Method | Scope |
|----------|--------|-------|
| `GET /health` | System health | None |
| `POST /payments` | Initiate payment | `write` |
| `GET /payments/{id}` | Payment details | `read` |
| `GET /transactions` | List transactions | `read` |
| `GET /transactions/{id}` | Single transaction | `read` |
| `GET /refunds` | List refunds | `read` |
| `POST /refunds` | Request refund | `write` |
| `GET /refunds/{id}` | Single refund | `read` |
| `GET /customers` | List customers | `read` |
| `POST /customers` | Create customer | `write` |
| `GET /customers/{id}` | Customer details | `read` |
| `GET /api-keys` | List keys | `write` + `admin` |
| `POST /api-keys` | Generate key | `write` + `admin` |
| `DELETE /api-keys/{id}` | Revoke key | `write` + `admin` |
| `POST /webhooks/tests` | Test webhook | `write` |
| `GET /webhooks/deliveries` | Delivery log | `read` |

---

## See Also

- [API Tester Tool →](https://ownpay.org/api-tester.php)
- [Full Interactive API Reference →](https://docs.ownpay.org)
- [PHP SDK Integration →](/developer/integration/php)
- [Node.js SDK Integration →](/developer/integration/nodejs)
- [WordPress WooCommerce →](/developer/integration/woocommerce)
- [Webhooks Setup →](/developer/webhooks)
