# Architecture

OwnPay is a PHP-based monolithic application following a layered MVC architecture, designed for predictable deployment on a single VPS or dedicated server.

## High-Level Overview

```
                        ┌─────────────────────────────────────┐
                        │           Load Balancer / Nginx      │
                        └──────────────┬──────────────────────┘
                                       │
              ┌────────────────────────▼──────────────────────┐
              │                  OwnPay Core                   │
              │                                                 │
              │  ┌────────────┐  ┌───────────┐  ┌──────────┐  │
              │  │  Admin UI  │  │  REST API │  │  Webhook  │  │
              │  │ (PHP/HTML) │  │ (v1 JSON) │  │ Inbound  │  │
              │  └─────┬──────┘  └─────┬─────┘  └────┬─────┘  │
              │        │               │               │        │
              │  ┌─────▼───────────────▼───────────────▼─────┐ │
              │  │             Service Layer                   │ │
              │  │  Payments · Gateways · Auth · Ledger · SMS │ │
              │  └─────────────────────┬───────────────────────┘ │
              │                        │                         │
              │  ┌─────────────────────▼───────────────────────┐ │
              │  │             Repository Layer                  │ │
              │  │    (SQL queries, no ORM — raw PDO)           │ │
              │  └─────────────────────┬───────────────────────┘ │
              └────────────────────────┼──────────────────────────┘
                                       │
              ┌────────────────────────▼──────────────────────┐
              │                   MySQL / MariaDB              │
              └────────────────────────────────────────────────┘
```

## Core Layers

### Routing & Kernel
All HTTP requests enter through `public/index.php`, which bootstraps the `Kernel`. The Kernel resolves the route, applies middleware, and dispatches to the correct Controller.

### Middleware Stack
Every request passes through a configurable middleware pipeline:

| Middleware | Purpose |
|-----------|---------|
| `SecurityHeadersMiddleware` | Adds CSP, HSTS, X-Frame-Options |
| `MaintenanceMiddleware` | Blocks traffic during maintenance windows |
| `RateLimiterMiddleware` | Enforces per-route request limits |
| `CsrfMiddleware` | Validates CSRF tokens on state-changing requests |
| `JwtAuthMiddleware` | Verifies Bearer tokens for API routes |
| `BearerAuthMiddleware` | Validates `op_` prefixed API keys |
| `TwoFactorMiddleware` | Enforces 2FA on admin routes |

### Controllers
Controllers are grouped by domain:

- **Admin Controllers** — Dashboard, Auth, Transactions, Gateways, People, Appearance, System
- **API Controllers** — PaymentIntents, Transactions, Webhooks, ApiKeys
- **Checkout Controllers** — Public checkout flows (branded, white-labeled)
- **Webhook Controllers** — Inbound gateway notifications

### Gateway Plugin System
Payment gateways are modular plugins loaded from `src/Gateway/Plugins/`. Each plugin implements a standard interface exposing:
- `initiate()` — Starts a payment session
- `verify()` — Confirms payment status
- `webhook()` — Handles inbound gateway callbacks

### Multi-Tenancy Model
Brands (`op_merchants`) are the tenancy unit. Every data record is scoped to a `merchant_id`. The Kernel resolves the active brand context on each request via:
1. Custom domain matching (for white-labeled checkouts)
2. Session/JWT context (for admin routes)

### Double-Entry Ledger
Every financial event produces two ledger records (debit + credit). The `LedgerRepository` enforces this invariant. Balance verification tools cross-check ledger totals against raw transaction sums.

## Data Flow: Payment Initiation

```
Customer Browser
      │
      │  POST /api/v1/payment-intents
      ▼
BearerAuthMiddleware  ──→  Validates op_ API key
      │
      ▼
RateLimiterMiddleware ──→  Checks per-key rate
      │
      ▼
PaymentIntentController
      │
      ├─→ Validates request body
      ├─→ Resolves gateway plugin
      ├─→ Creates pending transaction record
      ├─→ Calls Gateway::initiate()
      └─→ Returns { payment_url, transaction_id }
```

## Technology Stack

| Layer | Technology |
|-------|------------|
| Language | PHP 8.2+ |
| Web Server | Nginx + PHP-FPM |
| Database | MySQL 8 / MariaDB 10.6+ |
| Cache | Redis (optional) |
| Frontend | Vanilla JS + CSS (no framework) |
| SMS Bridge | Android APK (custom) |
| API Format | JSON REST (no GraphQL) |

## Deployment Requirements

- PHP 8.2+ with extensions: `pdo_mysql`, `mbstring`, `openssl`, `curl`, `redis` (optional)
- MySQL 8.0+ or MariaDB 10.6+
- Nginx with `try_files` for clean URL routing
- Composer for dependency management
- SSL certificate (Let's Encrypt recommended)

## Next Steps

- [Installation Guide →](/user-guide/installation)
- [API Reference →](/api-reference/)
