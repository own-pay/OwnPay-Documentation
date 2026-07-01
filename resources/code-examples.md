---
title: Code Examples
---

# Code Examples & Snippets

A collection of implementation examples and code snippets for common OwnPay integration patterns.

---

## 1. Creating a Payment Intent

These examples show how to call `POST /payments` to start a checkout flow and get the `checkout_url`.

::: code-group

```php [PHP]
<?php
// Initialize parameters
$baseUrl = 'https://pay.yourbrand.com/api/v1';
$apiKey = 'op.xxxxx.xxxxxx';

$payload = [
    'amount' => '500.00',
    'currency' => 'BDT',
    'callback_url' => 'https://my-store.com/webhooks/ownpay',
    'redirect_url' => 'https://my-store.com/checkout/success',
    'cancel_url' => 'https://my-store.com/checkout/cancel',
    'customer_email' => 'customer@example.com',
    'customer_name' => 'John Doe',
    'reference' => 'ORDER-10024'
];

// Execute request
$ch = curl_init("$baseUrl/payments");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $apiKey,
    'Content-Type: application/json',
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$result = json_decode($response, true);

if ($httpCode === 201 && ($result['success'] ?? false)) {
    $checkoutUrl = $result['data']['checkout_url'];
    // Redirect the customer to $checkoutUrl
    header("Location: $checkoutUrl");
    exit;
} else {
    echo "Error creating payment: " . ($result['error'] ?? 'Unknown error');
}
```

```javascript [Node.js]
const axios = require('axios');

const baseUrl = 'https://pay.yourbrand.com/api/v1';
const apiKey = 'op.xxxxx.xxxxxx';

async function createPayment() {
  try {
    const response = await axios.post(`${baseUrl}/payments`, {
      amount: '500.00',
      currency: 'BDT',
      callback_url: 'https://my-store.com/webhooks/ownpay',
      redirect_url: 'https://my-store.com/checkout/success',
      cancel_url: 'https://my-store.com/checkout/cancel',
      customer_email: 'customer@example.com',
      customer_name: 'John Doe',
      reference: 'ORDER-10024'
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('Checkout URL:', response.data.data.checkout_url);
      console.log('Payment ID:', response.data.data.payment_id);
    }
  } catch (error) {
    console.error('Error:', error.response?.data?.error || error.message);
  }
}

createPayment();
```

```python [Python]
import requests

base_url = "https://pay.yourbrand.com/api/v1"
api_key = "op.xxxxx.xxxxxx"

payload = {
    "amount": "500.00",
    "currency": "BDT",
    "callback_url": "https://my-store.com/webhooks/ownpay",
    "redirect_url": "https://my-store.com/checkout/success",
    "cancel_url": "https://my-store.com/checkout/cancel",
    "customer_email": "customer@example.com",
    "customer_name": "John Doe",
    "reference": "ORDER-10024"
}

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

response = requests.post(f"{base_url}/payments", json=payload, headers=headers)
result = response.json()

if response.status_code == 201 and result.get("success"):
    checkout_url = result["data"]["checkout_url"]
    print(f"Redirecting user to: {checkout_url}")
else:
    print(f"Error: {result.get('error', 'Unknown error')}")
```

```bash [cURL]
curl -X POST https://pay.yourbrand.com/api/v1/payments \
  -H "Authorization: Bearer op.xxxxx.xxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "500.00",
    "currency": "BDT",
    "callback_url": "https://my-store.com/webhooks/ownpay",
    "redirect_url": "https://my-store.com/checkout/success",
    "cancel_url": "https://my-store.com/checkout/cancel",
    "customer_email": "customer@example.com",
    "customer_name": "John Doe",
    "reference": "ORDER-10024"
  }'
```

:::

---

## 2. Webhook Signature Verification

Always verify webhook payloads using the webhook secret before acting on them.

::: code-group

```php [PHP]
<?php
// Your brand's Webhook Secret from Admin -> Developer Hub -> Webhooks
$webhookSecret = 'whsec_xxxxxxxxxxxxxxxxxxxx';

// Retrieve the raw body
$rawPayload = file_get_contents('php://input');

// Retrieve the X-OwnPay-Signature header
$signatureHeader = $_SERVER['HTTP_X_OWNPAY_SIGNATURE'] ?? '';

// Calculate the expected signature
$expectedSignature = hash_hmac('sha256', $rawPayload, $webhookSecret);

// Safe timing-attack-resistant comparison
if (!hash_equals($expectedSignature, $signatureHeader)) {
    http_response_code(401);
    exit('Invalid signature');
}

// Signature is valid, parse the event
$payload = json_decode($rawPayload, true);

if ($payload['event'] === 'payment.transaction.completed') {
    $transaction = $payload['data'];
    $orderRef = $transaction['reference'];
    $amount = $transaction['amount'];
    
    // Fulfill the order
    // ...
}

http_response_code(200);
echo 'OK';
```

```javascript [Node.js (Express)]
const express = require('express');
const crypto = require('crypto');
const app = express();

const webhookSecret = 'whsec_xxxxxxxxxxxxxxxxxxxx';

// Middleware to parse raw body
app.post('/webhooks/ownpay', express.raw({ type: 'application/json' }), (req, res) => {
  const signatureHeader = req.headers['x-ownpay-signature'];
  if (!signatureHeader) {
    return res.status(401).send('Missing signature header');
  }

  // Calculate HMAC-SHA256 signature
  const hmac = crypto.createHmac('sha256', webhookSecret);
  hmac.update(req.body);
  const expectedSignature = hmac.digest('hex');

  // Verify signature safely
  const isValid = crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'utf8'),
    Buffer.from(signatureHeader, 'utf8')
  );

  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }

  // Parse body after verification
  const payload = JSON.parse(req.body.toString());
  
  if (payload.event === 'payment.transaction.completed') {
    const transaction = payload.data;
    console.log(`Fulfilling order ${transaction.reference} for ${transaction.amount} ${transaction.currency}`);
    // Fulfill order here
  }

  res.status(200).send('OK');
});

app.listen(3000, () => console.log('Listening on port 3000'));
```

:::

---

## 3. Querying Transaction Status

Use this pattern to query the server directly when a customer returns to your success page, instead of relying solely on webhooks.

```php
<?php
$baseUrl = 'https://pay.yourbrand.com/api/v1';
$apiKey = 'op.xxxxx.xxxxxx';
$paymentId = 'a810b445-564a-4e20-80a5-f1261d7b328a'; // UUID from payment intent

$ch = curl_init("$baseUrl/payments/$paymentId");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $apiKey,
    'Accept: application/json'
]);

$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);

if ($result['success'] ?? false) {
    $payment = $result['data'];
    
    switch ($payment['status']) {
        case 'completed':
            echo "Payment completed! Transaction ID: " . $payment['trx_id'];
            break;
        case 'processing':
            echo "Payment is processing, awaiting confirmation.";
            break;
        case 'failed':
            echo "Payment failed.";
            break;
        default:
            echo "Payment status: " . $payment['status'];
            break;
    }
}
```

---

## 4. OwnPay Hook System (Plugin Development)

If you are developing a custom plugin or addon inside OwnPay, use these filters and actions to tap into the core execution pipeline.

### Apply a Custom Fee Filter

Modify the amount before it gets processed.

```php
use OwnPay\Event\EventManager;

EventManager::addFilter('payment.amount', function(string $amount, array $payment): string {
    // Add a 2% convenience fee if payment is processed on a credit card gateway
    if (($payment['gateway'] ?? '') === 'stripe-card') {
        // Always use bcmath for precision money operations!
        return bcmul($amount, '1.02', 2);
    }
    return $amount;
}, 10, 2);
```

### Listen to Completed Payments Action

Trigger background notifications when a transaction succeeds.

```php
use OwnPay\Event\EventManager;

EventManager::addAction('payment.completed', function(array $transaction): void {
    $email = $transaction['customer']['email'] ?? null;
    $amount = $transaction['amount'];
    $currency = $transaction['currency'];

    if ($email) {
        // Send a custom invoice receipt email
        mail($email, "Payment Received", "Thank you for your payment of $amount $currency.");
    }
}, 10, 1);
```
