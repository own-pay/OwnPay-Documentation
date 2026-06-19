# Introduction

**OwnPay** is a self-hosted, enterprise-grade payment gateway orchestration platform. It allows a single platform owner to manage multiple white-labeled merchant stores (brands) under one installation, complete with double-entry ledger bookkeeping, developer API hubs, local Android-based SMS verification, and support for both automated and manual payment methods.

## What OwnPay Is

OwnPay is not a SaaS payment processor. It is infrastructure you deploy and own. You control the server, the database, the credentials, and the data — no third-party intermediary has access to your transactions.

## Key Architectural Concepts

**Sovereign Single-Owner Model**
One master administrator controls the system. There is no self-registration; brands and staff are invited and created by the administrator.

**Multi-Brand Scoping**
Multiple brands can be run simultaneously, completely isolated from each other — each with their own customers, gateways, staff, and checkout flows.

**White-Labeling**
Brands configure custom customer-facing domains, logo assets, CSS styles, and email templates, fully masking the master application domain.

**Double-Entry Ledger Bookkeeping**
All payments, fees, and transfers are recorded using double-entry bookkeeping records to guarantee financial integrity and auditing.

**Mobile & SMS Gateway**
Connect local Android phones to dynamically parse mobile-banking SMS alerts (e.g. bKash, Nagad) to automate local manual checkouts.

## Who Is OwnPay For?

| Role | Use Case |
|------|----------|
| **Platform Operators** | Host a payment infrastructure for multiple businesses |
| **Agency Owners** | White-label checkout flows for clients |
| **Fintech Developers** | Build and integrate custom payment flows via the REST API |
| **Finance Teams** | Audit transactions and reconcile ledger balances |

## Quick Start

1. [Install OwnPay](/user-guide/installation) on your server
2. Log in as the master administrator
3. Create your first [Brand](/user-guide/people/brands)
4. Configure a [Payment Gateway](/user-guide/gateways/gateways)
5. Generate an [API Key](/user-guide/developers/developer-hub) or create a [Payment Link](/user-guide/payments/payment-links)

## Next Steps

- [Architecture Overview →](/user-guide/architecture)
- [Installation Guide →](/user-guide/installation)
- [API Reference →](/api-reference/)
