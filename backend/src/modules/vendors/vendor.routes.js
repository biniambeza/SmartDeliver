const express = require('express');
const router = express.Router();
const vendorController = require('./vendor.controller');

// Public catalog routes
router.get('/', vendorController.getVendors);
router.get('/:id', vendorController.getVendorById);
router.get('/:id/products', vendorController.getVendorProducts);

module.exports = router;
