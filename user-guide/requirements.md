# Requirements

Before installing OwnPay, make sure your server meets the following minimum and recommended requirements to ensure secure, fast, and precise payment processing.

---

## 1. System Requirements

### PHP Environment
OwnPay requires **PHP 8.3 or higher**.
The following PHP extensions are **strictly required**:

*   **`bcmath`**: Crucial for arbitrary-precision accounting and ledger double-entry calculations.
*   **`json`**: Required for REST APIs, metadata serialization, and config handling.
*   **`mbstring`**: Handles multi-byte character encodings for internationalization (i18n).
*   **`openssl`**: Used for AES-256-GCM field encryption (PII protection).
*   **`pdo_mysql`**: Database adapter interface connection.
*   **`curl`**: For outbound communication with gateway APIs and updating release modules.

### Database Engine
OwnPay requires a MySQL-compatible database server:
*   **MySQL 8.0+** OR
*   **MariaDB 10.4+**

### Web Server
You can host OwnPay on Apache, Nginx, or LiteSpeed.
*   **Apache**: Needs `mod_rewrite` enabled (uses the bundled `.htaccess` file).
*   **Nginx**: Proper configuration to route requests to `/public/index.php`.
*   **Directory Mapping**: The web root **must** point to the `public/` directory (e.g. `/var/www/ownpay/public`), **not** the root installation directory, to protect application configurations and credentials.

---

## 2. Infrastructure & Hosting

### SSL / HTTPS (Mandatory)
An active SSL/TLS certificate is **mandatory** for handling live payments securely. Running on plain HTTP is insecure and blocked by most payment providers.
*   You can use free certificates from Let's Encrypt.
*   Per-brand white-label checkout relies on custom domain mappings, which require wildcard SSL or multiple single-domain SSL certificates.

### Mobile SMS Gateway Pairing
If you plan to use the Android SMS Gateway:
*   An active Android device (Android 8.0+) is required.
*   The device must have network connectivity (cellular or Wi-Fi) to transmit matched transaction details to your server.
