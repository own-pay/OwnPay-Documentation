---
title: Developer Guide
---

# Developer Guide

OwnPay exposes a full REST API that lets you integrate payment collection into any application. This guide covers the main areas: server-side integration (PHP and Node.js), webhook event handling, and extending OwnPay through the plugin system.

## Get Started in 5 Minutes

**[→ Quickstart Guide](/developer/quickstart)**

Follow our 5-step quickstart to generate API keys, make your first payment, and set up webhooks.

## Quick Reference

| Topic | Value |
|-------|-------|
| Base URL | `https://your-domain.com/api/v1` |
| Auth header | `Authorization: Bearer <api_key>` |
| Response format | JSON - `{ success, data, message }` |
| Webhook algo | HMAC-SHA256 |
| Rate limit (API keys) | 120 requests / minute |
| Rate limit (mobile) | 60 requests / minute |

## Authentication

All API requests require a Bearer token. Generate API keys in the **Admin Panel → Developer Hub**.

```http
Authorization: Bearer op.xxxxxxxxxxxxxxxxx
```

Keys can be scoped to **read-only** or **full access** and are tied to a specific brand. Rotate keys under Developer Hub → API Keys → Regenerate.

## Base URL

```
https://your-domain.com/api/v1
```

Replace `your-domain.com` with your OwnPay installation domain. All endpoints are prefixed with `/api/v1`.

## Response Envelope

Every response wraps data in a consistent envelope:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

Error responses include an `errors` object:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "amount": ["Amount must be greater than 0"]
  }
}
```

Standard HTTP status codes apply: `200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `422 Unprocessable Entity`, `429 Too Many Requests`.

## What's in This Guide

<div class="tip custom-block">

### [PHP Integration →](/developer/integration/php)

Using cURL and Guzzle to create payment intents, retrieve transactions, and generate payment links in PHP 8.3+.

### [Node.js Integration →](/developer/integration/nodejs)

Fetch-based API client for Node.js 18+ with full TypeScript type definitions.

### [Webhooks & Events →](/developer/webhooks)

Configure endpoint URLs, verify HMAC-SHA256 signatures, and handle the full event catalogue.

### [Plugin Development →](/developer/plugin-types/gateway-development)

Build and publish custom payment gateway plugins using the OwnPay Plugin API.

</div>

## External References

- [API Reference →](https://docs.ownpay.org) - Full OpenAPI spec with live try-it-out
- [Plugin Catalog →](https://plugins.ownpay.org) - Browse community plugins
- [GitHub →](https://github.com/own-pay/OwnPay) - Source code and issues
