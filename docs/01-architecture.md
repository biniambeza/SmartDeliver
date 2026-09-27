# SmartDeliver — System Architecture

## Modular Monolith Design

SmartDeliver is engineered as a **Modular Monolith** — a single deployable backend containing strictly decoupled, domain-driven modules. This balances performance and simplicity while maintaining clean interfaces that can be extracted into microservices if needed.

## Module Map

```
backend/src/modules/
├── auth/        # Token handling, password hashing, OTP, auth audit trail
├── vendors/     # Store profiles, operational toggles, product catalog
├── orders/      # Order creation, status lifecycle, order lines
├── payments/    # Chapa initialization, webhook handling, reconciliation
├── deliveries/  # Atomic assignment, GPS dispatch, status progression
├── ai/          # Context-injected LLM support, token usage metering
├── admin/       # System telemetry, dispute arbitration, audit logs
└── customer/    # Profile, addresses, payments, reviews, tickets, loyalty
```

## Communication Patterns

### Synchronous (REST API)
Standard CRUD operations and authenticated commands over HTTPS.

### Real-Time WebSockets (Socket.io)
Low-latency push notifications for:
- Order status transitions (`order:status_changed`)
- Live courier coordinates (`delivery:location_updated`)
- Delivery completion events (`order:delivered`)
- Customer-rider chat (`chat:message`)

Backed by Redis pub/sub adapter for horizontal scaling.

### Asynchronous Background Processing (BullMQ)
Offloads non-critical tasks from the HTTP event loop:
- Transactional OTP emails
- Password reset emails
- Webhook post-processing
- Payout settlement processing

Failed jobs retry with exponential backoff before routing to a Dead-Letter Queue (DLQ).

## Infrastructure Dependencies

| Component | Provider | Purpose |
|-----------|----------|---------|
| Database | Supabase (PostgreSQL) | ACID transactions, row-level locking |
| Cache/Queue | Upstash (Redis) | Caching, rate limiting, BullMQ queues |
| Media CDN | Cloudinary | Product images, store logos |
| Payments | Chapa | East African payment gateway |
| AI | Gemini API | Customer support chatbot |
| Email | Gmail/Resend (SMTP) | OTP and password reset emails |
