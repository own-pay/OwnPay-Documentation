---
title: Advanced Topics
---

# Advanced Topics & Operations

Deep-dives into security, performance tuning, scaling architectures, troubleshooting, and frequently asked questions for running OwnPay in production environments.

---

## 🛠️ Performance, Security & Troubleshooting Guides

Browse these sections to configure and optimize your OwnPay production instances.

| Guide | Description |
|:---|:---|
| [🔒 Security & Compliance](./security-compliance) | Data encryption (AES-256-GCM), GDPR guidelines, network security limits, and OWASP compliance standards. |
| [🚀 Performance & Scaling](./performance-scaling) | Optimizing PHP-FPM, MariaDB performance, enabling Redis caching/queues, setting up load balancers, rate limits, and idempotency. |
| [🩺 Troubleshooting](./troubleshooting) | Diagnosing common installation, database connectivity, email delivery, mobile device pairing, and webhook delivery errors. |
| [❓ Frequently Asked Questions (FAQ)](./faq) | Answers to common licensing, security, deployment, update engine, and payment processing questions. |

---

## Production Checklist

Before launching a new OwnPay brand or store in production, ensure the following settings are active:

* [ ] **SSL (HTTPS)** is enforced and HTTP requests redirect to HTTPS.
* [ ] **`APP_DEBUG`** is set to `false` in your `.env` configuration.
* [ ] **`CACHE_DRIVER`** and **`QUEUE_DRIVER`** are set to `redis` for optimal performance.
* [ ] **System Cron Job** is successfully configured on the host machine to execute every minute.
* [ ] **Database Backup** scheduler is active and working.
* [ ] **Trusted Proxies** are defined in `.env` if OwnPay runs behind a reverse proxy (e.g. Cloudflare, AWS ALB).
* [ ] **Rate Limiting** is verified and active on the API endpoints.

---

## See Also

* 🚀 **First time setting up?** Read [Getting Started](/getting-started/)
* 🧑‍💻 **Developing a plugin?** Browse the [Developer Guide](/developer/)
* 📖 **Merchant REST API?** Read the [REST API Guide](/resources/integrations/rest-api)
* 📐 **OwnPay Architecture?** Read the [Architecture Overview](/resources/architecture)
