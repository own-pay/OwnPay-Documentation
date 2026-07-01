# Troubleshooting

A comprehensive, production-grade troubleshooting reference for OwnPay administrators, developers, and operations engineers. Each issue includes root-cause analysis, diagnostic commands, and verified solutions sourced directly from the OwnPay codebase.

---

## How to Read This Guide

Every section follows the same structure:

- **Symptom** - What you observe
- **Root Cause** - Why it happens (with the exact code or configuration responsible)
- **Diagnosis** - How to confirm the cause
- **Resolution** - Verified fix

**Log locations quick reference:**

| Log | Path | Notes |
|---|---|---|
| PHP errors | `storage/logs/php-errors.log` | All PHP `E_ERROR`/`E_WARNING` |
| PHP-FPM pool | `storage/logs/php-fpm.log` | Worker startup/crash messages |
| PHP-FPM slow requests | `storage/logs/php-fpm-slow.log` | Requests taking > 10s |
| Application (cron/queue) | `storage/logs/` | Controlled by `LOG_LEVEL` in `.env` |
| MariaDB slow queries | `/var/lib/mysql/slow-queries.log` | Queries taking > 2s |
| Docker container | `docker logs ownpay_app` | Supervisord, Nginx, PHP-FPM combined |

---

## 1. Installation Issues

### 1.1 "PHP version not supported"

**Symptom:** Installer Step 1 shows a PHP version check failure.

**Root Cause:** OwnPay requires PHP **8.3 or higher**. The installer checks `PHP_VERSION_ID` at boot.

**Diagnosis:**

```bash
php -v
# Must show PHP 8.3.x or higher
php -r "echo PHP_VERSION_ID;"
# Must be >= 80300
```

**Resolution:**

*Shared hosting (cPanel/DirectAdmin):*

- Navigate to **Software → Select PHP Version** → Select **PHP 8.3**
- Verify all required extensions are ticked: `pdo_mysql`, `json`, `mbstring`, `openssl`, `curl`, `zip`, `bcmath`, `fileinfo`, `intl`

*VPS/Debian/Ubuntu:*

```bash
sudo add-apt-repository ppa:ondrej/php
sudo apt update
sudo apt install php8.3 php8.3-fpm php8.3-mysql php8.3-curl php8.3-zip \
     php8.3-mbstring php8.3-xml php8.3-bcmath php8.3-intl php8.3-fileinfo
sudo systemctl restart php8.3-fpm
```

---

### 1.2 "MySQL/MariaDB connection failed"

**Symptom:** Installer Step 2 (`testDatabase()`) returns a connection error.

**Root Cause:** Incorrect credentials, the server is unreachable, or the database does not exist. The installer probe uses `PDO::ERRMODE_EXCEPTION` - any connection error surfaces immediately.

**Diagnosis:**

```bash
# Test the exact credentials from the installer form
mysql -u YOUR_USER -p -h YOUR_HOST YOUR_DB_NAME

# Check MariaDB is running
systemctl status mariadb

# Docker
docker logs ownpay_db | tail -20
docker exec ownpay_db mysqladmin -u root -p"$MYSQL_ROOT_PASSWORD" status
```

**Common causes and fixes:**

| Error text | Fix |
|---|---|
| `Access denied for user` | Wrong username/password - re-check in MariaDB |
| `Unknown database` | Database does not exist - create it first |
| `Connection refused` | MariaDB not running or wrong port - `systemctl start mariadb` |
| `Can't connect to ... via socket` | Use `127.0.0.1` instead of `localhost` as host |
| `Host is not allowed to connect` | Grant privileges: `GRANT ALL ON db.* TO 'user'@'%'` |

The installer stores validated credentials in `storage/.env.temp` between steps. If this file is missing when you reach Step 3, restart from Step 2.

---

### 1.3 "storage/ directory not writable"

**Symptom:** Installer Step 1 shows a writable-path check failure. The installer validates write access to `storage/`, `storage/logs/`, `storage/cache/`, `storage/sessions/`, and `storage/queue/`.

**Diagnosis:**

```bash
ls -la storage/
# Directories should be drwxrwxr-x (775) owned by www-data
stat -c '%a %U:%G %n' storage/
```

**Resolution:**

```bash
# Shared hosting
chmod 775 storage
chmod -R 775 storage/

# VPS (PHP-FPM runs as www-data)
chown -R www-data:www-data storage/
chmod -R 775 storage/

# Docker (storage is a named volume)
docker exec -it ownpay_app chown -R www-data:www-data /var/www/ownpay/storage
```

---

### 1.4 "Missing PHP extensions"

**Symptom:** Installer Step 1 lists extensions with a ✗ mark.

**Required extensions and their purpose:**

| Extension | Purpose |
|---|---|
| `pdo_mysql` | All database operations |
| `openssl` | AES-256-GCM encryption, TLS, HMAC |
| `bcmath` | Financial arithmetic (all money math) |
| `mbstring` | Multi-byte string handling |
| `curl` | Webhook delivery, gateway HTTP calls |
| `json` | API responses, plugin manifests |
| `zip` | Plugin/update package extraction |
| `fileinfo` | File upload MIME type validation |
| `intl` | Currency formatting |

**Resolution:**

```bash
# Ubuntu/Debian - install all required extensions at once
sudo apt install php8.3-pdo-mysql php8.3-openssl php8.3-bcmath \
     php8.3-mbstring php8.3-curl php8.3-zip php8.3-fileinfo php8.3-intl
sudo systemctl restart php8.3-fpm nginx

# Verify all are loaded
php -m | grep -E 'pdo_mysql|openssl|bcmath|mbstring|curl|zip|fileinfo|intl'
```

---

### 1.5 Installer step 2 passes but step 3 fails immediately

**Symptom:** "Environment file not found" or "Temporary config missing" during Step 3 (Create Admin).

**Root Cause:** `storage/.env.temp` was not written after Step 2, or was deleted. The installer reads from this file in Step 3 using `vlucas/phpdotenv` - never `parse_ini_file()` - because base64 `=` characters in `APP_KEY` and `ENCRYPTION_KEY` break the PHP ini parser.

**Diagnosis:**

```bash
ls -la storage/.env.temp
# Must exist and be readable by www-data
cat storage/.env.temp | head -5   # Verify it contains DB_ credentials
```

**Resolution:**

1. Re-run Step 2 (`/install?step=2`) to regenerate `.env.temp`
2. Verify `storage/` is writable (see [1.3](#13-storage-directory-not-writable))

---

### 1.6 "/install shows 'Already Installed'"

**Symptom:** Visiting `/install/*` redirects to 404 or the dashboard.

**Root Cause:** The installer locks itself by creating `storage/.installed` at Step 4 finalization. This is intentional and security-critical.

**If you need to re-run the installer** (destroys all data):

```bash
# DANGER: This wipes all settings and the installed lock
rm storage/.installed
rm storage/.env.temp  # if exists
# Also drop and recreate the database
```

> [!CAUTION]
> Removing `storage/.installed` without also clearing the database will cause the installer to attempt schema re-creation on an already-populated database. Always back up your database first.

---

## 2. Authentication & Login Issues

### 2.1 "Invalid credentials" / Cannot log in

**Symptom:** Login form returns "Invalid credentials" despite correct username and password.

**Root Cause:** The [`Authenticator::attempt()`](file:///C:/laragon/www/ownpay/src/Security/Authenticator.php#L68-L127) method uses Argon2id (`password_verify`) for hash comparison. All invalid-user cases intentionally return the same error string to prevent user enumeration.

**Diagnosis flow:**

```bash
# Step 1: Check if the account exists and is active
mysql -u root -p ownpay -e "
  SELECT id, username, email, status, two_factor_enabled
  FROM op_merchant_users
  WHERE email = 'YOUR_EMAIL';"

# Step 2: Check login attempt history
mysql -u root -p ownpay -e "
  SELECT email, ip_address, success, created_at
  FROM op_login_attempts
  WHERE email = 'YOUR_EMAIL'
  ORDER BY created_at DESC
  LIMIT 10;"
```

**Common causes:**

| Symptom | Cause | Fix |
|---|---|---|
| `status = 'suspended'` | Account suspended by admin | Re-activate in **People → Staff** |
| Multiple `success = 0` entries | Brute-force lockout active | Wait for lockout window (see 2.2) |
| No rows in `op_merchant_users` | Wrong email address | Check for typos |
| `password_hash` starts with `$2y` | Legacy bcrypt hash | User must reset password |

**Password reset (admin CLI):**

```bash
# Generate a new Argon2id hash for a temporary password
php -r "echo password_hash('NewTempPassword123!', PASSWORD_ARGON2ID, ['memory_cost'=>65536,'time_cost'=>4,'threads'=>1]);"

# Update the user record
mysql -u root -p ownpay -e "
  UPDATE op_merchant_users
  SET password_hash = 'PASTE_HASH_HERE'
  WHERE email = 'user@example.com';"
```

---

### 2.2 "Account temporarily locked"

**Symptom:** Login returns: *"Account temporarily locked due to repeated failed attempts. Try again in about N minute(s)."*

**Root Cause:** [`Authenticator::attempt()`](file:///C:/laragon/www/ownpay/src/Security/Authenticator.php#L78-L90) checks `LoginAttemptRepository::lockoutSecondsRemaining()` against `op_login_attempts` on every request. The lockout thresholds are set by environment variables:

```ini
# .env
MAX_LOGIN_ATTEMPTS=5      # default: 5 failed attempts triggers lockout
LOCKOUT_DURATION=300      # default: 300 seconds (5 minutes)
```

**Diagnosis:**

```bash
# See how many recent failed attempts exist
mysql -u root -p ownpay -e "
  SELECT email, ip_address, COUNT(*) as failures, MAX(created_at) as last_attempt
  FROM op_login_attempts
  WHERE success = 0
    AND created_at > DATE_SUB(NOW(6), INTERVAL 300 SECOND)
  GROUP BY email, ip_address;"
```

**Resolution:**

*Option A - Wait:* Lockout clears automatically after `LOCKOUT_DURATION` seconds (default 5 minutes).

*Option B - Admin manually clears lockout:*

```sql
-- Clear all lockout records for a specific email
DELETE FROM op_login_attempts
WHERE email = 'user@example.com'
  AND success = 0
  AND created_at > DATE_SUB(NOW(6), INTERVAL 300 SECOND);
```

*Option C - Extend lockout window* (for security hardening):

```ini
# .env
MAX_LOGIN_ATTEMPTS=3
LOCKOUT_DURATION=900  # 15 minutes
```

---

### 2.3 Two-Factor Authentication (TOTP) not working

**Symptom:** The correct 6-digit TOTP code is rejected at the `/2fa` challenge screen.

**Root Cause:** OwnPay uses RFC 6238 TOTP. The [`TwoFactorMiddleware`](file:///C:/laragon/www/ownpay/src/Middleware/TwoFactorMiddleware.php) checks `two_factor_enabled` (`op_merchant_users.two_factor_enabled`) and `$_SESSION['2fa_verified']`. The encrypted secret is stored in `op_merchant_users.totp_secret_enc` - not `totp_secret`.

**Diagnosis steps:**

1. **Verify device time sync** - TOTP codes are time-based. A clock drift > 30 seconds invalidates codes.

   ```bash
   # Server time
   date -u
   # Compare with: https://time.is/UTC
   ```

2. **Force NTP sync on the server:**

   ```bash
   sudo timedatectl set-ntp true
   sudo systemctl restart systemd-timesyncd
   timedatectl status
   ```

3. **Verify the correct column is set in the database:**

   ```sql
   SELECT id, email, two_factor_enabled, totp_secret_enc
   FROM op_merchant_users
   WHERE email = 'user@example.com';
   -- two_factor_enabled should be 1
   -- totp_secret_enc should be non-null (it's AES-256-GCM encrypted)
   ```

4. **Admin disables 2FA for a locked-out user:**

   ```sql
   UPDATE op_merchant_users
   SET two_factor_enabled = 0,
       totp_secret_enc = NULL
   WHERE email = 'user@example.com';
   ```

> [!IMPORTANT]
> `TwoFactorMiddleware` enforces 2FA at line 97 with the comment: *"2FA enforcement must NEVER be overridable by plugins (PCI-DSS 8.4.2)."* There is no plugin hook to bypass 2FA. The only reset path is direct database access or admin panel.

---

### 2.4 Password reset email not arriving

**Symptom:** User clicks "Forgot Password" but no email arrives.

**Root Cause:** OwnPay's [`PasswordResetService`](file:///C:/laragon/www/ownpay/src/Service/Auth/PasswordResetService.php) creates a record in `op_password_resets` with a hashed token (`token_hash` = `SHA-256` of the plaintext token, stored as `CHAR(64)`). Token TTL is 60 minutes (`expires_at > NOW(6)`). The email is dispatched through the queue worker.

**Diagnosis:**

```sql
-- Check if a reset token was created
SELECT user_id, expires_at, used_at, created_at
FROM op_password_resets
WHERE user_id = (SELECT id FROM op_merchant_users WHERE email = 'user@example.com')
ORDER BY created_at DESC
LIMIT 5;
-- expires_at must be in the future; used_at must be NULL
```

```bash
# Check SMTP configuration
grep -E 'MAIL_|SMTP_' .env

# Check the queue for pending email jobs
ls storage/queue/default/*.json | wc -l    # file queue
redis-cli llen "op:queue:default"          # redis queue

# Check application logs for SMTP errors
grep -i 'mail\|smtp\|email' storage/logs/*.log | tail -20
```

**Resolution:**

1. **Verify SMTP in Settings → Email:**
   - Host: `smtp.gmail.com` / `smtp.mailgun.org` / your server
   - Port: `587` (STARTTLS) or `465` (SSL/TLS)
   - Verify credentials with an external SMTP tester

2. **Ensure the queue cron is running:**

   ```bash
   # Check crontab
   crontab -l | grep cron/run
   # Must show: * * * * * php /path/to/ownpay/public/index.php cron/run

   # Manual queue flush
   php public/index.php cron/run
   ```

3. **Check token hasn't expired** - tokens expire after 60 minutes. Request a new one.

---

## 3. Payment & Transaction Issues

### 3.1 Transaction stuck in `pending` state

**Symptom:** A transaction in `op_transactions` has `status = 'pending'` for more than the checkout timer window (default 10 minutes from `config/app.php`: `'timer_seconds' => 600`).

**Root Cause:** One of three scenarios:

- The SMS from the companion mobile device has not been received/matched yet
- The gateway webhook/callback was not delivered to OwnPay
- The `SmsVerificationJob` cron is not running

**Diagnosis:**

```sql
-- Inspect the transaction
SELECT id, trx_id, gateway_slug, method, status, amount, currency,
       payment_intent_id, created_at, updated_at
FROM op_transactions
WHERE trx_id = 'OP-XXXXXXXXX';

-- For SMS-based payments: check if the SMS was received
SELECT id, device_id, amount, trx_id, match_status, received_at, created_at
FROM op_sms_parsed
WHERE merchant_id = YOUR_MERCHANT_ID
  AND match_status = 'pending'
ORDER BY created_at DESC
LIMIT 10;

-- Check if the cron last ran
SELECT * FROM op_job_queue
WHERE job_class LIKE '%SmsVerification%'
ORDER BY created_at DESC LIMIT 5;
```

```bash
# Check SmsVerificationJob lock file (confirms cron is running)
ls -la storage/cron/
# Look for SmsVerificationJob.lock with a recent timestamp

# Manually trigger the cron
php public/index.php cron/run
```

**SMS matching logic:**
[`SmsVerificationJob`](file:///C:/laragon/www/ownpay/src/Cron/SmsVerificationJob.php) matches by:

1. **Provider TRX ID** (`op_sms_parsed.trx_id` → `op_transactions.provider_trx_id`) - exact match
2. **Amount + gateway + time window** - fallback if no TRX ID was parsed; refuses ambiguous matches (two pending transactions of the same amount)

If both strategies fail, `match_status` stays `pending` and `failed` count increments.

**Resolution:**

```bash
# For SMS match failures: check the SmartSmsAnalyzer parsed the correct fields
mysql -u root -p ownpay -e "
  SELECT id, device_id, sender, body, amount, trx_id, gateway_slug, match_status
  FROM op_sms_parsed
  WHERE match_status = 'pending'
  ORDER BY created_at DESC LIMIT 5;"

# Manually complete a transaction (only after confirming payment with gateway)
php public/index.php admin/transactions/complete --trx=OP-XXXXXXXXX
```

---

### 3.2 Transaction shows `failed` but the customer was charged

**Symptom:** `op_transactions.status = 'failed'`, but the gateway dashboard shows the payment was collected.

**Root Cause:** The payment was processed by the gateway but OwnPay's webhook callback failed to deliver - so OwnPay never received the completion event. This is a webhook delivery issue.

**This is a financial reconciliation scenario. Follow this protocol:**

> [!WARNING]
> Do NOT issue a refund before confirming the transaction status with the gateway dashboard. Double-refunding causes financial loss.

**Diagnosis:**

```sql
-- Check webhook delivery attempts for this transaction
SELECT we.id, we.event_type, we.status, we.attempts, we.last_attempt_at, we.next_retry_at,
       wdl.response_code, wdl.error, wdl.duration_ms
FROM op_webhook_events we
LEFT JOIN op_webhook_delivery_logs wdl ON wdl.webhook_event_id = we.id
WHERE we.webhook_id IN (
    SELECT id FROM op_webhooks WHERE merchant_id = YOUR_MERCHANT_ID
)
ORDER BY we.created_at DESC LIMIT 20;

-- Check inbound gateway callback logs (did OwnPay receive the gateway callback at all?)
SELECT direction, gateway, status, status_code, error, created_at
FROM op_webhook_deliveries
WHERE merchant_id = YOUR_MERCHANT_ID
  AND direction = 'inbound'
ORDER BY created_at DESC LIMIT 10;
```

**Resolution:**

1. Confirm payment with gateway dashboard
2. If confirmed charged → manually mark as completed:

   ```sql
   UPDATE op_transactions
   SET status = 'completed',
       completed_at = NOW(6),
       updated_at = NOW(6)
   WHERE trx_id = 'OP-XXXXXXXXX' AND merchant_id = YOUR_MERCHANT_ID;
   ```

3. Manually post the ledger entry (required to keep the double-entry ledger balanced):

   ```bash
   # Use the admin reconciliation tool
   php public/index.php admin/reconcile --trx=OP-XXXXXXXXX
   ```

4. Fix the webhook delivery issue to prevent recurrence (see [Section 5](#5-webhook-issues))

---

### 3.3 Refund fails or shows wrong amount

**Symptom:** Refund request throws `InvalidArgumentException` or the refunded amount is incorrect.

**Root Cause:** [`RefundService::create()`](file:///C:/laragon/www/ownpay/src/Service/Payment/RefundService.php#L75) enforces these rules:

1. Transaction must belong to the requesting merchant (`merchant_id` match)
2. Transaction `status` must be `completed` - not `pending`, `failed`, or already `refunded`
3. Refund amount cannot exceed the remaining un-refunded amount (`amount - SUM(existing_refunds)`)
4. Partial refunds are calculated using BCMath string arithmetic - never float

The fee reversal amount is prorated from the original transaction's `fee/amount` ratio, not the current fee rules (fee rules may have changed since the original payment).

**Diagnosis:**

```sql
-- Check transaction eligibility
SELECT id, status, amount, fee, net_amount, currency, merchant_id
FROM op_transactions
WHERE trx_id = 'OP-XXXXXXXXX';

-- Check existing refunds
SELECT id, amount, status, reason, created_at
FROM op_refunds
WHERE transaction_id = TXN_ID;

-- Remaining refundable amount = amount - SUM(approved refunds)
SELECT t.amount - COALESCE(SUM(r.amount), 0) as refundable_remaining
FROM op_transactions t
LEFT JOIN op_refunds r ON r.transaction_id = t.id AND r.status = 'approved'
WHERE t.id = TXN_ID;
```

**Common errors:**

| Error | Cause | Fix |
|---|---|---|
| `Transaction not found` | Wrong `merchant_id` scope | Verify you are in the correct brand context |
| `Transaction not eligible for refund` | Status is not `completed` | Confirm transaction completed first |
| `Refund amount exceeds remaining` | Partial refunds already issued | Reduce refund amount |
| `Gateway refund failed` | Gateway API rejected the refund | Check gateway dashboard; some gateways have time limits |

---

### 3.4 Invoice total shows 0.00 after update

**Symptom:** Updating an invoice saves `0.00` as the subtotal/total.

**Root Cause:** `InvoiceService::update()` must dynamically recalculate subtotals from the submitted line items on every save. If the update routine reads from a stale state or the `quantity × price` loop is not executed, the totals write as `0.00`. Additionally, old `op_invoice_items` rows must be purged before fresh ones are inserted - otherwise orphan line items accumulate.

**Diagnosis:**

```sql
-- Check invoice and line items
SELECT inv.id, inv.subtotal, inv.total, inv.status
FROM op_invoices inv
WHERE id = INVOICE_ID;

SELECT id, description, quantity, unit_price, total
FROM op_invoice_items
WHERE invoice_id = INVOICE_ID;

-- If op_invoice_items has duplicate rows, the purge step was skipped
SELECT invoice_id, COUNT(*) as row_count
FROM op_invoice_items
GROUP BY invoice_id
HAVING row_count > (SELECT COUNT(*) FROM op_invoice_items WHERE invoice_id = INVOICE_ID LIMIT 1);
```

**Resolution:**

1. Re-save the invoice from the admin panel - the form will recalculate
2. If the issue persists after the next OwnPay update, manually fix:

   ```sql
   -- Recalculate from line items
   UPDATE op_invoices inv
   SET subtotal = (
       SELECT COALESCE(SUM(ii.quantity * ii.unit_price), 0)
       FROM op_invoice_items ii WHERE ii.invoice_id = inv.id
   ),
   total = (
       SELECT COALESCE(SUM(ii.quantity * ii.unit_price), 0)
       FROM op_invoice_items ii WHERE ii.invoice_id = inv.id
   )
   WHERE inv.id = INVOICE_ID;
   ```

---

### 3.5 Ledger balance mismatch

**Symptom:** The daily `BalanceVerificationJob` sends a balance mismatch alert, or the `MERCHANT_PAYABLE` ledger balance doesn't match the sum of completed transactions.

**Root Cause:** The double-entry ledger in `op_ledger_accounts`, `op_ledger_transactions`, and `op_ledger_entries` is written via [`LedgerService::postEntries()`](file:///C:/laragon/www/ownpay/src/Service/Payment/LedgerService.php#L65-L150). This method:

- Validates that `SUM(debits) === SUM(credits)` using `bccomp()` at 4-decimal precision
- Guards against double-posting with `SELECT ... FOR UPDATE` on `(merchant_id, reference_type, reference_id, description)`
- Throws `InvalidArgumentException` on an unbalanced journal - this error must never be suppressed

**Diagnosis:**

```sql
-- Check MERCHANT_PAYABLE balance
SELECT la.name, la.type, la.balance, la.currency
FROM op_ledger_accounts la
WHERE la.merchant_id = YOUR_MERCHANT_ID
  AND la.name IN ('CASH', 'MERCHANT_PAYABLE', 'PLATFORM_FEE_REVENUE');

-- Calculate expected balance from transactions
SELECT
    SUM(CASE WHEN status = 'completed' THEN net_amount ELSE 0 END) as expected_payable,
    SUM(CASE WHEN status = 'refunded' THEN net_amount ELSE 0 END) as total_refunds,
    SUM(CASE WHEN status = 'completed' THEN fee ELSE 0 END) as total_fees
FROM op_transactions
WHERE merchant_id = YOUR_MERCHANT_ID;

-- Find transactions missing a ledger entry (potential double-post prevention false-positive)
SELECT t.id, t.trx_id, t.amount, t.status
FROM op_transactions t
LEFT JOIN op_ledger_transactions lt
    ON lt.reference_type = 'transaction' AND lt.reference_id = t.id
    AND lt.merchant_id = t.merchant_id
WHERE t.status = 'completed'
  AND lt.id IS NULL
  AND t.merchant_id = YOUR_MERCHANT_ID;
```

**Resolution:**

- **Missing ledger entry** → Use the reconciliation tool to re-post:

  ```bash
  php public/index.php admin/reconcile --merchant=YOUR_MERCHANT_ID
  ```

- **Genuine balance mismatch** → Investigate the specific transaction IDs flagged in the `BalanceVerificationJob` alert. Do not manually modify `op_ledger_accounts.balance` - always go through `LedgerService`.

---

## 4. Gateway & Checkout Issues

### 4.1 Gateway not appearing on checkout

**Symptom:** A configured gateway is absent from the checkout page.

**Root Cause:** The checkout controller loads gateways via `GatewayBridge` using a combination of `op_plugins` (installed status) and `op_gateway_configs` (active/enabled flag per merchant). The `DomainMiddleware` also restricts checkout paths on custom domains to `checkout`, `invoice`, and `pay` prefixes only.

**Diagnosis:**

```sql
-- Check plugin installation status
SELECT p.slug, p.status, p.is_active, gc.enabled, gc.merchant_id
FROM op_plugins p
LEFT JOIN op_gateway_configs gc ON gc.gateway_slug = p.slug
    AND gc.merchant_id = YOUR_MERCHANT_ID
WHERE p.type = 'gateway';

-- Verify domain allows checkout routes
SELECT d.domain, d.type, d.dns_verified, d.status
FROM op_domains d
WHERE d.merchant_id = YOUR_MERCHANT_ID;
-- type must be 'checkout' (not 'api') for checkout routes to work
```

**Checklist:**

1. **Admin → Gateways → Payment Gateways** - Is the gateway listed and toggled **active**?
2. **Plugin installed?** - `op_plugins.status = 'active'` and `is_active = 1`
3. **Gateway config exists?** - `op_gateway_configs` has a row for `(merchant_id, gateway_slug)` with `enabled = 1`
4. **Correct domain type?** - `op_domains.type` must be `checkout` for checkout URLs

**Logo not showing:**
Gateway logos are resolved via `PluginManager::resolveIconPath()`, which copies the icon from `modules/{slug}/` to `public/assets/img/gateways/{slug}.{ext}` on first load. If the icon is missing, check that the plugin files are in `modules/` and the `public/assets/img/gateways/` directory is writable.

---

### 4.2 "Gateway returns 'Invalid Credentials' / 401"

**Symptom:** Gateway API calls fail with authentication errors.

**Root Cause:** Gateway API credentials in `op_gateway_configs` are stored AES-256-GCM encrypted via `FieldEncryptor`. If `ENCRYPTION_KEY` changes after credentials are saved, decryption will silently fail and return garbage bytes - causing credential errors at the gateway.

**Diagnosis:**

```bash
# Verify ENCRYPTION_KEY has not changed since credentials were saved
grep ENCRYPTION_KEY .env
# Compare with the hash you stored at setup time

# Check gateway config exists for the merchant
mysql -u root -p ownpay -e "
  SELECT gc.id, gc.gateway_slug, gc.enabled, gc.merchant_id,
         LENGTH(gc.config) as config_length
  FROM op_gateway_configs gc
  WHERE gc.merchant_id = YOUR_MERCHANT_ID;"
```

**Resolution:**

1. **Re-enter credentials** in **Admin → Gateways → [Gateway Name] → Edit**
2. Ensure you are using the correct environment's credentials (test vs. live)
3. If `ENCRYPTION_KEY` was rotated, re-enter all gateway credentials (they cannot be automatically re-encrypted)

---

### 4.3 Checkout page returns 404 on custom domain

**Symptom:** Customers visiting `pay.yourdomain.com/checkout/xxx` receive a 404 error.

**Root Cause:** [`DomainMiddleware`](file:///C:/laragon/www/ownpay/src/Middleware/DomainMiddleware.php) enforces several conditions that each produce a 404:

1. Domain not in `op_domains` table → 404
2. `op_domains.status = 'inactive'` → 404
3. `op_domains.dns_verified = 0` → 503 "DNS verification pending"
4. Merchant is `suspended` or inactive → 404
5. Domain `type = 'api'` but request is `/checkout/*` → 404
6. Request path is `/admin/*` on any custom domain → 404 (by design)

**Diagnosis:**

```sql
SELECT d.domain, d.type, d.dns_verified, d.status, d.redirect_url,
       m.status as merchant_status
FROM op_domains d
JOIN op_merchants m ON m.id = d.merchant_id
WHERE d.domain = 'pay.yourdomain.com';
```

```bash
# Verify DNS resolution
dig +short pay.yourdomain.com
# Must point to your OwnPay server IP

# Check the domain warning log
grep "DomainMiddleware" storage/logs/*.log | tail -10
```

**Resolution by cause:**

- `dns_verified = 0` → Go to **System → Domains** and click "Verify DNS"
- `status = 'inactive'` → Activate the domain in **System → Domains**
- `type = 'api'` → Change domain type to `checkout`
- `merchant_status ≠ 'active'` → Activate the brand in **People → Brands**
- DNS not pointing to server → Update DNS A/CNAME record to your server IP

---

### 4.4 Webhook callback from gateway arriving but not processed

**Symptom:** The gateway dashboard shows the callback was sent (HTTP 200), but the transaction stays `pending` in OwnPay.

**Root Cause:** The inbound webhook is logged in `op_webhook_deliveries` (`direction = 'inbound'`). Deduplication uses a virtual generated column `dedup_key = merchant_id:payload_hash` with a `UNIQUE` constraint (`uk_inbound_dedup`) - a duplicate payload silently discards the event.

**Diagnosis:**

```sql
-- Check inbound deliveries for this merchant
SELECT gateway, event, url, direction, status_code, status, error, created_at
FROM op_webhook_deliveries
WHERE merchant_id = YOUR_MERCHANT_ID
  AND direction = 'inbound'
ORDER BY created_at DESC
LIMIT 20;

-- Check for deduplication hits (duplicate_key violations)
SELECT payload_hash, COUNT(*) as count
FROM op_webhook_deliveries
WHERE merchant_id = YOUR_MERCHANT_ID
  AND direction = 'inbound'
GROUP BY payload_hash
HAVING count > 1;
```

**Resolution:**

- If `status = 'rejected'` → Webhook signature validation failed. Verify the gateway's signing secret matches what's configured in OwnPay.
- If the payload hash is duplicated → The gateway sent the same payload twice. OwnPay intentionally deduplicates; the first delivery should have been processed.
- If `status = 'received'` but transaction is still pending → Check the route/controller that handles the inbound callback for that gateway slug.

---

## 5. Webhook Issues

### 5.1 Outbound webhooks not being delivered

**Symptom:** `op_webhook_events.status = 'failed'` with zero `attempts`, or events not appearing in the table at all.

**Root Cause:** OwnPay's [`WebhookService::deliver()`](file:///C:/laragon/www/ownpay/src/Service/Payment/WebhookService.php#L114-L275) performs an **SSRF safety check** before every delivery via `UrlValidator::isValidWebhookUrl()`. URLs pointing to private IP ranges (`127.x.x.x`, `10.x.x.x`, `192.168.x.x`, `169.254.x.x`, `::1`), localhost hostnames, or bare IP addresses are immediately dead-lettered with status `failed` and attempts set to 1.

**Diagnosis:**

```sql
-- Check the webhook URL and recent delivery attempts
SELECT w.url, w.events, w.status,
       we.event_type, we.status as event_status, we.attempts,
       we.last_attempt_at, we.next_retry_at
FROM op_webhooks w
JOIN op_webhook_events we ON we.webhook_id = w.id
WHERE w.merchant_id = YOUR_MERCHANT_ID
ORDER BY we.created_at DESC LIMIT 10;

-- Check delivery logs for detailed errors
SELECT wdl.response_code, wdl.error, wdl.duration_ms, wdl.created_at
FROM op_webhook_delivery_logs wdl
JOIN op_webhook_events we ON we.id = wdl.webhook_event_id
WHERE we.status = 'failed'
ORDER BY wdl.created_at DESC LIMIT 10;
```

```bash
# Test your endpoint is reachable from the OwnPay server
curl -v -X POST https://your-app.com/webhooks/ownpay \
  -H "Content-Type: application/json" \
  -d '{"event":"test","data":{},"timestamp":1234567890}'

# Check if WebhookRetryCron is running (fires every 5 min)
ls -la storage/cron/
grep "WebhookRetryCron" storage/logs/*.log | tail -5
```

**Common error patterns:**

| `error` field value | Cause | Fix |
|---|---|---|
| `SSRF blocked` | URL is a private/loopback IP | Use a public HTTPS URL |
| `HTTP status 0` | cURL connection timed out (5s connect timeout) | Check firewall; URL must be publicly reachable |
| `HTTP status 5xx` | Your endpoint crashed | Fix the bug in your webhook handler |
| `HTTP status 401/403` | Your endpoint requires auth | Remove auth requirement or use a public path |
| `SSL certificate problem` | Self-signed or expired cert on destination | Install a valid TLS certificate |

---

### 5.2 Outbound webhook retry schedule

**Root Cause:** [`WebhookService::deliver()`](file:///C:/laragon/www/ownpay/src/Service/Payment/WebhookService.php#L219-L231) uses an exponential back-off schedule - `next_retry_at` is set automatically after each failure:

| Attempt | Retry delay |
|---|---|
| 1 | 5 minutes |
| 2 | 15 minutes |
| 3 | 1 hour |
| 4 | 6 hours |
| 5 | 12 hours |
| 6 | 24 hours |
| 7+ | Dead-lettered (no further retries) |

[`WebhookRetryCron`](file:///C:/laragon/www/ownpay/src/Cron/WebhookRetryCron.php) processes up to **50 pending events** per execution (every 5 minutes).

**Force an immediate retry:**

```sql
-- Reset next_retry_at to force immediate retry on next cron run
UPDATE op_webhook_events
SET next_retry_at = NOW(6),
    status = 'pending'
WHERE id = EVENT_ID;

-- Or reset all failed events for a merchant's webhook
UPDATE op_webhook_events we
JOIN op_webhooks w ON w.id = we.webhook_id
SET we.next_retry_at = NOW(6),
    we.status = 'pending',
    we.attempts = 0
WHERE w.merchant_id = YOUR_MERCHANT_ID
  AND we.status = 'failed';
```

---

### 5.3 Webhook signature verification failing

**Symptom:** Your receiving application rejects webhooks with an `X-Signature` mismatch.

**Root Cause:** [`WebhookService::deliver()`](file:///C:/laragon/www/ownpay/src/Service/Payment/WebhookService.php#L131-L143) signs the **full JSON body** using HMAC-SHA256 with the webhook's secret:

```php
$body = json_encode(['event' => $eventType, 'data' => $payload, 'timestamp' => time()]);
$signature = hash_hmac('sha256', $body, $secret);
// Header sent: X-Signature: sha256={$signature}
```

**Common mistakes:**

- Reading `$request->body()` after JSON-decoding and re-encoding it (produces different whitespace)
- Using the API key instead of the webhook secret
- Using the wrong HMAC algorithm (must be `sha256`, not `sha1` or `sha512`)
- Clock skew on `X-Timestamp` causing timestamp validation to fail on the receiving end

**Correct verification (PHP example):**

```php
$rawBody    = file_get_contents('php://input');  // Raw body - never decoded/re-encoded
$signature  = $_SERVER['HTTP_X_SIGNATURE'] ?? '';
$secret     = 'your-webhook-secret-from-ownpay-dashboard';

$expected   = 'sha256=' . hash_hmac('sha256', $rawBody, $secret);
$isValid    = hash_equals($expected, $signature);  // Timing-safe comparison

if (!$isValid) {
    http_response_code(401);
    exit('Signature mismatch');
}
```

---

## 6. Mobile Companion & SMS Issues

### 6.1 Device pairing fails / OTP rejected

**Symptom:** The mobile app cannot pair - OTP is rejected or already expired.

**Root Cause:** [`DevicePairingService::generatePairingOtp()`](file:///C:/laragon/www/ownpay/src/Service/Device/DevicePairingService.php#L84-L119) generates a 6-digit OTP stored as `SHA-256(otp)` in `op_device_pairing_tokens.otp_hash`. The OTP expires in **5 minutes** (`expires_at = NOW + 5 minutes`). Generating a new OTP invalidates all previous unused OTPs for that merchant.

Rate limit: **5 pairing requests per 5 minutes per admin account** (checked against `created_by`).

**Diagnosis:**

```sql
-- Check pairing token state
SELECT otp_hash, expires_at, is_used, used_at, created_by, created_at
FROM op_device_pairing_tokens
WHERE merchant_id = YOUR_MERCHANT_ID
ORDER BY created_at DESC LIMIT 5;
-- expires_at must be in the future, is_used must be 0
```

```bash
# Check if rate limit is reached (> 5 OTPs in last 5 minutes for same admin)
mysql -u root -p ownpay -e "
  SELECT created_by, COUNT(*) as otp_count
  FROM op_device_pairing_tokens
  WHERE created_at > DATE_SUB(NOW(6), INTERVAL 300 SECOND)
  GROUP BY created_by;"
```

**Resolution:**

1. Generate a fresh OTP from **Admin → Mobile & SMS → Pair Device**
2. Enter the code within **5 minutes**
3. If rate-limited, wait 5 minutes before requesting a new OTP

---

### 6.2 Paired device JWT token rejected (401 on API)

**Symptom:** Mobile app API calls return `401 Unauthorized` after previously working.

**Root Cause:** [`JwtService`](file:///C:/laragon/www/ownpay/src/Service/Auth/JwtService.php) issues HS256 tokens with claims: `iss=OwnPay`, `aud=ownpay-mobile`, `sub={userId}`, `mid={merchantId}`, `did={deviceId}`. Default TTL is **86400 seconds (24 hours)**. The `JWT_SECRET` environment variable must be non-empty in production - the service throws `RuntimeException` if it's missing.

**Diagnosis:**

```bash
# Verify JWT_SECRET is set
grep JWT_SECRET .env
# Must be non-empty (generate: openssl rand -hex 32)

# Check paired device status
mysql -u root -p ownpay -e "
  SELECT device_id, device_name, platform, status, last_heartbeat, created_at
  FROM op_paired_devices
  WHERE merchant_id = YOUR_MERCHANT_ID
  ORDER BY created_at DESC LIMIT 10;"
```

**Resolution:**

- **Token expired** → Re-authenticate in the mobile app (re-enter OTP to get a new token)
- **Device revoked** → `op_paired_devices.status = 'revoked'` → Admin must re-pair the device
- **`JWT_SECRET` changed** → All existing tokens are invalid. Re-pair all devices.
- **`mid` claim mismatch** → Token's merchant ID doesn't match the device's assigned brand

---

### 6.3 SMS not matching to transactions

**Symptom:** SMS payments stay `pending`; the SMS is received by the device but `op_sms_parsed.match_status` stays `pending`.

**Root Cause:** [`SmsVerificationJob`](file:///C:/laragon/www/ownpay/src/Cron/SmsVerificationJob.php) matches in this order:

1. Exact `provider_trx_id` match via `findByProviderTrxId()`
2. Amount + gateway slug + time window via `findPendingMatch()` or `findPendingMatchGlobal()` (all-brands)

**`findPendingMatchGlobal` refuses ambiguous matches** - if two transactions have the same amount pending in the same time window, it returns `null` to prevent attributing money to the wrong transaction.

**Diagnosis:**

```sql
-- Check parsed SMS records
SELECT id, device_id, sender, amount, trx_id, gateway_slug,
       match_status, received_at, created_at
FROM op_sms_parsed
WHERE match_status = 'pending'
ORDER BY created_at DESC LIMIT 10;

-- Check for ambiguous amount collisions
SELECT amount, gateway_slug, COUNT(*) as conflict_count
FROM op_transactions
WHERE status = 'pending'
  AND merchant_id = YOUR_MERCHANT_ID
  AND created_at > DATE_SUB(NOW(6), INTERVAL 30 MINUTE)
GROUP BY amount, gateway_slug
HAVING conflict_count > 1;
-- If conflicts exist, the amount-based fallback will fail
```

**Resolution:**

- **No `trx_id` parsed** → Check [`SmartSmsAnalyzer`](file:///C:/laragon/www/ownpay/src/Service/Sms/SmartSmsAnalyzer.php) can parse the sender's SMS format. Add a custom regex template in **Admin → Mobile & SMS → SMS Templates**.
- **Amount collision** → Two transactions of the same amount. The system is correct to refuse. One must be manually completed after confirming with the gateway.
- **Cron not running** → Add `* * * * * php /var/www/ownpay/public/index.php cron/run` to crontab.
- **All-brands device, wrong brand attribution** → Check `op_sms_parsed.merchant_id` - all-brands device SMS is stored under `platform_id`. `SmsVerificationJob` calls `rebindToBrand()` to re-attribute after matching.

---

## 7. Admin Panel Issues

### 7.1 Admin panel is slow

**Symptom:** Page loads take 3–10+ seconds in the admin dashboard.

**Diagnosis checklist:**

```bash
# 1. Check cache driver - must be 'redis', not 'file' for performance
grep CACHE_DRIVER .env

# 2. Check PHP-FPM worker saturation
curl http://127.0.0.1/fpm-status  # internal only
# Look for: 'listen queue' - if > 0, all workers are busy

# 3. Check OPcache is active
php -r "var_dump(opcache_get_status()['opcache_enabled']);"
# Must return bool(true)

# 4. Check MariaDB slow queries
tail -20 /var/lib/mysql/slow-queries.log

# 5. Check server resources
top -bn1 | head -20
free -h
```

**Most common causes:**

| Symptom | Root Cause | Fix |
|---|---|---|
| `CACHE_DRIVER=file` | Every settings read hits the filesystem | Set `CACHE_DRIVER=redis` |
| OPcache disabled | PHP recompiles every file on each request | Enable in `php.ini` (`opcache.enable=1`) |
| `listen queue > 0` | All FPM workers busy; requests queueing | Increase `pm.max_children` |
| Slow queries > 2s | Missing indexes or large unfiltered queries | Run `EXPLAIN` on slow queries |
| MariaDB buffer pool too small | InnoDB reading from disk instead of RAM | Increase `innodb_buffer_pool_size` |

---

### 7.2 "403 Forbidden" or missing navigation items

**Symptom:** Staff user gets a 403 on a specific admin page, or a menu item is not visible.

**Root Cause:** [`PermissionMiddleware`](file:///C:/laragon/www/ownpay/src/Middleware/PermissionMiddleware.php) resolves the required permission for each route via `resolvePermission()` and checks it against the role's grants in `op_role_permissions`. The session stores `auth_role_id` - permissions are loaded on every request from `RoleRepository::getPermissions()`.

**Diagnosis:**

```sql
-- Check the user's role and permissions
SELECT u.email, u.status, r.name as role_name, rp.permission
FROM op_merchant_users u
JOIN op_roles r ON r.id = u.role_id
JOIN op_role_permissions rp ON rp.role_id = r.id
WHERE u.email = 'staff@example.com'
ORDER BY rp.permission;

-- Check if the permission exists for this role
SELECT permission FROM op_role_permissions
WHERE role_id = (SELECT role_id FROM op_merchant_users WHERE email = 'staff@example.com')
  AND permission = 'transactions.view';
```

**Resolution:**

1. Admin goes to **People → Roles & Permissions**
2. Select the role → Add the missing permission
3. Staff user must **log out and log in** to refresh their session's role cache

For cross-brand (All Brands) access, the user needs the `brands.access_all` permission. Staff users without this permission will always be restricted to their assigned brand.

---

### 7.3 Brand switcher shows wrong data / "All Brands" shows brand-only data

**Symptom:** After switching brand context, data from another brand bleeds through, or the "All Brands" view shows only one brand's data.

**Root Cause:** Brand context is managed by [`BrandContext`](file:///C:/laragon/www/ownpay/src/Service/Brand/BrandContext.php). The active brand ID is resolved from the request and cached. All scoped repositories use `TenantScope::forTenant($merchantId)` - calling `forAllTenants()` is the only valid bypass. The platform-owner row (`is_platform = 1`, slug `__platform__`) is excluded from the brand switcher and must never be a selectable brand.

**Diagnosis:**

```sql
-- Verify the platform-owner row is correctly set
SELECT id, name, slug, is_platform, status
FROM op_merchants
WHERE is_platform = 1;
-- Should return exactly ONE row

-- Verify no regular brands accidentally have is_platform = 1
SELECT COUNT(*) FROM op_merchants WHERE is_platform = 1;
-- Must be exactly 1
```

**Resolution:**

- If the `is_platform` count is > 1 → all but one must be set back to 0
- If `BrandContext::getPlatformId()` returns 0 → the platform row is missing; re-run the installer or seed it manually
- If session persists incorrect brand context → force the user to log out

---

## 8. Performance Diagnostic Commands

### Quick health check (run from server)

```bash
#!/bin/bash
echo "=== OwnPay Health Check ==="

echo "--- PHP-FPM ---"
curl -s http://127.0.0.1/fpm-status 2>/dev/null | grep -E 'pool|pm|processes|listen queue'

echo "--- Redis ---"
redis-cli -h 127.0.0.1 info stats | grep -E 'keyspace_hits|keyspace_misses|evicted_keys|connected_clients'

echo "--- MariaDB ---"
mysql -u root -p"$DB_ROOT_PASS" -e "SHOW STATUS LIKE 'Threads_connected';" 2>/dev/null
mysql -u root -p"$DB_ROOT_PASS" -e "SHOW STATUS LIKE 'Slow_queries';" 2>/dev/null

echo "--- Disk ---"
df -h /var/www/ownpay/storage

echo "--- Cron Locks ---"
ls -la /var/www/ownpay/storage/cron/

echo "--- Queue Depth ---"
redis-cli llen "op:queue:default" 2>/dev/null || ls /var/www/ownpay/storage/queue/default/*.json 2>/dev/null | wc -l
```

### Database diagnostic queries

```sql
-- Pending transactions older than 1 hour (possible stuck payments)
SELECT trx_id, gateway_slug, method, amount, currency, created_at
FROM op_transactions
WHERE status = 'pending'
  AND created_at < DATE_SUB(NOW(6), INTERVAL 1 HOUR)
ORDER BY created_at DESC;

-- Webhook events failing repeatedly
SELECT we.id, w.url, we.event_type, we.attempts, we.last_attempt_at
FROM op_webhook_events we
JOIN op_webhooks w ON w.id = we.webhook_id
WHERE we.status = 'failed'
  AND we.attempts >= 3
ORDER BY we.last_attempt_at DESC LIMIT 20;

-- SMS records that haven't matched in > 30 minutes
SELECT id, device_id, amount, trx_id, gateway_slug, received_at
FROM op_sms_parsed
WHERE match_status = 'pending'
  AND created_at < DATE_SUB(NOW(6), INTERVAL 30 MINUTE)
ORDER BY created_at DESC;

-- Ledger integrity check: find unbalanced transactions
SELECT lt.id, lt.description, lt.reference_type, lt.reference_id,
       SUM(CASE WHEN le.type = 'debit'  THEN le.amount ELSE 0 END) as total_debit,
       SUM(CASE WHEN le.type = 'credit' THEN le.amount ELSE 0 END) as total_credit
FROM op_ledger_transactions lt
JOIN op_ledger_entries le ON le.ledger_transaction_id = lt.id
WHERE lt.merchant_id = YOUR_MERCHANT_ID
GROUP BY lt.id, lt.description, lt.reference_type, lt.reference_id
HAVING ABS(total_debit - total_credit) > 0.001
ORDER BY lt.created_at DESC;
```

---

## 9. Log Analysis Reference

### Searching logs effectively

```bash
# All PHP errors in the last 24 hours
grep "$(date -d 'yesterday' '+%Y-%m-%d')\|$(date '+%Y-%m-%d')" \
  storage/logs/php-errors.log | grep -i "error\|exception\|fatal"

# Webhook delivery failures
grep -i "webhook\|delivery\|SSRF" storage/logs/*.log | tail -30

# Authentication failures
grep "auth.login.failed\|Invalid credentials\|locked" storage/logs/*.log | tail -20

# SMS matching failures
grep -i "sms\|match\|SmsVerification" storage/logs/*.log | tail -20

# Cron execution summary
grep -i "cron\|job\|queue" storage/logs/*.log | tail -30

# Docker: stream all logs with timestamps
docker logs --since 1h --timestamps ownpay_app 2>&1 | grep -v "fpm-ping"
```

### Reading PHP-FPM slow log

The slow log (`storage/logs/php-fpm-slow.log`) triggers for requests taking > 10 seconds and includes the full stack trace:

```
[01-Jul-2026 14:30:01]  [pool ownpay] pid 1234
script_filename = /var/www/ownpay/public/index.php
[0x00007f...] LedgerRepository->entriesPaginated() /var/www/ownpay/src/Repository/LedgerRepository.php:245
[0x00007f...] LedgerService->entries() /var/www/ownpay/src/Service/Payment/LedgerService.php:241
```

Use the stack trace to identify the slow code path and add an appropriate database index or add query pagination.

---

## 10. Getting Help

### Before contacting support

Collect the following information:

```bash
# OwnPay version
php public/index.php --version

# PHP version and loaded extensions
php -v
php -m | sort

# Environment summary (never share credentials)
php -r "
echo 'CACHE_DRIVER: ' . (getenv('CACHE_DRIVER') ?: 'file') . PHP_EOL;
echo 'QUEUE_DRIVER: ' . (getenv('QUEUE_DRIVER') ?: 'file') . PHP_EOL;
echo 'APP_ENV: '      . (getenv('APP_ENV') ?: 'production') . PHP_EOL;
"

# Last 50 PHP errors
tail -50 storage/logs/php-errors.log

# Recent slow queries
tail -20 /var/lib/mysql/slow-queries.log
```

### Support resources

| Resource | URL |
|---|---|
| Enterprise Support | [support.ownpay.org](https://support.ownpay.org) |
| GitHub Issues | Submit bug reports with full error details |
| Performance Guide | [Performance & Scaling](performance-scaling.md) |
| FAQ | [FAQ](/advanced-topics/faq) |

**Required information for all support tickets:**

1. Exact error message and HTTP status code
2. OwnPay version (`php public/index.php --version`)
3. Relevant log excerpts (`storage/logs/php-errors.log`)
4. Steps to reproduce the issue
5. What you have already tried
