---
title: WordPress WooCommerce Integration
---

# WordPress WooCommerce Integration

This guide explains how to integrate OwnPay as a payment gateway in a **WordPress WooCommerce** store using the OwnPay Gateway Plugin for WooCommerce.

## Prerequisites

- WordPress 6.0+
- WooCommerce 8.0+
- PHP 8.2+
- An OwnPay instance (self-hosted) with a valid API key
- OwnPay Gateway Plugin for WooCommerce - download from [GitHub Releases](https://github.com/own-pay/OwnPay-WordPress/releases/)

## How It Works

```
Customer Checkout
       │
       ▼
 WooCommerce Order Created
       │
       ▼
 OwnPay Plugin → POST /api/v1/payment-intents
       │
       ▼
 Customer Redirected → OwnPay Checkout Page
       │
       ▼
 Payment Completed / Failed
       │
       ▼
 OwnPay Webhook → WooCommerce Order Status Updated
```

The plugin creates a payment intent via the OwnPay REST API, redirects the customer to the OwnPay hosted checkout, and listens to webhook callbacks to update the WooCommerce order status automatically.

## Installation

### Step 1 - Install the Plugin

**Option A: Upload ZIP manually**

1. Download the latest plugin ZIP from [GitHub Releases](https://github.com/own-pay/OwnPay-WordPress/releases/)
2. Go to **WordPress Admin → Plugins → Add New → Upload Plugin**
3. Upload the ZIP and click **Install Now**
4. Click **Activate Plugin**

**Option B: Install via WP-CLI**

```bash
wp plugin install ownpay-woocommerce --activate
```

### Step 2 - Configure the Gateway

1. Go to **WooCommerce → Settings → Payments**
2. Find **OwnPay** in the list and click **Manage**
3. Fill in the following fields:

| Field | Description |
|-------|-------------|
| **Enable/Disable** | Toggle to enable OwnPay at checkout |
| **Title** | Payment method label shown to customers (e.g. `Pay with OwnPay`) |
| **Description** | Short description shown on checkout page |
| **API Base URL** | Your OwnPay instance URL (e.g. `https://pay.yourdomain.com`) |
| **API Key** | Your OwnPay API key from Admin → Developer Hub |
| **Brand ID** | Your OwnPay brand/store ID |
| **Webhook Secret** | Secret key for verifying incoming webhooks |
| **Test Mode** | Enable to use sandbox environment |

4. Click **Save Changes**

### Step 3 - Configure Webhooks in OwnPay

1. Log in to your OwnPay Admin panel
2. Go to **Developer Hub → Webhooks**
3. Add a new webhook endpoint:

```
https://yourstore.com/?wc-api=ownpay_gateway
```

4. Select the following events:
   - `payment.transaction.completed`
   - `payment.transaction.failed`
   - `payment.transaction.cancelled`

5. Copy the generated **Webhook Secret** and paste it into the WooCommerce plugin settings

## Order Status Mapping

OwnPay payment events are automatically mapped to WooCommerce order statuses:

| OwnPay Event | WooCommerce Status |
|---|---|
| `payment.transaction.completed` | `processing` (or `completed` for virtual products) |
| `payment.transaction.failed` | `failed` |
| `payment.transaction.cancelled` | `cancelled` |
| `payment.intent.expired` | `cancelled` |

## Manual Webhook Verification

The plugin verifies every incoming webhook using the `X-OwnPay-Signature` header. Ensure your OwnPay Webhook Secret matches exactly in both the OwnPay Admin and WooCommerce settings.

```php
// The plugin performs this check internally:
$signature = hash_hmac('sha256', $rawBody, $webhookSecret);
if (!hash_equals($signature, $_SERVER['HTTP_X_OWNPAY_SIGNATURE'])) {
    status_header(401);
    exit('Invalid signature');
}
```

## Customization

### Change Redirect Behavior

By default, the plugin redirects customers to the OwnPay hosted checkout. To customize the redirect URL or add query parameters, use the `ownpay_redirect_url` filter:

```php
add_filter('ownpay_redirect_url', function (string $url, \WC_Order $order): string {
    return add_query_arg('ref', $order->get_order_key(), $url);
}, 10, 2);
```

### Customize Payment Intent Payload

To add extra metadata to the payment intent (e.g. customer tags or order notes), use the `ownpay_payment_intent_payload` filter:

```php
add_filter('ownpay_payment_intent_payload', function (array $payload, \WC_Order $order): array {
    $payload['metadata']['wc_order_id'] = $order->get_id();
    $payload['metadata']['customer_note'] = $order->get_customer_note();
    return $payload;
}, 10, 2);
```

### Customize Order Status on Completion

```php
add_filter('ownpay_completed_order_status', function (string $status, \WC_Order $order): string {
    // Mark downloadable orders as 'completed' immediately
    if ($order->has_downloadable_item()) {
        return 'completed';
    }
    return $status;
}, 10, 2);
```

## Troubleshooting

### Webhooks not received

- Ensure your OwnPay instance can reach `https://yourstore.com/?wc-api=ownpay_gateway` over the internet
- Check **WooCommerce → Status → Logs** and filter by `ownpay`
- Verify the Webhook Secret matches in both systems
- Confirm the events are selected in OwnPay Admin → Developer Hub → Webhooks

### Orders stuck in "Pending Payment"

This usually means the webhook was not delivered. You can manually sync an order:

1. Open the order in WooCommerce Admin
2. Click **OwnPay → Sync Payment Status** in the order meta box

Or via WP-CLI:

```bash
wp ownpay sync-order --order-id=1234
```

### SSL / CURL errors

If your OwnPay instance uses a self-signed certificate, add the following to `wp-config.php`:

```php
define('OWNPAY_VERIFY_SSL', false);
```

::: warning
Only disable SSL verification in local/development environments. Never use this in production.
:::

## Testing

Enable **Test Mode** in the plugin settings to use the OwnPay sandbox. Test transactions will not process real money but will trigger all webhooks and order status updates exactly as in production.

**Test credentials:**

| Field | Value |
|-------|-------|
| Test API Key | Available in OwnPay Admin → Developer Hub → Test Keys |
| Test Checkout | Triggered automatically when Test Mode is on |

## See Also

- [PHP SDK Integration →](/developer/integration/php)
- [Node.js SDK Integration →](/developer/integration/nodejs)
- [Webhooks Setup →](/developer/webhooks)
- [OwnPay Plugin Marketplace →](https://plugins.ownpay.org)
