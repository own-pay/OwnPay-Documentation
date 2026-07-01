# System Requirements

Before installing OwnPay, ensure your server meets these requirements.

## Server Requirements

### Minimum Requirements
- **PHP**: 8.3 or higher
- **MySQL**: 5.7 or higher (8.0+ recommended)
- **Disk Space**: 1 GB minimum
- **RAM**: 512 MB minimum (2 GB+ recommended)

### PHP Extensions Required
- `php-mysql` - MySQL database support
- `php-curl` - HTTP requests
- `php-xml` - XML processing
- `php-zip` - ZIP file support
- `php-gd` - Image manipulation
- `php-bcmath` - Arbitrary precision math
- `php-intl` - Internationalization

### Hosting Compatibility
- **Shared Hosting** - cPanel, DirectAdmin, Plesk (with PHP 8.3)
- **VPS/Cloud** - Ubuntu 22.04+, Debian 12, or any Linux with root access
- **Docker** - Full Docker support available

### Domain & SSL
- Custom domain name
- SSL certificate (HTTPS required for production)
- DNS access to configure domain

## Optional Enhancements

### Performance Optimization
- **Redis** - Recommended for caching and queue processing
- **Nginx** - Better performance than Apache (though both work)
- **CDN** - For static asset delivery

### Mobile Features
- **Android Device** - For SMS automation features (optional)

## Browser Requirements

OwnPay admin panel works on:
- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Getting Started

Once requirements are met, proceed with [Installation](/getting-started/installation).
