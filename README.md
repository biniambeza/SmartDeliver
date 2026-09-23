# 🚀 SmartDeliver — Multi-Vendor Delivery Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E.svg?logo=supabase&logoColor=white)](https://supabase.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748.svg)](https://www.prisma.io/)
[![Redis](https://img.shields.io/badge/Redis-Upstash-DC382D.svg)](https://upstash.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101.svg)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC.svg)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)

> **A production-grade, cloud-ready multi-vendor delivery platform built as a clean modular monolith.**  
> SmartDeliver covers the end-to-end commerce lifecycle: vendor storefronts, customer ordering, automated payment verification with Chapa, live GPS delivery tracking, AI-powered contextual customer support, and dedicated vendor/rider/admin operations — architected entirely on free-tier, open-source technologies.

---

## 📑 Table of Contents

- [1. Project Overview](#1-project-overview)
- [2. System Architecture](#2-system-architecture)
- [3. Core Functional Capabilities](#3-core-functional-capabilities)
  - [3.1 Customer Experience](#31-customer-experience)
  - [3.2 Vendor Operations](#32-vendor-operations)
  - [3.3 Rider Logistics](#33-rider-logistics)
  - [3.4 Payments & Trust (Payout Protection)](#34-payments--trust-payout-protection)
  - [3.5 Real-Time Communication & Chat](#35-real-time-communication--chat)
  - [3.6 Admin Oversight & Auditability](#36-admin-oversight--auditability)
- [4. Non-Functional Engineering Principles](#4-non-functional-engineering-principles)
- [5. Module Reference](#5-module-reference)
- [6. Technology Stack](#6-technology-stack)
- [7. Security Model & Authentication](#7-security-model--authentication)
- [8. Role-Based Access Control (RBAC)](#8-role-based-access-control-rbac)
- [9. Data Architecture & Integrity](#9-data-architecture--integrity)
- [10. Real-Time Communication (WebSockets)](#10-real-time-communication-websockets)
- [11. AI Support Engine](#11-ai-support-engine)
- [12. Order & Payment Lifecycle Workflow](#12-order--payment-lifecycle-workflow)
- [13. Caching & Resilience Strategy](#13-caching--resilience-strategy)
- [14. Frontend Application Structure](#14-frontend-application-structure)
- [15. API Reference](#15-api-reference)
- [16. Getting Started & Deployment](#16-getting-started--deployment)
  - [Prerequisites](#prerequisites)
  - [Option A: Docker Compose (Recommended)](#option-a-docker-compose-recommended)
  - [Option B: Manual Local Setup](#option-b-manual-local-setup)
  - [Production Deployment Matrix (100% Free-Tier)](#production-deployment-matrix-100-free-tier)
- [17. Environment Configuration Reference](#17-environment-configuration-reference)
- [18. Observability & Health Checks](#18-observability--health-checks)
- [19. Known Limitations & Roadmap](#19-known-limitations--roadmap)
- [20. Project Structure](#20-project-structure)
- [21. Demo & Deployment Links](#21-demo--deployment-links)
- [License](#license)

---

## 1. Project Overview

Manual coordination between customers, vendors, and delivery couriers via unorganized phone calls and spreadsheets fails at scale and creates zero operational transparency. **SmartDeliver** replaces ad-hoc processes with a single unified platform that enforces business rules deterministically across the order lifecycle.

### Core Value Propositions
- **End-to-End Order Traceability:** Deterministic state machine (`placed` ➔ `paid` ➔ `preparing` ➔ `picked_up` ➔ `en_route` ➔ `delivered`).
- **Zero-Trust Server Payment Verification:** Payments are validated directly against Chapa's server API, never trusting client callbacks or standalone webhook headers.
- **True Push Real-Time Tracking:** Sub-second status and courier coordinate distribution powered by Socket.io, eliminating wasteful client polling.
- **Intelligent Contextual AI Support:** Order-aware automated support chatbot answering customer queries with live database context.
- **Strict Role-Scoped Data Access:** Strict segregation ensures vendors only access their own items and sales; riders only receive assigned routes.
- **Dual-Layer Immutable Audit Trails:** Authentication anomalies and sensitive administrative actions are written to separate, append-only audit tables.

### Platform Roles & Responsibilities

| Role | Target User | Primary Responsibilities |
| :--- | :--- | :--- |
| **`ADMIN`** | Operations Manager | Platform oversight, dispute mediation, user/vendor suspensions, payout overrides, audit analysis. |
| **`VENDOR`** | Merchant / Restaurant | Storefront management, product catalog CRUD, live order fulfillment, revenue analytics, CSV reporting. |
| **`RIDER`** | Delivery Courier | Atomically claim orders, broadcast live GPS updates, update transit state (`picked_up` ➔ `delivered`). |
| **`CUSTOMER`** | Shopper / End-User | Browse catalogs, manage cart, pay via Chapa checkout, track live deliveries, resolve issues via AI bot. |

---

## 2. System Architecture

SmartDeliver is engineered as a **Modular Monolith** — a single deployable backend containing strictly decoupled, domain-driven modules. This strikes the ideal balance for performance, simplicity, and maintainability, avoiding microservice network overhead while guaranteeing clean interfaces that can be extracted into microservices if domain requirements ever necessitate it.

```mermaid
flowchart TB
    subgraph ClientLayer ["Client Layer"]
        SPA["React SPA (Vite + Tailwind CSS)"]
    end

    subgraph Gateway ["Transport & Real-Time Gateway"]
        direction TB
        HTTPS["HTTPS (REST API)"]
        WS["WebSocket (Socket.io)"]
    end

    subgraph BackendCore ["Modular Monolith Core (Express / Node.js)"]
        direction TB
        AuthMod["Auth Module"]
        VendorMod["Vendor & Product Module"]
        OrderMod["Order Module"]
        PayMod["Payment Module (Chapa)"]
        DelivMod["Delivery & Dispatch Module"]
        AIMod["AI Support Engine"]
        AdminMod["Admin & Audit Module"]
    end

    subgraph StorageQueues ["Data, Cache & Job Infrastructure"]
        Postgres[("PostgreSQL\n(Supabase)")]
        RedisCache[("Redis Cache & Rate Limiting\n(Upstash)")]
        BullMQWorker["Background Worker\n(BullMQ Queues)"]
    end

    subgraph ExternalIntegrations ["Third-Party External Services"]
        ChapaAPI["Chapa Payment Gateway"]
        GeminiAPI["Gemini AI LLM API"]
        Cloudinary["Cloudinary / MinIO Media"]
        SMTPService["SMTP / Resend Email"]
    end

    %% Client to Transports
    SPA -->|REST Calls| HTTPS
    SPA <-->|Status & Location Subscriptions| WS

    %% Gateway to Monolith
    HTTPS --> BackendCore
    WS <--> BackendCore

    %% Monolith to Storage
    BackendCore -->|Prisma ORM (Transactions)| Postgres
    BackendCore -->|Caching & Throttling| RedisCache
    BackendCore -->|Enqueue Heavy Jobs| BullMQWorker

    %% Workers & Sockets to Redis
    BullMQWorker <-->|Queue Management| RedisCache
    WS <-->|Pub/Sub Scaling Adapter| RedisCache

    %% External Connections
    PayMod <-->|Verify Charges| ChapaAPI
    AIMod <-->|Contextual Inference| GeminiAPI
    VendorMod -->|CDN Assets| Cloudinary
    BullMQWorker -->|Dispatch OTP & Alerts| SMTPService
```

### Communication Patterns
- **Synchronous (REST API):** Standard CRUD operations, idempotent queries, and authenticated commands.
- **Real-Time WebSockets (Socket.io):** Low-latency push notifications for order status transitions and live courier coordinates. Backed by a Redis pub/sub adapter for frictionless horizontal scaling.
- **Asynchronous Background Processing (BullMQ + Redis):** Offloads non-critical tasks (transactional OTP emails, password resets, webhook post-processing, and LLM rate-limiting buffers) from the HTTP event loop. Failed jobs are diverted to a dedicated Dead-Letter Queue (DLQ) for manual inspection and replay.

---

## 3. Core Functional Capabilities

### 3.1 Customer Experience
- **Catalog Discovery:** Filter products by merchant, category, price, and keyword search.
- **Cart & Dynamic Checkout:** Integrated checkout with Chapa payment processing.
- **Live Visual Tracking:** Interactive tracking screen receiving real-time rider coordinates and status changes via WebSockets.
- **Customer Order History:** Scoped strictly to the authenticated customer's own identity.
- **Contextual Support Bot:** AI chatbot automatically pre-fed with active order telemetry.
- **Account Protection:** 6-digit OTP verification at registration (hashed with bcrypt, short-lived 5–10 min TTL), single-use password reset tokens, and proactive session expiration notifications.

### 3.2 Vendor Operations
- **Storefront Profiling:** Configure brand metadata, logo, operating banner, business category, and active status toggle.
- **Product Catalog Management:** Image upload handling (Cloudinary CDN), price specification, and stock management.
- **Segregated Order Queue:** Query-level isolation prevents cross-tenant access.
- **Merchant Analytics:** Revenue graphs, completed delivery count, and CSV exports for bookkeeping.

### 3.3 Rider Logistics
- **Targeted Order Delivery Pool:** View only deliveries dispatched to the authenticated courier.
- **Atomic Assignment Concurrency Protection:** Lock-free race hazard elimination using row-level pessimistic locking (`SELECT ... FOR UPDATE`) inside an ACID database transaction.
- **Live Telemetry Broadcasting:** Emits coordinate pairs (`lat`, `lng`) directly to the order-specific Socket.io room.
- **Status State Machine:** Enforced state progression (`picked_up` ➔ `en_route` ➔ `delivered`).

### 3.4 Payments & Trust (Payout Protection)
- **Zero-Trust Verification Pipeline:** 
  1. Initialize session via Chapa.
  2. Webhook triggers backend background verification.
  3. Direct server-to-server validation against Chapa REST API before updating ledger status.
- **Automated Payout Hold:** Customer funds remain in platform escrow and are only released to the merchant's balance upon courier-certified `delivered` status confirmation.
- **Strict Rate Limiting:** Redis-backed sliding-window throttles on authentication, checkout initialization, and AI routes.

### 3.5 Real-Time Communication & Chat
- Order-scoped Socket rooms ensure data emissions are isolated strictly to authorized order participants.
- Optional customer-to-rider delivery coordination chat (e.g. gate codes, apartment delivery notes) scoped strictly to active orders.

### 3.6 Admin Oversight & Auditability
- **Platform Telemetry:** Global KPIs, cross-vendor dispute mediation, and system analytics.
- **Append-Only Administrative Audit Log:** Immutable ledger recording administrative interventions (user locks, dispute overrides, manual balance corrections).
- **Independent Auth Security Audit Log:** Dedicated recording of account lifecycles (registration, logins, failed attempts, resets, lockouts) independent of admin interaction.

---

## 4. Non-Functional Engineering Principles

### Performance & Scalability
- **Redis Cache Layer:** Product listings and store profiles are cached in Redis with a 60-second TTL and automatic write-through cache invalidation on edits.
- **Stateless Application Tier:** User sessions rely on cryptographically signed JWT tokens, allowing backend nodes to scale behind reverse proxies without session stickiness.
- **Database Optimization:** Composite and single indexes placed on hot foreign keys and query filters: `(vendor_id)`, `(customer_id)`, `(status)`, and `(created_at)`.
- **Strict Pagination:** Cursor/offset pagination enforced on all collection endpoints (`?page=&limit=`).

### Reliability & Resilience
- **Idempotent Webhooks:** Transaction references (`tx_ref`) are checked against existing payment logs inside transactions to prevent double-crediting.
- **Exponential Backoff:** Background jobs automatically retry on transient failures before routing to a failed-job queue.
- **Graceful AI Degradation:** Circuit-breaking fallback responses ensure support widgets stay responsive even during upstream LLM outages.

### Security & Data Protection
- **Segregation of Duties (SoD):** A vendor can fulfill items, but cannot sign off on delivery completion or trigger their own payout release.
- **Brute Force Lockout:** Accounts are locked automatically after 5 consecutive failed login attempts; unlocks require administrative review or cryptographically verified identity flows.
- **Sanitized Upload Pipelines:** User files are renamed to server-generated UUIDs before CDN upload to prevent directory traversal attacks.
- **Monetary Precision:** All currency representations utilize arbitrary-precision `DECIMAL(10,2)` columns, forbidding floating-point math.

---

## 5. Module Reference

```
backend/src/modules/
├── auth/         # Token handling, password hashing, OTP verification, auth audit trail
├── vendors/      # Store profiles, operational toggles, product catalog management
├── orders/       # Order creation, status lifecycle, invoice items, checkout
├── payments/     # Chapa checkout initialization, webhook handling, reconciliation
├── deliveries/   # Atomic assignment, GPS dispatch, status progression, delivery proofs
├── ai/           # Context-injected LLM support interactions, token usage metering
└── admin/        # System telemetry, dispute arbitration, append-only logs, CSV reporting
```

| Module | Core Responsibility | Key Database Entities |
| :--- | :--- | :--- |
| **`auth`** | Identity verification, JWT rotation, OTP, security audit | `users`, `auth_audit_logs` |
| **`vendors`** | Merchant storefront and product catalog operations | `vendors`, `products`, `categories` |
| **`orders`** | Cart management, order state machine, order lines | `orders`, `order_items` |
| **`payments`** | Chapa payment integration, transaction ledgers, escrows | `payments`, `payout_records` |
| **`deliveries`**| Courier allocation, live coordinate broadcast, delivery states | `deliveries`, `courier_locations` |
| **`ai`** | Customer automated assistance, rate-limiting, usage logs | `ai_requests` |
| **`admin`** | Platform oversight, dispute settlement, analytics exports | `admin_audit_logs` |

---

## 6. Technology Stack

| Layer | Technology | Selection Rationale |
| :--- | :--- | :--- |
| **Frontend** | React (JavaScript) + Vite | Ultra-fast build times, zero TypeScript overhead for clean, accessible JavaScript code. |
| **Styling** | Tailwind CSS | Utility-first styling for cohesive design systems and responsive layouts. |
| **Backend** | Node.js + Express | Non-blocking I/O ideal for real-time WebSocket multiplexing and modular monolith architecture. |
| **ORM** | Prisma ORM | Type-safe query building, declarative migrations, and transactional isolation. |
| **Database** | PostgreSQL (Supabase) | Enterprise ACID guarantees, row-level locking, and native DECIMAL numeric safety hosted on Supabase free tier. |
| **Cache & Queue** | Redis + BullMQ | In-memory key-value caching, sliding-window rate limiting, and robust job queuing with DLQ support. |
| **Real-Time** | Socket.io | Bi-directional communication with automated fallback and Redis pub/sub adapter support. |
| **Authentication** | JWT (Dual Token) + bcrypt | Stateless access tokens with rotating refresh tokens and bcrypt password salting. |
| **Payment Gateway** | Chapa API | Premier East-African payment gateway supporting local mobile money and cards. |
| **AI Engine** | Google Gemini (Free Tier) | Cost-effective contextual NLP customer support integration. |
| **Media Storage** | Cloudinary / MinIO | Scalable CDN media distribution and thumbnail transformation. |
| **Transactional Email**| Nodemailer (Gmail / Resend) | Free-tier transactional email delivery for OTP codes and password resets. |
| **Containerization**| Docker & Docker Compose | Guaranteed dev/prod environment parity and one-command orchestration. |

---

## 7. Security Model & Authentication

```mermaid
sequenceDiagram
    autonumber
    actor Client as Customer / Client
    participant Auth as Auth Middleware
    participant Controller as Order Controller
    participant DB as PostgreSQL Database

    Client->>Auth: POST /api/v1/auth/login { email, password }
    Auth->>DB: Query user & verify bcrypt hash
    DB-->>Auth: User verified
    Auth-->>Client: { accessToken (15m), refreshToken (7d), user }

    Note over Client, DB: Authenticated Request Execution
    Client->>Auth: GET /api/v1/orders (Bearer accessToken)
    Auth->>Auth: Verify JWT signature & expiration
    Auth->>Auth: Check Role Permissions (authorize)
    Auth->>Controller: Pass control with req.user context
    Controller->>DB: SELECT * FROM orders WHERE customer_id = req.user.id
    DB-->>Controller: Return scoped records
    Controller-->>Client: 200 OK (Scoped Payload)
```

### Security Defenses
- **Dual-Token System:** Short-lived access tokens (15 minutes) coupled with single-use rotating refresh tokens (7 days).
- **Atomic Assignment with Pessimistic Locking:**
  ```sql
  -- Prevents race conditions when multiple couriers attempt to claim an order
  SELECT * FROM deliveries 
  WHERE id = $1 AND status = 'unassigned' 
  FOR UPDATE;
  ```
- **Segregation of Duties (SoD):** A merchant cannot sign off on an order as `delivered`; a courier cannot trigger their own payout; payout releases occur automatically upon verified delivery events.
- **Comprehensive Audit Trails:**
  - `auth_audit_logs`: Captures `IP`, `user_agent`, `event_type` (`LOGIN_SUCCESS`, `LOGIN_FAILED`, `ACCOUNT_LOCKED`, `PASSWORD_RESET`).
  - `admin_audit_logs`: Captures `admin_id`, `target_resource`, `action`, `rationale`, and `timestamp`.

---

## 8. Role-Based Access Control (RBAC)

| Resource / Endpoint | `CUSTOMER` | `VENDOR` | `RIDER` | `ADMIN` |
| :--- | :---: | :---: | :---: | :---: |
| **Browse Stores & Catalogs** | Read | Read | Read | Full |
| **Manage Store & Products** | ❌ | Read / Write (Own) | ❌ | Full |
| **Place & Pay for Order** | Create (Own) | ❌ | ❌ | Read |
| **Update Order State** | Cancel (Unpaid) | Accept / Prepare | Pick Up / Deliver | Override |
| **Live Telemetry Stream** | Read (Own Active) | Read (Own Store) | Broadcast (Assigned) | Read (All) |
| **AI Support Access** | Use (Throttled) | ❌ | ❌ | Read Usage |
| **Financial Payouts** | ❌ | View Balance | ❌ | Dispute / Override |
| **Audit Logs & Telemetry** | ❌ | ❌ | ❌ | Full Access |

---

## 9. Data Architecture & Integrity

```mermaid
erDiagram
    users ||--o{ orders : places
    users ||--o{ auth_audit_logs : generates
    users ||--o| vendors : owns
    vendors ||--o{ products : catalogs
    orders ||--|{ order_items : contains
    products ||--o{ order_items : referenced_in
    orders ||--|| payments : billed_via
    orders ||--o| deliveries : dispatched_via
    users ||--o{ deliveries : fulfilled_by
    users ||--o{ ai_requests : triggers
    users ||--o{ admin_audit_logs : executes

    users {
        uuid id PK
        string email UK
        string password_hash
        string role
        boolean is_active
        int failed_login_attempts
        timestamp locked_until
    }

    vendors {
        uuid id PK
        uuid user_id FK
        string name
        string slug UK
        string logo_url
        boolean is_active
    }

    products {
        uuid id PK
        uuid vendor_id FK
        string name
        decimal price
        int stock_quantity
    }

    orders {
        uuid id PK
        uuid customer_id FK
        uuid vendor_id FK
        string status
        decimal subtotal
        decimal delivery_fee
        decimal total_amount
    }

    payments {
        uuid id PK
        uuid order_id FK
        string tx_ref UK
        string chapa_reference
        decimal amount
        string status
    }

    deliveries {
        uuid id PK
        uuid order_id FK
        uuid rider_id FK
        string status
        decimal current_lat
        decimal current_lng
    }
```

---

## 10. Real-Time Communication (WebSockets)

SmartDeliver leverages WebSocket rooms isolated by individual order IDs (`order:{orderId}`). This guarantees that updates are only dispatched to clients actively authorized to monitor that specific order.

```mermaid
flowchart LR
    RiderApp["Rider Device\n(Location Telemetry)"] -->|PATCH /deliveries/:id/location| API["Express Backend"]
    API -->|socket.to('order:123').emit()| RedisPubSub["Redis Pub/Sub Layer"]
    RedisPubSub --> SocketEngine["Socket.io Engine"]
    SocketEngine -->|Push delivery:location| CustomerApp["Customer Live Map UI"]
    SocketEngine -->|Push delivery:location| VendorApp["Vendor Active Tracker"]
```

### Event Specification Matrix

| Event Name | Producer | Consumers | Payload Schema | Trigger Condition |
| :--- | :--- | :--- | :--- | :--- |
| `order:status` | Server | Customer, Vendor | `{ orderId: string, status: string, updatedAt: string }` | State changes in order pipeline |
| `delivery:location` | Rider | Customer | `{ orderId: string, lat: number, lng: number }` | Courier location change (throttled) |
| `order:delivered` | Rider | Customer, Vendor | `{ orderId: string, deliveredAt: string }` | Courier marks delivery complete |
| `chat:message` | Customer / Rider | Customer, Rider | `{ orderId: string, senderId: string, text: string }` | Delivery instructions exchange |

---

## 11. AI Support Engine

SmartDeliver incorporates an automated support engine powered by the Google Gemini free-tier API. 

```
                                Context Injection Engine
                               ┌─────────────────────────┐
Customer Query:                │ Active Order Status     │
"Where is my burger?" ───►     │ Courier Distance & ETA  │ ───► Prompt ───► Gemini API
                               │ Vendor Kitchen Time     │
                               └─────────────────────────┘
```

- **Live Context Injection:** Prompts are dynamically enriched with active order metadata, enabling precise responses (e.g., *"Your order from BurgerTown was picked up 4 minutes ago and is 1.2 km away"*).
- **Abuse Prevention:** Rate-limited to 20 inquiries per hour per customer via Redis token buckets.
- **Privacy Assurance:** Raw conversation transcripts are kept ephemeral; only token usage and latency metrics are persisted in `ai_requests`.

---

## 12. Order & Payment Lifecycle Workflow

```mermaid
stateDiagram-v2
    [*] --> PENDING_PAYMENT : Customer Creates Order
    PENDING_PAYMENT --> CHAPA_CHECKOUT : Initialize Payment
    CHAPA_CHECKOUT --> FAILED : Payment Cancelled / Expired
    CHAPA_CHECKOUT --> VERIFYING : Chapa Webhook Received
    
    state VERIFYING {
        [*] --> QueryChapaServer : Server-to-Server GET /verify
        QueryChapaServer --> VerifiedOK : Status == success
        QueryChapaServer --> VerificationFailed : Status != success
    }

    VerificationFailed --> FAILED : Payment Rejected
    VerifiedOK --> PAID : Ledger Updated (Transaction)
    
    PAID --> PREPARING : Vendor Accepts Order
    PREPARING --> READY_FOR_PICKUP : Vendor Dispatches to Counter
    READY_FOR_PICKUP --> EN_ROUTE : Rider Claims (Pessimistic Lock)
    EN_ROUTE --> DELIVERED : Rider Confirms Delivery
    
    DELIVERED --> ESCROW_RELEASED : Background Job Releases Payout
    ESCROW_RELEASED --> [*]
    FAILED --> [*]
```

---

## 13. Caching & Resilience Strategy

- **Multi-Level Cache Architecture:**
  - High-traffic catalog reads (`GET /vendors`, `GET /vendors/:id/products`) are cached in Redis with a 60-second TTL.
  - Mutations (`POST /products`, `PATCH /vendors/:id`) trigger immediate cache evictions for affected cache tags.
- **Resilient Background Processing with BullMQ:**
  - Webhook reconciliation and email dispatches are queued asynchronously.
  - Failed operations retry up to 5 times with exponential backoff before routing to the Dead-Letter Queue (DLQ).
- **Circuit Breakers & Fallbacks:**
  - If the Gemini API experiences upstream throttling, the UI seamlessly transitions to an automated fallback message providing phone support contacts without breaking the application interface.

---

## 14. Frontend Application Structure

The React application is built on top of Vite and Tailwind CSS. All communications route through a unified Axios instance with interceptors for transparent authentication:

```
frontend/src/
├── components/          # Reusable UI widgets (Navbar, Modal, StatusBadge, Button)
├── context/             # Global Contexts (AuthContext, CartContext, SocketContext)
├── hooks/               # Custom hooks (useOrderTracking, useLiveLocation)
├── lib/
│   ├── api.js           # Central Axios client with Bearer & error interceptors
│   └── socket.js        # Socket.io client initialization
├── pages/
│   ├── auth/            # Login, Register, ForgotPassword, VerifyOTP
│   ├── customer/        # Storefront, ProductList, Cart, Checkout, OrderTracking
│   ├── vendor/          # VendorDashboard, ProductManager, IncomingOrders
│   ├── rider/           # RiderDashboard, ActiveDeliveryMap
│   └── admin/           # PlatformOverview, DisputeCenter, AuditLogs
└── routes/
    └── RequireRole.jsx  # Role-based route guard wrapper
```

---

## 15. API Reference

All endpoints are prefixed with `/api/v1`. Protected routes require an `Authorization: Bearer <accessToken>` header.

### Authentication
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Register new user account (dispatches OTP email). |
| `POST` | `/auth/verify-otp` | Public | Verify 6-digit registration code. |
| `POST` | `/auth/login` | Public | Authenticate user; returns tokens and role. |
| `POST` | `/auth/refresh` | Public | Rotate refresh token for a new access token. |
| `POST` | `/auth/forgot-password`| Public | Initiate password reset email flow. |
| `POST` | `/auth/reset-password` | Public | Submit new password with single-use reset token. |

### Storefronts & Products
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/vendors` | Public | List active vendor storefronts (cached). |
| `GET` | `/vendors/:id` | Public | Fetch vendor profile details. |
| `POST` | `/vendors` | `VENDOR` | Initialize merchant storefront. |
| `GET` | `/vendors/:id/products`| Public | List product catalog for a store. |
| `POST` | `/products` | `VENDOR` | Add new item to vendor catalog. |
| `PATCH` | `/products/:id` | `VENDOR` | Update item (enforces merchant ownership). |

### Orders & Checkout
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/orders` | `CUSTOMER` | Create order and calculate subtotal/delivery fees. |
| `GET` | `/orders/mine` | `CUSTOMER` | Retrieve current user's order history. |
| `GET` | `/orders/:id` | Authenticated | Get full order details (access-scoped). |
| `PATCH`| `/orders/:id/status` | `VENDOR` / `RIDER` | Advance order lifecycle state. |

### Payments (Chapa)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/payments/initialize` | `CUSTOMER` | Initialize Chapa session; returns hosted URL. |
| `POST` | `/payments/webhook` | Chapa Server | Handle asynchronous payment confirmation. |
| `GET` | `/payments/verify/:tx_ref` | Authenticated | Server-side status reconciliation. |

### Deliveries & Rider Dispatch
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/deliveries/:id/claim` | `RIDER` | Atomically claim an order using row locks. |
| `PATCH`| `/deliveries/:id/location` | `RIDER` | Broadcast current GPS latitude/longitude. |
| `PATCH`| `/deliveries/:id/status` | `RIDER` | Update delivery milestone (`picked_up`, `delivered`).|

### AI & Operations
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/ai/support` | `CUSTOMER` | Interactive support chat with contextual injection. |
| `GET` | `/admin/analytics` | `ADMIN` | Platform KPIs (revenue, active stores, orders/day). |
| `GET` | `/admin/audit-logs` | `ADMIN` | Query immutable audit logs. |
| `GET` | `/admin/export/csv` | `ADMIN` | Generate CSV export of platform transaction ledgers. |

---

## 16. Getting Started & Deployment

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or higher)
- [Docker & Docker Compose](https://www.docker.com/) (Optional, for containerized execution)
- Free-tier accounts for [Supabase](https://supabase.com/) (PostgreSQL), [Upstash](https://upstash.com/) (Redis), and [Chapa](https://chapa.co/)

### Option A: Docker Compose (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/smartdeliver.git
   cd smartdeliver
   ```

2. **Configure environment variables:**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   # Populate backend/.env with your database, redis, and API keys
   ```

3. **Launch the entire stack:**
   ```bash
   docker compose up --build
   ```
   - **Frontend:** `http://localhost:5173`
   - **Backend API:** `http://localhost:5000`
   - **Socket Gateway:** `ws://localhost:5000`

---

### Option B: Manual Local Setup

#### 1. Backend Setup
```bash
cd backend
npm install

# Run database migrations and generate Prisma Client
npx prisma migrate dev --name init
npx prisma db seed # (Optional) Seed demo stores & catalog items

# Start development server
npm run dev
```

#### 2. Frontend Setup
```bash
cd ../frontend
npm install

# Start Vite dev server
npm run dev
```

---

### Production Deployment Matrix (100% Free-Tier)

| Component | Provider | Configuration Notes |
| :--- | :--- | :--- |
| **Frontend** | [Vercel](https://vercel.com/) | Set root directory to `frontend`, output directory to `dist`. |
| **Backend API** | [Render](https://render.com/) | Web Service (Node.js runtime). Set environment variables in dashboard. |
| **Database** | [Supabase](https://supabase.com/) | Managed Serverless PostgreSQL instance with connection pooling. |
| **Redis & Queues** | [Upstash](https://upstash.com/) | Serverless Redis with standard REST & TLS connection strings. |
| **Media Hosting** | [Cloudinary](https://cloudinary.com/) | Free media store for store banners and product imagery. |
| **Payments** | [Chapa Sandbox](https://chapa.co/) | Real test-mode simulation for Ethiopian Birr (ETB) checkouts. |

---

## 17. Environment Configuration Reference

### Backend Configuration (`backend/.env`)

```ini
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database (PostgreSQL / Supabase connection pooling URL)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?schema=public"

# Redis Cache & Queue
REDIS_URL="redis://default:token@localhost:6379"

# Security & Auth Tokens
JWT_SECRET="your-ultra-secure-access-jwt-secret-min-32-chars"
JWT_REFRESH_SECRET="your-ultra-secure-refresh-jwt-secret-min-32-chars"

# Chapa Payment Gateway
CHAPA_SECRET_KEY="CHASECK_TEST-xxxxxxxxxxxxxxxxxxxx"
CHAPA_WEBHOOK_SECRET="your-chapa-webhook-secret-token"

# AI Integration
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"

# Media Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Transactional Email (Nodemailer / Resend)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-specific-password"
EMAIL_FROM="SmartDeliver <no-reply@smartdeliver.com>"

# Observability (Optional)
SENTRY_DSN=""
```

### Frontend Configuration (`frontend/.env`)

```ini
VITE_API_BASE_URL="http://localhost:5000/api/v1"
VITE_SOCKET_URL="http://localhost:5000"
```

---

## 18. Observability & Health Checks

SmartDeliver exposes structured health endpoints for container probes and uptime monitoring:

```http
GET /health
200 OK
{
  "status": "healthy",
  "timestamp": "2026-09-23T15:00:00.000Z",
  "services": {
    "database": "UP",
    "redis": "UP",
    "bullmq": "RUNNING"
  },
  "uptime": 1420.45
}
```

- **Liveness Probe:** `GET /health/live`
- **Readiness Probe:** `GET /health/ready` (Validates DB and Redis socket connectivity)
- **Application Logs:** Structured JSON logs utilizing [Pino](https://github.com/pinojs/pino).
- **Error Tracking:** Native integration hook for Sentry free tier.

---

## 19. Known Limitations & Roadmap

### Current Limitations
- **Single Host Default:** Local dev runs a single node instance; multi-node clusters require enabling the Redis Socket.io adapter.
- **AI Rate Quotas:** Context length and request frequencies are capped by Google Gemini free-tier parameters.
- **Immediate Invalidation:** JWT access tokens remain cryptographically valid until the 15-minute expiration period expires unless specifically blacklisted in Redis.

### Strategic Roadmap
- [ ] **Kubernetes Helm Charts:** Production manifests for container auto-scaling.
- [ ] **Automated Testing Suite:** End-to-end integration tests using Jest, Supertest, and Playwright.
- [ ] **Catalog Search Indexing:** Integration of Typesense/Meilisearch for typo-tolerant product searches.
- [ ] **SMS Integration:** Twilio / Africa's Talking integration for instant delivery SMS alerts.
- [ ] **Predictive ML Routing:** Delivery time estimation using historical transit times and weather conditions.
- [ ] **Distributed Tracing:** OpenTelemetry instrumented spans across database transactions and external APIs.

---

## 20. Project Structure

```
smartdeliver/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema definitions & indices
│   │   └── migrations/          # Version-controlled SQL migrations
│   ├── src/
│   │   ├── config/              # Validated environment configurations
│   │   ├── jobs/                # BullMQ background workers (email, payouts)
│   │   ├── lib/                 # Singletons: prisma.js, redis.js, socket.js
│   │   ├── middleware/          # authenticate.js, authorize.js, rateLimiter.js
│   │   ├── modules/             # Domain modules (auth, vendors, orders, etc.)
│   │   └── app.js               # Express application entrypoint
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── public/                  # Static assets & brand icons
│   ├── src/
│   │   ├── components/          # Design system primitives & shared components
│   │   ├── context/             # React State Contexts (Auth, Cart, Socket)
│   │   ├── hooks/               # Custom React hooks
│   │   ├── pages/               # Views for Customer, Vendor, Rider, Admin
│   │   ├── lib/api.js           # Interceptor-configured Axios client
│   │   ├── App.jsx              # Routing & role-based guard layout
│   │   └── main.jsx
│   ├── Dockerfile
│   └── package.json
├── docs/                        # Deep-dive architectural whitepapers
│   ├── 00-overview.md
│   ├── 01-architecture.md
│   ├── 02-authentication-and-security.md
│   ├── 03-order-and-payment-workflow.md
│   ├── 04-vendor-and-rider-workflows.md
│   ├── 05-data-and-caching.md
│   ├── 06-frontend.md
│   └── 07-deployment.md
├── docker-compose.yml           # Full-stack local orchestration
├── .gitignore
└── README.md                    # Primary repository entry point
```

---

## 21. Demo & Deployment Links

- **Live Web Application:** *Deploying on Vercel (Coming Soon)*
- **API Documentation & Health:** *Deploying on Render (Coming Soon)*
- **GitHub Repository:** [https://github.com/biniambeza/SmartDeliver](https://github.com/biniambeza/SmartDeliver)

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for full details.

Built with ❤️ as a modern, production-grade portfolio showcase.
