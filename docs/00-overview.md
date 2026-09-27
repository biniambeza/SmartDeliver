# SmartDeliver — Project Overview

SmartDeliver is a production-grade, cloud-ready **multi-vendor delivery platform** built as a clean modular monolith. It covers the end-to-end commerce lifecycle:

- **Vendor storefronts** — product catalog, brand metadata, operational toggles
- **Customer ordering** — browse, cart, checkout with Chapa payments
- **Automated payment verification** — server-side validation against Chapa's API
- **Live GPS delivery tracking** — real-time courier coordinates via Socket.io
- **AI-powered customer support** — order-aware chatbot with Gemini integration
- **Dedicated role dashboards** — Customer, Vendor, Rider, Admin

## Core Value Propositions

1. **End-to-End Order Traceability** — deterministic state machine: `placed → paid → preparing → picked_up → en_route → delivered`
2. **Zero-Trust Server Payment Verification** — payments validated directly against Chapa's server API
3. **True Push Real-Time Tracking** — sub-second Socket.io broadcasts, no polling
4. **Intelligent Contextual AI Support** — order-aware automated chatbot
5. **Strict Role-Scoped Data Access** — RBAC with four platform roles
6. **Dual-Layer Immutable Audit Trails** — auth and admin audit logs

## Platform Roles

| Role | Target User | Primary Responsibilities |
|------|-------------|------------------------|
| ADMIN | Operations Manager | Platform oversight, dispute mediation, audit analysis |
| VENDOR | Merchant / Restaurant | Storefront management, product catalog, revenue analytics |
| RIDER | Delivery Courier | Claim orders, broadcast GPS, update transit state |
| CUSTOMER | Shopper / End-User | Browse, order, pay, track, AI support |

## Technology Stack

- **Frontend**: React (Vite) + Tailwind CSS
- **Backend**: Node.js + Express
- **ORM**: Prisma
- **Database**: PostgreSQL (Supabase)
- **Cache/Queue**: Redis (Upstash) + BullMQ
- **Real-Time**: Socket.io
- **Payments**: Chapa API
- **AI**: Gemini API
- **Containerization**: Docker
