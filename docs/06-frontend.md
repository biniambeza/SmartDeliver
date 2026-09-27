# SmartDeliver — Frontend Application

## Technology Stack

- **React 19** with JavaScript (no TypeScript)
- **Vite 8** for ultra-fast builds
- **Tailwind CSS v4** for utility-first styling
- **Axios** for HTTP API calls
- **Socket.io Client** for real-time WebSocket communication
- **Lucide React** for icons
- **React Router DOM v7** for routing

## Application Structure

```
frontend/src/
├── components/         # Reusable UI widgets
│   ├── Navbar.jsx
│   ├── AuthModal.jsx
│   ├── CartDrawer.jsx
│   ├── ChapaPaymentModal.jsx
│   ├── OrderTrackerModal.jsx
│   ├── VendorDashboardModal.jsx
│   ├── AdminSuperpanelModal.jsx
│   ├── Storefront.jsx
│   ├── ProductCard.jsx
│   ├── VendorCard.jsx
│   └── ...
├── context/            # React State Contexts
│   ├── AuthContext.jsx    # Authentication state & token management
│   ├── CartContext.jsx    # Shopping cart state
│   └── SocketContext.jsx  # Socket.io connection & room management
├── contexts/           # Additional contexts
│   └── LanguageContext.jsx
├── hooks/              # Custom React hooks
│   ├── useOrderTracking.js   # Real-time order status & location
│   └── useLiveLocation.js    # GPS broadcasting & receiving
├── lib/
│   ├── api.js          # Axios client with JWT interceptors
│   └── socket.js       # Socket.io client singleton
├── pages/
│   ├── customer/       # CustomerDashboard.jsx
│   ├── vendor/         # VendorDashboard.jsx
│   ├── rider/          # RiderDashboard.jsx
│   └── admin/          # AdminDashboard.jsx
├── routes/
│   ├── RequireRole.jsx # Role-based route guard
│   └── RoleLayout.jsx  # Role-specific layout wrapper
├── App.jsx             # Main routing & layout
├── main.jsx            # Application entrypoint
└── index.css           # Global styles
```

## Key Patterns

### Authentication Flow
- JWT stored in `localStorage` as `smartdeliver_token`
- Axios interceptor automatically attaches `Authorization: Bearer <token>`
- On 401 response, token is cleared and user is logged out

### Socket.io Integration
- `SocketContext` auto-connects when user authenticates
- `useOrderTracking` hook subscribes to order-specific rooms
- `useLiveLocation` hook handles GPS broadcasting (rider) and receiving (customer)

### Role-Based Routing
- `RequireRole` component wraps protected routes
- Redirects unauthorized users to their appropriate dashboard
- Supports all four platform roles
