const prisma = require('../../lib/prisma');
const bcrypt = require('bcryptjs');

/**
 * Helper to ensure a default demo rider exists if needed
 */
async function getOrCreateDemoRider() {
  let rider = await prisma.user.findFirst({
    where: { role: 'RIDER', isActive: true },
  });

  if (!rider) {
    const passwordHash = await bcrypt.hash('RiderPass123!', 10);
    rider = await prisma.user.create({
      data: {
        email: 'rider.dawit@smartdeliver.com',
        name: 'Dawit Haile',
        phone: '+251911223344',
        password: passwordHash,
        role: 'RIDER',
        isVerified: true,
      },
    });
  }

  return rider;
}

/**
 * POST /api/v1/deliveries/claim/:orderId
 * Assign a courier rider to a delivery
 */
exports.claimDelivery = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    let riderId = req.user?.id;

    // If caller is not RIDER (e.g. simulated dispatch from customer portal), assign default verified rider
    if (req.user?.role !== 'RIDER') {
      const demoRider = await getOrCreateDemoRider();
      riderId = demoRider.id;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { delivery: true },
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Default Bole starting coordinates for Addis Ababa
    const defaultLat = 9.0016;
    const defaultLng = 38.7839;

    const delivery = await prisma.delivery.upsert({
      where: { orderId },
      create: {
        orderId,
        riderId,
        status: 'ASSIGNED',
        currentLat: defaultLat,
        currentLng: defaultLng,
      },
      update: {
        riderId,
        status: 'ASSIGNED',
        currentLat: defaultLat,
        currentLng: defaultLng,
      },
      include: {
        rider: {
          select: { id: true, name: true, phone: true },
        },
      },
    });

    // Update order status to EN_ROUTE if needed
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'EN_ROUTE' },
    });

    // Broadcast to WebSocket room
    const io = req.app.get('io') || req.io;
    if (io) {
      io.to(`order:${orderId}`).to(`order_${orderId}`).emit('delivery:status_changed', {
        orderId,
        deliveryId: delivery.id,
        status: 'ASSIGNED',
        rider: delivery.rider,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Delivery claimed successfully by courier',
      delivery,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/deliveries/:id/status
 * Transition delivery status (PICKED_UP, DELIVERED) and release Escrow
 */
exports.updateDeliveryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['ASSIGNED', 'PICKED_UP', 'DELIVERED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const existingDelivery = await prisma.delivery.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!existingDelivery) {
      return res.status(404).json({ success: false, error: 'Delivery record not found' });
    }

    const updateData = { status };
    if (status === 'PICKED_UP') {
      updateData.pickedUpAt = new Date();
    } else if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    }

    // Atomic update for delivery, order status, and escrow release
    const result = await prisma.$transaction(
      async (tx) => {
        const delivery = await tx.delivery.update({
          where: { id },
          data: updateData,
          include: {
            rider: {
              select: { id: true, name: true, phone: true },
            },
          },
        });

        if (status === 'DELIVERED') {
          // Update Order to DELIVERED
          await tx.order.update({
            where: { id: delivery.orderId },
            data: { status: 'DELIVERED' },
          });

          // Release Escrow payment
          await tx.payment.updateMany({
            where: { orderId: delivery.orderId },
            data: {
              isEscrowHeld: false,
              releasedAt: new Date(),
            },
          });
        }

        return delivery;
      },
      { maxWait: 10000, timeout: 25000 }
    );

    // Broadcast WebSocket update
    const io = req.app.get('io') || req.io;
    if (io) {
      io.to(`order:${existingDelivery.orderId}`).to(`order_${existingDelivery.orderId}`).emit('delivery:status_changed', {
        orderId: existingDelivery.orderId,
        deliveryId: id,
        status,
        escrowReleased: status === 'DELIVERED',
      });
    }

    res.status(200).json({
      success: true,
      message: `Delivery status transitioned to ${status}`,
      delivery: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/deliveries/:id/location
 * Update real-time GPS coordinates of courier
 */
exports.updateLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, error: 'Latitude and longitude are required' });
    }

    const delivery = await prisma.delivery.update({
      where: { id },
      data: {
        currentLat: lat,
        currentLng: lng,
      },
    });

    const io = req.app.get('io') || req.io;
    if (io) {
      io.to(`order:${delivery.orderId}`).to(`order_${delivery.orderId}`).emit('delivery:location_updated', {
        deliveryId: id,
        orderId: delivery.orderId,
        lat,
        lng,
      });
    }

    res.status(200).json({
      success: true,
      deliveryId: id,
      lat,
      lng,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/deliveries/order/:orderId
 * Fetch delivery tracking info by order ID
 */
exports.getDeliveryByOrderId = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const delivery = await prisma.delivery.findUnique({
      where: { orderId },
      include: {
        rider: {
          select: { id: true, name: true, phone: true },
        },
      },
    });

    if (!delivery) {
      return res.status(404).json({ success: false, error: 'Delivery not found for this order' });
    }

    res.status(200).json({
      success: true,
      delivery,
    });
  } catch (error) {
    next(error);
  }
};
