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

    // Check if vendor exists
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
