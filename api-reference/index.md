# API Reference

The OwnPay REST API allows developers to integrate payment collection directly into their applications, websites, or backend services.

## Base URL

```
https://your-ownpay-domain.com/api/v1
```

All API responses are JSON. All requests must include the `Content-Type: application/json` header.

## Authentication

All API endpoints require Bearer token authentication using an `op_` prefixed API key:

```http
Authorization: Bearer op_<your-api-key>
```

Generate API keys from the [Developer Hub](/user-guide/developers/developer-hub) in the admin panel.

## Rate Limiting

API requests are rate-limited per key. Rate limit headers are returned with every response:

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests per window |
| `X-RateLimit-Remaining` | Requests remaining in current window |
| `X-RateLimit-Reset` | Unix timestamp when the window resets |

A `429 Too Many Requests` response is returned when the limit is exceeded.

## Error Format

All errors follow a consistent JSON format:

```json
{
  "error": true,
  "message": "Human-readable error description",
  "code": "ERROR_CODE"
}
```

## Standard HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Resource created |
| `400` | Bad request — invalid parameters |
| `401` | Unauthorized — invalid or missing API key |
| `403` | Forbidden — insufficient permissions |
| `404` | Resource not found |
| `422` | Unprocessable — validation failed |
| `429` | Rate limit exceeded |
| `500` | Server error |

## Endpoints

### Payments
- [Initiate Payment →](/api-reference/initiate-payment) — `POST /api/v1/payment-intents`

### Authentication
- [API Key Authentication →](/api-reference/authentication)

## Webhooks

OwnPay sends outbound webhook notifications to your configured endpoint when payment events occur. All webhook payloads include an HMAC-SHA256 signature header:

```
X-OwnPay-Signature: sha256=<hmac_hex>
```

Always verify this signature on your server before processing the event.

```php
$secret = getenv('WEBHOOK_SECRET');
$payload = file_get_contents('php://input');
$expected = 'sha256=' . hash_hmac('sha256', $payload, $secret);
$received = $_SERVER['HTTP_X_OWNPAY_SIGNATURE'] ?? '';

if (!hash_equals($expected, $received)) {
    http_response_code(401);
    exit;
}
```
