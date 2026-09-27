# SmartDeliver — Authentication & Security

## JWT Dual-Token System

- **Access Token**: Short-lived (configurable, default 7d for development). Contains `sub`, `email`, `role`.
- **Refresh Token**: Planned for single-use rotation (roadmap item for v2).

## Password Security

- All passwords hashed with **bcrypt** (10 salt rounds)
- Minimum 6 character password enforcement
- OTP codes hashed with bcrypt, short-lived 5-10 minute TTL

## Brute Force Protection

- Accounts lock after **5 consecutive failed login attempts**
- Lockout duration: 15 minutes
- Lockout events recorded in `auth_audit_logs`
- Unlock requires waiting or admin intervention

## Auth Audit Trail (`auth_audit_logs`)

Every authentication event is recorded immutably:

| Event Type | Trigger |
|-----------|---------|
| `REGISTER` | New account creation |
| `LOGIN_SUCCESS` | Successful authentication |
| `LOGIN_FAILED` | Wrong password attempt |
| `ACCOUNT_LOCKED` | 5th consecutive failed login |
| `PASSWORD_RESET` | Password change |

Each log captures: `userId`, `email`, `ipAddress`, `userAgent`, `createdAt`.

## Rate Limiting

Redis-backed sliding-window throttles:
- **Auth routes**: 15 requests per 15 minutes
- **Payment routes**: 10 requests per minute
- **AI chat**: 10 requests per minute
- **General API**: 60 requests per minute

Rate limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`) included in responses.

## RBAC (Role-Based Access Control)

The `authorize(...roles)` middleware enforces role checks at the route level. Four roles: `CUSTOMER`, `VENDOR`, `RIDER`, `ADMIN`.

## Security Best Practices

- Uploaded files renamed to server-generated UUIDs (prevents directory traversal)
- CORS configured to allow only the specified client URL
- All monetary values use `DECIMAL(10,2)` — no floating-point arithmetic
- Webhook signature verification via HMAC SHA-256
