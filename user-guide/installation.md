# Installation

OwnPay comes with a **built-in web installer**. Once you upload the files and create a database, just visit your domain and the installer will guide you through the rest — no command-line knowledge required.

Choose your hosting type below to get started:

- [Shared Hosting (cPanel, DirectAdmin, Plesk)](#shared-hosting)
- [VPS / Cloud Server (Ubuntu / Debian)](#vps-cloud-server)

---

## Shared Hosting

Shared hosting is the easiest way to get started. Most popular hosts like Hostinger, Namecheap, SiteGround, Bluehost, and others work great with OwnPay.

::: tip Before You Begin
Make sure your hosting plan supports **PHP 8.3** and **MySQL**. Almost all modern shared hosting plans do.
:::

### Step 1 — Download OwnPay

1. Go to the [OwnPay GitHub Releases page](https://github.com/own-pay/OwnPay/releases/)
2. Find the **latest release** at the top of the list
3. Under the **Assets** section, click the `.zip` file to download it (e.g. `ownpay-v1.x.x.zip`)

> Save the file somewhere easy to find on your computer, like your Desktop.

---

### Step 2 — Upload the ZIP to Your Hosting

How you upload depends on your control panel. All methods below lead to the same result.

#### Using cPanel (File Manager)

1. Log in to your hosting control panel (e.g. `yourdomain.com/cpanel`)
2. Open **File Manager**
3. Navigate to your website's root folder — usually `public_html` or a subfolder like `public_html/pay`
4. Click **Upload** at the top
5. Choose the OwnPay `.zip` file you downloaded and wait for the upload to complete

#### Using DirectAdmin (File Manager)

1. Log in to DirectAdmin
2. Click **File Manager** from the main menu
3. Navigate to `domains/yourdomain.com/public_html/`
4. Click **Upload Files**, then select the `.zip` file

#### Using Plesk (File Manager)

1. Log in to Plesk
2. Go to **Files** from the left sidebar
3. Navigate to `httpdocs/` (this is your web root)
4. Click the **+** button, then **Upload file**, and choose the `.zip`

#### Using FTP (FileZilla or similar)

If your host does not have a built-in file manager, use an FTP client:

1. Connect to your server with your FTP credentials (host, username, password, port 21)
2. On the right panel (server side), navigate to `public_html/` or your website folder
3. Drag and drop the `.zip` file from your computer to the server

---

### Step 3 — Extract (Unzip) the Files

After uploading, you need to extract the ZIP on the server.

#### In cPanel File Manager

1. Click on the uploaded `.zip` file to select it
2. Click **Extract** in the toolbar at the top
3. A dialog will appear — click **Extract File(s)**
4. The files will be extracted into the current folder

After extracting, you should see folders like `public/`, `src/`, `config/`, `storage/`, etc.

#### In DirectAdmin / Plesk File Manager

Right-click the `.zip` file and choose **Extract** or **Unzip**.

::: warning Folder Structure Check
After extracting, make sure you don't have a **double-nested folder** like `public_html/ownpay-v1.x.x/...`. If that happens, move all the files one level up so that the `public/` folder is directly inside `public_html/`.
:::

---

### Step 4 — Create a MySQL Database

You need an empty database for OwnPay to store its data.

#### In cPanel

1. From cPanel home, click **MySQL Databases**
2. Under **Create New Database**, type a name (e.g. `ownpay_db`) and click **Create Database**
3. Scroll down to **MySQL Users** → **Add New User**
4. Enter a username (e.g. `ownpay_user`) and a **strong password** — write these down, you will need them later
5. Click **Create User**
6. Scroll down to **Add User To Database**
7. Select your new user and your new database, click **Add**
8. On the permissions page, check **ALL PRIVILEGES**, then click **Make Changes**

#### In DirectAdmin

1. Go to **MySQL Management** → **Create new Database**
2. Enter a database name and click **Create**
3. Then go to **MySQL Management** → **Create new User**
4. Enter a username and password
5. Assign the user to your database with **All Privileges**

#### In Plesk

1. Go to **Databases** from the left sidebar
2. Click **Add Database**
3. Enter a database name
4. Under **Related database user**, create a new user with a strong password
5. Click **OK**

::: tip Save Your Database Details
Write down (or copy to a notepad) your:

- **Database name**
- **Database username**
- **Database password**
- **Database host** (usually `localhost`)

You will enter these into the installer in the next steps.
:::

---

### Step 5 — Set PHP Version to 8.3

OwnPay requires PHP 8.3. Most hosts let you change this per-domain.

#### In cPanel

1. Go to **Software** → **Select PHP Version** (or "MultiPHP Manager")
2. Find your domain in the list
3. Change the PHP version to **8.3**
4. Click **Apply** or **Set as current**

#### In DirectAdmin

1. Go to **PHP Version Selector** (or **Fast PHP**)
2. Choose **PHP 8.3** for your domain
3. Save the changes

#### In Plesk

1. Go to your domain → **PHP Settings**
2. Change the **PHP version** to **8.3.x**
3. Click **OK**

::: warning PHP Version is Important
If you skip this step or use an older PHP version, OwnPay will not start. PHP 8.3 is required.
:::

---

### Step 6 — Run the Web Installer

Everything is ready. Now open your browser and visit your domain:

```
https://yourdomain.com/install
```

The OwnPay installer will open automatically. It is a simple multi-step wizard:

#### Installer Step 1 — Requirements Check

The installer checks if your server has everything OwnPay needs (PHP version, extensions, folder permissions).

- ✅ Green items are good to go
- ❌ Red items need to be fixed before you can continue

**Common issues and how to fix them:**

| Issue | How to Fix |
|-------|------------|
| PHP version too old | Go back to Step 5 and change PHP to 8.3 |
| `storage/` not writable | In File Manager, right-click the `storage` folder → Permissions → set to `755` or `775` |
| Missing PHP extension | Contact your hosting support and ask them to enable the extension |

Once all items are green, click **Continue**.

#### Installer Step 2 — Database Configuration

Enter the database details you created in Step 4:

- **Database Host**: `localhost` (leave as is unless your host says otherwise)
- **Database Port**: `3306` (leave as is)
- **Database Name**: the name you created (e.g. `ownpay_db`)
- **Database User**: the username you created (e.g. `ownpay_user`)
- **Database Password**: the password you set
- **Table Prefix**: leave as `op_` (recommended)

Click **Test Connection** — if everything is correct, you will see a success message. Then click **Continue**.

#### Installer Step 3 — Admin Account

Create your administrator account:

- **Name**: Your full name
- **Email**: Your email address (used to log in)
- **Password**: Choose a strong password (at least 12 characters)

#### Installer Step 4 — Application Settings

- **App Name**: Give your OwnPay installation a name (e.g. "My Payment Gateway")
- **App URL**: Your full domain URL (e.g. `https://yourdomain.com`)
- **Timezone**: Select your local timezone

Click **Install** and wait a few seconds. OwnPay will set up the database tables and write your configuration.

#### Done — Installation Complete! 🎉

The installer will show a success screen with a link to log in. Your login page is at:

```
https://yourdomain.com/login
```

Log in with the admin email and password you set in Installer Step 3.

::: warning Secure Your Installation
After logging in for the first time:

1. Go to **Settings → General** and review your configuration
2. Enable **Two-Factor Authentication** under your profile
3. The installer is automatically disabled after installation — no action needed
:::

---

### Step 7 — Set Up the Cron Job (Required)

The cron job runs background tasks like checking payment status, sending notifications, and processing queues. **Without it, many features will not work properly.**

#### In cPanel

1. Go to **Advanced** → **Cron Jobs**
2. Set frequency to: **Once per minute** (or manually enter `* * * * *`)
3. In the **Command** field, enter:

```bash
php /home/YOUR_USERNAME/public_html/public/index.php cron
```

> Replace `YOUR_USERNAME` with your actual cPanel username, and adjust the path if OwnPay is not in `public_html`.

1. Click **Add New Cron Job**

::: tip Find Your PHP Path
Some hosts need the full PHP binary path. To find it, go to **Terminal** in cPanel and run `which php`. You might need:

```bash
/usr/local/bin/php /home/YOUR_USERNAME/public_html/public/index.php cron
```

:::

#### In DirectAdmin

1. Go to **Cron Jobs** from the menu
2. Add a new cron job with schedule `* * * * *`
3. Enter the same command as above (adjusted for your path)

#### In Plesk

1. Go to **Scheduled Tasks** in your domain panel
2. Click **Add Task**
3. Set **Run** to "Cron style" with value `* * * * *`
4. Enter the command and save

---

## VPS / Cloud Server

This section covers installing OwnPay on a **Linux VPS** (Ubuntu 22.04 / 24.04 or Debian 12). You will need SSH access to your server.

::: tip Recommended for Production
A VPS gives you full control, better performance, and the ability to use Redis for caching. It is the recommended setup for a production payment gateway.
:::

### What You Need Before Starting

- A VPS running **Ubuntu 22.04 LTS**, **Ubuntu 24.04 LTS**, or **Debian 12**
- A **domain name** pointing to your server's IP address (DNS must be set up before installing SSL)
- SSH access to the server (Terminal on Mac/Linux, or PuTTY/Windows Terminal on Windows)
- Around **20–30 minutes** of your time

---

### Step 1 — Connect to Your Server

Open your terminal and connect via SSH:

```bash
ssh root@YOUR_SERVER_IP
```

Or if you use a non-root user with sudo access:

```bash
ssh your_username@YOUR_SERVER_IP
```

---

### Step 2 — Update the System

Always start by updating your server's software:

```bash
sudo apt update && sudo apt upgrade -y
```

---

### Step 3 — Install Required Software

Install PHP 8.3, MySQL, Nginx, and all required extensions in one command:

```bash
sudo apt install -y nginx mysql-server \
  php8.3-fpm php8.3-mysql php8.3-mbstring php8.3-curl \
  php8.3-xml php8.3-zip php8.3-gd php8.3-bcmath \
  php8.3-intl unzip curl
```

::: info If PHP 8.3 Is Not Found
On some systems, you may need to add the PHP repository first:

```bash
sudo apt install -y software-properties-common
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
```

Then re-run the install command above.
:::

Start and enable the services:

```bash
sudo systemctl start nginx mysql php8.3-fpm
sudo systemctl enable nginx mysql php8.3-fpm
```

---

### Step 4 — Set Up the Database

#### Secure MySQL

```bash
sudo mysql_secure_installation
```

Follow the prompts. When asked to set a root password, choose a strong one and remember it.

#### Create the OwnPay Database and User

Log in to MySQL:

```bash
sudo mysql -u root -p
```

Once inside the MySQL prompt, run the following commands. Replace `STRONG_PASSWORD_HERE` with a real, secure password:

```sql
CREATE DATABASE ownpay CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ownpay'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON ownpay.* TO 'ownpay'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

> Write down the database name (`ownpay`), username (`ownpay`), and your password. You will enter them during the installer.

---

### Step 5 — Download and Extract OwnPay

1. Go to the [OwnPay GitHub Releases page](https://github.com/own-pay/OwnPay/releases/) in your browser
2. Copy the download URL for the latest `.zip` file (right-click → Copy Link)

Then on your server, run the following (replace the URL with the one you copied):

```bash
cd /var/www
sudo wget https://github.com/own-pay/OwnPay/releases/download/vX.X.X/ownpay-vX.X.X.zip
sudo unzip ownpay-vX.X.X.zip -d ownpay
sudo rm ownpay-vX.X.X.zip
```

> Replace `vX.X.X` with the actual version number from the releases page.

---

### Step 6 — Set File Permissions

OwnPay needs write access to the `storage/` folder:

```bash
sudo chown -R www-data:www-data /var/www/ownpay
sudo chmod -R 755 /var/www/ownpay
sudo chmod -R 775 /var/www/ownpay/storage
```

---

### Step 7 — Configure Nginx

Create a new Nginx configuration file for your site:

```bash
sudo nano /etc/nginx/sites-available/ownpay
```

Paste the following — replace `yourdomain.com` with your actual domain:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/ownpay/public;
    index index.php;

    # Route all requests through the front controller
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # Block access to sensitive files
    location ~ \.(env|git|md|json|lock|installed)$ {
        deny all;
    }

    # Block access to internal directories
    location ~ ^/(src|config|database|modules|tests|vendor)/ {
        deny all;
    }

    # Allow public media files in storage
    location ~ ^/storage/(gateways|uploads)/ {
        allow all;
    }

    # Block all other storage access
    location ~ ^/storage/ {
        deny all;
    }

    # PHP processing — only index.php runs as PHP
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # Block hidden files like .htaccess
    location ~ /\.ht {
        deny all;
    }

    # Cache static assets for 1 year
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Save the file (`Ctrl+O`, then `Enter`, then `Ctrl+X`).

Enable the site and verify the config:

```bash
sudo ln -s /etc/nginx/sites-available/ownpay /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

You should see: `syntax is ok` and `test is successful`.

---

### Step 8 — Install an SSL Certificate (HTTPS)

HTTPS is mandatory for a payment gateway. Install a free Let's Encrypt certificate:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the on-screen prompts. Certbot will automatically update your Nginx config for HTTPS and set up auto-renewal.

---

### Step 9 — Run the Web Installer

Open your browser and go to:

```
https://yourdomain.com/install
```

The same multi-step installer described in the [Shared Hosting section](#step-6-run-the-web-installer) will appear. Follow Installer Steps 1 through 4 to complete the setup.

::: info VPS-Specific Tips for the Installer

- **Database Host**: Use `127.0.0.1` instead of `localhost` for better reliability on VPS
- **App URL**: Enter the full URL including `https://` (e.g. `https://yourdomain.com`)
:::

---

### Step 10 — Set Up the Cron Job

The cron job is required for background tasks. Add it to the system scheduler:

```bash
sudo crontab -u www-data -e
```

When prompted to choose an editor, select `nano` (option 1). Then add the following line at the bottom of the file:

```bash
* * * * * /usr/bin/php /var/www/ownpay/public/index.php cron >> /var/log/ownpay-cron.log 2>&1
```

Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`).

Confirm it was added:

```bash
sudo crontab -u www-data -l
```

---

### (Optional) Step 11 — Install Redis for Better Performance

Redis improves caching and background queue speed. Recommended for high-traffic setups:

```bash
sudo apt install -y redis-server php8.3-redis
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

Then in your OwnPay admin panel under **Settings**, change the cache and queue driver to `redis`.

---

## After Installation

Once installed, log in to your OwnPay admin panel at `https://yourdomain.com/login`.

**Do these things right after logging in:**

1. **Change your password** — Go to your profile and update it to something strong
2. **Enable Two-Factor Authentication** — Strongly recommended for a payment platform
3. **Create your first Brand** — Go to **People → Brands** from the All Brand.
4. **Connect a Payment Gateway** — Go to **Gateways** and add your payment provider

---

## Troubleshooting

### The installer won't open or I see a blank page

- Make sure PHP 8.3 is active for your domain (see Step 5 for shared hosting)
- On shared hosting, verify `mod_rewrite` is enabled — contact support if unsure
- Check that all OwnPay files are in the correct folder (the `public/` folder must be inside your web root)

### Database connection failed in the installer

- Double-check the database name, username, and password — they must match exactly what you created
- On shared hosting, the host is almost always `localhost`
- Make sure the database user has **All Privileges** on the database

### 500 Internal Server Error

- **On VPS**: Check Nginx error logs: `sudo tail -50 /var/log/nginx/error.log`
- **On VPS**: Check PHP-FPM logs: `sudo journalctl -u php8.3-fpm --no-pager -n 50`
- **On shared hosting**: Open your control panel and look for **Error Logs** under the domain or hosting section

### Folder permission errors on shared hosting

- In File Manager, right-click the `storage/` folder → **Change Permissions** → set to `755`
- If that does not work, try `775`

### The `/install` page says "Already Installed"

OwnPay creates a lock file after a successful installation to prevent accidental re-installation. This is expected and normal behavior. If you need to genuinely reinstall (e.g. starting over with a fresh database), contact support for assistance.

---

## Next Steps

- [Requirements →](/user-guide/requirements)
- [Creating Your First Brand →](/user-guide/people/brands)
- [Configuring Payment Gateways →](/user-guide/gateways/gateways)
