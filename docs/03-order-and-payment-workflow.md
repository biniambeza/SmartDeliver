# SmartDeliver — Order & Payment Workflow

## Order Lifecycle State Machine

```
PENDING → PAID → PREPARING → READY_FOR_PICKUP → EN_ROUTE → DELIVERED
                                                              ↓
                                                       PAYOUT_RELEASED
```

An order can be `CANCELLED` from `PENDING` or `PAID` states.

## State Transitions & Actors

| Transition | Actor | Trigger |
|-----------|-------|---------|
| → PENDING | System | Customer places order (POST /orders) |
| PENDING → PAID | System | Chapa payment verified server-side |
| PAID → PREPARING | Vendor | Vendor accepts order |
| PREPARING → READY_FOR_PICKUP | Vendor | Food/items ready |
| READY_FOR_PICKUP → EN_ROUTE | System | Rider claims delivery |
| EN_ROUTE → DELIVERED | Rider | Rider confirms drop-off |
| DELIVERED → PAYOUT_RELEASED | System | Automatic escrow release |
| Any → CANCELLED | Customer/Admin | Cancellation request |

## Payment Flow (Chapa Integration)

### 1. Initialize Payment
- Customer calls `POST /payments/initialize/:orderId`
- Backend creates a `Payment` record with status `PENDING`
- Backend calls Chapa API to initialize a checkout session
- Returns `checkoutUrl` for the customer to complete payment

### 2. Webhook Notification
- Chapa sends `POST /payments/webhook` with `tx_ref` and `status`
- Backend verifies HMAC signature
- If `status === 'success'`, atomically updates Payment and Order

### 3. Server-Side Verification
- Customer can call `POST /payments/verify/:txRef`
- Backend directly validates against Chapa REST API
- Atomically transitions Payment → SUCCESS, Order → PAID

### 4. Escrow & Payout Release
- Payment funds held in escrow (`isEscrowHeld: true`)
- Escrow released automatically when Rider marks delivery as DELIVERED
- Payout recorded in `payout_records` table

## Segregation of Duties (SoD)
- Vendor cannot mark an order as delivered
- Rider cannot trigger their own payout
- Payout release is automatic upon verified delivery
