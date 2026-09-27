const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.io Connection Handler
io.on('connection', (socket) => {
  console.log(`⚡ Socket connected: ${socket.id}`);

  // Join order-scoped tracking room (support both formats)
  socket.on('join:order', (orderId) => {
    socket.join(`order:${orderId}`);
    socket.join(`order_${orderId}`);
    console.log(`👥 Socket ${socket.id} joined tracking rooms for order ${orderId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

app.set('io', io);

// Make io accessible to route handlers via req.io
app.use((req, res, next) => {
  req.io = io;
  next();
});

const prisma = require('./lib/prisma');
const { redis } = require('./lib/redis');

// Health Checks (accessible at /health and /api/v1/health)
const handleHealth = (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      server: 'UP',
      socket: 'READY',
    },
  });
};

const handleDbHealth = async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'healthy',
      database: 'connected',
      provider: 'Supabase (PostgreSQL)',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database Health Check Failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
    });
  }
};

// Liveness Probe — is the process running?
const handleLive = (req, res) => {
  res.status(200).json({ status: 'alive', timestamp: new Date().toISOString() });
};

// Readiness Probe — are dependencies reachable?
const handleReady = async (req, res) => {
  const checks = { database: 'DOWN', redis: 'DOWN' };
  let healthy = true;

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'UP';
  } catch {
    healthy = false;
  }

  try {
    if (redis) {
      await redis.ping();
      checks.redis = 'UP';
    } else {
      checks.redis = 'NOT_CONFIGURED';
    }
  } catch {
    healthy = false;
  }

  const statusCode = healthy ? 200 : 503;
  res.status(statusCode).json({
    status: healthy ? 'ready' : 'not_ready',
    services: checks,
    timestamp: new Date().toISOString(),
  });
};

app.get(['/health', '/api/v1/health'], handleHealth);
app.get(['/health/db', '/api/v1/health/db'], handleDbHealth);
app.get(['/health/live', '/api/v1/health/live'], handleLive);
app.get(['/health/ready', '/api/v1/health/ready'], handleReady);

// Base API route
app.get('/api/v1', (req, res) => {
  res.status(200).json({
    message: 'Welcome to SmartDeliver API',
    version: '1.0.0',
    documentation: '/docs',
  });
});

// Module Routes
const authRoutes = require('./modules/auth/auth.routes');
const vendorRoutes = require('./modules/vendors/vendor.routes');
const orderRoutes = require('./modules/orders/order.routes');
const paymentRoutes = require('./modules/payments/payment.routes');
const deliveryRoutes = require('./modules/deliveries/delivery.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const customerRoutes = require('./modules/customer/customer.routes');
const aiRoutes = require('./modules/ai/ai.routes');

// Rate limiter imports
const { authLimiter, paymentLimiter } = require('./middleware/rateLimiter');

app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/vendors', vendorRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentLimiter, paymentRoutes);
app.use('/api/v1/deliveries', deliveryRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/customer', customerRoutes);
app.use('/api/v1/ai', aiRoutes);


// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Start BullMQ Workers (if Redis is available)
const { startEmailWorker, startPayoutWorker } = require('./jobs/workers');
startEmailWorker();
startPayoutWorker();

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 SmartDeliver Backend running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket Gateway ready on ws://localhost:${PORT}`);
  console.log(`🌐 Allowed Client URL: ${CLIENT_URL}`);
});

module.exports = { app, server, io };

