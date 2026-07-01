# Developer Quickstart

Get started with OwnPay API integration in **5 minutes**.

---

## Step 1: Generate Your API Key

1. Log in to your OwnPay admin panel
2. Go to **Developers** (or your profile → **Developer Hub**)
3. Click **Generate API Key**
4. Choose **Full Access** (or **Read-Only** for testing)
5. Copy both the **Public Key** and **Secret Key** - you'll need them

Your keys look like:

```
Public Key:  op_live_abc123xyz...
Secret Key:  op_secret_def456...
```

::: warning Keep Keys Safe
Never commit API keys to git. Use environment variables instead:

```bash
OWNPAY_PUBLIC_KEY=op_live_...
OWNPAY_SECRET_KEY=op_secret_...
```

:::

---

## Step 2: Choose Your SDK

### PHP Developers

```bash
composer require ownpay/php-sdk
```

Then in your code:

```php
use OwnPay\SDK\Client;

$client = new Client(
    publicKey:  $_ENV['OWNPAY_PUBLIC_KEY'],
    secretKey:  $_ENV['OWNPAY_SECRET_KEY'],
    baseUrl:    'https://yourdomain.com/api/v1'
);

// Create a payment
$payment = $client->payments()->create([
    'amount'       => 5000, // in cents (50.00)
    'currency'     => 'USD',
    'customer_email' => 'customer@example.com',
    'description'  => 'Order #123'
]);

echo "Payment ID: " . $payment['id'];
```

**Full guide:** [PHP SDK →](/developer/integration/php)

---

### Node.js Developers

```bash
npm install ownpay
```

Then in your code:

```javascript
import OwnPay from 'ownpay';

const ownpay = new OwnPay({
  publicKey:  process.env.OWNPAY_PUBLIC_KEY,
  secretKey:  process.env.OWNPAY_SECRET_KEY,
  baseUrl:    'https://yourdomain.com/api/v1'
});

// Create a payment
const payment = await ownpay.payments.create({
  amount:          5000, // in cents (50.00)
  currency:        'USD',
  customer_email:  'customer@example.com',
  description:     'Order #123'
});

console.log('Payment ID:', payment.id);
```

**Full guide:** [Node.js SDK →](/developer/integration/nodejs)

---

### Other Languages (cURL)

```bash
curl -X POST https://yourdomain.com/api/v1/payments \
  -H "Authorization: Bearer op_live_xxx..." \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "currency": "USD",
    "customer_email": "customer@example.com",
    "description": "Order #123"
  }'
```

---

## Step 3: Create Your First Payment

After creating a payment, you get back:

```json
{
  "success": true,
  "data": {
    "id": "pay_abc123...",
    "amount": 5000,
    "currency": "USD",
    "status": "pending",
    "checkout_url": "https://yourdomain.com/checkout/pay_abc123",
    "customer_email": "customer@example.com"
  }
}
```

**The `checkout_url` is where your customer makes the payment.**

---

## Step 4: Handle Webhooks

When your customer completes a payment, OwnPay sends a webhook to your endpoint.

### Configure Your Webhook Endpoint

1. Go to **Developers → Webhook Settings**
2. Enter your endpoint URL: `https://yourapp.com/webhooks/ownpay`
3. Copy the **Webhook Signing Secret**
4. Click **Save**

### Receive and Verify Webhook Events

**PHP Example:**

```php
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_OWNPAY_SIGNATURE'] ?? '';
$secret = $_ENV['OWNPAY_WEBHOOK_SECRET'];

// Verify the signature
$expectedSignature = hash_hmac('sha256', $payload, $secret);
if (!hash_equals($expectedSignature, $signature)) {
    http_response_code(401);
    exit('Unauthorized');
}

// Parse the event
$event = json_decode($payload, true);

// Handle the event
if ($event['type'] === 'payment.completed') {
    $paymentId = $event['data']['id'];
    $amount = $event['data']['amount'];
    
    // Update your database, send confirmation email, etc.
    updateOrder($paymentId, 'completed');
}

http_response_code(200);
```

**Node.js Example:**

```javascript
import crypto from 'crypto';

app.post('/webhooks/ownpay', express.json(), (req, res) => {
  const payload = JSON.stringify(req.body);
  const signature = req.headers['x-ownpay-signature'];
  const secret = process.env.OWNPAY_WEBHOOK_SECRET;

  // Verify the signature
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Handle the event
  const { type, data } = req.body;
  
  if (type === 'payment.completed') {
    updateOrder(data.id, 'completed');
  }

  res.json({ success: true });
});
```

**Full guide:** [Webhooks →](/developer/webhooks)

---

## Step 5: Test Your Integration

### Development / Sandbox Mode

1. In your admin panel, go to **Gateways**
2. Set the gateway to **Test Mode**
3. Use test card numbers like `4111 1111 1111 1111`
4. No real charges occur

### Test Card Numbers

| Card Type | Number | Outcome |
|-----------|--------|---------|
| Visa | 4111 1111 1111 1111 | Success |
| Mastercard | 5555 5555 5555 4444 | Success |
| Amex | 3782 822463 10005 | Success |
| Declined | 4000 0000 0000 0002 | Failure |

### Webhook Testing

Use tools like:

- [Webhook.cool](https://webhook.cool) - Temporary webhook URL for testing
- [Hookbin](https://hookbin.com) - Inspect webhook payloads
- [ngrok](https://ngrok.com) - Expose local server to the internet

---

## Common Tasks

### Get Payment Status

```php
$payment = $client->payments()->get('pay_abc123');
echo $payment['status']; // 'pending', 'completed', 'failed'
```

### List Transactions

```php
$transactions = $client->transactions()->list([
    'limit' => 50,
    'offset' => 0
]);
```

### Create a Payment Link

```php
$link = $client->paymentLinks()->create([
    'amount'        => 5000,
    'currency'      => 'USD',
    'description'   => 'Product Name',
    'expires_at'    => date('Y-m-d H:i:s', strtotime('+30 days'))
]);

echo "Share this link: " . $link['url'];
```

---

## Next Steps

- **[Full PHP SDK Guide →](/developer/integration/php)** - Complete API reference for PHP
- **[Full Node.js SDK Guide →](/developer/integration/nodejs)** - Complete API reference for Node.js
- **[Webhook Events →](/developer/webhooks)** - All webhook event types
- **[Build a Plugin →](/developer/plugin-types/gateway-development)** - Extend OwnPay with plugins
- **[API Error Codes →](https://docs.ownpay.org)** - Error handling reference

---

## API Quick Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/payments` | POST | Create a payment |
| `/payments/{id}` | GET | Get payment details |
| `/transactions` | GET | List transactions |
| `/payment-links` | POST | Create a payment link |
| `/webhooks/verify` | POST | Verify webhook signature |

**Full API reference:** [docs.ownpay.org](https://docs.ownpay.org)

---

## Troubleshooting

**"Invalid API key" error**
→ Verify your key is correct and hasn't expired. Regenerate if needed.

**Webhook not being received**
→ Check your firewall/security groups. OwnPay connects from your server IP.

**Payment shows "pending" forever**
→ Check that your cron job is running: `php public/index.php cron`

**CORS errors**
→ This is expected. Always make API calls from your backend, not the browser.

**Need more help?**
→ Check [Troubleshooting](/advanced-topics/troubleshooting) or open an issue on [GitHub](https://github.com/own-pay/OwnPay/issues).

---

**Finished? Celebrate! 🎉 You've successfully integrated OwnPay.**
