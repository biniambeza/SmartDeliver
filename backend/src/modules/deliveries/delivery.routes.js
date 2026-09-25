const express = require('express');
const router = express.Router();
const deliveryController = require('./delivery.controller');
const { authenticate } = require('../../middleware/auth.middleware');

// Claim order for delivery (Assign courier)
router.post('/claim/:orderId', authenticate, deliveryController.claimDelivery);

// Update status (ASSIGNED -> PICKED_UP -> DELIVERED with escrow release)
router.patch('/:id/status', authenticate, deliveryController.updateDeliveryStatus);

// Update real-time GPS coordinates
router.post('/:id/location', authenticate, deliveryController.updateLocation);

// Get delivery details by order ID
router.get('/order/:orderId', authenticate, deliveryController.getDeliveryByOrderId);

module.exports = router;
