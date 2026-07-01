# Brands and Stores

Understanding OwnPay's multi-tenancy model through brands and stores.

## What is a Brand?

A **brand** in OwnPay represents a complete, isolated merchant entity. Each brand has:

- **Own customers** - Separate customer database
- **Own gateways** - Independent payment processor configuration
- **Own settings** - Branding, email templates, checkout styles
- **Own staff** - Dedicated team members with role-based permissions
- **Own checkout** - White-labeled payment experience
- **Own domain** - Custom domain (optional)

## Multi-Tenancy Architecture

OwnPay is built on a **multi-tenant architecture**, meaning:

```
OwnPay Installation
├── Brand A (Acme Corp)
│   ├── Customers
│   ├── Transactions
│   ├── Staff Members
│   ├── Payment Gateways
│   └── Custom Settings
├── Brand B (TechCorp)
│   ├── Customers
│   ├── Transactions
│   ├── Staff Members
│   ├── Payment Gateways
│   └── Custom Settings
└── Brand C (StartupCo)
    ├── Customers
    ├── Transactions
    ├── Staff Members
    ├── Payment Gateways
    └── Custom Settings
```

Each brand operates independently with **complete data isolation**.

## Brand vs Store

### Brand

- **Top-level entity** in OwnPay
- Represents a **merchant or business**
- Has own **customers, transactions, staff**
- Each brand is **completely isolated**
- Can have multiple **stores** (optional)

### Store (Optional)

- **Sub-division** within a brand
- Used for **multiple physical locations** or **sales channels**
- Share the same **brand identity**
- Share **payment gateways and staff**
- Separate **product catalogs** and **reporting** (if applicable)

**Example:**

- **Brand:** "Acme Retail" (the company)
  - **Store 1:** New York location
  - **Store 2:** Los Angeles location
  - **Store 3:** Online shop

## Key Features

### Data Isolation

- One brand's data is **invisible** to other brands
- No cross-brand **customer leakage**
- No shared **transaction history**
- Complete **privacy guarantee**

### White-Labeling

Each brand can customize:

- **Logo and branding**
- **Color scheme**
- **Email templates**
- **Checkout appearance**
- **Landing page**
- **Custom domain** (yourpay.com instead of yourdomain.com/brand-a)

### Independent Configuration

Each brand manages independently:

- **Payment gateways** (Stripe, PayPal, bKash, etc.)
- **Currencies** and exchange rates
- **Email settings** (SMTP, templates)
- **SMS settings** (if enabled)
- **User roles** and permissions
- **Webhooks** and API keys

### Scalability

OwnPay can handle:

- **Dozens of brands** on one installation
- **Thousands of customers** per brand
- **Millions of transactions** across all brands
- **Multiple currencies** per brand
- **Multiple payment methods** per brand

## Use Cases

### SaaS Platform Operators

Host payment processing for multiple SaaS companies:

- Each company is a **brand**
- Each company has own **customers and transactions**
- White-label the checkout experience
- Charge per-brand or per-transaction

### Agencies

Manage payments for multiple clients:

- Each client is a **brand**
- Custom domains for each client
- White-labeled checkout
- Centralized billing and management

### Multi-Store Retailers

Manage multiple physical or online locations:

- **Brand** represents the company
- **Stores** represent locations
- Shared payment infrastructure
- Centralized reporting with per-store breakdown

### Enterprise Deployments

Large organizations with multiple divisions:

- Each division is a **brand**
- Independent payment processing
- Separate customer bases
- Unified management portal

## Creating a Brand

### Via Admin Panel

1. **Log in** to OwnPay admin
2. Go to **People → Brands**
3. Click **Add Brand**
4. Fill in:
   - **Brand Name** (e.g., "Acme Retail")
   - **Currency** (USD, EUR, etc.)
   - **Timezone**
   - **Contact Email**
5. Click **Create Brand**

### Initial Setup

After creating a brand:

1. **Assign yourself** as brand manager
2. **Configure payment gateway** (Gateways section)
3. **Customize branding** (Appearance section)
4. **Add staff** (People → Staff)
5. **Set up webhook** (if integrating)
6. **Create payment links** (start accepting payments)

## Brand Settings

### Basic Settings

- **Name** - Display name
- **Slug** - URL-safe identifier
- **Currency** - Default currency (USD, EUR, GBP, etc.)
- **Timezone** - For reports and timestamps
- **Contact Email** - Brand contact email

### Branding

- **Logo** - Brand image
- **Favicon** - Browser tab icon
- **Color Scheme** - Primary color for checkout
- **Landing Page** - Custom HTML/text
- **Email Templates** - Customized email designs

### Checkout Customization

- **Theme** - Light/dark checkout appearance
- **Language** - Checkout language
- **Payment Methods** - Which methods to display
- **Success Message** - Custom success page text
- **Failure Message** - Custom failure page text

### Advanced Settings

- **Custom Domain** - Point to your own domain
- **Webhook URL** - For payment notifications
- **API Keys** - For programmatic access
- **Metadata** - Custom data storage

## Brand Access Control

### Master Administrator

- Can create and manage **all brands**
- Can view **all transactions across brands**
- Can manage **all staff members**
- Full system access

### Brand Manager

- Can manage **assigned brand only**
- Can view **brand's transactions only**
- Can manage **brand's staff**
- Limited to brand scope

### Staff Member

- Can manage **assigned tasks** within brand
- Can view **relevant data** for their role
- Permissions defined by **role**

## Best Practices

### Organization

- Use **clear, consistent naming** for brands
- Use **appropriate timezones** for accurate reporting
- Set **correct currencies** upfront
- Document **brand purposes** internally

### Security

- **Assign limited roles** to staff
- Use **strong passwords** for brand managers
- **Rotate API keys** regularly
- **Monitor access logs** for unusual activity

### Customization

- Keep **branding consistent** with company identity
- Test **checkout appearance** before going live
- Use **professional email templates**
- Customize **success/failure pages** with contact info

### Scaling

- Plan for **multiple brands** upfront
- Use **clear naming conventions**
- Document **brand relationships**
- Monitor **resource usage** as brands grow

## Summary

Brands are the **core organizational unit** in OwnPay:

- ✅ **Isolated** from each other
- ✅ **Customizable** for white-labeling
- ✅ **Scalable** for growth
- ✅ **Manageable** through a single interface

Ready to create your first brand? → [First Steps](/getting-started/first-steps)
