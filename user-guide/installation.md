# Installation

This guide covers deploying OwnPay on a fresh Ubuntu 22.04 or Debian 12 VPS. The entire process takes approximately 20–30 minutes.

## Prerequisites

Before beginning, ensure your server meets the following requirements:

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| OS | Ubuntu 22.04 | Ubuntu 24.04 LTS |
| PHP | 8.2 | 8.3 |
| MySQL | 8.0 | 8.0+ |
| Nginx | 1.18 | Latest stable |
| RAM | 1 GB | 2 GB+ |
| Disk | 10 GB | 20 GB+ |
| SSL | Required | Let's Encrypt |

## Step 1 — Server Preparation

Update the system and install required packages:

```bash
sudo apt update && sudo apt upgrade -y

sudo apt install -y nginx mysql-server php8.3-fpm \
  php8.3-mysql php8.3-mbstring php8.3-curl php8.3-xml \
  php8.3-zip php8.3-gd php8.3-bcmath php8.3-redis \
  redis-server composer git unzip certbot python3-certbot-nginx
```

## Step 2 — Database Setup

```bash
sudo mysql_secure_installation

sudo mysql -u root -p <<'EOF'
CREATE DATABASE ownpay CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ownpay'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON ownpay.* TO 'ownpay'@'localhost';
FLUSH PRIVILEGES;
EOF
```

## Step 3 — Application Files

```bash
cd /var/www
git clone https://github.com/own-pay/ownpay.git ownpay
cd ownpay
composer install --no-dev --optimize-autoloader
cp .env.example .env
```

## Step 4 — Environment Configuration

Edit `.env` with your server values:

```ini
APP_ENV=production
APP_URL=https://your-domain.com
APP_SECRET=<64-char-random-string>

DB_HOST=127.0.0.1
DB_NAME=ownpay
DB_USER=ownpay
DB_PASS=STRONG_PASSWORD_HERE

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

Generate a secure `APP_SECRET`:

```bash
openssl rand -hex 32
```

## Step 5 — Database Migration

```bash
php cli/migrate.php
php cli/seed.php  # Creates the initial admin account
```

The seeder outputs the default admin credentials. **Change the password immediately after first login.**

## Step 6 — Nginx Configuration

Create `/etc/nginx/sites-available/ownpay`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/ownpay/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/ownpay /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Step 7 — SSL Certificate

```bash
sudo certbot --nginx -d your-domain.com
```

## Step 8 — File Permissions

```bash
sudo chown -R www-data:www-data /var/www/ownpay
sudo chmod -R 755 /var/www/ownpay
sudo chmod -R 775 /var/www/ownpay/storage
```

## Step 9 — Cron Jobs

Add the OwnPay scheduler to crontab:

```bash
sudo crontab -u www-data -e
```

Add this line:

```bash
* * * * * php /var/www/ownpay/cli/cron.php >> /var/log/ownpay-cron.log 2>&1
```

## Step 10 — First Login

Navigate to `https://your-domain.com` in your browser. Log in with the credentials output by the seeder in Step 5.

Immediately:
1. Change the admin password under **Account → My Account**
2. Enable Two-Factor Authentication
3. Create your first Brand under **People → Brands**

## Troubleshooting

**500 Internal Server Error**
Check PHP-FPM logs: `sudo journalctl -u php8.3-fpm --no-pager -n 50`

**Database connection refused**
Verify MySQL is running: `sudo systemctl status mysql`

**Nginx 502 Bad Gateway**
Verify PHP-FPM socket path matches Nginx config: `ls /run/php/`

**Permission denied errors**
Re-run the `chown` command from Step 8.

## Next Steps

- [Architecture Overview →](/user-guide/architecture)
- [Creating Your First Brand →](/user-guide/people/brands)
- [Configuring Payment Gateways →](/user-guide/gateways/gateways)
