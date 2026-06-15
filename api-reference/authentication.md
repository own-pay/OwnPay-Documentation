# API Key Authentication

OwnPay uses static Bearer tokens for API authentication. All API keys are prefixed with `op_` and are generated from the [Developer Hub](/user-guide/developers/developer-hub).

## Generating an API Key

1. Log in to the OwnPay admin panel.
2. Navigate to **DEVELOPERS → Developer Hub**.
3. Under the **API Keys** tab, enter a descriptive **Key Label** (e.g., `Production Backend`).
4. Click **Generate Key**.
5. **Copy the full key immediately** — it is only displayed once.

## Using the API Key

Include the key in the `Authorization` header of every API request:

```http
Authorization: Bearer op_8ae87c48.aae2b54e89c755d768a9db81b820643d3da425747
```

### cURL Example

```bash
curl -X GET https://your-domain.com/api/v1/transactions \
  -H "Authorization: Bearer op_8ae87c48.aae2b54e89c755d768a9db81b820643d3da425747" \
  -H "Content-Type: application/json"
```

### PHP Example

```php
$apiKey = getenv('OWNPAY_API_KEY');

$response = file_get_contents('https://your-domain.com/api/v1/transactions', false, stream_context_create([
    'http' => [
        'header' => "Authorization: Bearer {$apiKey}\r\nContent-Type: application/json\r\n",
    ],
]));
```

### Node.js Example

```javascript
const response = await fetch('https://your-domain.com/api/v1/transactions', {
  headers: {
    'Authorization': `Bearer ${process.env.OWNPAY_API_KEY}`,
    'Content-Type': 'application/json',
  },
});
const data = await response.json();
```

## Authentication Errors

| Status | Code | Meaning |
|--------|------|---------|
| `401` | `MISSING_TOKEN` | No `Authorization` header provided |
| `401` | `INVALID_TOKEN` | Key does not exist or has been revoked |
| `403` | `INSUFFICIENT_SCOPE` | Key does not have permission for this action |

### Example 401 Response

```json
{
  "error": true,
  "message": "Invalid or missing API key.",
  "code": "INVALID_TOKEN"
}
```

## Security Best Practices

::: warning Never commit API keys to source control
Store all keys in environment variables (`.env` file, server environment, or a secrets manager). A leaked key grants full API access under that key's scope.
:::

- Generate **separate keys** for each environment (staging, production).
- Generate **separate keys** for each integration (WooCommerce, mobile app, backend).
- **Revoke immediately** if a key is ever leaked or no longer needed.
- Keys are **not recoverable** after generation — store them securely on first copy.

## Revoking a Key

1. Go to **DEVELOPERS → Developer Hub → API Keys**.
2. Find the key by its label.
3. Click **Revoke** and confirm.

The key is instantly deactivated. All requests using it will receive `401 Unauthorized`.

## Related

- [Developer Hub (Admin UI)](/user-guide/developers/developer-hub)
- [Initiate Payment →](/api-reference/initiate-payment)
- [API Overview →](/api-reference/)
