# SmartDeliver — Vendor & Rider Workflows

## Vendor Workflow

### Storefront Setup
1. Register with role `VENDOR` → auto-creates storefront
2. Configure brand metadata (name, logo, banner, category)
3. Add products with pricing, images, and categories

### Order Fulfillment
1. Receive real-time order notifications via Socket.io
2. Accept order → status transitions to `PREPARING`
3. Mark items ready → status transitions to `READY_FOR_PICKUP`
4. Track delivery progress in real-time

### Analytics & Reporting
- Revenue graphs and completed delivery counts
- Per-order transaction ledger
- CSV export capability

### Key Restrictions
- Can only access own store's products and orders
- Cannot mark orders as delivered (rider-only privilege)
- Cannot trigger own payout release (SoD enforcement)

## Rider Workflow

### Delivery Pool
- View only deliveries dispatched/available to the rider
- No access to other riders' deliveries or unrelated orders

### Atomic Order Claiming
- `POST /deliveries/claim/:orderId` uses database-level locking
- `SELECT ... FOR UPDATE` inside ACID transaction prevents race conditions
- Only one rider can claim a delivery — concurrent attempts safely handled

### Delivery Status Progression
```
ASSIGNED → PICKED_UP → EN_ROUTE → DELIVERED
```

Each transition is enforced (forward-only, no backward states).

### Live GPS Broadcasting
- Rider device sends `POST /deliveries/:id/location` with lat/lng
- Backend stores coordinates and broadcasts via Socket.io
- Customer tracking screen receives real-time updates
- GPS updates are rate-throttled

### Escrow Release
When rider marks delivery as `DELIVERED`:
1. Delivery record updated with `deliveredAt` timestamp
2. Order status atomically updated to `DELIVERED`
3. Payment escrow released (`isEscrowHeld: false`, `releasedAt` set)
4. All operations wrapped in a database transaction

### Key Restrictions
- Cannot view vendor catalog internals or customer payment data
- Cannot self-release payouts
- No access to platform analytics or audit logs
