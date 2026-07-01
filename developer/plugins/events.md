# Event System

OwnPay's plugin system is built around a central event bus implemented in `OwnPay\Event\EventManager`. It provides two hook types - **actions** (fire-and-forget) and **filters** (pipeline mutation) - that allow plugins to extend and customise core behaviour without modifying any core files.

This document covers the `EventManager` API, execution model, security behaviour, and the complete catalogue of every hook in the system. The authoritative machine-readable version is `config/hooks.php`, which is kept in sync with every `doAction`/`applyFilter` call site in the codebase.

---

## 1. Hook Types

### Actions

Actions are fire-and-forget. The core fires an action at a defined point in execution; any listener registered on that hook runs. The return value of the listener is discarded.

```
Core fires: $events->doAction('payment.transaction.completed', $txn)
     ↓
Plugin listens: $events->addAction('payment.transaction.completed', function (array $txn): void { ... })
```

**Use actions to**: send notifications, write logs, update external systems, enqueue background jobs.

### Filters

Filters pass a value through a pipeline of listeners. Each listener receives the current value, may transform it, and must return the (possibly modified) value. After all listeners run, the final value is returned to the caller.

```
Core calls: $amount = $events->applyFilter('payment.amount.calculate', $amount, $context)
     ↓
Plugin modifies: $events->addFilter('payment.amount.calculate', function (string $amount, array $ctx): string {
    return bcadd($amount, '1.00', 2); // adds a $1.00 surcharge
})
```

**Use filters to**: modify data before it is saved or sent, override templates, augment context arrays, intercept and validate inputs.

---

## 2. API Reference

All hook interaction happens through the `EventManager` instance, which is passed to `PluginInterface::register()` as the first argument. You must **never** instantiate `EventManager` directly inside a plugin - always use the injected instance.

### `addAction(string $hook, callable $callback, int $priority = 10): void`

Registers a callback on an action hook.

```php
$events->addAction('payment.transaction.completed', [$this, 'onPaymentCompleted'], priority: 10);
```

- **`$hook`**: The hook name (e.g., `'payment.transaction.completed'`).
- **`$callback`**: Any PHP callable - closure, `[$object, 'method']`, or named function.
- **`$priority`**: Execution order. Lower number = runs earlier. Default is `10`. Multiple listeners at the same priority run in registration order.

---

### `doAction(string $hook, mixed ...$args): void`

Fires an action hook. Called by the core, not by plugins.

```php
$events->doAction('payment.transaction.completed', $transactionArray);
```

---

### `addFilter(string $hook, callable $callback, int $priority = 10): void`

Registers a callback on a filter hook.

```php
$events->addFilter('payment.fee.calculate', function (string $fee, array $ctx): string {
    // Return the modified value
    return $fee;
}, priority: 20);
```

- The first argument to the callback is always the value being filtered.
- Additional arguments match what the core passes to `applyFilter()`.
- The callback **must** return a value of the same type as it received.

---

### `applyFilter(string $hook, mixed $value, mixed ...$args): mixed`

Applies a filter pipeline. Called by the core, not by plugins.

```php
$amount = $events->applyFilter('payment.amount.calculate', $amount, ['currency' => 'USD']);
```

`applyFilters()` is an alias for `applyFilter()` - both are identical.

---

### `removeAction(string $hook, callable $callback): bool`

Removes a previously registered action callback.

```php
$removed = $events->removeAction('payment.transaction.completed', [$this, 'onPaymentCompleted']);
```

Returns `true` if the callback was found and removed.

---

### `removeFilter(string $hook, callable $callback): bool`

Removes a previously registered filter callback. Returns `true` if removed.

---

### `removeHook(string $hook): void`

Removes **all** actions and filters registered on a hook name.

---

### `removeByOwner(string $owner): void` / `removeAllByOwner(string $owner): int`

Removes all hooks registered by a specific plugin slug. `removeAllByOwner()` returns the count of removed callbacks. Called internally by `PluginManager` when a plugin is deactivated.

---

### `hasAction(string $hook): bool`

Returns `true` if at least one action listener is registered on the hook.

---

### `hasFilter(string $hook): bool`

Returns `true` if at least one filter listener is registered on the hook.

---

### `hasHook(string $hook): bool`

Returns `true` if any action **or** filter listener is registered on the hook.

---

### `getFireCount(string $hook): int`

Returns how many times a hook has been fired in the current request lifecycle. Useful for debugging.

---

### `getActiveOwner(): string`

Returns the slug of the plugin currently executing inside a hook callback, or `'core'` if executing outside a hook. Populated from the internal `ownerStack`.

---

### `getRegisteredHooks(): array`

Returns a sorted map of every registered hook and its listener counts:

```php
[
    'payment.transaction.completed' => ['actions' => 3, 'filters' => 0],
    'payment.fee.calculate'         => ['actions' => 0, 'filters' => 1],
]
```

---

### `inspectHook(string $hook): array`

Returns the full listener list for a hook, sorted by priority. Each entry is:

```php
[
    'callable' => callable,
    'priority' => 10,
    'owner'    => 'my-plugin-slug',
]
```

---

## 3. Execution Model

### Owner Attribution and Brand-Context Scoping

When `PluginLoader` calls `PluginInterface::register()`, it wraps the call with `events->pushOwner($slug)` and `events->popOwner()`. Every `addAction()` or `addFilter()` call made during `register()` is automatically attributed to the plugin's slug as the `owner`.

At dispatch time (`doAction`, `applyFilter`), the `EventManager` calls `isOwnerActive($owner)` before invoking each listener. This checks `PluginRegistry::isPluginActive($owner, $brandId)` against the current active brand context. If the plugin is not active for the current brand, the listener is silently skipped. This is the mechanism that enforces per-brand plugin activation.

```
Plugin "sms-gateway" active for Brand A, inactive for Brand B
     ↓
Request arrives for Brand B
     ↓
payment.transaction.completed fires
     ↓
sms-gateway listener → isOwnerActive('sms-gateway') → false → skipped
```

### Priority and Determinism

Listeners run in ascending priority order (lower number = earlier). Listeners registered at the same priority run in the order they were registered. Priority is enforced with `usort()` at registration time, so the order is stable.

### Error Isolation

Every listener invocation is wrapped in a `try/catch(\Throwable)`. If a plugin listener throws any exception, the `EventManager`:

1. Logs the error via `Logger::error()` with the format: `[OwnPay] Hook error in "{hook}" (owner: {slug}): {message} in {file}:{line}`.
2. Continues to the next listener without crashing.

**Exception**: If a listener registered by a non-core plugin modifies the `db.query.before` filter and the resulting SQL fails `PluginSandbox::validateSql()`, a `RuntimeException` with `"blocked"` in its message is **re-thrown** and propagates to the caller, halting the request. This is intentional - a plugin attempting to access core tables must be stopped immediately.

### Re-entrancy Guard

`EventManager` includes a `resolvingOwnerActive` boolean guard to prevent infinite recursion if `isOwnerActive()` triggers another hook that in turn triggers `isOwnerActive()`.

---

## 4. Twig Hook Points

Twig templates use the `hook()` helper function (registered by `TwigExtensions`) to execute action hooks that plugins can use to inject HTML:

```twig
{# In a checkout template #}
{{ hook('checkout.head')|raw }}
{{ hook('checkout.footer')|raw }}

{# In the admin layout #}
{{ hook('admin.head')|raw }}
{{ hook('admin.footer')|raw }}
{{ hook('admin.menu.register')|raw }}
```

These are buffered action hooks: the `hook()` helper calls `ob_start()`, fires `doAction($hookName)`, captures the output buffer, then passes it through `TwigExtensions::sanitizeHookOutput()` as defense-in-depth before returning.

`sanitizeHookOutput()` strips: `<script>`, `<iframe>`, `<object>`, `<embed>`, `<form>`, `<base>`, `<meta>`, `<link>` tags, inline event handler attributes (`onclick`, `onload`, etc.), and `javascript:` URIs. **This is a backstop** against compromised plugins - plugins must still escape all user-supplied values themselves.

---

## 5. Complete Hook Catalogue

The following is the complete hook registry from `config/hooks.php` - the code-verified single source of truth for every fireable hook in OwnPay.

### System Lifecycle

| Hook | Type | Source |
|---|---|---|
| `system.boot` | Action | `Kernel` |
| `system.shutdown` | Action | `Kernel` |
| `system.request` | Filter | `Kernel` |
| `system.response` | Filter | `Kernel` |
| `system.middleware.pipeline` | Filter | `Kernel` |
| `system.route.matched` | Action | `Kernel` |
| `system.routes.register` | Action | `Router` |
| `system.cron.before` | Action | `CronJobRunner` |
| `system.cron.after` | Action | `CronJobRunner` |
| `system.update.available` | Action | `SystemUpdateJob` |

**`system.request`** - Filter the inbound `Request` object. Return a `Request`. Used to rewrite paths, inject headers, or enforce rate limits.

**`system.response`** - Filter the outbound `Response` object before it is sent to the client. Parameters: `Response $response, Request $request`. Return a `Response`.

**`system.middleware.pipeline`** - Filter the global middleware class array. Return an `array`. Use to append custom firewall or auditing middleware.

---

### Database

| Hook | Type | Source |
|---|---|---|
| `db.query.before` | Filter | `Database` |
| `db.query.after` | Action | `Database` |

**`db.query.before`** - Filter the SQL query data array (`['sql' => string, 'params' => array]`) before PDO execution. Return the same shape array. **Security**: Non-core plugin callbacks that modify the SQL are validated by `PluginSandbox::validateSql()`. A blocked query throws a `RuntimeException` that propagates.

---

### Authentication & Session

| Hook | Type | Source |
|---|---|---|
| `auth.login.before` | Filter | `AuthSessionService` |
| `auth.login.attempt` | Action | `AuthController` |
| `auth.login.success` | Action | `AuthController`, `Authenticator`, `AuthSessionService` |
| `auth.login.failed` | Action | `Authenticator`, `AuthSessionService` |
| `auth.logout` | Action | `AuthController`, `AuthSessionService` |
| `auth.forgot_password` | Action | `AuthController` |

**`auth.login.before`** - Parameters: `bool $allowed, string $email, string $ip`. Return `bool`. Return `false` to block the login attempt before credentials are validated.

**`auth.login.success`** - Parameters: `array $user, string $ip`. Use to dispatch security notifications or reset brute-force counters.

**`auth.login.failed`** - Parameters: `string $email, string $ip`. Use to trigger account lockout logic.

---

### Admin Panel

| Hook | Type | Source |
|---|---|---|
| `admin.head` | Action | `admin/layout/base.twig <head>` |
| `admin.footer` | Action | `admin/layout/base.twig </body>` |
| `admin.menu.register` | Action | `admin/layout/sidebar.twig` |
| `admin.dashboard.before` | Action | `admin/dashboard.twig` |
| `admin.dashboard.bottom` | Action | `admin/dashboard.twig` |
| `admin.dashboard.stats` | Filter | `DashboardController` |
| `admin.landing.render` | Action | `page/landing.twig` |
| `admin.login.render` | Action | `page/login.twig` |
| `admin.page.before_render` | Filter | `BaseController` |
| `admin.page.after_render` | Filter | `BaseController` |
| `admin.template.resolve` | Filter | `AdminPageTrait` |
| `admin.template.data` | Filter | `AdminPageTrait` |
| `admin.settings.tabs` | Action | `admin/settings/index.twig` |
| `admin.settings.general` | Action | `admin/settings/index.twig` |
| `admin.settings.branding` | Action | `admin/settings/index.twig` |
| `admin.settings.landing` | Action | `admin/settings/index.twig` |
| `admin.settings.payment` | Action | `admin/settings/index.twig` |
| `admin.settings.email` | Action | `admin/settings/index.twig` |
| `admin.settings.security` | Action | `admin/settings/index.twig` |
| `admin.settings.checkout` | Action | `admin/settings/index.twig` |
| `admin.settings.notification` | Action | `admin/settings/index.twig` |
| `admin.settings.faq` | Action | `admin/settings/index.twig` |
| `admin.settings.cron` | Action | `admin/settings/index.twig` |
| `settings.saved` | Action | `SettingsController` |

**`admin.menu.register`** - Echo HTML link tags to inject entries into the admin sidebar. Links must begin with `/` (off-site URLs are stripped by `registerManifestAdminMenu()`). Use class `op-nav-link`:

```php
$events->addAction('admin.menu.register', function (): void {
    echo '<a href="/admin/my-plugin" class="op-nav-link"><span>My Plugin</span></a>';
});
```

**`admin.dashboard.stats`** - Parameters: `array $stats`. Return `array`. Inject custom numeric metrics that render in dashboard stat cards.

**`admin.settings.tabs`** - Echo an HTML `<li>` tab trigger to add a custom settings tab panel.

**`admin.settings.*`** - Echo HTML form fields inside the corresponding settings tab panel (general, branding, payment, etc.).

**`admin.page.before_render`** - Parameters: `array $data, string $templatePath`. Return `array`. Augment the Twig context before any admin page renders.

**`admin.page.after_render`** - Parameters: `string $html, string $templatePath`. Return `string`. Modify the final rendered HTML before it is sent.

---

### Landing Page

| Hook | Type | Source |
|---|---|---|
| `landing.head` | Action | `page/landing.twig` |
| `landing.features` | Filter | `LandingController` |

---

### Payment & Transactions

| Hook | Type | Source |
|---|---|---|
| `payment.amount.calculate` | Filter | `PaymentService` |
| `payment.fee.calculate` | Filter | `FeeService` |
| `payment.intent.created` | Action | `PaymentService` |
| `payment.intent.expired` | Action | `PaymentService` |
| `payment.transaction.before_create` | Filter | `TransactionService` |
| `payment.transaction.created` | Action | `TransactionService` |
| `payment.transaction.completed` | Action | `TransactionService` |
| `payment.transaction.failed` | Action | `TransactionService` |
| `payment.transaction.cancelled` | Action | `TransactionService` |
| `payment.refund.reconciliation_failed` | Action | `RefundReconciliationJob` |
| `refund.created` | Action | `RefundController` |
| `transaction.status.before` | Action | `TransactionController` |
| `transaction.status.changed` | Action | `TransactionController` |
| `ledger.entry.created` | Action | `LedgerService` |
| `dispute.opened` | Action | `DisputeService` |
| `dispute.resolved` | Action | `DisputeService` |

**`payment.transaction.before_create`** - Parameters: `array $data, int $merchantId`. Return `array`. Modify the column map before the `op_transactions` row is inserted.

**`payment.transaction.completed`** - Parameters: `array $transaction`. The transaction array contains all columns from `op_transactions`. This is the primary hook for SMS/email notifications, order fulfilment triggers, and webhook dispatches.

**`payment.amount.calculate`** - Parameters: `string $amount, array $context`. Return `string`. Must be a BCMath-compatible decimal string. Use `bcadd()`/`bcmul()` - never cast to float.

**`payment.fee.calculate`** - Parameters: `string $fee, array $context`. Return `string`. Apply custom tiered fee rules. The context array contains `amount`, `currency`, `merchant_id`, and `gateway_slug`.

**`ledger.entry.created`** - Parameters: `array $entry`. Fired after a balanced double-entry journal is committed to `op_ledger_transactions`. Do not post additional ledger entries from inside this hook - use it for downstream notifications only.

---

### Gateway & Checkout

| Hook | Type | Source |
|---|---|---|
| `gateway.capture.before` | Filter | `GatewayBridge` |
| `gateway.capture.after` | Action | `GatewayBridge` |
| `gateway.webhook.{slug}` | Action | `WebhookController` (dynamic) |
| `checkout.before` | Action | `CheckoutController` |
| `checkout.render` | Filter | `CheckoutController` |
| `checkout.template` | Filter | `CheckoutController` |
| `checkout.status.template` | Filter | `CheckoutController`, `InvoiceCheckoutController`, `PaymentLinkCheckoutController`, `PaymentIntentCheckoutController` |
| `checkout.intent.render` | Filter | `PaymentIntentCheckoutController` |
| `checkout.payment_link.template` | Filter | `PaymentLinkCheckoutController` |
| `checkout.gateway.selected` | Action | `CheckoutController` |
| `checkout.cancelled` | Action | `CheckoutController` |
| `checkout.manual_verify.submitted` | Action | `CheckoutController`, `PaymentIntentCheckoutController` |
| `checkout.head` | Action | `checkout/checkout.twig <head>` |
| `checkout.footer` | Action | `checkout/checkout.twig </body>` |
| `checkout.csp.sources` | Filter | `SecurityHeadersMiddleware` |

**`gateway.capture.before`** - Parameters: `array $params, string $gatewaySlug, int $merchantId`. Return `array`. The returned array **must** preserve the shape `{amount: string, currency: string, trx_id: string, redirect_url: string, cancel_url: string}` - `GatewayBridge` validates this structure and throws if it is malformed.

**`gateway.webhook.{slug}`** - Dynamic hook fired by `WebhookController` after signature verification succeeds. `{slug}` is the gateway slug (e.g., `gateway.webhook.stripe`). Parameters: a `WebhookPayload` model object.

**`checkout.csp.sources`** - Parameters: `array $sources`. Return `array`. Keys are CSP directives: `script_src`, `style_src`, `frame_src`, `connect_src`, `font_src`, `img_src`. Append domains as strings to the relevant directive array.

---

### Invoice & Payment Links

| Hook | Type | Source |
|---|---|---|
| `invoice.created` | Action | `InvoiceController` |
| `invoice.updated` | Action | `InvoiceController` |
| `payment_link.created` | Action | `PaymentLinkController` |
| `payment_link.updated` | Action | `PaymentLinkController` |

---

### Customers

| Hook | Type | Source |
|---|---|---|
| `customer.created` | Action | `CustomerPiiService` |
| `customer.updated` | Action | `CustomerPiiService` |
| `customer.deleted` | Action | `CustomerPiiService` |

---

### Communication & Messaging

| Hook | Type | Source |
|---|---|---|
| `communication.sms.send` | Action | `CommunicationService`, `NotificationService` |
| `communication.mail.send` | Action | `CommunicationService`, `NotificationService` |
| `communication.template.render` | Filter | `CommunicationService` |
| `communication.channels` | Filter | `CommunicationService` |

**`communication.channels`** - Parameters: `array $channels`. Return `array`. Register custom delivery channels (Telegram, Slack, push) for the core notification system.

**`communication.template.render`** - Parameters: `string $html, array $variables`. Return `string`. Intercept and customise SMS/email template compilation before delivery.

---

### Mobile & SMS

| Hook | Type | Source |
|---|---|---|
| `mobile.device.paired` | Action | `DevicePairingService` |
| `mobile.device.revoked` | Action | `DevicePairingService` |
| `mobile.sms.matched` | Action | `SmsVerificationJob` |
| `sms.received.before` | Action | `SmsController` |
| `sms.received.after` | Action | `SmsController` |
| `mfs.templates` | Filter | `SmsParserService` |

**`mfs.templates`** - Parameters: `array $templates`. Return `array`. Add custom regex schemas for MFS (Mobile Financial Service) SMS parsing. Used to extend the platform's SMS-to-payment auto-matching.

---

### Outbound Webhook Delivery

| Hook | Type | Source |
|---|---|---|
| `webhook.delivery.success` | Action | `WebhookDispatcher`, `WebhookService` |
| `webhook.delivery.failed` | Action | `WebhookDispatcher`, `WebhookService` |

---

### Reporting & Export

| Hook | Type | Source |
|---|---|---|
| `report.data` | Filter | `DashboardController` |
| `export.row` | Filter | `DashboardController` |

**`report.data`** - Parameters: `array $reportData, array $queryParams`. Return `array`. Filter financial grid data before rendering.

**`export.row`** - Parameters: `array $row`. Return `array`. Transform or redact individual CSV/export rows.

---

### Audit

| Hook | Type | Source |
|---|---|---|
| `audit.log.created` | Action | `AuditLogger` |

---

### Domain

| Hook | Type | Source |
|---|---|---|
| `domain.mapped` | Action | `DomainService` |
| `domain.verified` | Action | `DomainService` |
| `domain.removed` | Action | `DomainService` |

---

### Auto-Updater

| Hook | Type | Source |
|---|---|---|
| `update.available` | Action | `UpdateService` |
| `update.before` | Action | `UpdateService` |
| `update.after` | Action | `UpdateService` |
| `update.failed` | Action | `UpdateService` |
| `update.rollback` | Action | `UpdateService` |

---

### Plugin Lifecycle

| Hook | Type | Source |
|---|---|---|
| `plugins.before_load` | Action | `PluginLoader` |
| `plugins.after_load` | Action | `PluginLoader` |
| `plugin.load_error` | Action | `PluginLoader` |
| `plugin.boot_error` | Action | `PluginLoader` |
| `plugin.before_install` | Action | `PluginManager` |
| `plugin.installed` | Action | `PluginManager` |
| `plugin.before_activate` | Action | `PluginManager` |
| `plugin.activated` | Action | `PluginManager` |
| `plugin.before_deactivate` | Action | `PluginManager` |
| `plugin.deactivated` | Action | `PluginManager` |
| `plugin.before_uninstall` | Action | `PluginManager` |
| `plugin.uninstalled` | Action | `PluginManager` |
| `plugin.before_update` | Action | `PluginManager` |
| `plugin.updated` | Action | `PluginManager` |
| `plugin.trashed` | Action | `PluginManager` |
| `plugin.restored` | Action | `PluginManager` |
| `plugin.settings.saved` | Action | `PluginController` |

**`plugin.activated`** - Parameters: `string $slug, int $migrationsCount, int $brandId`. Use to register default options or trigger external API activations.

**`plugin.deactivated`** - Parameters: `string $slug, int $brandId`. Flush caches here. Do **not** drop database tables - use `uninstall()` for that.

**`plugin.settings.saved`** - Parameters: the saved settings data. Use to clear plugin-specific caches when configuration changes.

---

## 6. Practical Patterns

### Listening to a payment and sending an HTTP request

```php
public function register(EventManager $events, Container $container): void
{
    $events->addAction('payment.transaction.completed', function (array $txn) use ($container): void {
        // Read plugin config from settings
        $settings = $container->get(\OwnPay\Repository\SettingsRepository::class);
        $webhookUrl = $settings->get('plugin.my-plugin', 'webhook_url') ?? '';
        if ($webhookUrl === '') {
            return;
        }

        $payload = json_encode([
            'event'    => 'payment.completed',
            'trx_id'   => $txn['trx_id'] ?? '',
            'amount'   => $txn['amount'] ?? '',
            'currency' => $txn['currency'] ?? '',
        ]);

        $ch = curl_init($webhookUrl);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 5,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS     => $payload,
        ]);
        curl_exec($ch);
        curl_close($ch);
    }, priority: 15);
}
```

### Injecting a custom fee tier

```php
$events->addFilter('payment.fee.calculate', function (string $fee, array $context): string {
    // Waive the fee for transactions over 50,000 BDT
    if (bccomp($context['amount'] ?? '0', '50000.00', 2) >= 0) {
        return '0.00';
    }
    return $fee;
}, priority: 5); // runs before default fee rules (priority 10)
```

### Adding a custom settings tab

```php
$events->addAction('admin.settings.tabs', function (): void {
    echo '<li><button data-tab="my-plugin-tab">My Plugin</button></li>';
});

$events->addAction('admin.settings.general', function (): void {
    // Not used - each tab has its own hook
});
```

> Use the `admin.settings.{tab}` hooks to inject form fields into a specific existing tab, or `admin.settings.tabs` to add a new tab link, paired with a custom route that renders the full tab body.

### Blocking a login from a specific IP

```php
$events->addFilter('auth.login.before', function (bool $allowed, string $email, string $ip): bool {
    $blocklist = ['192.168.1.100', '10.0.0.55'];
    if (in_array($ip, $blocklist, true)) {
        return false; // Block before credentials are checked
    }
    return $allowed;
});
```

### Reading the active owner inside a hook

```php
$events->addAction('payment.transaction.completed', function (array $txn) use ($events): void {
    $owner = $events->getActiveOwner(); // Returns your plugin slug
    // ... 
});
```

---

## 7. Guidelines and Constraints

| Rule | Detail |
|---|---|
| **Register hooks in `register()` only** | Hook registrations in `boot()` or the constructor are not attributed to your plugin slug and bypass brand-context activation checks. |
| **Never modify `$this` state in a filter** | Filters may execute concurrently (in future async contexts). Keep filter callbacks pure - take input, return output. |
| **BCMath for all financial values** | Any filter on `payment.amount.calculate` or `payment.fee.calculate` must use `bcadd()`/`bcmul()`/`bcdiv()`. Never cast to `float`. |
| **Do not post to the ledger from hooks** | Never call `LedgerService::postEntries()` from inside a hook callback. Use it only from services called by controllers or dedicated job runners. |
| **Escape all echoed HTML** | Action hooks that echo output must escape all user-sourced data with `htmlspecialchars($value, ENT_QUOTES, 'UTF-8')`. |
| **No `eval()` or OS commands** | The plugin is token-scanned before loading. `eval`, `exec`, `shell_exec`, `system`, `passthru`, `popen`, `proc_open`, `pcntl_exec`, `dl`, `assert`, `create_function` are blocked. |
| **Respect filter return type** | A filter callback must return the same type as the value it received. Returning `null` from a string filter, for example, will corrupt downstream logic. |
| **Hooks fire only when plugin is active** | A listener registered by plugin `my-addon` is silently skipped for any brand where `my-addon` is not active. |
