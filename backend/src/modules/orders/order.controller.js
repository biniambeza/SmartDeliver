const prisma = require('../../lib/prisma');

/**
 * POST /api/v1/orders
 * Create a new customer order with atomic transaction & server-verified pricing
 */
exports.createOrder = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { vendorId, deliveryAddress, deliveryNotes, items } = req.body;

    // 1. Validation
    if (!vendorId) {
      return res.status(400).json({ success: false, error: 'Vendor ID is required' });
    }

    if (!deliveryAddress || !deliveryAddress.trim()) {
      return res.status(400).json({ success: false, error: 'Delivery address is required' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one item is required in order' });
    }

    // 2. Verify Vendor exists & is active
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor || !vendor.isActive) {
      return res.status(404).json({ success: false, error: 'Vendor not found or currently inactive' });
    }

    // 3. Fetch products from DB to verify pricing and availability
    const productIds = items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        vendorId: vendor.id,
      },
    });

    if (dbProducts.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        error: 'One or more items do not belong to this vendor or do not exist',
      });
    }

    // Check availability
    for (const prod of dbProducts) {
      if (!prod.isAvailable) {
        return res.status(400).json({
          success: false,
          error: `Item "${prod.name}" is currently sold out`,
        });
      }
    }

    // 4. Calculate subtotal using database prices (tamper-proof)
    const productMap = new Map(dbProducts.map((p) => [p.id, p]));
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({ success: false, error: `Invalid quantity for item ${product.name}` });
      }

      const itemTotal = Number(product.price) * qty;
      subtotal += itemTotal;

      orderItemsData.push({
        productId: product.id,
        quantity: qty,
        price: product.price,
      });
    }

    const deliveryFee = 50.0; // Standard 50 ETB local delivery
    const totalAmount = subtotal + deliveryFee;

    // 5. Execute atomic transaction in PostgreSQL
    const createdOrder = await prisma.$transaction(
      async (tx) => {
        const order = await tx.order.create({
          data: {
            customerId,
            vendorId,
            status: 'PENDING',
            subtotal,
            deliveryFee,
            totalAmount,
            deliveryAddress: deliveryAddress.trim(),
            deliveryNotes: deliveryNotes ? deliveryNotes.trim() : null,
            items: {
              create: orderItemsData,
            },
          },
          include: {
            vendor: {
              select: { id: true, name: true, logoUrl: true, address: true },
            },
            items: {
              include: {
                product: {
                  select: { id: true, name: true, imageUrl: true, price: true },
                },
              },
            },
          },
        });

        return order;
      },
      {
        maxWait: 10000,
        timeout: 25000,
      }
    );

    // 6. Broadcast real-time event via WebSocket if available
    const io = req.app.get('io');
    if (io) {
      io.to(`vendor_${vendorId}`).emit('order:created', {
        orderId: createdOrder.id,
        totalAmount: createdOrder.totalAmount,
        status: createdOrder.status,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: createdOrder,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/orders/my-orders
 * Retrieve current customer's orders
 */
exports.getMyOrders = async (req, res, next) => {
  try {
    const customerId = req.user.id;

    const orders = await prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        vendor: {
          select: { id: true, name: true, logoUrl: true, address: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, imageUrl: true, price: true },
            },
          },
        },
        payment: true,
        delivery: true,
      },
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/orders/:id
 * Retrieve order details by ID
 */
exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        vendor: {
          select: { id: true, userId: true, name: true, logoUrl: true, address: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, imageUrl: true, price: true },
            },
          },
        },
        payment: true,
        delivery: true,
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Role-based authorization: customer who placed it, the vendor owner, assigned rider, or admin
    const isOwner = order.customerId === userId;
    const isVendorOwner = order.vendor.userId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isOwner && !isVendorOwner && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Access denied to this order' });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};
