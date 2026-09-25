const express = require('express');
const router = express.Router();
const orderController = require('./order.controller');
const { authenticate } = require('../../middleware/auth.middleware');

// All order operations require a verified authenticated user
router.use(authenticate);

router.post('/', orderController.createOrder);
router.get('/my-orders', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);

module.exports = router;
