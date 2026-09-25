const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { authenticate } = require('../../middleware/auth.middleware');

// In development, allow authenticated users to inspect the admin superpanel
const adminOrDev = (req, res, next) => {
  if (req.user.role === 'ADMIN' || process.env.NODE_ENV === 'development') {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden: Admin access required' });
};

router.use(authenticate, adminOrDev);

router.get('/overview', adminController.getOverview);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/toggle-status', adminController.toggleUserStatus);
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
