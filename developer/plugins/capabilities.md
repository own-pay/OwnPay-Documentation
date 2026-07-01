# Plugin Capabilities

OwnPay uses a capability system to declare what a plugin does and what platform features it interacts with. Capabilities are expressed as string values in `manifest.json` and mapped to the `OwnPay\Plugin\Capability` backed PHP enum. They drive UI grouping in the admin panel, determine permission key requirements, and serve as searchable metadata for the plugin registry.

> **Full-trust model**: Installed plugins are owner-uploaded and run with full application trust - similar to how WordPress handles plugins. Under this model, capabilities are **declarative metadata** and an intent contract. They document what a plugin does and drive UI presentation; they are **not** a runtime enforcement sandbox that restricts PHP execution. The `PluginSandbox` enforces a narrower set of hard security rules (blocked functions, path containment, SQL table access) independently of capability declarations.

---

## 1. Declaring Capabilities

Capabilities are declared in the `capabilities` array inside `manifest.json`. A plugin may declare one or more values:

```json
{
  "slug": "my-plugin",
  "capabilities": ["addon", "hooks", "cron"]
}
```

The `PluginInterface::capabilities()` method on the entrypoint class should return the matching `Capability` enum cases:

```php
use OwnPay\Plugin\Capability;

public function capabilities(): array
{
    return [Capability::ADDON, Capability::HOOKS, Capability::CRON];
}
```

Both declarations must be consistent. The manifest drives discovery and DB storage; the class method is used for runtime introspection.

---

## 2. Full Capability Reference

The following table documents every value in the `OwnPay\Plugin\Capability` enum (`src/Plugin/Capability.php`), the JSON string used in `manifest.json`, the admin permission keys associated with each, and its intended scope.

| Enum Case | JSON Value | Required Permission Keys | Scope & Intent |
|---|---|---|---|
| `Capability::GATEWAY` | `"gateway"` | `gateway.process`, `gateway.config` | Payment gateway adapter. Enables the plugin to hook into the payment processing pipeline via `GatewayBridge`. The entrypoint must also implement `GatewayAdapterInterface`. |
| `Capability::THEME` | `"theme"` | `theme.render` | Checkout theme. Grants the plugin authority to override Twig checkout template paths and inject CSS/JS into checkout pages. |
| `Capability::ADDON` | `"addon"` | *(none - base platform access)* | General-purpose extension. The baseline capability for any plugin that doesn't process payments or replace checkout templates. |
| `Capability::COMMUNICATION` | `"communication"` | `comm.send` | SMS, email, or chat delivery. Authorises the plugin to connect to outbound messaging providers (Twilio, Vonage, SMTP, Telegram, etc.). |
| `Capability::ANALYTICS` | `"analytics"` | `analytics.read` | Reporting and BI. Grants read access to transactional datasets for rendering custom analytics dashboards. |
| `Capability::WEBHOOK` | `"webhook"` | *(none)* | Custom inbound webhook handler. Allows the plugin to register listener endpoints under the dynamic `gateway.webhook.{slug}` hook. |
| `Capability::NOTIFICATION` | `"notification"` | *(none)* | Push and system notifications. Grants authority to post visual alert panels to the admin control panel. |
| `Capability::EXPORT` | `"export"` | *(none)* | Data export provider. Grants permission to produce CSV, PDF, or Excel output from reporting datasets. |
| `Capability::AUTHENTICATION` | `"authentication"` | *(none)* | SSO and OAuth. Authorises the plugin to implement external identity provider (OAuth2, SAML, LDAP) authentication layers. |
| `Capability::STORAGE` | `"storage"` | `storage.read`, `storage.write` | External file storage. Grants permission to integrate with block storage providers (S3, GCS, Cloudflare R2, etc.). |
| `Capability::CRON` | `"cron"` | *(none)* | Scheduled background jobs. Grants authority to register automated tasks via the `cron` array in `manifest.json`. The cron class must implement `CronJobInterface`. |
| `Capability::DASHBOARD` | `"dashboard"` | *(none)* | Admin dashboard widgets. Authorises the plugin to inject HTML/JS panels and custom metric cards into the dashboard via the `admin.dashboard.before` and `admin.dashboard.bottom` hooks. |
| `Capability::DB_READ` | `"db_read"` | *(none)* | Database read access. Grants the plugin read-query permissions scoped exclusively to `op_plugin_*` prefixed tables. Queries to core `op_*` tables are blocked by `PluginSandbox::validateSql()`. |
| `Capability::DB_WRITE` | `"db_write"` | *(none)* | Database write access. Grants the plugin insert/update/delete permissions scoped exclusively to `op_plugin_*` prefixed tables. |
| `Capability::FILE_READ` | `"file_read"` | *(none)* | Filesystem read. Grants the plugin read access sandboxed to its own directory (validated by `PluginSandbox::validateFilePath()`). |
| `Capability::FILE_WRITE` | `"file_write"` | *(none)* | Filesystem write. Grants the plugin write access confined to its `storage/` subdirectory (resolved via `PluginSandbox::storagePath()`). |
| `Capability::HTTP_OUTBOUND` | `"http_outbound"` | *(none)* | Outbound HTTP. Declares that the plugin makes outbound `curl` requests to remote APIs (e.g., payment gateway APIs, SMS provider endpoints). |
| `Capability::HOOKS` | `"hooks"` | *(none)* | Event hook subscriptions. Declares that the plugin subscribes to `EventManager` action and filter hooks. |
| `Capability::CHECKOUT_UI` | `"checkout_ui"` | *(none)* | Checkout UI injection. Grants the plugin permission to filter Twig context variables and inject UI elements into the checkout screen via `checkout.render` and `checkout.head`/`checkout.footer` hooks. |

---

## 3. Capability-to-Permission Mapping

The `Capability::requiredPermissions()` method (from `src/Plugin/Capability.php`) returns the RBAC permission keys required for each capability. These keys are matched against the `permissions` array in `manifest.json` and against the platform's role-permission system (`op_roles`, `op_role_permissions`):

```php
public function requiredPermissions(): array
{
    return match ($this) {
        self::GATEWAY       => ['gateway.process', 'gateway.config'],
        self::THEME         => ['theme.render'],
        self::COMMUNICATION => ['comm.send'],
        self::ANALYTICS     => ['analytics.read'],
        self::STORAGE       => ['storage.read', 'storage.write'],
        default             => [],
    };
}
```

To declare permissions in `manifest.json`:

```json
{
  "capabilities": ["gateway"],
  "permissions": [
    "gateway.process",
    "gateway.refund"
  ]
}
```

---

## 4. Common Capability Combinations

The following combinations represent the standard plugin archetypes:

### Payment Gateway

```json
"capabilities": ["gateway"]
```

The entrypoint class must also implement `GatewayAdapterInterface`. `PluginLoader` auto-registers it with `GatewayBridge` after the boot phase.

### Communication Addon (SMS/Email/Telegram)

```json
"capabilities": ["addon", "communication", "hooks", "http_outbound"]
```

The addon subscribes to `payment.transaction.completed`, `invoice.created`, or other hooks and calls an outbound messaging API.

### Analytics Dashboard Widget

```json
"capabilities": ["addon", "analytics", "hooks", "dashboard"]
```

Filters `admin.dashboard.stats` to inject custom metric data, and uses `admin.dashboard.bottom` to echo an HTML widget card.

### Data Export Provider

```json
"capabilities": ["addon", "export", "db_read"]
```

Reads from `op_plugin_*` tables and filters `export.row` to transform output format.

### Background Sync with Scheduled Job

```json
"capabilities": ["addon", "cron", "http_outbound", "db_write"]
```

Declares a cron entry in `manifest.json` that periodically syncs external data and writes results to a `op_plugin_` table.

### Checkout Theme

```json
"capabilities": ["theme", "checkout_ui"]
```

Overrides the three checkout template filters and injects brand-scoped CSS/JS via `checkout.head` and `checkout.footer`.

---

## 5. Runtime Capability Checking

The `PluginManifest` class provides methods for checking declared capabilities at runtime:

```php
// Check if a manifest declares a specific capability
$manifest->hasCapability(Capability::GATEWAY); // bool

// Retrieve all declared Capability enum cases
$manifest->getCapabilities(); // Capability[]
```

The `PluginSandbox` class performs independent, hard security checks regardless of declared capabilities:

```php
// Validates a file path is within the plugin's own directory
$sandbox->validateFilePath($path); // bool

// Checks whether a plugin holds a declared capability string
$sandbox->hasCapability('db_write'); // bool

// Validates a SQL query against the core table access policy
$sandbox->validateSql($sql); // bool - blocks DROP, ALTER, access to op_* non-plugin tables

// Returns the plugin's own sandboxed storage directory
$sandbox->storagePath(); // string - {plugin_dir}/storage/
```

---

## 6. Security-Relevant Capability Notes

### `db_read` / `db_write` - SQL Isolation

When a plugin's hook callback modifies a database query through the `db.query.before` filter, `EventManager::applyFilter()` automatically invokes `PluginSandbox::validateSql()` on the resulting SQL. This check rejects:

- DDL statements: `DROP`, `TRUNCATE`, `ALTER`, `CREATE TABLE`, `CREATE DATABASE`, `CREATE USER`
- Privilege statements: `GRANT`, `REVOKE`
- File operations: `LOAD_FILE`, `INTO OUTFILE`, `INTO DUMPFILE`
- Access to any `op_*` table **not** prefixed with `op_plugin_`

Any blocked query raises a `RuntimeException` with the message `"blocked: direct access to core tables..."`, which is **re-thrown** (unlike other hook errors that are swallowed).

### `file_read` / `file_write` - Path Containment

`PluginSandbox::validateFilePath()` uses `realpath()` to resolve the target path and checks that it begins with the plugin directory path followed by a directory separator. This prevents sibling-directory traversal (e.g., a crafted path like `../other-plugin/secrets.php`).

### Blocked PHP Functions

Regardless of capabilities, the `PluginLoader` token-scans every PHP file in a plugin before loading it. The following functions cause an immediate load failure if they appear as direct calls:

| Blocked Function | Reason |
|---|---|
| `exec()` | Direct OS command execution |
| `shell_exec()` | Shell command via backtick-equivalent |
| `system()` | OS command with direct output |
| `passthru()` | Raw OS command execution |
| `popen()` | Process pipe opener |
| `proc_open()` | Full process control |
| `pcntl_exec()` | Process image replacement |
| `dl()` | Dynamic extension loading |
| `assert()` | Code evaluation via assertion |
| `create_function()` | Runtime lambda code generation |
| `eval` (language construct) | Dynamic code evaluation |

Method calls (e.g., `$obj->system()`), static calls (`MyClass::exec()`), and function declarations (`function exec()`) are **not** blocked - only bare function invocations are flagged.
