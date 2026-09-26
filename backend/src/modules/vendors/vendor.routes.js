const express = require('express');
const router = express.Router();
const vendorController = require('./vendor.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

// Merchant Dashboard & Operations (Authenticated)
router.post('/', authenticate, authorize('VENDOR', 'ADMIN'), vendorController.createVendor);
router.post('/products', authenticate, authorize('VENDOR', 'ADMIN'), vendorController.createProduct);

router.get('/me/dashboard', authenticate, authorize('VENDOR', 'ADMIN'), vendorController.getVendorDashboard);
router.patch('/orders/:id/status', authenticate, authorize('VENDOR', 'ADMIN'), vendorController.updateVendorOrderStatus);
router.patch('/products/:id/toggle', authenticate, authorize('VENDOR', 'ADMIN'), vendorController.toggleProductAvailability);
router.patch('/products/:id', authenticate, authorize('VENDOR', 'ADMIN'), vendorController.updateProduct);

// Public Catalog Routes
router.get('/', vendorController.getVendors);
router.get('/:id', vendorController.getVendorById);
router.get('/:id/products', vendorController.getVendorProducts);

module.exports = router;
