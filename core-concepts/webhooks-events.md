# Webhooks and Events

Understanding OwnPay's event-driven architecture.

## What are Webhooks?

**Webhooks** are automatic HTTP POST requests that OwnPay sends to your server when events occur.

Instead of polling OwnPay asking "did anything happen?", OwnPay **pushes** notifications to you automatically.

### Benefits
- **Real-time** - Instant notification
- **Efficient** - No polling needed
- **Reliable** - Retry on failure
- **Verified** - Signature authentication

## Event Types

OwnPay fires events for:

### Payment Events
- `payment.created` - Payment initiated
- `payment.completed` - Payment successful
- `payment.failed` - Payment declined
- `payment.refunded` - Refund processed
- `payment.cancelled` - Payment cancelled
- `payment.disputed` - Chargeback filed

### Customer Events
- `customer.created` - Customer registered
- `customer.updated` - Customer data changed
- `customer.deleted` - Customer removed

### Gateway Events
- `gateway.added` - Gateway configured
- `gateway.updated` - Settings changed
- `gateway.removed` - Gateway deleted

### Settlement Events
- `settlement.completed` - Funds settled
- `settlement.failed` - Settlement failed
- `settlement.pending` - Awaiting settlement

## Setting Up Webhooks

### Configure Webhook Endpoint
1. Go to **Developers → Webhooks**
2. Enter your webhook URL (must be HTTPS)
3. Copy the webhook secret
4. Click **Save**

### Webhook URL Requirements
- **HTTPS only** - Must be secure
- **Public** - Accessible from internet
- **Fast** - Respond within 30 seconds
- **Idempotent** - Handle duplicate deliveries

### Test Webhook
1. Go to **Developers → Webhooks**
2. Click **Send Test**
3. Select event type
4. Check your logs for webhook

## Webhook Structure

### Request Format
```http
POST /webhooks/ownpay HTTP/1.1
Host: your-domain.com
Content-Type: application/json
X-OwnPay-Signature: sha256=abcd1234...
X-OwnPay-Timestamp: 1234567890

{
  "type": "payment.completed",
  "id": "evt_abc123",
  "created_at": "2024-01-15T10:30:00Z",
  "data": {
    "id": "pay_xyz789",
    "amount": 5000,
    "currency": "USD",
    "status": "completed",
    "customer_email": "john@example.com",
    "brand_id": "brand_123"
  }
}
```

### Request Headers
- `Content-Type: application/json` - JSON payload
- `X-OwnPay-Signature` - HMAC signature
- `X-OwnPay-Timestamp` - Unix timestamp
- `User-Agent: OwnPay/1.0` - Source identifier

## Signature Verification

**Critical:** Always verify webhook signatures to ensure authenticity.

### Verification Process
1. Get the signature from `X-OwnPay-Signature` header
2. Create signature string: `{timestamp}.{payload}`
3. Compute HMAC-SHA256 using your webhook secret
4. Compare computed vs received signature

### Example (PHP)
```php
$signature = $_SERVER['HTTP_X_OWNPAY_SIGNATURE'] ?? '';
$timestamp = $_SERVER['HTTP_X_OWNPAY_TIMESTAMP'] ?? '';
$payload = file_get_contents('php://input');

$secret = 'whsec_your_webhook_secret';
$expected = hash_hmac('sha256', "$timestamp.$payload", $secret);

if (!hash_equals($expected, $signature)) {
    die('Invalid signature');
}
```

### Example (Node.js)
```javascript
const crypto = require('crypto');

const signature = req.headers['x-ownpay-signature'];
const timestamp = req.headers['x-ownpay-timestamp'];
const payload = req.body;

const secret = 'whsec_your_webhook_secret';
const computed = crypto
  .createHmac('sha256', secret)
  .update(`${timestamp}.${JSON.stringify(payload)}`)
  .digest('hex');

if (computed !== signature) {
  return res.status(401).send('Invalid signature');
}
```

## Handling Webhooks

### Best Practices
1. **Verify signature** - Authentication
2. **Check event type** - Route to handler
3. **Process idempotently** - Handle duplicates
4. **Respond quickly** - Don't slow OwnPay
5. **Queue for async** - Process in background
6. **Log everything** - For debugging
7. **Return 2xx** - Tell OwnPay success

### Idempotent Processing
Webhooks may be delivered multiple times:

```php
// Check if already processed
$existing = Payment::where('event_id', $event['id'])->first();
if ($existing) {
    return response()->json(['status' => 'already processed']);
}

// Process the event
$payment = Payment::create([
    'event_id' => $event['id'],
    'amount' => $event['data']['amount'],
    ...
]);

return response()->json(['status' => 'processed']);
```

### Async Processing
Don't process webhooks synchronously:

```php
// Bad: Slow response
$this->sendEmail($customer);
$this->updateDatabase($payment);
return 'OK';

// Good: Fast response, async processing
Queue::push(new ProcessPayment($event));
return 'OK';
```

## Webhook Delivery

### Retry Logic
If your server doesn't respond with 2xx:
- **Retry 1:** After 30 seconds
- **Retry 2:** After 5 minutes
- **Retry 3:** After 30 minutes
- **Retry 4:** After 2 hours
- **Retry 5:** After 8 hours
- **Retry 6:** After 24 hours

After 6 failures, webhook is abandoned.

### Monitoring
1. Go to **Developers → Webhooks**
2. View **webhook history**
3. See delivery status:
   - ✅ **Delivered** - Success
   - ⏳ **Pending** - Awaiting retry
   - ❌ **Failed** - All retries exhausted

### Manual Retry
1. Go to **Developers → Webhooks**
2. Find failed webhook
3. Click **Retry**
4. OwnPay resends immediately

## Common Patterns

### Update Order on Payment
```javascript
app.post('/webhooks/ownpay', (req, res) => {
  const event = req.body;

  if (event.type === 'payment.completed') {
    const orderId = event.data.metadata.order_id;
    
    // Update order status
    Order.updateOne(
      { id: orderId },
      { status: 'paid', paid_at: new Date() }
    );
    
    // Send confirmation email
    sendConfirmationEmail(event.data.customer_email);
  }

  res.json({ received: true });
});
```

### Handle Refunds
```javascript
if (event.type === 'payment.refunded') {
  const payment = event.data;
  
  // Update order
  Order.updateOne(
    { payment_id: payment.id },
    { status: 'refunded', refund_date: new Date() }
  );
  
  // Restore inventory
  restoreInventory(payment.metadata.items);
  
  // Notify customer
  sendRefundNotification(payment.customer_email);
}
```

### Log All Events
```javascript
if (event.type.includes('payment')) {
  logger.info('Payment event', {
    type: event.type,
    payment_id: event.data.id,
    amount: event.data.amount,
    status: event.data.status,
    timestamp: event.created_at
  });
}
```

## Troubleshooting

### Webhook Not Received
**Check:**
1. Is webhook URL registered?
2. Is webhook secret correct?
3. Is endpoint accessible from internet?
4. Do firewall rules allow inbound?
5. Check webhook history for errors

### Webhook Signature Invalid
**Check:**
1. Is webhook secret correct?
2. Is timestamp recent (< 5 minutes)?
3. Are you parsing raw body correctly?
4. Are you using correct hash algorithm?

### Missing Webhooks
**Check:**
1. Are events enabled?
2. Check **webhook history**
3. Do payment events exist in logs?
4. Try **manual retry** to test endpoint

## Testing Webhooks

### Using Webhook.cool
1. Generate temporary webhook URL
2. Enter in OwnPay webhook settings
3. Send test webhook
4. Inspect webhook in Webhook.cool

### Local Testing with ngrok
```bash
# Start ngrok
ngrok http 3000

# Use the ngrok URL in OwnPay webhooks
# https://abc123.ngrok.io/webhooks/ownpay

# View requests in ngrok dashboard
```

### Development Patterns
- Use **test mode** for development
- Use **webhook.cool** or **ngrok** for local
- Use **staging environment** for pre-live
- Use **actual endpoint** for production

## Summary

Webhooks provide:
- ✅ **Real-time** notifications
- ✅ **Automatic** delivery with retries
- ✅ **Verified** with signatures
- ✅ **Flexible** event types

Ready to set up webhooks? → [Webhooks Setup](/developer/webhooks)
