# Payment Gateways

Understanding payment gateway integration in OwnPay.

## What is a Payment Gateway?

A **payment gateway** is a service that processes payments by:

1. Accepting customer payment information
2. Encrypting and transmitting to the payment processor
3. Receiving authorization from the bank
4. Returning result to OwnPay
5. Settling funds to your account

## Gateway Types

### Processor Gateways

Direct integrations with payment processors:

- **Stripe** - Cards, wallets, local payments
- **PayPal** - Cards, PayPal account, wallets
- **Square** - Cards, Apple Pay, Square Cash
- **2Checkout** - Cards, wallets, local payments
- **Razorpay** - Cards, UPI, wallets (India focus)

### Local Payment Gateways

Regional payment methods:

- **bKash** - Mobile money (Bangladesh)
- **Nagad** - Mobile payment (Bangladesh)
- **GCash** - Mobile payment (Philippines)
- **AliPay** - China payment method
- **WeChat Pay** - China payment method

### Bank Gateways

Direct bank integrations:

- **Bank Transfer** - ACH, SEPA, wire
- **Direct Debit** - Recurring bank payments
- **Open Banking** - PSD2, UKOA

### Custom Gateways

Build your own:

- Custom processor integration
- Proprietary payment method
- Legacy system integration
- Unique requirements

## Payment Methods

Each gateway supports different payment methods:

### Card Payments

- Visa
- Mastercard
- American Express
- Discover
- Diners Club
- JCB

### Digital Wallets

- Apple Pay
- Google Pay
- PayPal
- Amazon Pay

### Bank Payments

- Bank Transfer
- Direct Debit
- ACH (US)
- SEPA (EU)
- iDEAL (Netherlands)

### Mobile Money

- bKash
- Nagad
- GCash
- M-Pesa
- Vodafone M-Money

### Regional Methods

- China: AliPay, WeChat Pay
- India: UPI, NEFT
- Brazil: Pix
- Mexico: OXXO

## Gateway Configuration

### Adding a Gateway

1. Go to **Gateways → Payment Gateways**
2. Click **Add Gateway**
3. Select gateway type
4. Enter credentials:
   - API Key / Merchant ID
   - Secret Key
   - Account ID (if applicable)
5. Choose payment methods to enable
6. Set as primary (optional)
7. Click **Save**

### Gateway Credentials

Each gateway needs:

- **API Key** - Public identifier
- **Secret Key** - Private authentication
- **Merchant ID** - Account identifier
- **Endpoint URL** - Gateway address

⚠️ **Security:** Never share secret keys. Rotate them regularly.

### Test vs Live Mode

- **Test Mode** - Sandbox, no real charges
- **Live Mode** - Real transactions
- Use test mode during development
- Switch to live when ready

## Currency Support

### Multi-Currency

Each gateway may support:

- **USD, EUR, GBP** - Common currencies
- **100+ currencies** - Many gateways support
- **Automatic conversion** - Some gateways handle
- **Real-time rates** - Current exchange rates

### Configuration

1. Go to **Gateways → Currencies**
2. Add currencies you accept
3. Set exchange rates
4. Update rates periodically

## Settlement

### How Settlement Works

1. **Customer pays** → Funds captured
2. **OwnPay records** → Transaction logged
3. **Gateway batches** → Daily/weekly
4. **Gateway settles** → Funds to bank account
5. **Appears in bank** → 1-3 business days

### Settlement Times

- **Stripe** - 1-2 days
- **PayPal** - 1 day
- **Square** - Next business day
- **Razorpay** - 1 day (premium) / 2-3 days (standard)

### Settlement Fees

Most gateways charge:

- **Percentage fee** - 2-3.5% per transaction
- **Fixed fee** - $0.10-0.50 per transaction
- **Monthly fee** - $0-20 (enterprise)
- **Setup fee** - Usually waived

## Webhooks and Notifications

### Real-Time Updates

Gateways send webhooks when:

- Payment authorized
- Payment captured
- Refund processed
- Dispute filed
- Chargeback initiated

### OwnPay Processing

OwnPay receives webhooks:

1. Verifies signature authenticity
2. Updates transaction status
3. Triggers your webhooks
4. Sends customer notification

## Security Features

### PCI Compliance

- **Data encryption** - HTTPS/TLS
- **Tokenization** - Card data never stored
- **Fraud detection** - Real-time monitoring
- **3D Secure** - Additional authentication

### Fraud Prevention

- **AVS** (Address Verification) - Address matching
- **CVV** (Card Verification) - CVV validation
- **3D Secure** - Bank authentication
- **ML Detection** - Machine learning fraud detection

## Gateway Switching

### Adding Another Gateway

1. Configure new gateway
2. Set payment method preferences
3. Test with test transactions
4. Switch to live mode
5. Monitor for issues

### Switching Primary Gateway

1. Configure backup gateway
2. Migrate in phases:
   - Start directing 10% of traffic
   - Monitor success rates
   - Increase percentage gradually
   - Eventually move all traffic

### Load Balancing

Distribute payments across gateways:

- Payment method-based routing
- Random distribution
- Sequential rotation
- Custom logic

## Troubleshooting

### Payment Declined

**Cause:** Gateway or bank declined
**Solution:**

- Check error message from gateway
- Verify credentials are correct
- Ensure gateway is in live mode
- Check account balance/limits
- Try different payment method

### Webhook Not Received

**Cause:** Network, configuration, or validation issue
**Solution:**

- Check webhook URL is correct
- Verify webhook endpoint is accessible
- Check logs for incoming webhooks
- Verify signature validation logic
- Contact gateway support if still failing

### Settlement Delayed

**Cause:** Holdback, review, or processing
**Solution:**

- Check gateway dashboard
- Review account status
- Check for reserves/holdbacks
- Contact gateway support

## Best Practices

### Multiple Gateways

- ✅ Use **2+ gateways** for redundancy
- ✅ **Load balance** for reliability
- ✅ **Diversify** payment methods
- ✅ **Monitor** success rates

### Security

- ✅ Use **test mode** during development
- ✅ **Never log** sensitive data
- ✅ **Verify** webhook signatures
- ✅ **Rotate** API keys quarterly

### Monitoring

- ✅ **Track** success rates
- ✅ **Monitor** settlement times
- ✅ **Review** fees and rates
- ✅ **Alert** on failures

## Summary

Payment gateways in OwnPay:

- ✅ Support **100+ payment methods**
- ✅ Enable **worldwide payments**
- ✅ Provide **secure processing**
- ✅ Support **multiple gateways**

Ready to configure your gateway? → [Gateway Setup](/user-guide/gateways/gateways)
