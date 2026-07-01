---
title: Glossary
---

# Glossary

This glossary defines terms, concepts, and acronyms used throughout the OwnPay ecosystem, codebases, and documentation.

---

### A

#### Addon

A type of plugin that extends the core functionality of OwnPay. Addons can add new admin dashboard screens, register API endpoints, execute scheduled background jobs, create database tables, or add UI components.

#### API Key

A secret token used by external applications to authenticate with the OwnPay REST API. API keys use a Bearer authentication scheme, are prefixed with `op.`, and are restricted by scopes (`read`, `write`, `admin`). Plain key secrets are hashed at rest and are only visible once upon generation.

---

### B

#### bcmath

A PHP extension used for arbitrary-precision mathematics. OwnPay uses `bcmath` string operations for all ledger calculations and transaction amount calculations to avoid the floating-point precision loss inherent to standard PHP floats.

#### Brand

An isolated business entity or store configured within a single OwnPay installation. Each brand has its own isolated database scope (via `merchant_id`), domains, payment gateways, customers, invoices, and ledger accounts. OwnPay is a multi-brand orchestrator managed by a single system owner.

---

### C

#### Checkout Token

A short-lived, secure token (prefixed with `tok_`) generated when initiating a payment intent. It identifies the checkout session and is used to render the checkout page without exposing the permanent payment intent UUID.

#### Companion App

The mobile application (Android/iOS) used by administrators to pair physical devices with the OwnPay server. It allows synchronization of incoming push notifications and SMS messages to automatically match payments on manual mobile financial services.

---

### D

#### DCO (Developer Certificate of Origin)

A licensing mechanism used by open-source projects to certify that a contributor wrote the code themselves or has the right to submit it. Verified via a `Signed-off-by: Name <email>` trailer in the Git commit message.

#### Double-Entry Ledger

The financial accounting engine running inside OwnPay. Every movement of money is recorded as a balanced pair of debits and credits across ledger accounts (`op_ledger_accounts`), ensuring that the system's ledger is mathematically sound and verifiable at any point in time.

---

### G

#### Gateway Adapter

A sandboxed PHP class implementing `OwnPay\Gateway\GatewayAdapterInterface` that bridges OwnPay's core payment flow with a specific external payment processor or gateway API (e.g., Stripe, bKash, PayPal).

---

### H

#### Hook

A point in the execution flow where plugins can register callbacks to alter behavior or perform actions. Follows the WordPress-style event pattern using **actions** (`doAction` / events) and **filters** (`applyFilter` / hooks).

---

### M

#### Merchant API

The REST API layer (`/api/v1/*`) used by merchant applications to interact with their configured brand gateway. Authenticated via merchant-specific API keys.

#### Mobile Financial Services (MFS)

Payment providers operating on mobile networks, popular in South Asia and other emerging markets (e.g., bKash, Nagad, Rocket). OwnPay supports direct MFS integration via dedicated gateway adapters or automatic SMS-matching companion apps.

---

### P

#### Paired Device

A physical mobile device linked to an OwnPay brand via a JWT token. Paired devices report heartbeats and transmit incoming SMS transaction notifications to automate manual peer-to-peer payment matching.

#### Payment Intent

A database object tracking the lifecycle of a payment session. It represents a user's intent to pay, stores state, billing/customer metadata, and transitions to a transaction once payment is verified.

#### Plugin Sandbox

A security layer that performs static analysis on uploaded plugin source code. It scans for and blocks dangerous PHP function calls (e.g., `exec`, `shell_exec`, `passthru`, `eval`, or raw PDO instances) to ensure plugin security.

---

### S

#### Scope

A permission boundary assigned to an API key. Supported scopes are `read` (data retrieval), `write` (mutating endpoints like payments or refunds), and `admin` (superadmin tasks like key generation).

#### Super-Administrator

The root platform administrator who owns and manages the OwnPay installation. Super-administrators can configure system-level variables, manage all brands, install plugins, and trigger updates. Identified in API endpoints via the `X-Super-Admin-Email` header.

---

### T

#### Tenant Scope

A query-level scope enforced within the database repositories (`TenantScope` trait) that transparently filters database operations by `merchant_id`. Enforces strict brand isolation at the database layer.

#### Theme

A package residing under `modules/themes/` consisting of Twig templates, CSS, and JS assets used to customize the design and layout of the public customer checkout screen.

---

### W

#### Webhook

An asynchronous HTTP POST callback sent by OwnPay to a merchant's server to notify them of transaction state transitions (e.g., `payment.transaction.completed`). Webhooks are signed with an `X-OwnPay-Signature` header computed using the brand's Webhook Secret.

#### White-Label Custom Domain

A feature allowing each brand to use its own custom domain (e.g., `pay.brand.com`) for public checkout flows. DNS queries are resolved by `DomainMiddleware` to swap brand parameters transparently.
