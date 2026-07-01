# Addon Plugin Development Guide

Addons are the general-purpose extension type in OwnPay. Unlike gateways (which implement `GatewayAdapterInterface`) or themes (which override checkout templates), addons extend the platform through event hooks, custom HTTP routes, cron jobs, admin menu entries, and database-backed functionality. Every real-world extension that does not process payments directly - SMS notifications, Telegram bots, mail providers, analytics dashboards, export utilities - is built as an addon.

This guide is based on the live reference implementation at `modules/addons/example-kit/`.

---

## 1. How Addon Plugins Work

`PluginLoader::loadActive()` scans `modules/addons/`, validates each `manifest.json`, token-scans all PHP files, and calls the two-phase lifecycle:

1. **`register(EventManager $events, Container $container)`** - called during the boot phase with `events->pushOwner(slug)` wrapping the call. All hook and filter registrations are attributed to the plugin slug and are automatically scoped to the active brand context via `EventManager::isOwnerActive()`.

2. **`boot(Container $container)`** - called after all plugins have registered. Use this phase to capture container services you need at request time, since all services are fully wired at this point.

Routes declared in `manifest.json` are registered by the core router automatically. Cron jobs declared in `manifest.json` are scheduled by `CronJobRunner` under the key `plugin:{slug}:{name}`.

---

## 2. Directory Structure

```
modules/addons/my-addon/
├── manifest.json           # Required. Plugin metadata.
├── Plugin.php              # Required. Entrypoint class implementing PluginInterface.
├── Service/                # Optional. Additional autoloaded classes.
│   └── MyService.php
├── Cron/                   # Optional. Cron job classes implementing CronJobInterface.
│   └── MyJob.php
├── migrations/             # Optional. SQL files run on activation.
│   └── 001_create_my_table.sql
└── assets/                 # Optional. CSS/JS for admin pages.
```

---

## 3. The `manifest.json` File

### Full Example - Example Kit Addon

```json
{
    "name": "Example Kit",
    "slug": "example-kit",
    "version": "1.0.0",
    "description": "Reference addon exercising multi-file classes, routes, cron, admin menu, and hooks.",
    "author": "OwnPay Core",
    "type": "addon",
    "entrypoint": "Plugin.php",
    "namespace": "OwnPay\\Modules\\Addons\\ExampleKit",
    "capabilities": ["addon", "hooks", "cron"],
    "requires": {
        "core": ">=0.1.0"
    },
    "routes": [
        ["GET", "/plugins/example-kit/ping", "ping"],
        ["GET", "/admin/example-kit",         "adminHome", "admin"]
    ],
    "cron": [
        {
            "name":     "heartbeat",
            "schedule": "every_5min",
            "class":    "OwnPay\\Modules\\Addons\\ExampleKit\\Cron\\HeartbeatJob"
        }
    ],
    "admin_menu": [
        { "label": "Example Kit", "url": "/admin/example-kit" }
    ]
}
```

### Communication Addon Example - SMS Gateway

```json
{
    "name": "SMS Gateway",
    "slug": "sms-gateway",
    "version": "1.0.0",
    "type": "addon",
    "entrypoint": "Plugin.php",
    "namespace": "OwnPay\\Modules\\Addons\\SmsGateway",
    "capabilities": ["addon", "communication"],
    "requires": { "core": ">=0.1.0" },
    "hooks": [
        "sms.send",
        "invoice.created",
        "payment.transaction.completed"
    ]
}
```

### Field Reference

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | ✅ | Display name in the admin panel. |
| `slug` | `string` | ✅ | Unique lowercase identifier. Pattern: `^[a-z0-9][a-z0-9\-]{0,62}[a-z0-9]$`. Must match directory name. |
| `version` | `string` | ✅ | Semantic version (e.g., `1.0.0`). |
| `description` | `string` | ✅ | Short description. |
| `author` | `string` | ✅ | Author name. |
| `type` | `string` | ✅ | Must be `"addon"`. |
| `entrypoint` | `string` | ✅ | PHP filename for the entrypoint class. |
| `namespace` | `string` | ✅ | PSR-4 root namespace. Autoloads all classes under this namespace from the plugin directory. |
| `capabilities` | `array` | ✅ | One or more `Capability` enum string values. At minimum `["addon"]`. |
| `requires.core` | `string` | ✅ | Semver constraint on OwnPay core version. |
| `routes` | `array` | ❌ | Array of route tuples. See §6. |
| `cron` | `array` | ❌ | Scheduled task declarations. See §7. |
| `admin_menu` | `array` | ❌ | Sidebar link entries. See §8. |
| `hooks` | `array` | ❌ | Declarative list of hooks the plugin subscribes to (informational; actual registration happens in `register()`). |
| `migrations` | `string` | ❌ | Path to migrations directory. Default: `"migrations"`. |

---

## 4. The Entrypoint Class

The entrypoint must implement `OwnPay\Plugin\PluginInterface`, which requires these six methods:

```php
<?php
declare(strict_types=1);

namespace OwnPay\Modules\Addons\MyAddon;

use OwnPay\Container;
use OwnPay\Event\EventManager;
use OwnPay\Plugin\Capability;
use OwnPay\Plugin\PluginInterface;
use OwnPay\Http\Request;
use OwnPay\Http\Response;

final class Plugin implements PluginInterface
{
    private ?Container $container = null;

    public function __construct()
    {
        // Instantiated with `new Plugin()` - no constructor injection.
        // Resolve services from the DI container in boot() instead.
    }

    // ─── Required: metadata ─────────────────────────────────────────────────

    public static function metadata(): array
    {
        return [
            'name'        => 'My Addon',
            'slug'        => 'my-addon',
            'version'     => '1.0.0',
            'description' => 'Describes what this addon does.',
            'author'      => 'Your Name',
            'type'        => 'addon',
        ];
    }

    // ─── Required: capabilities ──────────────────────────────────────────────

    public function capabilities(): array
    {
        return [Capability::ADDON, Capability::HOOKS];
    }

    // ─── Required: register ──────────────────────────────────────────────────

    public function register(EventManager $events, Container $container): void
    {
        // Called during boot. Register ALL hooks and filters here.
        // The EventManager automatically attributes them to your plugin slug.
        $events->addAction('payment.transaction.completed', [$this, 'onPaymentCompleted'], priority: 10);

        $events->addFilter('admin.dashboard.stats', function (array $stats): array {
            $stats['my_addon_metric'] = 42;
            return $stats;
        });
    }

    // ─── Required: boot ──────────────────────────────────────────────────────

    public function boot(Container $container): void
    {
        // All services are fully resolved at this point.
        // Capture services you need for request-time use.
        $this->container = $container;
    }

    // ─── Required: deactivate ────────────────────────────────────────────────

    public function deactivate(Container $container): void
    {
        // Flush caches or cancel remote subscriptions.
        // Do NOT drop database tables here.
    }

    // ─── Required: uninstall ─────────────────────────────────────────────────

    public function uninstall(Container $container): void
    {
        // Drop any tables created by your migrations.
        // Remove stored settings specific to this plugin.
    }

    // ─── Required: fields ────────────────────────────────────────────────────

    /**
     * Configuration fields rendered in the plugin settings form.
     * Supported types: text, password, select, toggle, textarea, color.
     */
    public function fields(): array
    {
        return [
            [
                'name'    => 'api_url',
                'label'   => 'API Endpoint',
                'type'    => 'text',
                'default' => 'https://api.example.com',
            ],
            [
                'name'    => 'api_key',
                'label'   => 'API Key',
                'type'    => 'password',
                'default' => '',
            ],
        ];
    }

    // ─── Hook handlers ────────────────────────────────────────────────────────

    public function onPaymentCompleted(array $txn): void
    {
        // $txn contains the op_transactions row columns.
        // Perform your side-effect: send SMS, call webhook, etc.
    }
}
```

---

## 5. Accessing Core Services

Plugins are **not** wired into the DI container automatically. You resolve services manually from the `$container` argument. The container holds all services registered in `config/services.php` and every repository/service class autowired by PSR-4.

```php
public function boot(Container $container): void
{
    $this->container = $container;
}

private function getSettings(): \OwnPay\Repository\SettingsRepository
{
    $repo = $this->container->get(\OwnPay\Repository\SettingsRepository::class);
    assert($repo instanceof \OwnPay\Repository\SettingsRepository);
    return $repo;
}
```

**Reading plugin settings** (stored via `op_system_settings` under the group `plugin.{slug}`):

```php
$value = $this->getSettings()->getGroup('plugin.my-addon')['api_key'] ?? '';
```

**Reading brand-scoped settings** (when your addon needs to behave differently per brand):

```php
$scopedRepo = $this->getSettings()->forTenant($merchantId);
$value = $scopedRepo->getGroup('plugin.my-addon')['setting_key'] ?? '';
```

---

## 6. Routes

Routes declared in `manifest.json` under the `routes` array are registered into the core router during boot. Each entry is a tuple:

```json
["METHOD", "/path", "handlerMethod", "middlewareGroup"]
```

| Position | Value | Notes |
|---|---|---|
| 0 | HTTP method | `GET`, `POST`, `PUT`, `DELETE`, `PATCH`. |
| 1 | URL path | Must start with `/`. Recommended prefix: `/plugins/{slug}/` for public, `/admin/{slug}/` for authenticated. |
| 2 | Handler method | A public method name on your entrypoint class. |
| 3 | Middleware group | Optional. `"admin"` requires authentication and RBAC. Omit for public (API-level) routes. |

**Route handler signature**:

```php
use OwnPay\Http\Request;
use OwnPay\Http\Response;

public function ping(Request $req): Response
{
    return Response::json(['ok' => true, 'pong' => true]);
}

public function adminHome(Request $req): Response
{
    return Response::html('<h1>My Addon</h1>');
}
```

> **Admin routes**: Always declare the `"admin"` middleware group for any route accessible only by authenticated staff. Routes without this group are publicly accessible.

---

## 7. Cron Jobs

Declare scheduled jobs in `manifest.json` under the `cron` array. The `CronJobRunner` schedules them using the key `plugin:{slug}:{name}`.

```json
"cron": [
    {
        "name":     "sync",
        "schedule": "every_5min",
        "class":    "OwnPay\\Modules\\Addons\\MyAddon\\Cron\\SyncJob"
    }
]
```

**Supported schedule values**: `every_minute`, `every_5min`, `every_15min`, `every_30min`, `hourly`, `every_6hours`, `daily`, `weekly`.

The cron class must implement `OwnPay\Cron\CronJobInterface`:

```php
<?php
declare(strict_types=1);

namespace OwnPay\Modules\Addons\MyAddon\Cron;

use OwnPay\Cron\CronJobInterface;

final class SyncJob implements CronJobInterface
{
    public function run(): mixed
    {
        // Perform background work.
        // Return any serialisable value; it is logged by the runner.
        return ['synced' => true, 'count' => 0];
    }
}
```

File location: `modules/addons/my-addon/Cron/SyncJob.php`. The class is autoloaded from the PSR-4 namespace declared in `manifest.json`.

---

## 8. Admin Menu Entries

Declare sidebar navigation links in `manifest.json` under the `admin_menu` array. Each entry renders as a link in the admin sidebar via the `admin.menu.register` action hook.

```json
"admin_menu": [
    { "label": "My Addon", "url": "/admin/my-addon" }
]
```

Rules enforced by `PluginLoader::registerManifestAdminMenu()`:
- `url` **must** start with `/`. Off-site or `javascript:` URLs are silently dropped.
- Labels and URLs are `htmlspecialchars()` escaped before output.
- Menu entries only appear while the plugin is **active** for the current brand context.

For programmatic menu injection (e.g., dynamic sub-menus), use the `admin.menu.register` hook inside `register()`:

```php
$events->addAction('admin.menu.register', function (): void {
    echo '<a href="/admin/my-addon/reports" class="op-nav-link"><span>Reports</span></a>';
});
```

---

## 9. Multi-File Classes (PSR-4 Autoloading)

Declare a `namespace` in `manifest.json`. The `PluginLoader` registers a PSR-4 autoloader that maps `{namespace}\{SubPath}` to `{plugin_dir}/{SubPath}.php`.

**Example**: With `"namespace": "OwnPay\\Modules\\Addons\\MyAddon"`:

```
OwnPay\Modules\Addons\MyAddon\Service\NotificationDispatcher
  → modules/addons/my-addon/Service/NotificationDispatcher.php

OwnPay\Modules\Addons\MyAddon\Cron\SyncJob
  → modules/addons/my-addon/Cron/SyncJob.php
```

The autoloader enforces directory containment: a crafted class name cannot load a file outside the plugin directory.

**Usage in entrypoint**:

```php
use OwnPay\Modules\Addons\MyAddon\Service\NotificationDispatcher;

public function __construct()
{
    // The class is in Service/NotificationDispatcher.php and autoloads transparently.
    $this->dispatcher = new NotificationDispatcher();
}
```

---

## 10. Database Migrations

Create a `migrations/` directory and add `.sql` files. Files must be named so they sort in execution order (e.g., `001_`, `002_`).

`PluginMigrator` rules:
- Statements split on `;` and executed inside a database transaction.
- Executed migrations tracked in `op_plugin_migrations` by `(plugin_slug, migration, batch)`.
- Only pending (not yet run) files execute on each activation.
- Rollback files: `001_create_my_table.down.sql`.

**Critical naming rule**: All plugin tables **must** be prefixed `op_plugin_`. Queries to any `op_*` table without the `op_plugin_` prefix are blocked by `PluginSandbox::validateSql()`.

```sql
-- migrations/001_create_notifications.sql
CREATE TABLE IF NOT EXISTS op_plugin_my_addon_notifications (
    id          BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    merchant_id INT UNSIGNED     NOT NULL,
    channel     VARCHAR(32)      NOT NULL,
    recipient   VARCHAR(255)     NOT NULL,
    message     TEXT             NOT NULL,
    status      ENUM('pending','sent','failed') NOT NULL DEFAULT 'pending',
    created_at  DATETIME(6)      NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_merchant_status (merchant_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

```sql
-- migrations/001_create_notifications.down.sql
DROP TABLE IF EXISTS op_plugin_my_addon_notifications;
```

---

## 11. Complete Hook Reference for Addons

### Most Commonly Used

| Hook | Type | Parameters | Use |
|---|---|---|---|
| `payment.transaction.completed` | Action | `array $txn` | Fire SMS, email, or webhook on successful payment. |
| `payment.transaction.failed` | Action | `array $txn` | Alert merchant of decline. |
| `payment.transaction.created` | Action | `array $txn` | Log new pending payment. |
| `payment.transaction.before_create` | Filter | `array $data`, `int $merchantId` | Inject custom metadata before DB insert. |
| `payment.amount.calculate` | Filter | `string $amount`, `array $ctx` | Override amount rounding logic. |
| `payment.fee.calculate` | Filter | `string $fee`, `array $ctx` | Apply custom tiered fee rules. |
| `admin.dashboard.stats` | Filter | `array $stats` | Inject metrics into the dashboard. |
| `admin.page.before_render` | Filter | `array $data`, `string $tpl` | Augment admin page context variables. |
| `admin.menu.register` | Action | None | Emit custom sidebar HTML links. |
| `communication.channels` | Filter | `array $channels` | Register Telegram, Slack, or custom channels. |
| `communication.template.render` | Filter | `string $html`, `array $vars` | Intercept SMS/email compilation. |
| `mfs.templates` | Filter | `array $templates` | Add custom SMS regex parsing patterns. |
| `export.row` | Filter | `array $row` | Scrub or transform CSV export rows. |
| `auth.login.success` | Action | `array $user`, `string $ip` | Log logins or notify security alerts. |
| `auth.login.before` | Filter | `bool $allowed`, `string $email`, `string $ip` | Block suspicious IPs or enforce 2FA. |

### Registering Hooks

All hook registrations **must** happen inside `register()`. Registrations made outside (e.g., in `boot()` or a constructor) will not be attributed to your plugin slug and will not respect brand-context activation:

```php
public function register(EventManager $events, Container $container): void
{
    // Action: fire-and-forget
    $events->addAction('payment.transaction.completed', [$this, 'onPaymentCompleted'], priority: 10);

    // Filter: mutate and return
    $events->addFilter('payment.fee.calculate', function (string $fee, array $ctx): string {
        // Apply a 0% fee for transactions over $10,000
        if (bccomp($ctx['amount'] ?? '0', '10000', 2) >= 0) {
            return '0.00';
        }
        return $fee;
    }, priority: 20);

    // Lower priority number = executes earlier
    $events->addAction('admin.dashboard.stats', [$this, 'injectStats'], priority: 5);
}
```

---

## 12. Security Requirements

| Rule | Requirement |
|---|---|
| **No `eval()`** | `PluginLoader` token-scans every PHP file. Any use of `eval` causes load failure. |
| **No OS commands** | `exec()`, `shell_exec()`, `system()`, `passthru()`, `popen()`, `proc_open()`, `pcntl_exec()`, `dl()` are blocked. |
| **No direct `op_*` table access** | Only `op_plugin_` prefixed tables are permitted. Core tables are blocked at SQL level by `PluginSandbox::validateSql()`. |
| **Escape all output** | Hook callbacks that echo HTML **must** escape any user-supplied or database-sourced values with `htmlspecialchars($val, ENT_QUOTES, 'UTF-8')`. |
| **Parameterised queries** | Never interpolate variables directly into SQL strings. Use prepared statements (`:param` style) via `Database::fetchAll()` / `execute()`. |
| **Tenant isolation** | When reading/writing brand-scoped data, always pass `merchant_id` through `forTenant($merchantId)` on repository calls. |

---

## 13. Installation and Activation

1. **Package** as a ZIP. The archive root (or one subdirectory) must contain `manifest.json`.
2. **Upload** via Admin → Plugins → "Install Plugin". `PluginInstaller::installFromZip()` validates security constraints and deploys to `modules/addons/{slug}/`.
3. **Activate** per brand. Activation runs pending migrations and calls your `register()` + `boot()` on the next request.
4. **Configure** settings via the plugin settings panel. Values are stored under `op_system_settings` group `plugin.{slug}`.

---

## 14. Checklist

- [ ] `manifest.json` complete; `slug` matches directory name.
- [ ] `namespace` declared; all classes in correct PSR-4 paths.
- [ ] Entrypoint implements `PluginInterface` with all six methods.
- [ ] All hooks registered inside `register()`, not `boot()` or constructor.
- [ ] `uninstall()` drops any `op_plugin_` tables created by migrations.
- [ ] Plugin tables named `op_plugin_{slug}_*`.
- [ ] Admin routes use the `"admin"` middleware group.
- [ ] Cron jobs implement `CronJobInterface`.
- [ ] Hook output escapes user-supplied values.
- [ ] No `eval()`, `exec()`, `shell_exec()`, `system()`, `passthru()`.
