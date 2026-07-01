# Theme Plugin Development Guide

Themes control the visual appearance of OwnPay's customer-facing checkout experience. A theme plugin overrides checkout template paths and injects CSS/JS assets via event hooks, without modifying any core file. OwnPay ships one built-in theme - `own-pay` - located at `modules/themes/own-pay/`, which serves as the definitive reference for theme development.

---

## 1. How Theme Plugins Work

Themes are ordinary plugins of type `"theme"`. They are loaded by `PluginLoader` from `modules/themes/{slug}/` through the same two-phase lifecycle as addons (`register()` then `boot()`).

The checkout controller resolves which template to render by applying three filter hooks:

| Hook | Purpose |
|---|---|
| `checkout.template` | Main payment gateway selection and checkout page. |
| `checkout.status.template` | Success / failure / pending result page. |
| `checkout.payment_link.template` | Payment link amount-entry page. |

Each filter passes the current template path as a `string` and expects a `string` in return. A theme overrides these filters to return its own Twig template paths.

**Active theme resolution**: The active theme is stored in `op_system_settings` as `active_theme` under the `general` group. `BrandThemeService::getBrandTheme()` resolves brand-specific visual overrides (color, logo, CSS, JS) from `op_system_settings` keyed under the `theme` group, falling back to merchant `settings` JSON, then to system-wide defaults.

> **Critical**: The default `own-pay` theme has a manifest `slug` of `"own-pay"`, not `"own-pay-theme"`. The `active_theme` setting and `op_plugins` records must use `"own-pay"` exactly.

---

## 2. Directory Structure

```
modules/themes/my-theme/
├── manifest.json           # Required. Plugin metadata and settings schema.
├── Theme.php               # Required. Entrypoint class implementing PluginInterface.
├── templates/              # Required. Twig templates for checkout pages.
│   ├── checkout.twig       # Main checkout page.
│   ├── checkout-status.twig # Payment result page.
│   ├── payment-link-amount.twig # Payment link page.
│   └── partials/           # Optional. Twig partial files included by main templates.
└── assets/                 # Optional. CSS/JS files.
    ├── checkout.css
    └── checkout.js
```

---

## 3. The `manifest.json` File

### Full Example - OwnPay Default Theme

```json
{
  "name": "OwnPay Theme",
  "slug": "own-pay",
  "version": "2.0.0",
  "description": "Default OwnPay checkout theme - premium, responsive, multi-gateway.",
  "author": "OwnPay",
  "type": "theme",
  "entrypoint": "Theme.php",
  "namespace": "OwnPay\\Modules\\Themes\\OwnPay",
  "requires": {
    "ownpay": ">=0.1.0"
  },
  "settings": {
    "logo_url":              "",
    "support_email":         "",
    "help_url":              "",
    "footer_text":           "Secured by OwnPay · 256-bit encryption",
    "show_dark_toggle":      "enabled",
    "show_security_badges":  "enabled",
    "timeout_enabled":       "enabled",
    "timeout_minutes":       10,
    "express_checkout":      "disabled",
    "custom_css":            "",
    "custom_js":             ""
  },
  "assets": {
    "css": ["checkout.css"],
    "js":  ["op-fetch.js", "checkout.js"]
  }
}
```

### Field Reference

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | ✅ | Display name shown in the admin panel. |
| `slug` | `string` | ✅ | Unique lowercase identifier. Pattern: `^[a-z0-9][a-z0-9\-]{0,62}[a-z0-9]$`. Must match directory name. |
| `version` | `string` | ✅ | Semantic version (e.g., `1.0.0`). |
| `description` | `string` | ✅ | Short description. |
| `author` | `string` | ✅ | Author name. |
| `type` | `string` | ✅ | Must be `"theme"`. Determines scan directory (`modules/themes/`). |
| `entrypoint` | `string` | ✅ | PHP filename for the entrypoint class (e.g., `Theme.php`). No path traversal characters permitted. |
| `namespace` | `string` | ✅ | PSR-4 root namespace for this plugin. |
| `requires` | `object` | ✅ | Semver constraint on OwnPay core. Either `"ownpay"` or `"core"` key is accepted. |
| `settings` | `object` | ❌ | Default key-value pairs for theme configuration. Rendered in the admin theme settings form via `fields()`. |
| `assets` | `object` | ❌ | Declarative asset list. For documentation purposes only - actual asset injection is done via hook callbacks in `register()`. |

---

## 4. The Entrypoint Class

A theme's entrypoint implements `OwnPay\Plugin\PluginInterface`. The primary work is inside `register()`, where Twig template path filters and asset-injection hooks are registered.

```php
<?php
declare(strict_types=1);

namespace OwnPay\Modules\Themes\MyTheme;

use OwnPay\Container;
use OwnPay\Event\EventManager;
use OwnPay\Plugin\Capability;
use OwnPay\Plugin\PluginInterface;

final class Theme implements PluginInterface
{
    public static function metadata(): array
    {
        return [
            'name'        => 'My Theme',
            'slug'        => 'my-theme',
            'version'     => '1.0.0',
            'description' => 'A custom checkout theme for OwnPay.',
            'author'      => 'Your Name',
            'type'        => 'theme',
        ];
    }

    public function capabilities(): array
    {
        return [Capability::THEME];
    }

    public function register(EventManager $events, Container $container): void
    {
        // ── Template overrides ─────────────────────────────────────────────
        // Return paths relative to the Twig loader's base directory (templates/).
        $events->addFilter('checkout.template', function (string $template): string {
            return 'checkout/checkout.twig';
        });

        $events->addFilter('checkout.status.template', function (string $template): string {
            return 'checkout/checkout-status.twig';
        });

        $events->addFilter('checkout.payment_link.template', function (string $template): string {
            return 'checkout/payment-link-amount.twig';
        });

        // ── Asset injection ────────────────────────────────────────────────
        $events->addAction('checkout.head', function (): void {
            // Inject the theme stylesheet into the head section
            echo '<link rel="stylesheet" href="/assets/css/my-theme-checkout.css">';
        });

        $events->addAction('checkout.footer', function () use ($container): void {
            // Read the CSP nonce from the container for script tags
            $nonceVal  = $container->has('csp_nonce') ? $container->get('csp_nonce') : '';
            $nonceAttr = is_string($nonceVal) && $nonceVal !== ''
                ? ' nonce="' . htmlspecialchars($nonceVal, ENT_QUOTES, 'UTF-8') . '"'
                : '';

            echo '<scr' . 'ipt' . $nonceAttr . ' src="/assets/js/my-theme-checkout.js"></scr' . 'ipt>';
        });

        // ── Checkout context data ──────────────────────────────────────────
        $events->addFilter('checkout.render', function (array $data): array {
            // Inject custom variables into the Twig context
            $data['theme_footer_text'] = 'Secured by My Theme · 256-bit encryption';
            return $data;
        });
    }

    public function boot(Container $container): void {}
    public function deactivate(Container $container): void {}
    public function uninstall(Container $container): void {}

    public function fields(): array
    {
        return [
            [
                'name'    => 'primary_color',
                'label'   => 'Primary Color',
                'type'    => 'color',
                'default' => '#0D9488',
                'help'    => 'Main brand color for buttons and accents.',
            ],
            [
                'name'    => 'accent_color',
                'label'   => 'Accent Color',
                'type'    => 'color',
                'default' => '#6C5CE7',
            ],
            [
                'name'    => 'checkout_logo',
                'label'   => 'Checkout Logo URL',
                'type'    => 'text',
                'default' => '',
                'help'    => 'URL of the logo displayed on checkout pages.',
            ],
            [
                'name'    => 'show_powered_by',
                'label'   => 'Show "Powered by OwnPay"',
                'type'    => 'toggle',
                'default' => '1',
            ],
        ];
    }
}
```

---

## 5. Checkout Template Filters

### `checkout.template` - Main Checkout Page

```php
$events->addFilter('checkout.template', function (string $template): string {
    return 'checkout/checkout.twig'; // Path relative to Twig templates root
});
```

The Twig context provided to this template includes:

| Variable | Type | Description |
|---|---|---|
| `transaction` | `array` | The `op_transactions` row (id, amount, currency, status, etc.). |
| `brand` | `array` | Result of `BrandThemeService::getBrandTheme($merchantId)`. Contains `name`, `logo`, `color`, `accent_color`, `custom_css`, `custom_js`, `footer_text`. |
| `gateways` | `array` | List of active gateway configurations for this brand. |
| `intent` | `array\|null` | Payment intent data if applicable. |

---

### `checkout.status.template` - Result Page

```php
$events->addFilter('checkout.status.template', function (string $template): string {
    return 'checkout/checkout-status.twig';
});
```

Context includes `transaction`, `brand`, and `status` (one of `completed`, `failed`, `pending`, `cancelled`).

---

### `checkout.payment_link.template` - Payment Link Page

```php
$events->addFilter('checkout.payment_link.template', function (string $template): string {
    return 'checkout/payment-link-amount.twig';
});
```

Context includes `payment_link` (the `op_payment_links` row), `brand`, and `currencies`.

---

## 6. Brand Theme Data

The checkout controller calls `BrandThemeService::getBrandTheme(int $merchantId)` and passes the result as the `brand` Twig variable. The returned array follows this structure:

```php
[
    'name'           => 'MyBrand',          // Brand display name from op_merchants
    'logo'           => '/storage/logo.png', // Brand logo path
    'favicon'        => '',
    'color'          => '#0D9488',           // Primary color (theme.primary_color setting)
    'accent_color'   => '#0F766E',
    'support_email'  => 'support@mybrand.com',
    'custom_css'     => '/* brand CSS */',   // Injected per-brand custom CSS
    'custom_js'      => '',
    'footer_text'    => 'Secured by MyBrand · 256-bit encryption',
    'show_powered_by'=> true,
    'language'       => '',
    'checkout_success_msg' => '',
    'checkout_pending_msg' => '',
    'checkout_failed_msg'  => '',
]
```

**Resolution priority** (from `BrandThemeService::resolveVal()`):
1. Brand-specific `op_system_settings` rows (`group_name = 'theme'`, `merchant_id = X`).
2. Merchant `settings` JSON column in `op_merchants`.
3. Global `op_system_settings` defaults (`merchant_id IS NULL`).

In your Twig templates, access these as `&#123;&#123; brand.color &#125;&#125;`, `&#123;&#123; brand.logo &#125;&#125;`, etc.

---

## 7. Twig Template Development

Twig 3.x is used as the template engine. All variables are **auto-escaped by default** (HTML context). Use `&#123;&#123; variable &#125;&#125;` for escaped output and `&#123;&#123; variable|raw &#125;&#125;` only for trusted HTML (e.g., core hook output).

### Invoking Core Hooks in Templates

To render hook output inside a Twig template, use the `hook()` Twig function registered by `TwigExtensions`:

```twig
{# Outputs CSS/JS injected by checkout.head action hooks #}
{{ hook('checkout.head')|raw }}

{# Outputs JS injected by checkout.footer action hooks #}
{{ hook('checkout.footer')|raw }}
```

> **Security**: The `hook()` renderer applies `sanitizeHookOutput()` as defense-in-depth, stripping `&lt;script&gt;`, `&lt;iframe&gt;`, `&lt;object&gt;`, `&lt;embed&gt;`, `&lt;form&gt;`, `&lt;base&gt;`, `&lt;meta&gt;`, and `&lt;link&gt;` tags plus inline event handlers from hook output. Your own hook callbacks must **still** escape any user-supplied data - this is a backstop, not a replacement for escaping.

### Example Checkout Template Skeleton

```twig
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{ brand.name|e }} - Checkout</title>

    {% if brand.favicon %}
        <link rel="icon" href="{{ brand.favicon|e }}" />
    {% endif %}

    {# Theme stylesheet (injected by checkout.head hook from Theme::register()) #}
    {{ hook('checkout.head')|raw }}

    {% if brand.custom_css %}
        <style>{{ brand.custom_css }}</style>
    {% endif %}
</head>
<body>
    <main class="checkout-container">

        {# Brand logo #}
        {% if brand.logo %}
            <img src="{{ brand.logo|e }}" alt="{{ brand.name|e }}" class="checkout-logo" />
        {% endif %}

        {# Transaction summary #}
        <div class="checkout-amount">
            {{ transaction.currency|e }} {{ transaction.amount|e }}
        </div>

        {# Gateway selection or payment form goes here #}
        {% block checkout_content %}{% endblock %}

        {# Footer #}
        <footer class="checkout-footer">
            {% if brand.show_powered_by %}
                <span>{{ brand.footer_text|e }}</span>
            {% endif %}
            {% if brand.support_email %}
                <a href="mailto:{{ brand.support_email|e }}">Support</a>
            {% endif %}
        </footer>
    </main>

    {# Theme scripts (injected by checkout.footer hook) #}
    {{ hook('checkout.footer')|raw }}

    {% if brand.custom_js %}
        <script>{{ brand.custom_js }}</script>
    {% endif %}
</body>
</html>
```

---

## 8. Asset Deployment

OwnPay does **not** automatically copy theme assets to `public/`. Theme CSS and JS files must either be:

**Option A - Served directly from `public/assets/`**: Copy your compiled assets into `public/assets/css/` and `public/assets/js/`. Reference them with absolute paths:

```php
$events->addAction('checkout.head', function (): void {
    echo '<link rel="stylesheet" href="/assets/css/my-theme-checkout.css">';
});
```

**Option B - Served via a public plugin route**: Declare a route in `manifest.json` that reads and serves the file from within the plugin directory. This is more portable but requires a route handler on the entrypoint class.

---

## 9. CSP Nonce Integration

OwnPay enforces a Content Security Policy. Inline scripts require a nonce. Retrieve it from the container inside the `checkout.footer` hook:

```php
$events->addAction('checkout.footer', function () use ($container): void {
    $nonce     = $container->has('csp_nonce') ? $container->get('csp_nonce') : '';
    $nonceAttr = is_string($nonce) && $nonce !== ''
        ? ' nonce="' . htmlspecialchars($nonce, ENT_QUOTES, 'UTF-8') . '"'
        : '';

    echo '<scr' . 'ipt' . $nonceAttr . ' src="/assets/js/my-theme-checkout.js"></scr' . 'ipt>';
});
```

If your theme needs to add external domains to the CSP (e.g., Google Fonts), filter `checkout.csp.sources`:

```php
$events->addFilter('checkout.csp.sources', function (array $sources): array {
    $sources['style_src'][] = 'https://fonts.googleapis.com';
    $sources['font_src'][]  = 'https://fonts.gstatic.com';
    return $sources;
});
```

---

## 10. Injecting Context Data

To pass additional variables to checkout templates, filter `checkout.render` or `checkout.intent.render`:

```php
$events->addFilter('checkout.render', function (array $data): array {
    $data['my_theme_version'] = '1.0.0';
    $data['show_trust_badges'] = true;
    return $data;
});
```

These variables are then available in Twig as `&#123;&#123; my_theme_version &#125;&#125;` and `&#123;&#123; show_trust_badges &#125;&#125;`.

---

## 11. Theme Settings and Per-Brand Configuration

The `fields()` array defines the configuration form shown on the Theme Settings admin page. Supported field types:

| Type | Input Rendered |
|---|---|
| `text` | Single-line text input. |
| `password` | Masked input. |
| `color` | Hex color picker. |
| `toggle` | On/off switch. Value stored as `"1"` (on) or `"0"` (off). |
| `select` | Dropdown with `options` key (associative array `value => label`). |
| `textarea` | Multi-line text area. |

Stored values are accessible at runtime from `SettingsRepository`:

```php
public function boot(Container $container): void
{
    $settings = $container->get(\OwnPay\Repository\SettingsRepository::class);
    assert($settings instanceof \OwnPay\Repository\SettingsRepository);

    // Global theme settings (all brands)
    $primaryColor = $settings->getGroup('plugin.my-theme')['primary_color'] ?? '#0D9488';

    // Per-brand override (scoped to a specific brand)
    $brandSettings = $settings->forTenant($merchantId)->getGroup('plugin.my-theme');
}
```

However, for checkout rendering the correct approach is to read from `BrandThemeService::getBrandTheme()`, which already applies the full three-tier resolution cascade (brand → merchant JSON → global defaults) for the standard theme keys (`primary_color`, `accent_color`, `logo`, `footer_text`, `custom_css`, `custom_js`).

---

## 12. Full Hook Reference for Themes

| Hook | Type | Parameters | Purpose |
|---|---|---|---|
| `checkout.template` | Filter | `string $path` | Override main checkout Twig template path. |
| `checkout.status.template` | Filter | `string $path` | Override result page template path. |
| `checkout.payment_link.template` | Filter | `string $path` | Override payment link page template. |
| `checkout.render` | Filter | `array $data` | Inject variables into checkout Twig context. |
| `checkout.intent.render` | Filter | `array $data` | Inject variables into payment intent context. |
| `checkout.head` | Action | None | Inject CSS/fonts into `&lt;head&gt;`. |
| `checkout.footer` | Action | None | Inject JS into `&lt;footer&gt;`. |
| `checkout.before` | Action | `array $txn` | React before checkout template is parsed. |
| `checkout.csp.sources` | Filter | `array $sources` | Add external domains to the Content Security Policy. |
| `landing.features` | Filter | `array $features` | Override features shown on the landing page. |
| `admin.template.resolve` | Filter | `string $template`, `array $data` | Override admin templates (advanced use only). |

---

## 13. Security Requirements

| Rule | Requirement |
|---|---|
| **Escape all output** | Always use `&#123;&#123; variable &#125;&#125;` (auto-escaped) in Twig, never `&#123;&#123; variable|raw &#125;&#125;` for user-supplied data. |
| **CSP nonce on inline scripts** | Every `&lt;script&gt;` tag must carry the nonce from the container (`csp_nonce`). |
| **No `eval()`** | PluginLoader token-scans every PHP file. `eval()` triggers load failure. |
| **No OS commands** | `exec()`, `shell_exec()`, `system()`, `passthru()`, `popen()`, `proc_open()`, `pcntl_exec()` are blocked. |
| **Validate color fields** | If you process the `primary_color` field programmatically, validate with `preg_match('/^#[0-9a-fA-F]{6}$/', $color)` before output. The built-in theme's `Theme::safeBrandColor()` pattern is the reference implementation. |
| **No hardcoded domains in CSP** | Use the `checkout.csp.sources` filter rather than injecting CSP headers directly. |

---

## 14. Installation and Activation

1. **Package** the plugin directory as a ZIP. The root (or one subdirectory) must contain `manifest.json`.
2. **Upload** via Admin → Appearance → Themes → "Install Theme". `PluginInstaller::installFromZip()` deploys to `modules/themes/{slug}/`.
3. **Activate** via the Themes list. On activation, pending database migrations run and `register()` is called on subsequent requests.
4. **Set as active theme** via Admin → Appearance → Themes → "Set Active". This writes `active_theme = {slug}` to `op_system_settings`.

> **Note**: The `active_theme` value must match your manifest `slug` exactly. A mismatch means the system falls back to the built-in `own-pay` theme.

---

## 15. Checklist

- [ ] `manifest.json` complete; `slug` matches directory name.
- [ ] `type` is `"theme"`.
- [ ] `namespace` declared; entrypoint class in correct PSR-4 path.
- [ ] Entrypoint implements `PluginInterface` with all six methods.
- [ ] `register()` overrides all three template filters: `checkout.template`, `checkout.status.template`, `checkout.payment_link.template`.
- [ ] CSS injected via `checkout.head` action hook.
- [ ] JS injected via `checkout.footer` action hook with CSP nonce applied.
- [ ] All Twig output of user-supplied or DB-sourced data uses `&#123;&#123; var &#125;&#125;` (escaped), not `&#123;&#123; var|raw &#125;&#125;`.
- [ ] External font/script domains declared via `checkout.csp.sources` filter.
- [ ] Brand colors validated with hex regex before use.
- [ ] No `eval()`, `exec()`, `shell_exec()`, `system()`, `passthru()`.
- [ ] `icon.svg` provided for display in the admin panel.
