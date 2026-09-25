const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');
const { authenticate } = require('../../middleware/auth.middleware');

// Public Webhook endpoint
router.post('/webhook', paymentController.handleWebhook);

// Authenticated Endpoints
router.post('/initialize/:orderId', authenticate, paymentController.initializePayment);
router.post('/verify/:txRef', authenticate, paymentController.verifyPayment);

module.exports = router;
