---
title: Core Concepts
---

# Core Concepts

Understand the fundamental concepts, workflows, and logical building blocks that power the OwnPay payment orchestration engine.

---

## 📐 Core Concept Guides

Browse these guides to understand how data is managed, how payments are routed, and how isolation is enforced.

| Guide | Description |
|:---|:---|
| [🏢 Brands & Stores](./brands-and-stores) | How OwnPay isolates stores, credentials, ledgers, and custom domains using tenant scoping (`merchant_id`). |
| [💳 Payment Flow](./payment-flow) | The life cycle of a transaction, from creating payment intents via API to customer redirection, verification, and settlement. |
| [🔌 Gateways & Routing](./gateways) | Understanding global gateway adapters, manual offline methods, fee rules, and currency conversion logic. |
| [🔗 Webhooks & Events](./webhooks-events) | How outbound event notifications are generated, signed (HMAC-SHA256), delivered, and retried. |
| [🛡️ User Roles & Permissions](./user-roles-permissions) | System super-administrators vs. brand-scoped staff, and mapping RBAC permissions. |

---

## Architecture Overview

At its core, OwnPay acts as an orchestrator sitting between your online application (merchant store) and payment networks (gateways). 

```
┌─────────────────┐
│ Merchant App    │ (WooCommerce, SDKs, etc.)
└────────┬────────┘
         │
         │ REST API (Bearer Token)
         ▼
┌────────────────────────────────────────────────────────┐
│ OwnPay Core                                            │
│                                                        │
│  - Brand Isolation (tenant scoped DB queries)          │
│  - Double-Entry Ledger (bcmath money precision)        │
│  - Event Hook Pipeline (EventManager)                  │
└────────┬───────────────────────────────────────┬───────┘
         │                                       │
         │ Adapter Interface                     │ Adapter Interface
         ▼                                       ▼
┌─────────────────┐                     ┌─────────────────┐
│ Gateway Adapter │                     │ Gateway Adapter │
│ (e.g. Stripe)   │                     │ (e.g. bKash)    │
└────────┬────────┘                     └────────┬────────┘
         │                                       │
         ▼ API / Redirect                        ▼ API / Redirect
┌─────────────────┐                     ┌─────────────────┐
│ Stripe API      │                     │ bKash API       │
└─────────────────┘                     └─────────────────┘
```

Every database operation inside the core checks the active `merchant_id` to ensure strict tenant boundary safety.

---

## See Also

- 🚀 **Ready to deploy?** Read the [Local Setup Guide](/resources/local-setup)
- 🧑‍💻 **Developer details?** Read the [Architecture Overview](/resources/architecture)
- 🩺 **Having issues?** Check the [Troubleshooting Guide](/advanced-topics/troubleshooting)
