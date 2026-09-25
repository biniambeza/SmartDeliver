const express = require('express');
const router = express.Router();
const vendorController = require('./vendor.controller');
const { authenticate } = require('../../middleware/auth.middleware');

// Merchant Dashboard & Operations (Authenticated)
router.get('/me/dashboard', authenticate, vendorController.getVendorDashboard);
router.patch('/orders/:id/status', authenticate, vendorController.updateVendorOrderStatus);
router.patch('/products/:id/toggle', authenticate, vendorController.toggleProductAvailability);
router.patch('/products/:id', authenticate, vendorController.updateProduct);

// Public Catalog Routes
router.get('/', vendorController.getVendors);
router.get('/:id', vendorController.getVendorById);
router.get('/:id/products', vendorController.getVendorProducts);

module.exports = router;
