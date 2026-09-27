# SmartDeliver — Deployment Guide

## Local Development

### Prerequisites
- Node.js v18.x or higher
- Docker & Docker Compose (optional)
- Free-tier accounts: Supabase, Upstash, Chapa

### Option A: Docker Compose (Recommended)
```bash
git clone https://github.com/biniambeza/SmartDeliver.git
cd SmartDeliver
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Populate .env files with your credentials
docker compose up --build
```

### Option B: Manual Setup
```bash
# Backend
cd backend
npm install
npx prisma migrate dev --name init
npx prisma db seed    # Optional: seed demo data
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Access Points
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/v1
- WebSocket: ws://localhost:5000
- Health Check: http://localhost:5000/health

## Production Deployment (100% Free-Tier)

| Component | Provider | Notes |
|-----------|----------|-------|
| Frontend | Vercel | Root: `frontend`, output: `dist` |
| Backend API | Render | Web Service, Node.js runtime |
| Database | Supabase | Managed PostgreSQL with pooling |
| Redis | Upstash | Serverless Redis with TLS |
| Media | Cloudinary | Free CDN for images |
| Payments | Chapa Sandbox | Test-mode ETB checkouts |

## Health Check Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /health` | Basic server liveness |
| `GET /health/db` | Database connectivity |
| `GET /health/live` | Kubernetes liveness probe |
| `GET /health/ready` | Kubernetes readiness probe (DB + Redis) |

## Environment Variables

See `backend/.env.example` and `frontend/.env.example` for the complete list of required configuration variables.
