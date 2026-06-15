---
title: Building Plugins
---

# Building Gateway Plugins

OwnPay's payment gateways are sandboxed plugins — self-contained packages that implement a standard interface. A plugin can be installed, updated, or removed without touching core code. This page covers everything you need to create one.

## Architecture Overview

```
ownpay-installation/
└── plugins/
    └── your-gateway/
        ├── plugin.json          ← manifest
        ├── Gateway.php          ← main class (implements GatewayInterface)
        ├── WebhookHandler.php   ← optional webhook processor
        └── views/
            └── settings.blade.php  ← admin settings form
```

Each plugin lives in its own directory under `plugins/`. OwnPay discovers plugins at runtime by scanning for `plugin.json` manifests.

## Plugin Manifest (plugin.json)

The manifest describes your plugin to OwnPay's plugin manager:

```json
{
  "id": "my-bank-gateway",
  "name": "My Bank Gateway",
  "version": "1.0.0",
  "description": "Accept payments via My Bank's PGW API.",
  "author": "Your Name",
  "author_url": "https://example.com",
  "requires_ownpay": ">=0.1.0",
  "gateway_class": "MyBankGateway\\Gateway",
  "webhook_class": "MyBankGateway\\WebhookHandler",
  "settings": [
    {
      "key": "merchant_id",
      "label": "Merchant ID",
      "type": "text",
      "required": true,
      "encrypted": false
    },
    {
      "key": "api_secret",
      "label": "API Secret",
      "type": "password",
      "required": true,
      "encrypted": true
    },
    {
      "key": "sandbox",
      "label": "Sandbox Mode",
      "type": "boolean",
      "default": false
    }
  ]
}
```

### Manifest Fields

| Field | Description |
|-------|-------------|
| `id` | Unique slug, lowercase, hyphens only |
| `name` | Human-readable display name |
| `version` | SemVer string |
| `requires_ownpay` | Version constraint for compatibility |
| `gateway_class` | Fully-qualified PHP class name |
| `webhook_class` | Class that handles inbound webhooks (optional) |
| `settings` | Array of admin-configurable fields |

Settings with `"encrypted": true` are stored AES-256-GCM encrypted. Retrieve them with `$this->getConfig('api_secret')` — OwnPay decrypts automatically.

## Implementing GatewayInterface

Your main class must implement `OwnPay\Contracts\GatewayInterface`:

```php
<?php

declare(strict_types=1);

namespace MyBankGateway;

use OwnPay\Contracts\GatewayInterface;
use OwnPay\Gateway\CheckoutRequest;
use OwnPay\Gateway\CheckoutResponse;
use OwnPay\Gateway\VerifyRequest;
use OwnPay\Gateway\VerifyResponse;
use OwnPay\Gateway\RefundRequest;
use OwnPay\Gateway\RefundResponse;

class Gateway implements GatewayInterface
{
    public function getName(): string
    {
        return 'My Bank Gateway';
    }

    public function getCode(): string
    {
        return 'my-bank-gateway';
    }

    /**
     * Initiate a checkout and return the redirect URL.
     */
    public function checkout(CheckoutRequest $request): CheckoutResponse
    {
        $isSandbox = (bool) $this->getConfig('sandbox');
        $baseUrl   = $isSandbox
            ? 'https://sandbox.mybank.com/pgw/initiate'
            : 'https://api.mybank.com/pgw/initiate';

        $payload = [
            'merchant_id'    => $this->getConfig('merchant_id'),
            'amount'         => $request->getAmount(),
            'currency'       => $request->getCurrency(),
            'tran_id'        => $request->getTransactionId(),
            'success_url'    => $request->getSuccessUrl(),
            'fail_url'       => $request->getFailUrl(),
            'cancel_url'     => $request->getCancelUrl(),
            'customer_name'  => $request->getCustomerName() ?? '',
            'customer_email' => $request->getCustomerEmail() ?? '',
        ];

        $payload['signature'] = $this->sign($payload);

        $apiResponse = $this->httpPost($baseUrl, $payload);

        if (($apiResponse['status'] ?? '') !== 'SUCCESS') {
            return CheckoutResponse::failure($apiResponse['message'] ?? 'Initiation failed');
        }

        return CheckoutResponse::redirect($apiResponse['redirect_url']);
    }

    /**
     * Verify a payment after the customer is redirected back.
     */
    public function verify(VerifyRequest $request): VerifyResponse
    {
        $baseUrl = (bool) $this->getConfig('sandbox')
            ? 'https://sandbox.mybank.com/pgw/verify'
            : 'https://api.mybank.com/pgw/verify';

        $apiResponse = $this->httpPost($baseUrl, [
            'merchant_id' => $this->getConfig('merchant_id'),
            'tran_id'     => $request->getTransactionId(),
            'signature'   => $this->signVerify($request->getTransactionId()),
        ]);

        if (($apiResponse['pay_status'] ?? '') === 'Successful') {
            return VerifyResponse::paid(
                gatewayTransactionId: $apiResponse['bank_tran_id'],
                amount: (int) round((float) ($apiResponse['amount'] ?? 0)),
            );
        }

        return VerifyResponse::failed($apiResponse['error'] ?? 'Verification failed');
    }

    /**
     * Initiate a refund.
     */
    public function refund(RefundRequest $request): RefundResponse
    {
        // Implementation varies by gateway — return unsupported if the gateway
        // doesn't provide a refund API.
        return RefundResponse::unsupported();
    }

    // ── Helpers ────────────────────────────────────────────────

    /**
     * Retrieve a plugin config value (decrypted if encrypted).
     */
    private function getConfig(string $key): string
    {
        return $this->config[$key] ?? '';
    }

    private function sign(array $data): string
    {
        $secret = $this->getConfig('api_secret');
        ksort($data);
        return hash_hmac('sha256', implode('|', $data), $secret);
    }

    private function signVerify(string $tranId): string
    {
        return hash_hmac('sha256', $tranId, $this->getConfig('api_secret'));
    }

    /**
     * @param array<string, mixed> $payload
     * @return array<string, mixed>
     */
    private function httpPost(string $url, array $payload): array
    {
        $ctx = stream_context_create([
            'http' => [
                'method'        => 'POST',
                'header'        => "Content-Type: application/json\r\nAccept: application/json",
                'content'       => json_encode($payload, JSON_THROW_ON_ERROR),
                'ignore_errors' => true,
                'timeout'       => 15,
            ],
        ]);

        $raw = file_get_contents($url, false, $ctx) ?: '{}';
        return json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
    }
}
```

## Response Objects

| Class | Factory Methods |
|-------|----------------|
| `CheckoutResponse` | `::redirect(string $url)`, `::failure(string $msg)` |
| `VerifyResponse` | `::paid(string $gwTxId, int $amount)`, `::failed(string $msg)`, `::pending()` |
| `RefundResponse` | `::success(string $refundId)`, `::failed(string $msg)`, `::unsupported()` |

## Handling Inbound Webhooks

If the gateway sends asynchronous payment notifications, create a `WebhookHandler`:

```php
<?php

namespace MyBankGateway;

use OwnPay\Contracts\WebhookHandlerInterface;
use OwnPay\Webhook\InboundWebhook;
use OwnPay\Webhook\WebhookResult;

class WebhookHandler implements WebhookHandlerInterface
{
    public function handle(InboundWebhook $webhook): WebhookResult
    {
        $payload = $webhook->getPayload();

        // Verify the gateway's own signature
        $expected = hash_hmac('sha256', $payload['tran_id'], $this->getConfig('api_secret'));
        if (!hash_equals($expected, $payload['verify_sign'] ?? '')) {
            return WebhookResult::reject('Invalid signature');
        }

        if ($payload['status'] === 'VALID') {
            return WebhookResult::paid(
                transactionId:        $payload['tran_id'],
                gatewayTransactionId: $payload['bank_tran_id'],
                amount:               (int) round((float) $payload['amount']),
            );
        }

        return WebhookResult::ignore();
    }
}
```

OwnPay routes `POST /webhook/{gateway-id}` to your handler automatically once `webhook_class` is set in `plugin.json`.

## Testing Your Plugin

### Unit Tests

OwnPay provides a `FakeGatewayContext` for PHPUnit:

```php
use OwnPay\Testing\FakeGatewayContext;
use OwnPay\Gateway\CheckoutRequest;

it('returns a redirect URL on successful checkout', function () {
    $gateway = new Gateway(new FakeGatewayContext([
        'merchant_id' => 'TEST_MERCHANT',
        'api_secret'  => 'secret123',
        'sandbox'     => true,
    ]));

    Http::fake(['sandbox.mybank.com/*' => Http::response([
        'status'       => 'SUCCESS',
        'redirect_url' => 'https://sandbox.mybank.com/pay/abc123',
    ])]);

    $response = $gateway->checkout(
        CheckoutRequest::make(amount: 1500, currency: 'BDT', transactionId: 'pi_test_001')
    );

    expect($response->isRedirect())->toBeTrue()
         ->and($response->getRedirectUrl())->toContain('abc123');
});
```

### Manual Testing

1. Drop your plugin directory into `plugins/`
2. Go to **Admin Panel → System → Plugins** and activate your plugin
3. Configure credentials and enable **Sandbox Mode**
4. Create a test payment intent via the API and complete the checkout flow

## Publishing to the Plugin Catalog

Once your plugin is ready:

1. Host it as a public GitHub repository
2. Add the `ownpay-plugin` topic to the repo
3. Submit a Pull Request to [plugin.ownpay.org](https://plugin.ownpay.org) with your plugin metadata
4. After review, it appears in the community catalog

The catalog entry requires: `plugin.json`, a `README.md`, a screenshot, and confirmation that the plugin passes OwnPay's basic test suite.
