const express = require('express');
const router = express.Router();
const customerController = require('./customer.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.use(authenticate);

// Profile & Summary
router.get('/profile', customerController.getCustomerProfile);

// Saved Addresses
router.post('/addresses', customerController.addAddress);
router.delete('/addresses/:id', customerController.deleteAddress);
router.patch('/addresses/:id/default', customerController.setDefaultAddress);

// Payment Methods
router.post('/payments', customerController.addPaymentMethod);
router.delete('/payments/:id', customerController.deletePaymentMethod);
router.patch('/payments/:id/default', customerController.setDefaultPaymentMethod);

// Reviews & Ratings
router.post('/reviews', customerController.submitReview);

// Support & Complaints Tickets
router.post('/tickets', customerController.submitTicket);
router.get('/tickets', customerController.getTickets);

// Loyalty & Rewards
router.post('/rewards/redeem', customerController.redeemPoints);
router.get('/offers', customerController.getOffers);

module.exports = router;
