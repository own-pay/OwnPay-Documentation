# Performance and Scaling

A technical guide to optimizing OwnPay performance and scaling for high-volume payment operations - written using real configuration values and architecture sourced directly from the OwnPay codebase.

---

## Performance Benchmarks

### Baseline Performance (Single Server)

The following targets apply to a standard single-server deployment with Redis enabled:

| Operation | Target | Notes |
|---|---|---|
| Payment creation (`POST /api/v1/payments`) | < 150ms | Includes fee rule resolution + ledger write |
| Checkout page load (`/checkout/{intent}`) | < 300ms | Brand theme + CSP build from active gateways only |
| Transaction list (100 items, paginated) | < 200ms | `idx_merchant_created` composite index used |
| Invoice/payment link lookup | < 50ms | Stored generated column + `idx_invoice_id` |
| Report generation (date-range queries) | 1–5 seconds | Depends on data volume and date span |
| API response (any endpoint) | < 200ms | Redis rate limiter adds < 5ms overhead |
| Webhook delivery | < 1 second | Sync delivery; async retry via `WebhookRetryCron` |
| SMS match verification | < 500ms | `SmsVerificationJob` per-device scope |

### Capacity Tiers

**Tier 1 - Single server (default Docker stack, 4 GB RAM):**

- Handles approximately 5,000–8,000 payments/day
- Supports 100–200 concurrent sessions
- PHP-FPM pool: 20 max workers (`pm.max_children = 20`)
- MariaDB: 100 max connections (`max_connections = 100`)

**Scale thresholds:**

| Daily Volume | Action Required |
|---|---|
| > 1,000 payments/day | Switch `CACHE_DRIVER=redis`, `QUEUE_DRIVER=redis` |
| > 5,000 payments/day | Tune PHP-FPM pool, increase InnoDB buffer pool |
| > 10,000 payments/day | Add a dedicated database server |
| > 50,000 payments/day | Read replica + Redis Cluster |
| > 100,000 payments/day | Horizontal app scaling + load balancer |

---

## Cache System

OwnPay has two built-in cache drivers, selectable via `CACHE_DRIVER` in `.env`. The driver is resolved at container boot in [`config/services.php`] and bound as the singleton `CacheInterface`.

### Drivers

#### File Cache (default - shared hosting)

**Class:** [`OwnPay/Cache/FileCache`]  
**Storage:** `storage/cache/` (subdirectory-namespaced `.cache` files)  
**Mechanism:** Atomic write via `rename()` after `LOCK_EX` to prevent torn reads.  
**GC strategy:** Lazy expiry - expired files are deleted on next read.  
**Security:** `unserialize()` with `['allowed_classes' => false]` to block gadget-chain RCE.

```ini
# .env
CACHE_DRIVER=file
CACHE_TTL=3600
```

#### Redis Cache (recommended - VPS/cloud)

**Class:** [`OwnPay/Cache/RedisCache`]  
**Database:** Redis DB 0 (DB 1 is reserved for the queue)  
**Key prefix:** `op:` (configurable via `REDIS_PREFIX`)  
**Flush scope:** Uses `SCAN` + prefix pattern - never `FLUSHALL`. Safe to share a Redis instance.

```ini
# .env
CACHE_DRIVER=redis
CACHE_TTL=3600
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_PREFIX=op:
```

**Docker default:** The official `docker-compose.yml` ships with Redis 7-Alpine and sets `CACHE_DRIVER=redis` automatically:

```yaml
# docker-compose.yml (excerpt)
redis:
  image: redis:7-alpine
  command: >
    redis-server
    --maxmemory 256mb
    --maxmemory-policy allkeys-lru
    --save ""
    --appendonly no
```

> **Note:** Redis uses `allkeys-lru` eviction. OwnPay cache keys hold gateway configs, exchange rates, permission trees, and settings group maps. These re-populate on the next request automatically on eviction.

### What OwnPay Caches

**`SettingsRepository`** ([`src/Repository/SettingsRepository.php`]) maintains a **per-request in-memory memoization** of resolved setting groups and individual keys. Since settings are read dozens of times per page render (brand theme, checkout timer, fee rules, email preferences), every write/delete automatically invalidates the affected group. After out-of-band database writes (e.g. installer imports), call `SettingsRepository::flushCache()` to clear the memoized state.

**What is memoized per request:**

- Setting group maps: `{group}|{merchant_id}` → `array<key, value>`
- Single-key resolved values: `{group}|{key}` and `{group}|{key}|{merchant_id}`

### OPcache (PHP Bytecode Cache)

OwnPay ships a production-tuned OPcache configuration in [`.docker/php.ini`]:

```ini
opcache.enable                  = 1
opcache.memory_consumption      = 128        ; 128 MB bytecode cache
opcache.interned_strings_buffer = 16
opcache.max_accelerated_files   = 10000      ; covers all OwnPay source files
opcache.revalidate_freq         = 0          ; never check disk (production)
opcache.validate_timestamps     = 0          ; no filesystem stat() calls
opcache.jit                     = tracing    ; PHP 8.3 JIT compiler enabled
opcache.jit_buffer_size         = 64M        ; JIT machine-code buffer
```

Also configured for fast file I/O:

```ini
realpath_cache_size = 4096K
realpath_cache_ttl  = 600
```

> **Important:** Set `opcache.validate_timestamps = 0` in production only. On deploy, reload PHP-FPM to clear the bytecode cache: `systemctl reload php8.3-fpm` or `kill -USR2 $(cat /var/run/php/php8.3-fpm.pid)`.

**Twig template cache** is stored in `storage/cache/twig/` and controlled by the container:

```php
// config/services.php (Twig binding)
$twig = new \Twig\Environment($loader, [
    'cache'       => $paths['cache'] . '/twig',
    'auto_reload' => (bool) ($appCfg['debug'] ?? false), // false in production
    'strict_variables' => true,
    'autoescape'  => 'html',
]);
```

---

## Queue System

OwnPay has two built-in queue drivers selectable via `QUEUE_DRIVER` in `.env`. The driver is bound as `QueueInterface` in [`config/services.php`].

### Drivers

#### File Queue (default - shared hosting)

**Class:** [`OwnPay/Queue/FileQueue`]  
**Storage:** `storage/queue/{queue-name}/` (JSON files, `flock` concurrency control)  
**Job naming:** `{timestamp}_{uuid}.json` - sorted chronologically for FIFO processing.  
**Concurrency:** Non-blocking `LOCK_EX | LOCK_NB` prevents double-processing by multiple workers.  
**Failed jobs:** Moved to `storage/queue/failed/` with error and timestamp attached.

#### Redis Queue (recommended - VPS/cloud)

**Class:** [`OwnPay\Queue\RedisQueue`]  
**Database:** Redis DB 1 (separate from the cache on DB 0)  
**Key prefix:** `op:queue:` (configurable via `REDIS_PREFIX`)  
**Delayed jobs:** Stored in a Redis sorted-set (`op:queue:{name}:delayed`), migrated to the ready list at pop time.  
**In-flight tracking:** Active jobs are hashed into `op:queue:processing` for concurrency visibility.  
**Retry:** Built-in `retry(string $jobId, int $delay = 60)` method re-queues failed jobs.

```ini
# .env - enable Redis queue
QUEUE_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PREFIX=op:queue:
```

### Cron-driven Queue Worker

The queue is processed by [`QueueWorkerJob`] running as a scheduled cron task. Key characteristics:

- **Batch size:** 20 jobs per invocation (configurable via `run(int $batchSize = 20)`)
- **Max retries:** 3 (`MAX_ATTEMPTS = 3`)  
- **Exponential backoff:** `backoffSeconds = attempts² × 60` → 1 min, 4 min, 9 min
- **Atomic claim:** `UPDATE ... SET status='processing' WHERE status='pending'` - prevents double-pickup by concurrent workers
- **Priority ordering:** `ORDER BY priority DESC, created_at ASC`
- **Database table:** `op_job_queue`

### Cron Schedule Reference

All cron jobs are managed by [`CronJobRunner`], which uses file-based `flock` locking (`.lock` + `.running.lock` per job in `storage/cron/`) to prevent concurrent execution.

| Job Class | Schedule | Purpose |
|---|---|---|
| `QueueWorkerJob` | `every_minute` | Process email, webhook, and async jobs |
| `WebhookRetryCron` | `every_5min` | Retry up to 50 failed webhook deliveries |
| `SmsVerificationJob` | `every_minute` | Match parsed SMS to pending transactions |
| `DnsVerificationJob` | `hourly` | Verify custom domain DNS records |
| `CurrencyUpdateJob` | `every_6h` | Fetch exchange rate updates |
| `BalanceVerificationJob` | `daily` | Cross-check ledger vs transaction aggregates |
| `UpdateCheckJob` | `daily` | Check `https://update.ownpay.org/manifest.json` |
| `RefundReconciliationJob` | `daily` | Reconcile refund states with gateways |
| `SystemUpdateJob` | `every_6h` | Apply pending updates (night window: 02:00–04:00) |

**Schedule intervals (from `CronJobRunner::isDue()`):**

```php
match ($schedule) {
    'every_minute' => $elapsed >= 60,
    'every_5min'   => $elapsed >= 300,
    'hourly'       => $elapsed >= 3600,
    'every_6h'     => $elapsed >= 21600,
    'daily'        => $elapsed >= 86400,
    'weekly'       => $elapsed >= 604800,
};
```

**System cron setup (required):**

```bash
# Add to crontab (crontab -e)
* * * * * php /var/www/ownpay/public/index.php cron/run >> /dev/null 2>&1
```

---

## Database Optimization

### Schema Design for Performance

OwnPay's core payment table `op_transactions` uses **MySQL Stored Generated Columns** to eliminate JSON extraction overhead on hot query paths:

```sql
-- From database/schema.sql
CREATE TABLE `op_transactions` (
  -- ... core columns ...
  `metadata` JSON DEFAULT NULL,

  -- Stored generated columns (no runtime JSON parsing)
  `invoice_id`      BIGINT UNSIGNED GENERATED ALWAYS AS (
    CAST(JSON_UNQUOTE(JSON_EXTRACT(`metadata`, '$.invoice_id')) AS UNSIGNED)
  ) STORED,
  `payment_link_id` BIGINT UNSIGNED GENERATED ALWAYS AS (
    CAST(JSON_UNQUOTE(JSON_EXTRACT(`metadata`, '$.payment_link_id')) AS UNSIGNED)
  ) STORED,

  -- Composite and single-column indexes
  KEY `idx_merchant_status`  (`merchant_id`, `status`),
  KEY `idx_merchant_created` (`merchant_id`, `created_at`),
  KEY `idx_gateway`          (`gateway_slug`),
  KEY `idx_gateway_trx`      (`gateway_trx_id`),
  KEY `idx_provider_trx`     (`provider_trx_id`),
  KEY `idx_pi`               (`payment_intent_id`),
  KEY `idx_invoice_id`       (`invoice_id`),       -- on generated column
  KEY `idx_payment_link_id`  (`payment_link_id`),  -- on generated column
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Why this matters:** Queries that previously required `JSON_EXTRACT(metadata, '$.invoice_id')` now use a normal B-tree index, turning full table scans into sub-millisecond index seeks.

### Composite Index Strategy

All tenant-scoped queries filter on `merchant_id` first. Every high-traffic table carries a `(merchant_id, ...)` composite index so the `TenantScope` WHERE clause hits an index immediately:

| Table | Key Index | Used By |
|---|---|---|
| `op_transactions` | `idx_merchant_status (merchant_id, status)` | Dashboard payment list |
| `op_transactions` | `idx_merchant_created (merchant_id, created_at)` | Date-range reports |
| `op_system_settings` | `idx_merchant_group (merchant_id, group_name)` | `SettingsRepository::getGroup()` |
| `op_customers` | `idx_merchant_phone_hash (merchant_id, phone_hash)` | Customer lookup |
| `op_webhook_events` | `idx_webhook_status (webhook_id, status)` | Retry queue |
| `op_webhook_events` | `idx_retry (next_retry_at)` | `WebhookRetryCron` scheduling |
| `op_audit_log` | `idx_entity (entity_type, entity_id)` | Entity-specific audit trails |
| `op_audit_log` | `idx_merchant_action (merchant_id, action)` | Filtered audit views |

### MariaDB Production Configuration

The official Docker configuration (`.docker/mariadb.cnf`) is the reference for production tuning:

```ini
[mysqld]
# Character set
character-set-server  = utf8mb4
collation-server      = utf8mb4_unicode_ci

# InnoDB buffer pool - set to ~70% of DB server RAM
innodb_buffer_pool_size    = 256M    # Docker default; increase for dedicated DB server
innodb_buffer_pool_instances = 1
innodb_log_file_size       = 64M

# Full ACID compliance - required for financial data
innodb_flush_log_at_trx_commit = 1
innodb_flush_method            = O_DIRECT
innodb_file_per_table          = 1

# Connection limits
max_connections     = 100
wait_timeout        = 600
interactive_timeout = 600
connect_timeout     = 10

# Query cache disabled - use Redis (deprecated in MariaDB 10.11+)
query_cache_type = 0
query_cache_size = 0

# Slow query logging
slow_query_log       = 1
slow_query_log_file  = /var/lib/mysql/slow-queries.log
long_query_time      = 2   # log queries taking > 2s
```

**Scaling the InnoDB buffer pool:**

```ini
# For a dedicated 8 GB DB server:
innodb_buffer_pool_size    = 5G
innodb_buffer_pool_instances = 4   # one per GB, max 64

# For a dedicated 16 GB DB server:
innodb_buffer_pool_size    = 11G
innodb_buffer_pool_instances = 8
```

### Connection Retry Logic

OwnPay's PDO factory ([`config/services.php`] automatically retries transient connection failures (too many connections, connection refused, server gone away) with **linear backoff**:

```php
// Configurable via DB_CONNECT_RETRIES env var (default: 3)
$maxAttempts = max(1, (int) (getenv('DB_CONNECT_RETRIES') ?: 3));

// Retries with 100ms, 200ms, 300ms wait between attempts
usleep(100000 * $attempt);
```

PDO is configured with strict settings to enforce financial data integrity:

```php
'options' => [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,   // real prepared statements only
    PDO::ATTR_STRINGIFY_FETCHES  => false,
    PDO::MYSQL_ATTR_FOUND_ROWS   => true,
],
```

SQL session hardening applied at connection time:

```sql
SET SESSION sql_mode = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'
```

### Database Maintenance

**Weekly:**

```sql
-- Analyze table statistics (InnoDB)
ANALYZE TABLE op_transactions;
ANALYZE TABLE op_audit_log;
ANALYZE TABLE op_webhook_events;

-- Check slow query log
-- Location configured in .docker/mariadb.cnf:
-- /var/lib/mysql/slow-queries.log (long_query_time = 2s)
```

**Monthly:**

```sql
-- Archive old audit entries (optional - keep for compliance as needed)
DELETE FROM op_audit_log
WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);

-- Clean up expired idempotency keys
DELETE FROM op_idempotency_keys
WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Clean up expired password reset tokens
DELETE FROM op_password_resets
WHERE expires_at < NOW();

-- Clean up old login attempts
DELETE FROM op_login_attempts
WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

**Quarterly:**

```bash
# Backup before major operations
mysqldump -u root -p ownpay > backup_$(date +%Y%m%d).sql

# Docker environment backup
docker exec ownpay_db sh -c \
  'mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" ownpay' \
  > backup_$(date +%Y%m%d).sql
```

---

## PHP-FPM Optimization

OwnPay's production PHP-FPM pool is configured in [`.docker/php-fpm-ownpay.conf`]:

```ini
[ownpay]
listen = 127.0.0.1:9000

pm                   = dynamic
pm.max_children      = 20    # max simultaneous PHP workers
pm.start_servers     = 4     # workers on startup
pm.min_spare_servers = 2
pm.max_spare_servers = 8

pm.max_requests      = 500   # recycle worker after 500 requests (prevents memory leaks)

# Monitoring (not exposed externally by Nginx)
pm.status_path  = /fpm-status
ping.path       = /fpm-ping

# Log slow requests (> 10s)
slowlog                  = storage/logs/php-fpm-slow.log
request_slowlog_timeout  = 10s
```

**Tuning `pm.max_children` for your server:**

The rule of thumb is: available RAM ÷ average PHP worker memory usage.

```bash
# Check average worker memory (run under load):
ps -o rss= -C php-fpm | awk '{sum+=$1} END {print sum/NR/1024 " MB average"}'

# Example: 4 GB server, ~80 MB per worker:
# 3000 MB available / 80 MB = 37 workers → set pm.max_children = 35
```

**PHP memory and execution limits** (from `.docker/php.ini`):

```ini
memory_limit       = 256M   # per worker
max_execution_time = 120    # seconds (covers report generation)
max_input_time     = 60

# Financial precision
bcmath.scale = 10
```

---

## Rate Limiting

OwnPay's [`RateLimiterMiddleware`] uses a **sliding-window algorithm** backed by Redis (primary) or the `op_rate_limits` database table (fallback). It injects `X-RateLimit-Limit` and `X-RateLimit-Remaining` headers on every response.

### Default Limits (from `config/app.php`)

```php
'rate_limit' => [
    'api'    => ['max' => 60,  'window' => 60],   // 60 req/min per API key
    'login'  => ['max' => 10,  'window' => 300],  // 10 attempts per 5 min
    'global' => ['max' => 120, 'window' => 60],   // 120 req/min per IP
],
```

The login rate limit protects all auth surfaces:

- `/{login-slug}` (configurable slug, cached in `storage/cache/login_slug.cache`)
- `/2fa`
- `/forgot-password`
- `/reset-password`
- `/api/mobile/v1/devices` (device pairing endpoint)

Environment variable overrides:

```ini
# .env
RATE_LIMIT_PER_MINUTE=60   # API requests per minute per key
RATE_LIMIT_BURST=20        # burst allowance above per-minute limit
```

### Dynamic Rate Limit Rules

Administrators can configure per-path rate limit rules in **Settings → Rate Limits** (stored in `op_system_settings` group `general`, key `rate_limit_rules` as a JSON array). These override the defaults for matched paths:

```json
[
  { "path": "/api/v1/payments", "method": "POST", "limit": 30, "window": 60 },
  { "path": "/api/v1/*",        "method": "ALL",  "limit": 100, "window": 60 }
]
```

### IP Whitelist

Trusted IPs (e.g. internal monitoring servers, load balancer health checks) can be whitelisted in **Settings → Rate Limits → Whitelist IPs** (`rate_limit_whitelist_ips`). Whitelisted IPs bypass all rate limit checks entirely.

---

## Web Server (Nginx)

OwnPay ships a production Nginx config in [`.docker/nginx-site.conf`]. Key settings:

```nginx
server {
    listen 80 default_server;
    root /var/www/ownpay/public;

    # Front controller - all requests through index.php
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHP-FPM - only index.php may execute (blocks PHP injection)
    location ~ \.php$ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_read_timeout   120s;
        fastcgi_connect_timeout 10s;
        fastcgi_send_timeout   30s;
        fastcgi_buffer_size    16k;
        fastcgi_buffers        4 16k;

        if ($fastcgi_script_name !~ "^/index\.php$") {
            return 403;
        }
    }

    # Static asset caching (30 days, immutable)
    location ~* \.(css|js|ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Block access to sensitive files/directories
    location ~ \.(env|git|md|lock|installed|neon|xml)$ { return 404; }
    location ~ ^/(src|tests|vendor|storage|database|config|templates|modules)/ { return 404; }
}
```

### Adding Gzip Compression (standalone, non-Docker)

Add to your server-level `nginx.conf` (not inside the `server` block):

```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_min_length 1000;
gzip_comp_level 6;
gzip_types
    text/plain text/css text/javascript
    application/json application/javascript
    application/xml image/svg+xml;
```

---

## Scaling Architecture

### Architecture 1: Single Server (Default)

The default Docker Compose stack - suitable for up to ~8,000 payments/day:

```
┌──────────────────────────────────────────────────────────┐
│                    OwnPay Docker Stack                   │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  ownpay_app container                               │ │
│  │  Supervisord → PHP-FPM 8.3 + Nginx                 │ │
│  │  FPM pool: 20 max workers, 500 req/recycle          │ │
│  │  OPcache: 128MB + JIT tracing                       │ │
│  └─────────────────────────────────────────────────────┘ │
│                          │                               │
│  ┌──────────────┐    ┌──────────────┐                    │
│  │  ownpay_db   │    │ ownpay_redis │                    │
│  │  MariaDB 10.11│   │  Redis 7     │                    │
│  │  256M buffer │    │  256MB LRU   │                    │
│  │  ACID+strict │    │  DB0=cache   │                    │
│  │  100 max conn│    │  DB1=queue   │                    │
│  └──────────────┘    └──────────────┘                    │
└──────────────────────────────────────────────────────────┘
```

**`.env` for single server:**

```ini
CACHE_DRIVER=redis
QUEUE_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

### Architecture 2: Dedicated Database + App Server

When your transaction volume outgrows the single-server stack:

```
┌──────────────────────┐        ┌──────────────────────┐
│   App Server         │        │   DB Server          │
│                      │        │                      │
│  PHP-FPM 8.3         │──────→ │  MariaDB 10.11       │
│  Nginx               │        │  innodb_buffer: 5G+  │
│  Redis (local)       │        │  max_connections: 300│
│  CACHE_DRIVER=redis  │        │                      │
│  QUEUE_DRIVER=redis  │        │                      │
└──────────────────────┘        └──────────────────────┘
```

Update `.env` on the app server:

```ini
DB_HOST=192.168.1.10   # dedicated DB server IP
DB_CONNECT_RETRIES=5   # more retries over network
```

### Architecture 3: Horizontal Scaling with Load Balancer

For 50,000+ payments/day with high availability:

```
                 ┌──────────────────────────────────┐
                 │   Load Balancer (Nginx/HAProxy)  │
                 └──────────────────────────────────┘
                          │               │
              ┌───────────┘               └────────────┐
              │                                         │
  ┌────────────────────┐             ┌────────────────────┐
  │   App Server 1     │             │   App Server 2     │
  │   PHP-FPM + Nginx  │             │   PHP-FPM + Nginx  │
  │   (stateless)      │             │   (stateless)      │
  └────────────────────┘             └────────────────────┘
              │                                  │
              └──────────────┬───────────────────┘
                             │
              ┌──────────────┴───────────────────┐
              │                                   │
  ┌───────────────────┐          ┌───────────────────────┐
  │   MariaDB Primary │──────→  │   MariaDB Read Replica │
  │   (writes)        │          │   (reports/reads)      │
  └───────────────────┘          └───────────────────────┘
              │
  ┌───────────────────┐
  │   Redis Cluster   │
  │   (3+ nodes)      │
  │   op: namespace   │
  └───────────────────┘
```

**Critical requirement for horizontal scaling:** OwnPay sessions are stored in `storage/sessions/` by default. When running multiple app servers, sessions must be shared. Options:

1. **Redis sessions (recommended):** Configure `session.save_handler = redis` and `session.save_path = "tcp://redis:6379?prefix=op:sess:"` in your PHP-FPM pool config.
2. **Shared NFS mount:** Mount `storage/sessions/` from a shared filesystem.
3. **Sticky sessions at load balancer:** Simpler but limits failover capability.

**Nginx load balancer configuration:**

```nginx
upstream ownpay_app {
    least_conn;                         # route to least-busy server
    server app1.internal:80;
    server app2.internal:80;
    keepalive 32;                       # persistent upstream connections
}

server {
    listen 443 ssl;
    server_name pay.example.com;

    # SSL termination at load balancer
    ssl_certificate     /etc/ssl/example.com.crt;
    ssl_certificate_key /etc/ssl/example.com.key;

    location / {
        proxy_pass http://ownpay_app;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Required `.env` configuration when behind a proxy:**

```ini
# .env - trusted proxy configuration
TRUSTED_PROXIES=10.0.0.1,10.0.0.2   # comma-separated proxy IPs or CIDR ranges
```

OwnPay's `RateLimiterMiddleware` reads `X-Forwarded-For` to obtain the real client IP when `TRUSTED_PROXIES` is set, ensuring rate limits apply per-user rather than per-proxy.

### Redis Cluster Setup

```bash
# Install Redis on 3 nodes minimum
apt install redis-server

# Create cluster (requires 3+ nodes, each on :6379 and :6380)
redis-cli --cluster create \
  node1:6379 node2:6379 node3:6379 \
  --cluster-replicas 0

# Verify cluster health
redis-cli -c -h node1 cluster info
redis-cli -c -h node1 cluster nodes
```

Update `.env`:

```ini
REDIS_HOST=node1  # any cluster node; PHP Redis extension handles redirects
REDIS_PORT=6379
```

---

## Idempotency

OwnPay implements idempotency for all mutating API endpoints (`POST`, `PUT`, `PATCH`) via [`IdempotencyMiddleware`]. This is critical for scaling because it prevents duplicate payments when requests are retried by clients or load balancers on network failure.

**How it works:**

1. Client sends `Idempotency-Key: {uuid}` header (max 64 chars, alphanumeric + dash/underscore)
2. Request signature is computed: `SHA-256(method + "\n" + uri + "\n" + body)`
3. If key was already successfully processed → cached response returned immediately (no re-processing)
4. If key is currently processing → HTTP 409 returned
5. Lock is released on non-2xx responses to allow legitimate retries

**Storage:** `op_idempotency_keys` table (indexed by `(merchant_id, idempotency_key)`).

```bash
# Example: safe retry-able payment creation
curl -X POST https://pay.example.com/api/v1/payments \
  -H "Authorization: Bearer op_live_xxxx" \
  -H "Idempotency-Key: order-abc123-attempt-1" \
  -H "Content-Type: application/json" \
  -d '{"amount": "500.00", "currency": "BDT", "gateway": "bkash-api"}'
```

---

## Security Headers (Performance Impact)

[`SecurityHeadersMiddleware`] runs on every request and generates a **per-request CSP nonce** (`base64(random_bytes(16))`). It also builds the Content-Security-Policy from active gateway manifests only - not all 100+ bundled gateways - to keep the header under the 7,500-byte safety limit (previously exceeding 8 KB caused FastCGI worker crashes).

**Headers applied to all responses:**

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Strict-Transport-Security: max-age=31536000; includeSubDomains   (HTTPS only)
```

---

## Monitoring

### Key Metrics

**Application:**

| Metric | Target | Where to check |
|---|---|---|
| PHP-FPM active workers | < 80% of `pm.max_children` | `/fpm-status` (internal) |
| PHP-FPM queue depth | 0 | `/fpm-status` `listen queue` |
| OPcache hit rate | > 95% | `opcache_get_status()` |
| Cache driver | Redis (not file) | `CACHE_DRIVER` in `.env` |

**Database:**

| Metric | Target | Query |
|---|---|---|
| Slow queries (> 2s) | 0/min | `SHOW GLOBAL STATUS LIKE 'Slow_queries'` |
| Buffer pool hit rate | > 95% | `SHOW STATUS LIKE 'Innodb_buffer_pool_read_requests'` |
| Thread connections | < 80 of 100 | `SHOW STATUS LIKE 'Threads_connected'` |
| Replication lag | < 1s | `SHOW SLAVE STATUS` |

**Redis:**

```bash
# Monitor Redis in real-time
redis-cli -h 127.0.0.1 monitor

# Key stats
redis-cli info stats | grep -E 'keyspace_hits|keyspace_misses|evicted_keys'

# Calculate hit rate
# hit_rate = keyspace_hits / (keyspace_hits + keyspace_misses) * 100
# Target: > 80%
```

### Docker Health Checks

The official Docker stack includes health checks for all services:

```yaml
# ownpay_app: HTTP health endpoint
# GET /health → 200 OK

# ownpay_db: MariaDB InnoDB initialized
test: ["CMD", "healthcheck.sh", "--connect", "--innodb_initialized"]

# ownpay_redis: Redis ping
test: ["CMD", "redis-cli", "ping"]
```

```bash
# Check service health
docker compose ps
docker inspect ownpay_app --format='{{.State.Health.Status}}'
```

### Log Locations

| Log | Location | Configured by |
|---|---|---|
| PHP errors | `storage/logs/php-errors.log` | `.docker/php.ini` |
| PHP-FPM pool | `storage/logs/php-fpm.log` | `.docker/php-fpm-ownpay.conf` |
| PHP-FPM slow | `storage/logs/php-fpm-slow.log` | `request_slowlog_timeout = 10s` |
| App / cron | `storage/logs/` | `LOG_CHANNEL=file` in `.env` |
| MariaDB slow | `/var/lib/mysql/slow-queries.log` | `.docker/mariadb.cnf` |
| Docker | `docker logs ownpay_app` | `json-file` driver, 10 MB max |

Log retention (set via `.env`):

```ini
LOG_MAX_FILES=7   # days of rotated log files
LOG_LEVEL=error   # debug | info | warning | error
```

---

## Load Testing

### Test Before Going Live

```bash
# Install Apache Bench
apt install apache2-utils

# Baseline: 500 requests, 10 concurrent
ab -n 500 -c 10 https://pay.example.com/

# Payment API stress test (requires valid auth token)
ab -n 1000 -c 20 \
   -H "Authorization: Bearer op_test_xxxx" \
   https://pay.example.com/api/v1/transactions

# Checkout page load
ab -n 2000 -c 50 https://pay.example.com/checkout/{test-intent-uuid}
```

**Recommended test scenarios:**

- Baseline: 10 concurrent → verify p95 < 300ms
- Normal: 50 concurrent → verify PHP-FPM queue stays at 0
- Peak: 100 concurrent → verify no 5xx responses
- Stress: 200+ concurrent → find your breaking point before production

### Scaling Decision Matrix

| Signal | Action |
|---|---|
| PHP-FPM `listen queue > 0` | Increase `pm.max_children` (add RAM first) |
| Server RAM > 85% sustained | Upgrade RAM or add app server |
| MariaDB `Threads_connected > 80` | Enable connection pooling (ProxySQL) or add read replica |
| OPcache hit rate < 90% | Increase `opcache.max_accelerated_files` |
| Redis `evicted_keys > 0/min` | Increase Redis `maxmemory` |
| Replication lag > 1s | Tune `innodb_log_file_size`, check network |

---

## Troubleshooting Common Performance Issues

### Admin Panel Slow

1. **Check cache driver:** `grep CACHE_DRIVER .env` - must be `redis`, not `file`
2. **Check OPcache:** `php -r "var_dump(opcache_get_status()['opcache_enabled']);"`
3. **Check PHP-FPM status:** `curl http://127.0.0.1/fpm-status` (internally)
4. **Check slow queries:** `tail -f /var/lib/mysql/slow-queries.log`

```bash
# Force OPcache reset after deploy
systemctl reload php8.3-fpm

# Check SettingsRepository memoization working (should see DB queries only on first load)
# Enable LOG_LEVEL=debug in .env temporarily, then check storage/logs/
```

### Checkout Page Slow

1. **CSP build performance:** Only active gateway manifests should be scanned. Check that all configured gateways have their configs in `op_gateway_configs`.
2. **Brand theme resolution:** `BrandThemeService::getBrandTheme()` reads from `op_system_settings` (memoized). Slow if memoization is cleared per request.
3. **Exchange rate conversion:** `CurrencyService::convert()` queries `op_exchange_rates`. Check `idx_exchange_pair` index.

### Transaction Lookups Slow

```sql
-- Verify generated column indexes are being used
EXPLAIN SELECT * FROM op_transactions
WHERE invoice_id = 42;

-- Should show: key = idx_invoice_id, type = ref
-- If showing type = ALL, the generated column index may be missing

-- Re-create if missing:
ALTER TABLE op_transactions
  ADD KEY `idx_invoice_id` (`invoice_id`),
  ADD KEY `idx_payment_link_id` (`payment_link_id`);
```

### Webhook Delivery Failures

```bash
# Check WebhookRetryCron is running (should fire every 5 min)
ls -la storage/cron/   # look for .lock files with recent timestamps

# Check failed webhook events
mysql -u root -p ownpay -e "
  SELECT COUNT(*), MAX(attempts) FROM op_webhook_events
  WHERE status IN ('failed', 'pending');"

# Manually trigger retry cron
php public/index.php cron/run
```

### Queue Backed Up

```bash
# File queue - count pending jobs
ls storage/queue/default/*.json | wc -l

# Redis queue - check queue length
redis-cli llen "op:queue:default"

# Check failed jobs
redis-cli llen "op:queue:failed"

# Retry a specific failed job
redis-cli lrange "op:queue:failed" 0 -1
```

---

## Summary

| Priority | Action | Impact |
|---|---|---|
| 🔴 Critical | Set `CACHE_DRIVER=redis` and `QUEUE_DRIVER=redis` | Eliminates file I/O bottleneck |
| 🔴 Critical | Ensure crontab runs `php public/index.php cron/run` every minute | Webhooks, SMS, queue processing |
| 🟠 High | Set `TRUSTED_PROXIES` if behind load balancer/Cloudflare | Correct rate limiting per client IP |
| 🟠 High | Tune `innodb_buffer_pool_size` to 70% of DB server RAM | Eliminates disk I/O for hot data |
| 🟡 Medium | Increase `pm.max_children` based on server RAM | More concurrent PHP workers |
| 🟡 Medium | Monitor `op_webhook_events` failure rate | Ensure merchant callbacks succeed |
| 🟢 Low | Add Nginx gzip compression for admin panel assets | ~40% bandwidth reduction |
| 🟢 Low | Set `SENTRY_DSN` for production error tracking | Faster issue detection |

**Deployment path:**

1. Start with the Docker Compose single-server stack (ships Redis and MariaDB pre-configured)
2. Monitor with `docker stats` and the built-in slow query log
3. Scale vertically first (more RAM = larger InnoDB buffer + more FPM workers)
4. Add a dedicated database server when connections saturate
5. Add app servers + load balancer when PHP-FPM workers saturate

**Need help?** → [Enterprise Support](/resources/external-services/enterprise-support)
