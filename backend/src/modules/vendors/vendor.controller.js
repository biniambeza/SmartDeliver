const prisma = require('../../lib/prisma');

/**
 * GET /api/v1/vendors
 * Fetch active vendors with optional category and search filters
 */
exports.getVendors = async (req, res, next) => {
  try {
    const { category, search } = req.query;

    const where = {
      isActive: true,
    };

    if (category && category !== 'ALL') {
      where.category = {
        equals: category,
        mode: 'insensitive',
      };
    }

    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
        { category: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const vendors = await prisma.vendor.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { products: { where: { isAvailable: true } } },
        },
      },
    });

    // Format response to include productsCount
    const formattedVendors = vendors.map((v) => ({
      id: v.id,
      name: v.name,
      slug: v.slug,
      description: v.description,
      category: v.category,
      logoUrl: v.logoUrl,
      bannerUrl: v.bannerUrl,
      address: v.address,
      isActive: v.isActive,
      productsCount: v._count.products,
      createdAt: v.createdAt,
    }));

    res.status(200).json({
      success: true,
      count: formattedVendors.length,
      vendors: formattedVendors,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/vendors/:id
 * Fetch single vendor by ID
 */
exports.getVendorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: { where: { isAvailable: true } } },
        },
      },
    });

    if (!vendor || !vendor.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found or inactive',
      });
    }

    res.status(200).json({
      success: true,
      vendor: {
        ...vendor,
        productsCount: vendor._count.products,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/vendors/:id/products
 * Fetch products for a specific vendor
 */
exports.getVendorProducts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { category, search } = req.query;

    const vendor = await prisma.vendor.findUnique({
      where: { id },
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found',
      });
    }

    const where = {
      vendorId: id,
    };

    if (category) {
      where.category = { equals: category, mode: 'insensitive' };
    }

    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    res.status(200).json({
      success: true,
      vendorId: id,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/vendors/me/dashboard
 * Authenticated Merchant Portal: Fetch store stats, active orders queue, and products
 */
exports.getVendorDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Find vendor affiliated with this user or fallback to first active vendor for testing
    let vendor = await prisma.vendor.findUnique({
      where: { userId },
    });

    if (!vendor) {
      vendor = await prisma.vendor.findFirst({
        where: { isActive: true },
      });
    }

    if (!vendor) {
      return res.status(404).json({ success: false, error: 'No active vendor store found' });
    }

    // 1. Fetch Orders for this vendor
    const orders = await prisma.order.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: { id: true, name: true, phone: true, email: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, price: true, imageUrl: true },
            },
          },
        },
        payment: true,
        delivery: {
          include: {
            rider: { select: { id: true, name: true, phone: true } },
          },
        },
      },
    });

    // 2. Fetch Products
    const products = await prisma.product.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'asc' },
    });

    // 3. Compute Metrics
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter((o) => o.status !== 'CANCELLED' && o.status !== 'PENDING')
      .reduce((acc, o) => acc + Number(o.totalAmount), 0);
    const activeOrders = orders.filter((o) =>
      ['PAID', 'PREPARING', 'READY_FOR_PICKUP'].includes(o.status)
    ).length;
    const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED').length;

    res.status(200).json({
      success: true,
      vendor,
      stats: {
        totalOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        activeOrders,
        deliveredOrders,
        totalProducts: products.length,
        availableProducts: products.filter((p) => p.isAvailable).length,
      },
      orders,
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/vendors/orders/:id/status
 * Update order status from vendor side (e.g. PREPARING, READY_FOR_PICKUP)
 */
exports.updateVendorOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['PREPARING', 'READY_FOR_PICKUP', 'CANCELLED'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Allowed statuses: ${allowedStatuses.join(', ')}`,
      });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { vendor: true },
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        items: { include: { product: true } },
        payment: true,
        delivery: true,
      },
    });

    // Broadcast WebSocket updates to customer tracking room
    const io = req.app.get('io') || req.io;
    if (io) {
      io.to(`order:${id}`).to(`order_${id}`).emit('order:status_changed', {
        orderId: id,
        status,
        vendorId: order.vendorId,
      });
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/vendors/products/:id/toggle
 * Toggle product availability (in-stock / 86-ed out)
 */
exports.toggleProductAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        isAvailable: !product.isAvailable,
      },
    });

    // Real-time broadcast
    const io = req.app.get('io') || req.io;
    if (io) {
      io.to(`vendor_${product.vendorId}`).emit('vendor:product_updated', {
        productId: id,
        isAvailable: updated.isAvailable,
      });
    }

    res.status(200).json({
      success: true,
      message: `Product "${updated.name}" availability set to ${updated.isAvailable ? 'IN STOCK' : 'OUT OF STOCK'}`,
      product: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/vendors/products/:id
 * Update product pricing or details
 */
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { price, name, description } = req.body;

    const data = {};
    if (price !== undefined) data.price = parseFloat(price);
    if (name) data.name = name.trim();
    if (description !== undefined) data.description = description ? description.trim() : null;

    const updated = await prisma.product.update({
      where: { id },
      data,
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/vendors
 * Create a new vendor profile
 */
exports.createVendor = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, slug, description, category, address, logoUrl, bannerUrl } = req.body;

    if (!name || !slug || !category) {
      return res.status(400).json({ success: false, error: 'Name, slug, and category are required' });
    }

    // Check if user already has a vendor
    const existing = await prisma.vendor.findUnique({ where: { userId } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'User already has a vendor profile' });
    }

    // Check slug uniqueness
    const slugExists = await prisma.vendor.findUnique({ where: { slug } });
    if (slugExists) {
      return res.status(400).json({ success: false, error: 'Store URL (slug) is already taken' });
    }

    const vendor = await prisma.vendor.create({
      data: {
        userId,
        name,
        slug,
        description,
        category,
        address,
        logoUrl,
        bannerUrl,
      }
    });

    res.status(201).json({ success: true, vendor });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/vendors/products
 * Create a new product for a vendor
 */
exports.createProduct = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, description, price, category, imageUrl } = req.body;

    if (!name || !price) {
      return res.status(400).json({ success: false, error: 'Name and price are required' });
    }

    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) {
      return res.status(403).json({ success: false, error: 'You must create a vendor profile first' });
    }

    const product = await prisma.product.create({
      data: {
        vendorId: vendor.id,
        name,
        description,
        price: parseFloat(price),
        category,
        imageUrl,
      }
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};
