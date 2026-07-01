# Gateway Plugin Development Guide

This guide covers everything required to build, install, and maintain a payment gateway plugin for OwnPay. Every example is derived from the live Stripe gateway implementation at `modules/gateways/stripe/`.

---

## 1. How Gateway Plugins Work

When OwnPay boots, `PluginLoader::loadActive()` scans `modules/gateways/`, discovers all active gateway directories, validates each `manifest.json`, token-scans every PHP file for dangerous functions, and instantiates the entrypoint class.

Because a gateway class implements both `PluginInterface` **and** `GatewayAdapterInterface`, the loader automatically calls `GatewayBridge::registerAdapter($instance)` after booting all plugins. From that point, every payment flow - checkout initiation, callback verification, webhook validation, and refunds - is routed through `GatewayBridge`, which looks up the registered adapter by slug and delegates the call.

```
HTTP Request
    └─ CheckoutController / WebhookController
         └─ GatewayBridge::initiate() / verify() / refund() / verifyWebhookSignature()
              └─ GatewayAdapterInterface (your plugin instance)
```

Credentials are **never** passed raw. `GatewayBridge` calls `GatewayConfigRepository::findCredentialsBySlug()` for the active `merchant_id`, decrypts the stored JSON blob with `FieldEncryptor`, and passes the resulting plain-text key-value map to your adapter methods as the `$credentials` array.

---

## 2. Directory Structure

Place your gateway inside `modules/gateways/{your-slug}/`. The slug must be lowercase, use only letters, numbers, and hyphens, and match the `slug` field in `manifest.json`.

```
modules/gateways/my-gateway/
├── manifest.json           # Required. Plugin metadata and capabilities declaration.
├── MyGateway.php           # Required. Entrypoint - implements PluginInterface + GatewayAdapterInterface.
├── icon.svg                # Recommended. Gateway logo shown in the admin panel (SVG or PNG).
├── assets/                 # Optional. CSS/JS loaded on the checkout page.
│   └── checkout.js
└── migrations/             # Optional. SQL files executed on activation.
    └── 001_create_my_gateway_logs.sql
```

For multi-file plugins, additional classes (e.g., a `Service/` or `Http/` subdirectory) autoload automatically via the PSR-4 namespace registered from `manifest.json`. See §5 for details.

---

## 3. The `manifest.json` File

The manifest is the single source of truth for how OwnPay discovers, validates, and loads your plugin. `PluginManifest::fromDirectory()` parses it; `PluginManifest::validate()` enforces the schema.

### Full Example - Stripe Gateway

```json
{
  "name": "Stripe",
  "slug": "stripe",
  "version": "1.0.0",
  "description": "Stripe payment gateway - cards, wallets, international payments",
  "author": "OwnPay Core",
  "type": "gateway",
  "category": "global",
  "icon": "icon.svg",
  "color": "#635BFF",
  "entrypoint": "StripeGateway.php",
  "namespace": "OwnPay\\Modules\\Gateways\\Stripe",
  "capabilities": [
    "gateway"
  ],
  "requires": {
    "core": ">=0.1.0",
    "php": ">=8.1"
  },
  "csp": {
    "script_src": ["https://*.stripe.com"],
    "style_src":  ["https://*.stripe.com"],
    "frame_src":  ["https://*.stripe.com"],
    "connect_src": [
      "https://api.stripe.com",
      "https://*.stripe.com",
      "https://q.stripe.com"
    ]
  },
  "permissions": [
    "gateway.process",
    "gateway.refund"
  ]
}
```

### Field Reference

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | ✅ | Human-readable display name shown in the admin panel. |
| `slug` | `string` | ✅ | Unique machine identifier. Pattern: `^[a-z0-9][a-z0-9\-]{0,62}[a-z0-9]$`. Must match directory name. |
| `version` | `string` | ✅ | Semantic version string (e.g., `1.0.0`). |
| `description` | `string` | ✅ | Short human-readable description. |
| `author` | `string` | ✅ | Plugin author name or organisation. |
| `type` | `string` | ✅ | Must be `"gateway"`. Determines the scan directory (`modules/gateways/`). |
| `entrypoint` | `string` | ✅ | PHP filename containing the entrypoint class (e.g., `MyGateway.php`). No path traversal allowed. |
| `namespace` | `string` | ✅ | PSR-4 root namespace for this plugin. The entrypoint class is resolved as `{namespace}\{EntrypointFilename}`. |
| `capabilities` | `array` | ✅ | Must include `"gateway"`. See `OwnPay\Plugin\Capability` enum for all values. |
| `requires.core` | `string` | ✅ | Semver constraint the OwnPay core version must satisfy. |
| `requires.php` | `string` | ❌ | PHP version constraint (e.g., `>=8.1`). |
| `icon` | `string` | ❌ | Icon filename relative to plugin root. Used by `PluginManager::resolveIconPath()` to copy to `public/assets/img/gateways/{slug}.{ext}`. |
| `color` | `string` | ❌ | Hex brand color shown in the UI (e.g., `"#635BFF"`). |
| `category` | `string` | ❌ | UI grouping label (e.g., `"global"`, `"local"`, `"crypto"`). |
| `csp` | `object` | ❌ | Content Security Policy directive extensions. Keys: `script_src`, `style_src`, `frame_src`, `connect_src`. OwnPay merges these with the base CSP via the `checkout.csp.sources` filter. |
| `permissions` | `array` | ❌ | RBAC permission strings required. Gateway plugins should declare `"gateway.process"`. |
| `migrations` | `string` | ❌ | Path to migrations directory (default: `"migrations"`). |

---

## 4. The Entrypoint Class

A gateway plugin's entrypoint class **must** implement both `OwnPay\Plugin\PluginInterface` and `OwnPay\Gateway\GatewayAdapterInterface`. The `GatewayDefaults` trait provides safe, no-op fallbacks for every method - use it and override only what your gateway supports.

```php
<?php
declare(strict_types=1);

namespace OwnPay\Modules\Gateways\MyGateway;

use OwnPay\Gateway\GatewayAdapterInterface;
use OwnPay\Gateway\GatewayDefaults;
use OwnPay\Plugin\PluginInterface;
use OwnPay\Plugin\Capability;
use OwnPay\Container;
use OwnPay\Event\EventManager;

final class MyGateway implements PluginInterface, GatewayAdapterInterface
{
    use GatewayDefaults;

    // ─── PluginInterface ────────────────────────────────────────────────────

    public static function metadata(): array
    {
        return [
            'name'        => 'My Gateway',
            'slug'        => 'my-gateway',
            'version'     => '1.0.0',
            'description' => 'My custom payment gateway.',
            'author'      => 'Your Name',
            'type'        => 'gateway',
        ];
    }

    public function capabilities(): array
    {
        return [Capability::GATEWAY];
    }

    public function register(EventManager $events, Container $container): void
    {
        // Register hooks here if needed.
        // Gateway adapters typically leave this blank.
    }

    public function boot(Container $container): void
    {
        // GatewayBridge registration is handled automatically by PluginLoader.
        // Leave blank unless you need container services at boot time.
    }

    public function deactivate(Container $container): void {}

    public function uninstall(Container $container): void
    {
        // Drop any plugin-owned tables here (e.g., op_plugin_my_gateway_logs).
    }

    /**
     * Admin configuration fields. These are rendered in the gateway settings form.
     * Field types: text, password, select, toggle, textarea.
     */
    public function fields(): array
    {
        return [
            [
                'name'     => 'api_key',
                'label'    => 'API Key',
                'type'     => 'password',
                'required' => true,
            ],
            [
                'name'     => 'mode',
                'label'    => 'Mode',
                'type'     => 'select',
                'options'  => ['sandbox' => 'Sandbox', 'live' => 'Live'],
                'required' => true,
            ],
        ];
    }

    // ─── GatewayAdapterInterface ─────────────────────────────────────────────

    public function slug(): string
    {
        return 'my-gateway';
    }

    public function initiate(array $params, array $credentials): array
    {
        // $params guaranteed keys: amount (string), currency, trx_id, redirect_url, cancel_url
        // $credentials: decrypted key-value array from GatewayBridge::decryptCredentials()
        // Return: redirect_url (string) OR form_html (string) OR session_id (string)
    }

    public function verify(array $callbackData, array $credentials): array
    {
        // ALWAYS verify server-side with the gateway API.
        // NEVER trust the callback payload's amount or status fields directly.
        // Return: ['success' => bool, 'gateway_trx_id' => string, 'amount' => string|null, 'status' => string]
    }

    public function verifyWebhook(string $rawBody, array $headers, array $credentials): bool
    {
        // Validate the inbound webhook signature. Return false to reject.
    }

    public function refund(string $gatewayTrxId, string $amount, array $credentials): array
    {
        // Return: ['success' => bool, 'refund_id' => string|null, 'error' => string|null]
    }

    public function supports(string $feature): bool
    {
        return match ($feature) {
            'refund', 'verification' => true,
            default                  => false,
        };
    }

    public function supportedCurrencies(): array
    {
        return []; // Empty = accepts any currency.
    }
}
```

---

## 5. Method Contracts

### `initiate(array $params, array $credentials): array`

Called by `GatewayBridge::initiate()` to start a payment session. The `$params` array has this guaranteed shape:

```php
[
    'amount'       => '150.00',      // BCMath-safe decimal string
    'currency'     => 'USD',         // ISO 4217 code
    'trx_id'       => 'OP-20240701-ABCD', // OwnPay internal transaction ID
    'redirect_url' => 'https://pay.example.com/checkout/callback?session=...',
    'cancel_url'   => 'https://pay.example.com/checkout/cancel',
    'metadata'     => [],            // Optional extra data
]
```

**Important**: The `gateway.capture.before` filter runs on `$params` before your method is called, allowing other plugins to augment the data. Your return value must be one of:

```php
// Option 1 - Redirect the user to a hosted payment page
return ['redirect_url' => 'https://gateway.example.com/pay/SESSION_ID'];

// Option 2 - Render a self-hosted HTML form (posted to the gateway)
return ['form_html' => '<form method="POST" action="https://gateway.example.com/pay">...</form>'];

// Option 3 - Return a session identifier for JS-based checkout SDKs
return ['session_id' => 'SESSION_ID_FROM_GATEWAY', 'redirect_url' => null];
```

**Amount Conversion**: Use the `toMinorUnits()` helper from `GatewayDefaults` for gateways that require integer cents:

```php
$amountCents = $this->toMinorUnits($params['amount']); // '150.00' → 15000
```

For gateways that accept decimal strings, use `toDecimalString()`:

```php
$amount = $this->toDecimalString($params['amount'], 2); // '150.00'
```

Never cast `$params['amount']` to `float` - floating-point arithmetic corrupts large values.

---

### `verify(array $callbackData, array $credentials): array`

Called to confirm a payment after the user returns from the gateway or a webhook arrives.

> **Security Rule**: Never trust the payment status from `$callbackData`. Always make a server-to-server API call to the gateway to retrieve the true payment status. This prevents forged callback attacks.

```php
public function verify(array $callbackData, array $credentials): array
{
    $sessionId = (string) ($callbackData['session_id'] ?? '');
    if ($sessionId === '') {
        return ['success' => false, 'gateway_trx_id' => '', 'status' => 'failed'];
    }

    // Server-side verification - the only source of truth
    $response = $this->callGatewayApi('/sessions/' . urlencode($sessionId), $credentials);

    $paid = ($response['status'] ?? '') === 'paid';
    return [
        'success'        => $paid,
        'gateway_trx_id' => (string) ($response['id'] ?? ''),
        'amount'         => $paid ? (string) ($response['amount'] ?? null) : null,
        'status'         => $paid ? 'completed' : 'failed',
    ];
}
```

**Return Shape**:

| Key | Type | Required | Description |
|---|---|---|---|
| `success` | `bool` | ✅ | Whether the payment was successful. |
| `gateway_trx_id` | `string` | ✅ | The gateway's own transaction/payment identifier. |
| `amount` | `string\|null` | ❌ | Confirmed amount in major units (e.g., `"150.00"`). |
| `status` | `string` | ✅ | Status string: `completed`, `failed`, `pending`, etc. |
| `trx_id` | `string` | ❌ | Echo back OwnPay's `trx_id` from metadata if available. |

---

### `verifyWebhook(string $rawBody, array $headers, array $credentials): bool`

Called by `GatewayBridge::verifyWebhookSignature()` before the webhook payload is processed.

Use `hash_equals()` for all HMAC comparisons - never `===`. Include replay protection by rejecting stale timestamps.

**Stripe HMAC-SHA256 pattern** (from `StripeGateway::verifyWebhook()`):

```php
public function verifyWebhook(string $rawBody, array $headers, array $credentials): bool
{
    $secret = $credentials['webhook_secret'] ?? '';
    if ($secret === '') {
        return false; // Fail closed - no secret means reject all webhooks
    }

    $sigHeader = $headers['Stripe-Signature'] ?? $headers['stripe-signature'] ?? '';
    if ($sigHeader === '') {
        return false;
    }

    // Parse "t=timestamp,v1=signature"
    $parts = [];
    foreach (explode(',', $sigHeader) as $item) {
        $kv = explode('=', $item, 2);
        if (count($kv) === 2) {
            $parts[trim($kv[0])] = trim($kv[1]);
        }
    }

    $timestamp   = $parts['t']  ?? '';
    $expectedSig = $parts['v1'] ?? '';

    if ($timestamp === '' || $expectedSig === '') {
        return false;
    }

    // Replay protection - reject if older than 5 minutes
    if (abs(time() - (int) $timestamp) > 300) {
        return false;
    }

    $computed = hash_hmac('sha256', $timestamp . '.' . $rawBody, $secret);
    return hash_equals($computed, $expectedSig);
}
```

---

### `refund(string $gatewayTrxId, string $amount, array $credentials): array`

`$gatewayTrxId` is the value your `verify()` method returned as `gateway_trx_id`. `$amount` is a BCMath-safe decimal string.

```php
public function refund(string $gatewayTrxId, string $amount, array $credentials): array
{
    $amountCents = $this->toMinorUnits($amount);
    // ... call gateway refund API ...
    return [
        'success'   => $success,
        'refund_id' => $refundId,
        'error'     => $errorMessage,
    ];
}
```

If your gateway does not support refunds, either use the `GatewayDefaults` trait's default implementation, or override `supports('refund')` to return `false`. OwnPay uses `supports()` to determine whether to show the refund UI.

---

### `supports(string $feature): bool`

Declare which optional features your gateway provides:

| Feature String | What it enables in the UI |
|---|---|
| `refund` | Refund button shown on completed transactions. |
| `recurring` | Subscription/recurring billing UI. |
| `partial` | Partial refund amount input. |
| `verification` | Server-side verify API is available. |

---

## 6. Multi-File Plugins

To ship additional PHP classes (e.g., a `Http/Client.php`, `Service/SessionStore.php`), declare a `namespace` in `manifest.json`. The `PluginLoader` registers your namespace via a custom PSR-4 `spl_autoload_register` handler, mapping `{namespace}\{SubClass}` to `{plugin_dir}/{SubClass}.php`.

**Example**: If your `manifest.json` declares `"namespace": "OwnPay\\Modules\\Gateways\\MyGateway"`, then the class `OwnPay\Modules\Gateways\MyGateway\Http\Client` autoloads from `modules/gateways/my-gateway/Http/Client.php`.

The autoloader enforces directory containment using `realpath()` - a crafted class name cannot escape the plugin directory.

---

## 7. Database Migrations

Create a `migrations/` directory inside your plugin root. Files must use the `.sql` extension and be named so they sort in execution order (e.g., `001_create_logs.sql`).

Rules enforced by `PluginMigrator`:
- Statements are split on `;` and executed inside a database transaction.
- Executed migrations are tracked in `op_plugin_migrations` by `(plugin_slug, migration, batch)`.
- Each activation re-runs only **pending** (not yet executed) files.
- Rollback files must be named `001_create_logs.down.sql`.

**Table naming**: Plugin tables **must** be prefixed with `op_plugin_` (e.g., `op_plugin_my_gateway_logs`). `PluginSandbox::validateSql()` blocks access to any `op_*` table that is **not** prefixed with `op_plugin_`.

```sql
-- migrations/001_create_my_gateway_logs.sql
CREATE TABLE IF NOT EXISTS op_plugin_my_gateway_logs (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    merchant_id INT UNSIGNED    NOT NULL,
    trx_id      VARCHAR(128)    NOT NULL,
    request     JSON            DEFAULT NULL,
    response    JSON            DEFAULT NULL,
    created_at  DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_merchant_trx (merchant_id, trx_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 8. Content Security Policy

If your gateway loads external JavaScript (e.g., Stripe.js, PayPal SDK), declare the required domains in `csp` inside `manifest.json`. OwnPay merges these with the base CSP when `SecurityHeadersMiddleware` fires the `checkout.csp.sources` filter:

```json
"csp": {
  "script_src":  ["https://js.stripe.com"],
  "connect_src": ["https://api.stripe.com"]
}
```

Without declaring these, the browser will block external scripts with a Content Security Policy violation.

---

## 9. Hooks Available to Gateway Plugins

| Hook | Type | When | Common Use |
|---|---|---|---|
| `gateway.capture.before` | Filter | Before `initiate()` | Modify `$params` (amount, metadata). |
| `gateway.capture.after` | Action | After `initiate()` | Log the payment attempt. |
| `payment.transaction.completed` | Action | Transaction marked paid | Post-payment notifications. |
| `payment.transaction.failed` | Action | Transaction declined | Alert the merchant. |
| `checkout.head` | Action | Checkout `<head>` | Inject gateway JS SDK. |
| `checkout.footer` | Action | Checkout `<footer>` | Inject SDK init scripts. |
| `checkout.csp.sources` | Filter | CSP header build | Whitelist gateway domains. |

Register hooks in the `register()` method:

```php
public function register(EventManager $events, Container $container): void
{
    $events->addAction('gateway.capture.after', function (string $slug, array $result) use ($container): void {
        if ($slug !== 'my-gateway') {
            return;
        }
        // Log the attempt to op_plugin_my_gateway_logs ...
    }, priority: 10);
}
```

---

## 10. Security Requirements

| Rule | Detail |
|---|---|
| **Never trust callback data** | Always verify payment status server-side via the gateway API. |
| **Use `hash_equals()`** | All HMAC and signature comparisons must use timing-safe comparison. |
| **Replay protection** | Reject webhook timestamps older than 5 minutes. |
| **Fail closed** | If `webhook_secret` is missing, `verifyWebhook()` must return `false`. |
| **No `eval()`** | `PluginLoader` token-scans every PHP file. `eval()` causes load failure. |
| **No OS commands** | `exec()`, `shell_exec()`, `system()`, `passthru()`, `popen()`, `proc_open()`, `pcntl_exec()`, `dl()` are blocked by `PluginSandbox::isDangerousFunction()`. |
| **No `op_*` table access** | Direct queries to core OwnPay tables are blocked by `PluginSandbox::validateSql()`. Use `op_plugin_` prefixed tables only. |
| **Credential storage** | Never store credentials in files. They are encrypted at rest via `FieldEncryptor` and decrypted by `GatewayBridge` before passing to your methods. |

---

## 11. Installation and Activation

1. **Package** your plugin directory as a ZIP archive. The root of the ZIP must contain (or have one subdirectory containing) `manifest.json`.
2. **Upload** via Admin → Gateways → "Install Plugin" - `PluginInstaller::installFromZip()` validates and extracts the archive to `modules/gateways/{slug}/`.
3. **Activate** via the gateway list. Activation runs pending migrations from `migrations/` and calls `PluginInterface::register()` + `boot()` on subsequent requests.
4. **Configure** credentials via the gateway settings form. The `fields()` array drives the rendered form. On save, values are AES-encrypted and stored in `op_gateway_configs`.

**Blocked file extensions**: `.phar`, `.sh`, `.bat`, `.exe`, `.dll` are rejected during ZIP extraction.

---

## 12. Checklist

- [ ] `manifest.json` present with all required fields; `slug` matches the directory name.
- [ ] `namespace` declared; entrypoint class in the correct namespace.
- [ ] Entrypoint implements both `PluginInterface` and `GatewayAdapterInterface`.
- [ ] `slug()` returns the exact value declared in `manifest.json`.
- [ ] `initiate()` returns a valid response shape (`redirect_url`, `form_html`, or `session_id`).
- [ ] `verify()` makes a server-side API call - never trusts callback data alone.
- [ ] `verifyWebhook()` uses `hash_equals()` and enforces a timestamp replay window.
- [ ] `refund()` handles the `success: false` case gracefully.
- [ ] `supports()` accurately reflects what the gateway implements.
- [ ] Plugin tables use the `op_plugin_` prefix.
- [ ] No use of `eval()`, `exec()`, `shell_exec()`, or equivalent functions.
- [ ] CSP domains declared in `manifest.json` for any external JS SDK.
- [ ] `icon.svg` provided for display in the admin panel.
