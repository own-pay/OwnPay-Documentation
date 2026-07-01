# OwnPay Plugin System

Complete overview of OwnPay's plugin architecture, plugin types, and how to build plugins.

## What are Plugins?

**Plugins** extend OwnPay functionality without modifying core code.

Instead of forking OwnPay, write a plugin to:

- Add payment gateways
- Create custom features
- Design custom themes
- Integrate external services
- Add hooks/events

## Plugin Architecture

```
OwnPay Core
    ↓
Plugin Loader
    ├── Gateway Plugins (payment methods)
    ├── Addon Plugins (features)
    └── Theme Plugins (UI)
    ↓
Hooks & Events System
    ├── Before/After hooks
    ├── Event listeners
    └── Filters
```

## Plugin Types

### 1. Gateway Plugins

Add new payment methods.

**Examples:**

- Stripe, PayPal, Square
- Local: bKash, Nagad, GCash
- Bank: ACH, SEPA, Direct Debit
- Crypto: Bitcoin, Ethereum

**Provides:**

- Payment processing
- Settlement management
- Webhook handling
- Refund logic

[Full gateway development guide →](/developer/plugin-types/gateway-development)

### 2. Addon Plugins

Add new features to OwnPay.

**Examples:**

- Advanced reporting
- Subscription management
- Inventory sync
- CRM integration
- Email customization
- SMS notifications

**Provides:**

- Admin dashboard pages
- API endpoints
- Scheduled jobs
- Database tables
- UI components

[Full addon development guide →](/developer/plugin-types/addon-development)

### 3. Theme Plugins

Customize the checkout experience.

**Examples:**

- Custom checkout design
- Branded payment pages
- Custom email templates
- Custom dashboard theme

**Provides:**

- Twig templates
- CSS stylesheets
- JavaScript files
- Asset management

[Full theme development guide →](/developer/plugin-types/theme-development)

## Plugin Lifecycle

```
1. Discovery
   ↓ Plugin loader scans plugins/ directory
   
2. Registration
   ↓ Plugin class loaded and registered
   
3. Configuration
   ↓ Config files read and validated
   
4. Activation
   ↓ Plugin hooks registered
   
5. Runtime
   ↓ Plugin executes and responds to events
   
6. Deactivation
   ↓ Plugin hooks unregistered
```

## Plugin Structure

```
plugins/
└── gateway-stripe/
    ├── config.json          # Plugin metadata
    ├── composer.json        # PHP dependencies
    ├── src/
    │   ├── StripeGateway.php
    │   ├── Hooks.php
    │   └── Events.php
    ├── resources/
    │   └── views/
    │       └── settings.twig
    ├── migrations/
    │   └── create_stripe_table.php
    └── README.md
```

### config.json

```json
{
  "id": "gateway-stripe",
  "name": "Stripe Payment Gateway",
  "version": "1.0.0",
  "author": "OwnPay",
  "description": "Accept payments via Stripe",
  "type": "gateway",
  "mainClass": "OwnPay\\Plugins\\Stripe\\StripeGateway",
  "requires": {
    "ownpay": ">=0.2.0",
    "php": ">=8.3"
  },
  "permissions": [
    "manage_gateways",
    "view_transactions"
  ]
}
```

## Hooks System

**Pre-execution hooks** (modify behavior):

```php
// Filter payment amount
$amount = Hook::apply('payment.amount', $amount, $payment);

// Filter payment data before save
$data = Hook::apply('payment.data', $data, $payment);
```

**Post-execution hooks** (react to events):

```php
// After payment created
Hook::do('payment.created', $payment);

// After payment completed
Hook::do('payment.completed', $payment);
```

**60+ available hooks** across OwnPay.

[Full hooks reference →](./hooks.md)

## Events System

**Listen to events:**

```php
Event::listen('payment.completed', function ($payment) {
    // Handle payment completed
    SendConfirmationEmail::dispatch($payment);
});
```

**Available events:**

- `payment.*` - Payment lifecycle
- `customer.*` - Customer actions
- `gateway.*` - Gateway operations
- `webhook.*` - Webhook events
- `user.*` - User actions
- `system.*` - System events

[Full events reference →](./events)

## Plugin Development

### 1. Create Plugin Directory

```bash
mkdir plugins/my-plugin
cd plugins/my-plugin
```

### 2. Create config.json

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "type": "addon",
  "mainClass": "OwnPay\\Plugins\\MyPlugin\\MyPlugin"
}
```

### 3. Create Plugin Class

```php
// src/MyPlugin.php
namespace OwnPay\Plugins\MyPlugin;

class MyPlugin
{
    public function register()
    {
        // Register hooks, routes, etc
    }
    
    public function boot()
    {
        // Plugin booting
    }
    
    public function uninstall()
    {
        // Cleanup on uninstall
    }
}
```

### 4. Test Plugin

```bash
# Enable plugin
php public/index.php plugin:enable my-plugin

# Test functionality
# Verify hooks/events firing

# Disable when done
php public/index.php plugin:disable my-plugin
```

## Plugin API

### Access OwnPay Services

```php
// Get payment service
$paymentService = Plugin::service('payment');

// Get config
$config = Plugin::config('stripe');

// Log message
Plugin::log('Something happened', 'info');

// Get current user
$user = Plugin::user();
```

### Access Database

```php
// Run query
$payments = Database::query("SELECT * FROM payments");

// Get connection
$db = Database::connection();

// Use query builder
$active = Database::table('payments')
    ->where('status', 'completed')
    ->get();
```

### Register Routes

```php
Route::group(['prefix' => 'api/v1'], function () {
    Route::post('my-plugin/action', 'MyController@action');
});
```

### Add Admin Pages

```php
Menu::add('Dashboard', 'my-plugin', '/admin/my-plugin');

Route::get('/admin/my-plugin', 'AdminController@index');
```

## Permissions

Plugins can request permissions:

```json
{
  "permissions": [
    "view_transactions",
    "manage_gateways",
    "manage_webhooks",
    "create_users"
  ]
}
```

These are checked before plugin actions execute.

## Publishing Plugins

### Share on Marketplace

1. Create plugin following standards
2. Test thoroughly
3. Write documentation
4. Submit to [Plugin Marketplace](/resources/external-services/plugin-marketplace)
5. Review process
6. Published and discoverable

### Requirements

- ✅ Proper structure
- ✅ config.json
- ✅ README.md
- ✅ Documentation
- ✅ Tests
- ✅ Security review
- ✅ License included

## Best Practices

### Code Quality

- ✅ Follow OwnPay coding standards
- ✅ Include tests
- ✅ Document thoroughly
- ✅ Handle errors gracefully
- ✅ Log important events

### Security

- ✅ Validate all input
- ✅ Escape output
- ✅ Use parameterized queries
- ✅ Respect permissions
- ✅ Store secrets in config

### Performance

- ✅ Use caching
- ✅ Optimize queries
- ✅ Queue heavy tasks
- ✅ Monitor resource usage

### Compatibility

- ✅ Specify PHP version requirement
- ✅ Specify OwnPay version requirement
- ✅ Test on multiple versions
- ✅ Maintain backwards compatibility

## Example: Simple Addon Plugin

```php
// plugins/email-logger/src/EmailLogger.php
namespace OwnPay\Plugins\EmailLogger;

class EmailLogger
{
    public function register()
    {
        Hook::add('email.before_send', [$this, 'logEmail']);
    }
    
    public function logEmail($email)
    {
        Database::table('email_logs')->insert([
            'to' => $email->to,
            'subject' => $email->subject,
            'sent_at' => now(),
        ]);
        
        return $email;
    }
}
```

**In config.json:**

```json
{
  "id": "email-logger",
  "name": "Email Logger",
  "type": "addon",
  "mainClass": "OwnPay\\Plugins\\EmailLogger\\EmailLogger",
  "migrations": ["create_email_logs_table"]
}
```

## Debugging Plugins

```bash
# Enable debug logging
APP_DEBUG=true

# Check plugin logs
tail -f storage/logs/plugins.log

# List active plugins
php public/index.php plugin:list

# Test plugin hooks
php public/index.php plugin:test my-plugin
```

## Troubleshooting

### Plugin Not Loading

- Check config.json syntax
- Verify mainClass exists
- Check permissions
- Review logs

### Hooks Not Firing

- Verify hook name matches
- Check plugin enabled
- Review callback signature
- Log hook firing

### Performance Issues

- Profile plugin code
- Check database queries
- Use query caching
- Queue async tasks

## Summary

Plugins enable:

- ✅ **Extensibility** - Add features without core changes
- ✅ **Customization** - Tailor OwnPay to your needs
- ✅ **Maintainability** - Upgrade OwnPay without losing changes
- ✅ **Community** - Share and discover plugins
- ✅ **Flexibility** - Mix and match plugins

Start building: [Plugin types guide →](/developer/plugin-types/gateway-development)
