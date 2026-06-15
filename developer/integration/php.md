---
title: PHP Integration
---

# PHP Integration

This guide shows how to integrate OwnPay into a PHP 8.3+ application using the native HTTP client (`file_get_contents` + stream contexts) or cURL. No Composer package is required.

## Prerequisites

- PHP 8.3 or higher
- `allow_url_fopen = On` in `php.ini` (for stream-based requests), **or** the `curl` extension enabled
- An OwnPay API key from Admin → Developer Hub

## Basic API Client

The following class handles authentication and JSON serialization for every request:

```php
<?php

declare(strict_types=1);

class OwnPayClient
{
    private string $baseUrl;
    private string $apiKey;

    public function __construct(string $baseUrl, string $apiKey)
    {
        $this->baseUrl = rtrim($baseUrl, '/') . '/api/v1';
        $this->apiKey  = $apiKey;
    }

    /**
     * @param array<string, mixed> $body
     * @return array<string, mixed>
     */
    public function post(string $endpoint, array $body): array
    {
        return $this->request('POST', $endpoint, $body);
    }

    /**
     * @return array<string, mixed>
     */
    public function get(string $endpoint): array
    {
        return $this->request('GET', $endpoint);
    }

    /**
     * @param array<string, mixed>|null $body
     * @return array<string, mixed>
     */
    private function request(string $method, string $endpoint, ?array $body = null): array
    {
        $url     = $this->baseUrl . '/' . ltrim($endpoint, '/');
        $payload = $body !== null ? json_encode($body, JSON_THROW_ON_ERROR) : null;

        $context = stream_context_create([
            'http' => [
                'method'        => $method,
                'header'        => implode("\r\n", [
                    'Content-Type: application/json',
                    'Accept: application/json',
                    'Authorization: Bearer ' . $this->apiKey,
                ]),
                'content'       => $payload,
                'ignore_errors' => true,
                'timeout'       => 15,
            ],
        ]);

        $raw = file_get_contents($url, false, $context);

        if ($raw === false) {
            throw new RuntimeException("Request to {$url} failed");
        }

        /** @var array<string, mixed> $decoded */
        $decoded = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);

        if (!($decoded['success'] ?? false)) {
            $msg = $decoded['message'] ?? 'Unknown API error';
            throw new RuntimeException("OwnPay API error: {$msg}");
        }

        return $decoded;
    }
}
```

## Creating a Payment Intent

A payment intent represents a pending payment session. The customer is redirected to OwnPay's checkout to complete payment.

```php
$client = new OwnPayClient(
    baseUrl: 'https://pay.your-domain.com',
    apiKey:  getenv('OWNPAY_API_KEY') ?: throw new RuntimeException('Missing OWNPAY_API_KEY'),
);

$response = $client->post('payment-intents', [
    'amount'      => 1500,          // in minor units (e.g. 1500 = $15.00 or BDT 1500)
    'currency'    => 'BDT',
    'description' => 'Order #1042',
    'customer'    => [
        'name'  => 'Rahim Uddin',
        'email' => 'rahim@example.com',
        'phone' => '+8801712345678',
    ],
    'metadata'    => [
        'order_id' => '1042',
    ],
    'redirect_url' => 'https://your-store.com/payment/callback',
    'cancel_url'   => 'https://your-store.com/payment/cancel',
]);

$checkoutUrl = $response['data']['checkout_url'];
// Redirect the customer:
header('Location: ' . $checkoutUrl, true, 302);
exit;
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | integer | ✓ | Amount in minor currency units |
| `currency` | string | ✓ | ISO 4217 currency code (e.g. `BDT`, `USD`) |
| `description` | string | — | Human-readable description |
| `customer.name` | string | — | Customer's full name |
| `customer.email` | string | — | Customer's email address |
| `customer.phone` | string | — | Customer's phone number |
| `metadata` | object | — | Arbitrary key/value pairs (returned in webhooks) |
| `redirect_url` | string | ✓ | URL to redirect after successful payment |
| `cancel_url` | string | — | URL to redirect if the customer cancels |

## Retrieving a Payment Intent

Poll or fetch after a webhook event to get the current payment status:

```php
$intent = $client->get('payment-intents/' . $intentId);

$status = $intent['data']['status'];
// Possible values: pending, processing, paid, failed, cancelled, refunded

if ($status === 'paid') {
    // Fulfil the order
    fulfillOrder($intent['data']['metadata']['order_id']);
}
```

## Generating a Payment Link

Payment links are reusable shareable URLs — no customer data required up-front:

```php
$response = $client->post('payment-links', [
    'amount'      => 5000,
    'currency'    => 'BDT',
    'description' => 'Monthly subscription',
    'expires_at'  => date('Y-m-d\TH:i:s\Z', strtotime('+7 days')),
    'redirect_url'=> 'https://your-store.com/payment/success',
]);

$link = $response['data']['url'];
echo "Share this link: {$link}";
```

## Listing Transactions

```php
$response = $client->get('transactions?page=1&per_page=20&status=paid');

foreach ($response['data']['data'] as $tx) {
    printf(
        "%-36s  %-8s  %s %s\n",
        $tx['id'],
        $tx['status'],
        $tx['amount'],
        $tx['currency']
    );
}
```

## Error Handling

The client throws `RuntimeException` on any API failure. Wrap calls in try/catch in production:

```php
try {
    $response = $client->post('payment-intents', $payload);
    // handle success
} catch (RuntimeException $e) {
    // Log the error
    error_log($e->getMessage());
    // Show user-friendly message
    http_response_code(502);
    echo json_encode(['error' => 'Payment service temporarily unavailable']);
    exit;
} catch (JsonException $e) {
    // Malformed response from OwnPay
    error_log('OwnPay JSON parse error: ' . $e->getMessage());
    http_response_code(502);
    exit;
}
```

## Environment Configuration

Never hardcode API keys. Use environment variables:

```php
// .env (never commit this file)
OWNPAY_BASE_URL=https://pay.your-domain.com
OWNPAY_API_KEY=op_live_xxxxxxxxxxxxxxxxxxxxxxxx
```

```php
$client = new OwnPayClient(
    baseUrl: $_ENV['OWNPAY_BASE_URL'],
    apiKey:  $_ENV['OWNPAY_API_KEY'],
);
```

## Next Steps

- [Webhook verification →](/developer/webhooks) — Receive and verify payment events server-side
- [API Reference →](https://docs.ownpay.org) — Full endpoint list with schemas
