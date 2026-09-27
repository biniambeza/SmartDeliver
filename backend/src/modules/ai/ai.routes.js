const express = require('express');
const router = express.Router();
const aiController = require('./ai.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { aiLimiter } = require('../../middleware/rateLimiter');

// Customer AI chat — rate limited
router.post('/chat', authenticate, aiLimiter, aiController.chat);

// Admin AI usage stats
router.get('/usage', authenticate, authorize('ADMIN'), aiController.getUsageStats);

module.exports = router;
