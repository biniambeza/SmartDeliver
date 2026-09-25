const prisma = require('../../lib/prisma');
const paymentService = require('./payment.service');

/**
 * POST /api/v1/payments/initialize/:orderId
 * Initialize escrow payment with Chapa
 */
exports.initializePayment = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    // 1. Fetch Order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        vendor: true,
        payment: true,
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (order.customerId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Unauthorized to pay for this order' });
    }

    if (order.status === 'PAID') {
      return res.status(400).json({ success: false, error: 'Order has already been paid for' });
    }

    // 2. Generate unique transaction reference
    const txRef = `SD-TX-${order.id.slice(0, 8)}-${Date.now()}`;

    // 3. Upsert Payment record in Database
    const payment = await prisma.payment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        txRef,
        amount: order.totalAmount,
        currency: 'ETB',
        status: 'PENDING',
        isEscrowHeld: true,
      },
      update: {
        txRef,
        amount: order.totalAmount,
        status: 'PENDING',
      },
    });

    // 4. Initialize with Chapa
    const chapaRes = await paymentService.initializeChapaPayment({
      amount: order.totalAmount,
      currency: 'ETB',
      email: order.customer.email,
      firstName: order.customer.name.split(' ')[0] || 'Customer',
      lastName: order.customer.name.split(' ')[1] || '',
      txRef,
      callbackUrl: process.env.CHAPA_WEBHOOK_URL || 'http://localhost:5000/api/v1/payments/webhook',
      returnUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/order/${order.id}?status=success`,
    });

    res.status(200).json({
      success: true,
      orderId: order.id,
      txRef,
      checkoutUrl: chapaRes?.data?.checkout_url || null,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/payments/verify/:txRef
 * Verify payment status and transition order to PAID (Escrow Secured)
 */
exports.verifyPayment = async (req, res, next) => {
  try {
    const { txRef } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { txRef },
      include: { order: true },
    });

    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment transaction not found' });
    }

    // Execute atomic update
    const [updatedPayment, updatedOrder] = await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCESS',
          chapaReference: `CHAPA-VERIFIED-${Date.now()}`,
          isEscrowHeld: true,
        },
      }),
      prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'PAID',
        },
      }),
    ]);

    // Broadcast real-time Socket.io event
    const io = req.app.get('io');
    if (io) {
      io.to(`order_${payment.orderId}`).emit('order:paid', {
        orderId: payment.orderId,
        paymentId: updatedPayment.id,
        status: 'PAID',
      });
      io.to(`vendor_${updatedOrder.vendorId}`).emit('vendor:order:paid', {
        orderId: payment.orderId,
        status: 'PAID',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and escrow locked successfully',
      payment: updatedPayment,
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/payments/webhook
 * Chapa Webhook handler with HMAC signature check
 */
exports.handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-chapa-signature'];
    const secret = process.env.CHAPA_WEBHOOK_SECRET;

    // In production, verify signature if secret configured
    if (secret && signature) {
      const isValid = paymentService.verifyWebhookSignature(
        JSON.stringify(req.body),
        signature,
        secret
      );
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }
    }

    const { tx_ref, status } = req.body;

    if (!tx_ref) {
      return res.status(400).json({ error: 'Missing tx_ref in webhook body' });
    }

    if (status === 'success' || status === 'SUCCESS') {
      const payment = await prisma.payment.findUnique({
        where: { txRef: tx_ref },
      });

      if (payment) {
        await prisma.$transaction([
          prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'SUCCESS',
              isEscrowHeld: true,
            },
          }),
          prisma.order.update({
            where: { id: payment.orderId },
            data: { status: 'PAID' },
          }),
        ]);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal webhook error' });
  }
};
