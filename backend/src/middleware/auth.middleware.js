const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

/**
 * Authenticate JWT token from Authorization header
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smartdeliver_default_secret_32chars');

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub || decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'User account no longer exists.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'This account has been deactivated.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid authentication token.' });
  }
};

/**
 * Authorize specific roles
 * @param  {...string} roles - Allowed roles (e.g. 'ADMIN', 'VENDOR')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Access restricted to [${roles.join(', ')}] only.`,
      });
    }

    next();
  };
};

module.exports = { authenticate, authorize };
