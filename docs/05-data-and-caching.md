# SmartDeliver — Data Architecture & Caching

## Database Schema (PostgreSQL)

The authoritative schema is defined in `backend/prisma/schema.prisma`.

### Core Entities

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `users` | All platform users | email, role, failedLoginAttempts, lockedUntil |
| `vendors` | Merchant storefronts | userId (FK), name, slug, category, isActive |
| `products` | Product catalog | vendorId (FK), price (DECIMAL), isAvailable |
| `orders` | Customer orders | customerId, vendorId, status, totalAmount (DECIMAL) |
| `order_items` | Line items per order | orderId, productId, quantity, price (DECIMAL) |
| `payments` | Chapa payment records | orderId, txRef, amount (DECIMAL), isEscrowHeld |
| `deliveries` | Delivery tracking | orderId, riderId, status, currentLat/Lng |
| `auth_audit_logs` | Authentication events | userId, event, ipAddress, userAgent |
| `admin_audit_logs` | Admin actions | adminId, action, targetResource, reason |
| `ai_requests` | AI chat usage metering | userId, orderId, message, response, tokensUsed |
| `payout_records` | Vendor settlement ledger | orderId, vendorId, amount (DECIMAL), status |

### Data Integrity Rules

- All monetary columns use `DECIMAL(10,2)` — no floating-point
- Foreign keys enforce referential integrity across the order chain
- Composite indexes on hot query paths: `(vendor_id)`, `(customer_id)`, `(status)`, `(created_at)`
- UUIDs as primary keys across all tables

## Redis Caching Strategy

### Cache-Aside Pattern
1. Check Redis cache before database query
2. On cache miss, query database and write result to cache
3. On mutations, immediately invalidate affected cache keys

### Cached Endpoints
| Endpoint | Cache Key Pattern | TTL |
|----------|------------------|-----|
| `GET /vendors` | `vendors:list:{category}:{search}` | 60s |
| `GET /vendors/:id/products` | `vendors:{id}:products:{category}:{search}` | 60s |

### Cache Invalidation Triggers
- `POST /products` → invalidates `vendors:{vendorId}:products:*` and `vendors:list:*`
- `PATCH /products/:id` → invalidates `vendors:{vendorId}:products:*`
- `PATCH /products/:id/toggle` → invalidates product and vendor list caches

### Graceful Degradation
- If Redis is unavailable, caching is silently skipped
- All cache operations are wrapped in try/catch
- Application continues to function without caching (direct DB queries)
