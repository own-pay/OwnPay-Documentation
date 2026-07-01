# Frequently Asked Questions

Common questions about OwnPay.

## General

### What is OwnPay?

OwnPay is a **white-label payment platform** that lets you:

- Accept payments online
- Manage multiple payment gateways
- Process refunds and disputes
- Control user access with RBAC
- Customize branding and checkout

### Is OwnPay self-hosted or cloud?

OwnPay is **self-hosted**. You install it on your own server (shared hosting or VPS).

**Benefits:**

- ✅ Full control of data
- ✅ No recurring SaaS fees
- ✅ Customizable to your needs
- ✅ PCI compliance under your control

### Can I use OwnPay for my business?

Yes, OwnPay works for:

- ✅ E-commerce stores
- ✅ SaaS platforms
- ✅ Service businesses
- ✅ Digital product sales
- ✅ Donation platforms
- ✅ Invoicing

### How much does OwnPay cost?

**OwnPay is free** to download and use.

You pay:

- Hosting cost (server)
- Payment gateway fees (Stripe, PayPal, etc.)
- Optional: Enterprise support

## Installation & Setup

### What are OwnPay's system requirements?

**Minimum:**

- PHP 8.3+
- MySQL 5.7+ or MariaDB 10.3+
- 2GB RAM
- 20GB disk space
- HTTPS

**Recommended:**

- PHP 8.3+
- MySQL 8.0+ or MariaDB 10.5+
- 4GB+ RAM
- 50GB+ disk space
- Dedicated IP

### Can I install OwnPay on shared hosting?

Yes, if your host has:

- PHP 8.3+
- MySQL/MariaDB
- SSH access
- Writable storage/ directory

cPanel-based hosts usually work well.

### Do I need a domain name?

Yes, for HTTPS and custom checkout.

You can start with a **subdomain** (e.g., `pay.yourdomain.com`).

### How long does installation take?

Usually **15-30 minutes** via web installer:

1. Upload files
2. Visit `/install`
3. Follow prompts
4. Done

[Full instructions](../getting-started/installation.md)

## Payments

### What payment methods do you support?

**Out of the box:**

- Credit cards (Visa, Mastercard, Amex)
- Digital wallets (Apple Pay, Google Pay)
- PayPal
- Bank transfers

**Via plugins:**

- bKash (Bangladesh)
- Nagad (Bangladesh)
- GCash (Philippines)
- AliPay (China)
- WeChat Pay (China)
- 50+ more

### Which payment gateways can I use?

Popular gateways:

- Stripe
- PayPal
- Square
- 2Checkout
- Razorpay
- Custom gateways

[View all gateways](../core-concepts/gateways.md)

### Can I use multiple payment gateways?

Yes! You can:

- ✅ Configure 2+ gateways
- ✅ Load balance payments
- ✅ Use different methods per gateway
- ✅ Switch if one goes down

### What currencies do you support?

OwnPay supports **100+ currencies** including:

- USD, EUR, GBP
- INR, BDT, PHP
- CNY, JPY, SGD
- AUD, CAD, ZAR
- ...and many more

### How long until funds settle to my bank?

**Depends on gateway:**

- Stripe: 1-2 days
- PayPal: 1 day
- Square: Next business day
- Razorpay: 1 day (premium) or 2-3 days
- Bank transfer: 3-5 days

Check your gateway's settlement policy.

### Can customers save cards?

Yes, with support from your payment gateway:

- Stripe: Yes
- PayPal: Yes
- Square: Yes
- Others: Check documentation

OwnPay stores **tokenized references only**, never raw card data (PCI-compliant).

### Do you support subscriptions?

Not built-in, but you can:

- Create recurring payment links
- Use webhooks to handle renewals
- Build custom logic via API

## Gateways

### How do I add a payment gateway?

1. Go to **Gateways → Payment Gateways**
2. Click **Add Gateway**
3. Select gateway type (Stripe, PayPal, etc.)
4. Enter API credentials
5. Choose payment methods
6. Test and save

[Full instructions](../user-guide/gateways/gateways.md)

### Where do I find my API keys?

Each gateway is different:

- **Stripe:** [Dashboard → API Keys](https://dashboard.stripe.com/apikeys)
- **PayPal:** [App Center → Create App](https://developer.paypal.com/)
- **Square:** [Application Dashboard → Credentials](https://developer.squareup.com/apps)

Check your gateway's documentation for the exact path.

### Why is my gateway showing "Invalid Credentials"?

**Common causes:**

1. Wrong API key or secret
2. Copied from wrong environment (test vs live)
3. Key is truncated or has extra characters
4. Gateway account is suspended
5. Keys need to be rotated

**Solution:**

1. Go back to your gateway dashboard
2. Copy credentials again (fresh)
3. Paste carefully (check for spaces)
4. Test with a test payment
5. Contact gateway support if still failing

### Can I use test mode?

Yes, every gateway has:

- **Test mode** - No real charges, test cards only
- **Live mode** - Real transactions

Always test in test mode first!

**Test card for most gateways:**

```
4111 1111 1111 1111
Exp: 12/25
CVV: 123
```

### What if a payment fails?

OwnPay records the failure and shows:

- Error message from gateway
- Decline reason
- Customer can retry

Check [Payment Issues](./troubleshooting.md#payment-issues) for solutions.

## Users & Permissions

### How many users can I add?

Unlimited. Add as many team members as needed.

### Can I create custom roles?

Yes! Go to **People → Roles** and create roles with custom permissions.

**Example:** Create a "Support Team" role with:

- View Transactions
- Create Payment Link
- View Customers
- But NOT manage gateways or staff

[Learn more](../core-concepts/user-roles-permissions.md)

### Can I limit what users can see?

Yes, via roles:

- **Master Admin** - Everything
- **Brand Manager** - Their brand only
- **Staff** - Limited features
- **View Only** - Read-only
- **Custom** - Whatever you define

### How do I remove a user?

1. Go to **People → Staff**
2. Find user
3. Click **Remove**

User loses access immediately.

### Can I audit user actions?

Yes! Go to **Reports → Audit Log** to see:

- Who did what
- When they did it
- Changes to settings
- Payment actions

## Data

### Where is my data stored?

On **your own server**. OwnPay doesn't store your data.

You control:

- Server location
- Backups
- Access
- Compliance

### Can I export transaction data?

Yes, go to **Payments → Transactions** and click **Export**.

Formats:

- CSV (spreadsheet)
- JSON (integration)
- PDF (reports)

### Can I backup my data?

Yes! Use your hosting provider's backup tools, or:

```bash
# Backup database
mysqldump -u username -p dbname > backup.sql

# Backup files
zip -r backup.zip public/ src/ templates/ storage/
```

[Full backup guide](../resources/architecture.md)

### How do I delete a customer?

1. Go to **Customers**
2. Find customer
3. Click **Delete**

Customer data is removed (respects GDPR).

## Security

### Is OwnPay secure?

Yes, OwnPay includes:

- ✅ HTTPS/TLS encryption
- ✅ PCI compliance built-in
- ✅ Card data never stored (tokenized)
- ✅ Signature verification for webhooks
- ✅ RBAC for access control
- ✅ Audit logs for compliance

### Do you store credit card data?

**No.** OwnPay never stores:

- Card numbers
- Expiration dates
- CVV codes

Payment gateways handle card data. OwnPay only stores:

- Transaction ID (from gateway)
- Amount
- Status
- Metadata

### Is OwnPay PCI compliant?

Yes, OwnPay is **PCI-DSS compliant** by design:

- Card data never stored
- Payment gateway handles encryption
- HTTPS only
- Regular security audits

You maintain compliance by:

- Using HTTPS
- Keeping OwnPay updated
- Using strong passwords
- Monitoring access logs

### How do I enable two-factor authentication?

1. User goes to **Account → Security**
2. Click **Enable Two-Factor**
3. Scan QR code with authenticator app
4. Enter code to confirm
5. Save backup codes

### Should I rotate API keys?

Yes, rotate quarterly:

1. Create new API key
2. Update your application
3. Delete old key

[Security guide](./security-compliance.md)

## Webhooks & Integration

### What are webhooks?

Webhooks are **automatic notifications** sent to your app when:

- Payment succeeds
- Payment fails
- Refund processed
- Chargeback filed

Instead of polling, OwnPay **pushes** updates to you.

### How do I set up webhooks?

1. Go to **Developers → Webhooks**
2. Enter your webhook URL
3. Copy the secret
4. Click **Save**

OwnPay will send webhooks to that URL.

[Full setup guide](../core-concepts/webhooks-events.md)

### Why is my webhook not working?

**Check these:**

1. URL is HTTPS (not HTTP)
2. URL is accessible from internet
3. Your endpoint returns HTTP 2xx
4. Firewall allows inbound on port 443
5. Secret key is correct

[Webhook troubleshooting](./troubleshooting.md#webhook-issues)

### Can I test webhooks locally?

Yes, use **ngrok**:

```bash
# Start ngrok
ngrok http 3000

# Use ngrok URL in OwnPay
# https://abc123.ngrok.io/webhooks/ownpay

# View requests in ngrok dashboard
```

Or use [webhook.cool](https://webhook.cool) for temporary URLs.

[Testing guide](../core-concepts/webhooks-events.md#testing-webhooks)

### Can I integrate with my app?

Yes! OwnPay provides:

- **REST API** - Standard HTTP endpoints
- **SDKs** - PHP, Node.js, Python, Ruby, Java, Go
- **Webhooks** - Event notifications
- **Hosted checkout** - Payment form on OwnPay
- **Embedded checkout** - Payment form on your site

[Integration guides](../resources/integrations/)

## Branding & Customization

### Can I customize the checkout form?

Yes, you can customize:

- Logo
- Colors
- Fonts
- Email templates
- Confirmation pages

Go to **Settings → Branding**

### Can I use my own domain for checkout?

Yes! Configure a custom domain:

1. Go to **Settings → Domains**
2. Add your domain
3. Update DNS records
4. Verify domain
5. Use custom domain in payment links

[Full instructions](../user-guide/system/domains.md)

### Can I white-label OwnPay?

Yes! You can:

- Use your logo
- Use your colors
- Use your domain
- Customize emails
- Hide OwnPay branding

Your customers see **only your brand**.

### Can I change the email templates?

Yes! Go to **Settings → Email Templates** to customize:

- Payment confirmation
- Invoice emails
- Refund notifications
- Account invitations

### Can I add custom pages?

You can create custom landing pages using webhooks and your own application.

[Integration guide](../resources/integrations/)

## Support

### How do I get help?

**Free resources:**

- Documentation
- FAQ (this page)
- Troubleshooting guide

**Paid support:**

- [Enterprise Support](../resources/external-services/enterprise-support.md)
- Email: <support@ownpay.org>
- Phone: [Available in support plans]

### What's included in Enterprise Support?

- Phone support
- Email support
- Priority response times
- Setup assistance
- Custom development advice

### How do I report a security issue?

Email: <security@ownpay.org>

**Important:** Do NOT post security issues publicly. Report privately so we can fix before disclosure.

### Where can I suggest a feature?

Post on the [community forum](https://discuss.ownpay.org) or contact support.

## Advanced

### Can I create plugins?

Yes! OwnPay supports:

- **Gateway plugins** - Add payment methods
- **Addon plugins** - Extend functionality
- **Theme plugins** - Customize design

[Plugin development guide](../developer/plugins/overview.md)

### Can I customize the code?

Yes, but be careful:

- Fork the code if you plan heavy customization
- Keep a changelog of changes
- Update when new versions release
- Test thoroughly before deploying

### Can I run multiple OwnPay instances?

Yes! Each instance:

- Needs separate database
- Can have separate domain
- Can have separate payment gateways
- Useful for multi-region or multi-brand

### Can I migrate from another platform?

Maybe. It depends on:

- Your current platform
- Data structure
- Payment gateway compatibility

Contact support for migration help.

### How often should I update?

**Security updates:** Immediately (usually monthly)
**Feature updates:** When you need features (every 2-3 months)
**Never skip versions** - Always update step-by-step

[Version updates guide](../resources/external-services/version-registry.md)

## Summary

**Still have questions?**

- Check [Troubleshooting](./troubleshooting.md)
- Read [Documentation](../getting-started/)
- Contact [Support](../resources/external-services/enterprise-support.md)
