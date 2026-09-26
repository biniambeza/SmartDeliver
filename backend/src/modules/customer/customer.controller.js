const prisma = require('../../lib/prisma');
const crypto = require('crypto');

/**
 * GET /api/v1/customer/profile
 * Get complete customer profile with addresses, payments, points, tickets, reviews
 */
exports.getCustomerProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Fetch or initialize loyalty points
    let loyaltyRows = await prisma.$queryRaw`
      SELECT points FROM customer_loyalty WHERE user_id = ${userId}
    `;
    let points = 250;
    if (loyaltyRows.length === 0) {
      await prisma.$executeRaw`
        INSERT INTO customer_loyalty (user_id, points) VALUES (${userId}, 250)
      `;
    } else {
      points = loyaltyRows[0].points;
    }

    // Fetch addresses
    const addresses = await prisma.$queryRaw`
      SELECT id, label, address, lat, lng, is_default AS "isDefault", created_at AS "createdAt"
      FROM customer_addresses
      WHERE user_id = ${userId}
      ORDER BY is_default DESC, created_at DESC
    `;

    // Fetch payment methods
    const paymentMethods = await prisma.$queryRaw`
      SELECT id, type, provider, expiry, is_default AS "isDefault", created_at AS "createdAt"
      FROM customer_payment_methods
      WHERE user_id = ${userId}
      ORDER BY is_default DESC, created_at DESC
    `;

    // Fetch reviews
    const reviews = await prisma.$queryRaw`
      SELECT id, order_id AS "orderId", vendor_rating AS "vendorRating", driver_rating AS "driverRating", comment, created_at AS "createdAt"
      FROM customer_reviews
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    // Fetch tickets
    const tickets = await prisma.$queryRaw`
      SELECT id, order_id AS "orderId", topic, details, status, created_at AS "createdAt"
      FROM support_tickets
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    res.status(200).json({
      success: true,
      profile: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        loyaltyPoints: points,
        addresses,
        paymentMethods,
        reviews,
        tickets,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/customer/addresses
 * Add saved address
 */
exports.addAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { label = 'Home', address, lat = 9.0084, lng = 38.7844, isDefault = false } = req.body;

    if (!address || !address.trim()) {
      return res.status(400).json({ success: false, error: 'Address is required' });
    }

    const id = `ADDR-${crypto.randomBytes(4).toString('hex')}`;

    if (isDefault) {
      await prisma.$executeRaw`
        UPDATE customer_addresses SET is_default = false WHERE user_id = ${userId}
      `;
    }

    await prisma.$executeRaw`
      INSERT INTO customer_addresses (id, user_id, label, address, lat, lng, is_default)
      VALUES (${id}, ${userId}, ${label}, ${address.trim()}, ${lat}, ${lng}, ${isDefault})
    `;

    res.status(201).json({
      success: true,
      message: 'Address saved successfully',
      address: { id, label, address: address.trim(), lat, lng, isDefault },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/customer/addresses/:id
 */
exports.deleteAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await prisma.$executeRaw`
      DELETE FROM customer_addresses WHERE id = ${id} AND user_id = ${userId}
    `;

    res.status(200).json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/customer/addresses/:id/default
 */
exports.setDefaultAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await prisma.$executeRaw`
      UPDATE customer_addresses SET is_default = false WHERE user_id = ${userId}
    `;

    await prisma.$executeRaw`
      UPDATE customer_addresses SET is_default = true WHERE id = ${id} AND user_id = ${userId}
    `;

    res.status(200).json({ success: true, message: 'Default address updated' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/customer/payments
 * Add payment method
 */
exports.addPaymentMethod = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type = 'Card', provider, expiry = '12/28', isDefault = false } = req.body;

    if (!provider || !provider.trim()) {
      return res.status(400).json({ success: false, error: 'Payment provider description is required' });
    }

    const id = `PAYM-${crypto.randomBytes(4).toString('hex')}`;

    if (isDefault) {
      await prisma.$executeRaw`
        UPDATE customer_payment_methods SET is_default = false WHERE user_id = ${userId}
      `;
    }

    await prisma.$executeRaw`
      INSERT INTO customer_payment_methods (id, user_id, type, provider, expiry, is_default)
      VALUES (${id}, ${userId}, ${type}, ${provider.trim()}, ${expiry}, ${isDefault})
    `;

    res.status(201).json({
      success: true,
      message: 'Payment method saved',
      paymentMethod: { id, type, provider: provider.trim(), expiry, isDefault },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/customer/payments/:id
 */
exports.deletePaymentMethod = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await prisma.$executeRaw`
      DELETE FROM customer_payment_methods WHERE id = ${id} AND user_id = ${userId}
    `;

    res.status(200).json({ success: true, message: 'Payment method removed' });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/customer/payments/:id/default
 */
exports.setDefaultPaymentMethod = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await prisma.$executeRaw`
      UPDATE customer_payment_methods SET is_default = false WHERE user_id = ${userId}
    `;

    await prisma.$executeRaw`
      UPDATE customer_payment_methods SET is_default = true WHERE id = ${id} AND user_id = ${userId}
    `;

    res.status(200).json({ success: true, message: 'Default payment method set' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/customer/reviews
 * Submit rating & review for an order
 */
exports.submitReview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { orderId, vendorRating = 5, driverRating = 5, comment = '' } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, error: 'Order ID is required' });
    }

    // Verify order ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.customerId !== userId) {
      return res.status(403).json({ success: false, error: 'Order not found or does not belong to you' });
    }

    const id = `REV-${crypto.randomBytes(4).toString('hex')}`;

    await prisma.$executeRaw`
      INSERT INTO customer_reviews (id, user_id, order_id, vendor_rating, driver_rating, comment)
      VALUES (${id}, ${userId}, ${orderId}, ${vendorRating}, ${driverRating}, ${comment})
    `;

    // Award 25 loyalty points for reviewing
    await prisma.$executeRaw`
      INSERT INTO customer_loyalty (user_id, points)
      VALUES (${userId}, 275)
      ON CONFLICT (user_id) DO UPDATE SET points = customer_loyalty.points + 25
    `;

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully! +25 SmartPoints earned.',
      review: { id, orderId, vendorRating, driverRating, comment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/customer/tickets
 * Submit a customer support or refund complaint ticket
 */
exports.submitTicket = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { orderId, topic, details } = req.body;

    if (!topic || !details) {
      return res.status(400).json({ success: false, error: 'Topic and details are required' });
    }

    const id = `TCK-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    await prisma.$executeRaw`
      INSERT INTO support_tickets (id, user_id, order_id, topic, details, status)
      VALUES (${id}, ${userId}, ${orderId || null}, ${topic}, ${details}, 'OPEN')
    `;

    res.status(201).json({
      success: true,
      message: 'Support ticket submitted successfully. Our operations desk will review it shortly.',
      ticket: { id, orderId, topic, details, status: 'OPEN', createdAt: new Date() },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/customer/tickets
 */
exports.getTickets = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const tickets = await prisma.$queryRaw`
      SELECT id, order_id AS "orderId", topic, details, status, created_at AS "createdAt"
      FROM support_tickets
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    res.status(200).json({ success: true, tickets });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/customer/rewards/redeem
 */
exports.redeemPoints = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { pointsToRedeem = 100 } = req.body;

    const rows = await prisma.$queryRaw`
      SELECT points FROM customer_loyalty WHERE user_id = ${userId}
    `;

    const currentPoints = rows.length > 0 ? rows[0].points : 0;
    if (currentPoints < pointsToRedeem) {
      return res.status(400).json({ success: false, error: 'Insufficient loyalty points' });
    }

    const newPoints = currentPoints - pointsToRedeem;
    await prisma.$executeRaw`
      UPDATE customer_loyalty SET points = ${newPoints} WHERE user_id = ${userId}
    `;

    const discountAmount = (pointsToRedeem / 100).toFixed(2);
    const promoCode = `REWARD-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    res.status(200).json({
      success: true,
      message: `Redeemed ${pointsToRedeem} points for a $${discountAmount} voucher!`,
      promoCode,
      discountAmount,
      remainingPoints: newPoints,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/customer/offers
 */
exports.getOffers = async (req, res) => {
  res.status(200).json({
    success: true,
    offers: [
      { code: 'SMART20', desc: 'Get 20% OFF on all orders above $20', discountPercent: 20, minOrder: 20 },
      { code: 'FREEDEL', desc: 'Free Delivery on any order today', freeDelivery: true },
      { code: 'WELCOME10', desc: 'Flat $10 OFF on your first 3 orders', flatDiscount: 10, minOrder: 25 },
    ],
  });
};
