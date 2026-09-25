const express = require('express');
const router = express.Router();
const aiController = require('./ai.controller');
const { optionalAuth } = require('../../middleware/auth.middleware');

// Public or Authenticated chat endpoint
router.post('/chat', optionalAuth, aiController.chat);

module.exports = router;
