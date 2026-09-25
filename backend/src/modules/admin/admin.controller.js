const prisma = require('../../lib/prisma');

/**
 * GET /api/v1/admin/overview
 * Platform-wide telemetry & escrow health
 */
exports.getOverview = async (req, res, next) => {
  try {
    // 1. User stats
    const [totalUsers, usersByRole] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({
        by: ['role'],
        _count: { id: true },
      }),
    ]);

    const roleBreakdown = {
      CUSTOMER: 0,
      VENDOR: 0,
      RIDER: 0,
      ADMIN: 0,
    };
    usersByRole.forEach((g) => {
      roleBreakdown[g.role] = g._count.id;
    });

    // 2. Orders & Financials
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        status: true,
        totalAmount: true,
        createdAt: true,
      },
    });

    const totalOrders = orders.length;
    const totalGrossRevenue = orders
      .filter((o) => o.status !== 'CANCELLED' && o.status !== 'PENDING')
      .reduce((sum, o) => sum + Number(o.totalAmount), 0);

    const ordersByStatus = {};
    orders.forEach((o) => {
      ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
    });

    // 3. Escrow Held Breakdown
    const escrowPayments = await prisma.payment.findMany({
      where: {
        isEscrowHeld: true,
        status: 'SUCCESS',
      },
      select: { amount: true },
    });

    const totalEscrowHeld = escrowPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );

    // 4. Vendors & Deliveries
    const [activeVendorsCount, activeDeliveriesCount] = await Promise.all([
      prisma.vendor.count({ where: { isActive: true } }),
      prisma.delivery.count({ where: { status: { in: ['ASSIGNED', 'PICKED_UP'] } } }),
    ]);

    res.status(200).json({
      success: true,
      metrics: {
        totalUsers,
        roleBreakdown,
        totalOrders,
        ordersByStatus,
        totalGrossRevenue: Math.round(totalGrossRevenue * 100) / 100,
        totalEscrowHeld: Math.round(totalEscrowHeld * 100) / 100,
        activeVendorsCount,
        activeDeliveriesCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/users
 * List platform users with order and store activity
 */
exports.getUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            customerOrders: true,
            assignedDeliveries: true,
          },
        },
        vendor: {
          select: { id: true, name: true, category: true },
        },
      },
    });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/users/:id/toggle-status
 * Suspend or reactivate user account
 */
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });

    // Audit log
    await prisma.adminAuditLog.create({
      data: {
        adminId,
        action: updated.isActive ? 'USER_ACTIVATED' : 'USER_SUSPENDED',
        targetResource: 'USER',
        targetId: id,
        reason: `Admin toggled user active status to ${updated.isActive}`,
      },
    });

    res.status(200).json({
      success: true,
      message: `User ${updated.name} status updated to ${updated.isActive ? 'ACTIVE' : 'SUSPENDED'}`,
      user: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/audit-logs
 * Security & compliance audit trail
 */
exports.getAuditLogs = async (req, res, next) => {
  try {
    const [authLogs, adminLogs] = await Promise.all([
      prisma.authAuditLog.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true, name: true, role: true } } },
      }),
      prisma.adminAuditLog.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: { admin: { select: { email: true, name: true } } },
      }),
    ]);

    res.status(200).json({
      success: true,
      authLogs,
      adminLogs,
    });
  } catch (error) {
    next(error);
  }
};
