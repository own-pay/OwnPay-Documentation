# First Steps: Choose Your Path

After installing OwnPay, here's what to do next based on your role.

---

## 👨‍💼 I'm an Administrator

You manage the OwnPay platform, set up brands, configure payment gateways, and oversee the team.

**Your first steps:**

1. **Secure Your Account** (5 min)
   - Go to your profile and change your password to something strong
   - Enable Two-Factor Authentication for security

2. **Create Your First Brand** (5 min)
   - Navigate to **People → Brands**
   - Click **Add Brand** and fill in details (name, currency, timezone)
   - Assign yourself as the brand manager
   - **Read:** [Managing Brands](/user-guide/people/brands)

3. **Set Up a Payment Gateway** (10 min)
   - Go to **Gateways**
   - Click **Add Gateway** and choose your payment provider (Stripe, PayPal, bKash, etc.)
   - Enter your gateway credentials
   - Enable currencies you want to accept
   - **Read:** [Payment Gateways](/user-guide/gateways/gateways)

4. **Create Your First Payment Link** (5 min)
   - Navigate to **Payments → Payment Links**
   - Click **Create Payment Link**
   - Set amount, customer name, and description
   - Share the link with your customer to test it
   - **Read:** [Payment Links](/user-guide/payments/payment-links)

5. **Configure Basic Settings** (5 min)
   - Go to **System → Settings**
   - Update app name, timezone, and email settings
   - Set up SMS notifications if using mobile devices
   - **Read:** [System Settings](/user-guide/system/settings)

**What's Next?**

Continue with your role-specific path:

- [Manage Staff and Permissions →](/user-guide/people/staff)
- [Set Up Financial Reporting →](/user-guide/reports-finance/reports)
- [Enable Two-Factor Authentication →](/user-guide/auth/two-factor)

Or explore other sections:

- [Core Concepts](/core-concepts/) - Understand system architecture
- [Advanced Topics](/advanced-topics/) - Security, troubleshooting, scaling

---

## 👨‍💻 I'm a Developer

You integrate OwnPay with applications, handle webhooks, and extend functionality via plugins.

**Your first steps:**

1. **Get Your API Keys** (5 min)
   - Log in to OwnPay admin
   - Go to **Developers → API Keys** (or the Developer Hub in your account)
   - Generate a new API key pair
   - Copy your **Public Key** and **Secret Key** securely
   - **Read:** [API Authentication](/core-concepts/)

2. **Understand the Payment Flow** (15 min)
   - Learn how OwnPay processes payments end-to-end
   - Understand webhooks, callbacks, and event handling
   - Review status codes and error handling
   - **Read:** [Payment Flow Architecture](/core-concepts/payment-flow)

3. **Choose Your SDK** (5 min)
   - **PHP Projects:** Use the [PHP SDK](/developer/integration/php)
   - **Node.js Projects:** Use the [Node.js SDK](/developer/integration/nodejs)
   - **Other Languages:** Use the [REST API](/developer/)

4. **Follow the Developer Quickstart** (20 min)
   - Set up your SDK with your API keys
   - Make your first API request
   - Test payment creation
   - **Read:** [Developer Quickstart](/developer/quickstart)

5. **Set Up Webhooks** (10 min)
   - Learn what webhook events OwnPay fires
   - Configure webhook endpoints in your app
   - Test webhook delivery in development mode
   - **Read:** [Webhooks & Events](/developer/webhooks)

**Next learning goals:**

- [Build a Payment Form](/developer/integration/php) (example)
- [Handle Webhook Events](/developer/webhooks)
- [Deploy to Production](/advanced-topics/security-compliance)

---

## 🏪 I'm Setting Up Multiple Brands

You're creating a platform that hosts payment processing for multiple merchants or stores.

**Your first steps:**

1. **Understand Brands** (10 min)
   - Each brand is isolated: its own customers, gateways, staff, configuration
   - Brands can have custom domains and white-label checkout flows
   - One administrator manages all brands
   - **Read:** [Brands and Stores](/core-concepts/brands-and-stores)

2. **Create Your First Brand** (5 min)
   - **People → Brands → Add Brand**
   - Set name, currency, timezone, logo, color scheme
   - Assign brand managers (staff with Brand Admin role)

3. **Create Additional Brands** (5 min each)
   - Repeat the process for each merchant/store
   - Each brand gets its own set of customers and transactions

4. **Set Up Custom Domains per Brand** (15 min)
   - For each brand, go to **System → Domains**
   - Add the merchant's custom domain
   - Point DNS to your OwnPay installation
   - OwnPay will serve that brand's checkout page on that domain
   - **Read:** [Custom Domains](/user-guide/system/domains)

5. **Configure Roles & Permissions** (15 min)
   - Create custom roles for different brand managers
   - Assign permissions (who can create payments, view reports, manage settings)
   - Invite brand managers via email
   - **Read:** [Roles & Permissions](/user-guide/people/roles)

**Next learning goals:**

- [Set Up Payment Gateways per Brand](/user-guide/gateways/gateways)
- [Manage Customers](/user-guide/people/customers)
- [Generate Financial Reports](/user-guide/reports-finance/reports)

---

## 🧩 I Want to Extend OwnPay with Plugins

You're building custom functionality like new payment methods, integrations, or features.

**Your first steps:**

1. **Understand the Plugin Architecture** (15 min)
   - How OwnPay plugins work
   - Available hooks and filters
   - Plugin lifecycle (install, activate, deactivate)
   - **Read:** [Plugin Development](/developer/plugin-types/gateway-development)

2. **Review Available Hooks** (10 min)
   - Payment processing hooks
   - User authentication hooks
   - Admin panel hooks
   - **Read:** [Hook Reference](/developer/plugins/hooks)

3. **Create Your First Plugin** (30 min)
   - Set up the plugin folder structure
   - Create `plugin.json` manifest
   - Write a simple hello-world hook
   - **Read:** [Building Plugins](/developer/plugin-types/gateway-development)

4. **Register and Test** (15 min)
   - Upload plugin to `modules/plugins/`
   - Go to **System → Plugins**
   - Enable your plugin
   - Test that hooks fire correctly

5. **Publish Your Plugin** (5 min)
   - Submit to [plugins.ownpay.org](https://plugins.ownpay.org)
   - Share with the OwnPay community

**Next learning goals:**

- [Create a Payment Gateway Plugin](/developer/plugin-types/gateway-development)
- [Add Admin Pages](/developer/plugin-types/gateway-development)
- [Publish on the Plugin Marketplace](https://plugins.ownpay.org)

---

## 📚 I Want to Learn Core Concepts First

You prefer understanding the "why" before the "how".

**Reading order:**

1. [What is OwnPay?](/getting-started/introduction) (5 min) - Feature overview
2. [System Architecture](/resources/architecture) (10 min) - High-level design
3. [Brands and Stores](/core-concepts/brands-and-stores) (10 min) - Multi-tenancy model
4. [Payment Flow](/core-concepts/payment-flow) (15 min) - How payments work
5. [User Roles & Permissions](/core-concepts/user-roles-permissions) (10 min) - RBAC model
6. [Payment Gateways](/core-concepts/gateways) (10 min) - Gateway architecture
7. [Webhooks & Events](/core-concepts/webhooks-events) (10 min) - Event-driven design

After this, jump to the guide for your role above.

---

## 🆘 I'm Stuck or Have Questions

Check our resource sections:

- **[Troubleshooting](/advanced-topics/troubleshooting)** - Common problems and solutions
- **[FAQ](/advanced-topics/faq)** - Frequently asked questions
- **[Glossary](/resources/glossary)** - Terminology and definitions
- **[GitHub Issues](https://github.com/own-pay/OwnPay/issues)** - Report bugs or ask for help

---

## ✅ Checklist: You're Ready to Go

Once you've completed the steps for your role:

- [ ] Logged in successfully
- [ ] Changed your password
- [ ] (Admin) Created your first brand
- [ ] (Admin) Configured a payment gateway
- [ ] (Admin) Tested a payment link
- [ ] (Developer) Generated API keys
- [ ] (Developer) Made your first API request
- [ ] (Developer) Set up webhooks
- [ ] (Plugin Dev) Created your first plugin
- [ ] Explored the admin dashboard
- [ ] Bookmarked this documentation site

**Congratulations! You're ready to start using OwnPay.** 🎉
