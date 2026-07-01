# Payment Flow Architecture

Understanding how OwnPay processes payments from start to finish.

## The Complete Payment Flow

```
Customer         OwnPay           Gateway          Customer
                                                   Bank
   │                │                │               │
   │─ Click "Pay" ─>│                │               │
   │                │                │               │
   │                │─ Create Payment│               │
   │                │    Intent      │               │
   │                │<─ Return URL ──│               │
   │                │                │               │
   │<─ Redirect to ─│                │               │
   │   Checkout     │                │               │
   │                │                │               │
   │─ Enter Card ──>│                │               │
   │                │─ Validate ────>│               │
   │                │                │─ Check ──────>│
   │                │                │<─ Approve ────│
   │                │<─ Success ─────│               │
   │<─ Success Page │                │               │
   │                │─ Record Payment│               │
   │                │   in Database  │               │
   │                │                │               │
   │                │─ Send Webhook ─>
   │                │   (if registered)
   │                │                │               │
   │<─ Confirmation │                │               │
   │   Email        │                │               │
```

## Payment States

Every payment goes through these states:

### 1. **Pending**

- Payment created
- Awaiting customer action
- Link sent or form displayed
- No funds charged yet

### 2. **Processing**

- Customer submitting payment
- Gateway validating
- No result yet from gateway
- Customer sees loading spinner

### 3. **Success**

- Gateway approved payment
- Funds authorized
- Transaction recorded
- Webhook sent (if configured)
- Customer sees success page

### 4. **Failed**

- Gateway declined payment
- Could be:
  - Insufficient funds
  - Invalid card
  - Fraud detection
  - Temporary network error
- Webhook sent (if configured)
- Customer can retry

### 5. **Refunded**

- Payment was successful
- Funds returned to customer
- Initiated by merchant
- Recorded in transaction history

### 6. **Disputed/Chargeback**

- Customer disputed payment
- Gateway initiated reversal
- Funds returned
- Recorded as chargeback

## Payment Methods

OwnPay supports multiple payment methods:

### Card Payments

- **Credit Cards** (Visa, Mastercard, AmEx)
- **Debit Cards**
- **Processed by payment gateway** (Stripe, PayPal, etc.)

### Digital Wallets

- **Apple Pay**
- **Google Pay**
- **PayPal**

### Local Payment Methods

- **Bank Transfer**
- **Mobile Money** (bKash, Nagad, GCash, etc.)
- **Cash on Delivery**
- **Manual Invoice**

### Bank-Level Integration

- **ACH Transfers** (US)
- **SEPA Transfers** (EU)
- **Direct Debit**

## Payment Creation

### Via Payment Link

1. Admin creates payment link
2. System generates unique URL
3. Customer visits URL
4. Checkout form displayed
5. Customer enters payment details
6. Payment processed

### Via Invoice

1. Admin creates invoice
2. System sends invoice via email
3. Customer clicks payment link
4. Checkout form displayed
5. Customer enters payment details
6. Payment processed

### Via API

1. Application creates payment intent
2. OwnPay returns checkout URL or token
3. Application displays payment form
4. Customer enters payment details
5. Payment processed
6. Webhook notifies application

### Via Hosted Checkout

1. Application redirects to OwnPay
2. Customer completes checkout on OwnPay
3. OwnPay redirects back to application
4. Application verifies payment
5. Confirms with customer

## Payment Processing

### Validation

- **Amount validation** - Must be > 0
- **Currency validation** - Supported currency
- **Customer validation** - Email or ID
- **Gateway validation** - Gateway available
- **Card validation** - Checksum verification

### Authorization

- **Send to gateway** - Format and encrypt
- **Gateway processes** - Real payment attempt
- **Bank approves/declines** - Authorization response
- **Record result** - Success or failure

### Confirmation

- **Record transaction** - In database
- **Generate receipt** - For customer
- **Send webhook** - To configured URL
- **Send email** - Confirmation to customer
- **Update inventory** - If applicable

## Webhooks

**Webhooks** notify your application of payment events in real-time.

### Setup

1. Go to **Developers → Webhooks**
2. Enter your webhook URL
3. OwnPay sends POST requests to this URL

### Events

OwnPay sends webhooks for:

- **payment.created** - Payment initiated
- **payment.completed** - Payment successful
- **payment.failed** - Payment declined
- **payment.refunded** - Payment refunded
- **payment.disputed** - Chargeback filed

### Webhook Data

```json
{
  "type": "payment.completed",
  "data": {
    "id": "pay_abc123",
    "amount": 5000,
    "currency": "USD",
    "status": "completed",
    "customer_email": "john@example.com",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### Verification

Every webhook includes a signature:

- **Header:** `X-OwnPay-Signature`
- **Value:** HMAC-SHA256 of payload
- **Verify:** Confirm signature matches
- **Purpose:** Ensure webhook authenticity

### Best Practices

- ✅ Verify webhook signatures
- ✅ Idempotent processing (handle duplicates)
- ✅ Return 2xx status quickly
- ✅ Process async (don't block response)
- ✅ Log all webhooks
- ✅ Retry on failure

## Error Handling

### Common Errors

| Error | Reason | Solution |
|-------|--------|----------|
| **Insufficient Funds** | Account doesn't have balance | Use different card |
| **Expired Card** | Card past expiration | Use valid card |
| **Invalid CVV** | CVV doesn't match card | Enter correct CVV |
| **Fraud Detected** | Payment flagged as suspicious | Contact bank or retry |
| **Gateway Unavailable** | Payment processor down | Retry later |
| **Network Timeout** | Connection issue | Retry payment |

### Handling Failures

1. **Check error message** - Understand why failed
2. **Notify customer** - Show clear message
3. **Log error** - For debugging
4. **Allow retry** - Customer can try again
5. **Contact support** - If persistent

## Security

### Data Protection

- **Encrypted in transit** - HTTPS/TLS
- **Encrypted at rest** - In database
- **No storage** - Card data never stored
- **PCI compliant** - Meets security standards

### Best Practices

- ✅ Always use HTTPS
- ✅ Never log sensitive data
- ✅ Verify webhooks
- ✅ Use API keys securely
- ✅ Rotate API keys regularly
- ✅ Monitor suspicious activity

## Payment Status Checks

### Via Admin Panel

1. Go to **Payments → Transactions**
2. Find payment by ID or customer
3. View current status
4. See payment details

### Via API

```
GET /api/v1/payments/{id}
```

Returns:

- Payment status
- Amount and currency
- Customer information
- Payment method
- Timestamps
- Error messages (if failed)

## Reconciliation

### Daily Reconciliation

1. Compare OwnPay transactions with gateway
2. Verify amounts match
3. Check for discrepancies
4. Report any mismatches

### Monthly Reconciliation

1. Run financial reports
2. Compare with bank statements
3. Verify settlement amounts
4. Reconcile fees and charges

## Performance Considerations

### Response Times

- **Payment creation:** <100ms
- **Gateway authorization:** 1-5 seconds
- **Webhook delivery:** <1 second
- **Database recording:** <50ms

### Optimization

- Use **connection pooling**
- Enable **caching** for lookups
- Process webhooks **asynchronously**
- Use **batch operations** when possible
- Monitor **database performance**

## Summary

The payment flow in OwnPay:

1. **Customer initiates** payment
2. **OwnPay creates** transaction
3. **Gateway processes** payment
4. **Bank authorizes** or declines
5. **OwnPay records** result
6. **Webhook notifies** application
7. **Customer receives** confirmation

Ready to process your first payment? → [Payment Links](/user-guide/payments/payment-links)
