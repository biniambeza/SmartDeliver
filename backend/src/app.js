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
    origin: CLIENT_URL,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.io Connection Handler
io.on('connection', (socket) => {
  console.log(`⚡ Socket connected: ${socket.id}`);

  // Join order-scoped tracking room
  socket.on('join:order', (orderId) => {
    socket.join(`order:${orderId}`);
    console.log(`👥 Socket ${socket.id} joined room order:${orderId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// Make io accessible to route handlers via req.io
app.use((req, res, next) => {
  req.io = io;
  next();
});

const prisma = require('./lib/prisma');

// Health Checks
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      server: 'UP',
      socket: 'READY',
    },
  });
});

app.get('/health/db', async (req, res) => {
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
});

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
app.use('/api/v1/auth', authRoutes);

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

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 SmartDeliver Backend running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket Gateway ready on ws://localhost:${PORT}`);
  console.log(`🌐 Allowed Client URL: ${CLIENT_URL}`);
});

module.exports = { app, server, io };
