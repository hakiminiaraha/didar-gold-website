# Didar authentication API contract

The frontend demo never represents itself as production authentication. In production, `VITE_AUTH_API_URL` must point to a server implementing these endpoints.

## Endpoints

### `POST /request-otp`

Request:

```json
{
  "mobile": "09123456789"
}
```

Response:

```json
{
  "challengeId": "opaque-server-generated-id",
  "mobile": "09123456789",
  "expiresIn": 120
}
```

### `POST /verify-otp`

Request:

```json
{
  "mobile": "09123456789",
  "challengeId": "opaque-server-generated-id",
  "code": "123456"
}
```

The server must set the authenticated session in a `Secure`, `HttpOnly`, `SameSite` cookie. Do not return a bearer token for browser storage.

Response:

```json
{
  "id": "stable-user-id",
  "mobileMasked": "0912***6789"
}
```

### `GET /me`

Returns the authenticated user from the session cookie, or JSON `null` for a guest.

### `POST /logout`

Invalidates the server session and expires the cookie.

## Required server controls

- Never include OTP values in application, proxy, analytics, or error logs.
- Rate-limit by mobile, IP, and challenge ID.
- Store OTPs as short-lived hashes with strict attempt limits and one-time consumption.
- Return the same neutral response for existing and non-existing identities to prevent enumeration.
- Use HTTPS in every non-local environment and apply CSRF protection appropriate to the cookie policy.
- Keep wishlist records keyed by the authenticated server user ID, not by mobile number.
