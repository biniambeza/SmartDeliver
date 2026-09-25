const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../lib/prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'smartdeliver_default_secret_32chars';
const TOKEN_EXPIRY = '7d';

/**
 * Helper to generate JWT Token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      sub: user.id,
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
};

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role = 'CUSTOMER', phone } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Validate role
    const validRoles = ['CUSTOMER', 'VENDOR', 'RIDER'];
    const assignedRole = validRoles.includes(role) ? role : 'CUSTOMER';

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and auto-create vendor storefront if role is VENDOR
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email: normalizedEmail,
          password: hashedPassword,
          role: assignedRole,
          phone: phone || null,
        },
      });

      if (assignedRole === 'VENDOR') {
        const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000);
        await tx.vendor.create({
          data: {
            userId: newUser.id,
            name: `${name}'s Store`,
            slug,
            category: 'Restaurant',
            description: 'Welcome to our store on SmartDeliver!',
          },
        });
      }

      // Record in Auth Audit Log
      await tx.authAuditLog.create({
        data: {
          userId: newUser.id,
          email: normalizedEmail,
          event: 'REGISTER',
          ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
          userAgent: req.headers['user-agent'] || null,
        },
      });

      return newUser;
    });

    const token = generateToken(user);

    return res.status(201).json({
      message: 'Account successfully registered.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

/**
 * Login user
 * POST /api/v1/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check account lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.lockedUntil - new Date()) / 60000);
      return res.status(403).json({
        error: `Account is temporarily locked due to repeated failed logins. Please try again in ${remainingMinutes} minute(s).`,
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const failedAttempts = user.failedLoginAttempts + 1;
      let lockedUntil = null;

      if (failedAttempts >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: failedAttempts,
          lockedUntil,
        },
      });

      await prisma.authAuditLog.create({
        data: {
          userId: user.id,
          email: normalizedEmail,
          event: lockedUntil ? 'ACCOUNT_LOCKED' : 'LOGIN_FAILED',
          ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
          userAgent: req.headers['user-agent'] || null,
        },
      });

      return res.status(401).json({
        error: lockedUntil
          ? 'Account locked for 15 minutes due to 5 consecutive failed login attempts.'
          : 'Invalid email or password.',
      });
    }

    // Reset failed login attempts on successful login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    // Audit log
    await prisma.authAuditLog.create({
      data: {
        userId: user.id,
        email: normalizedEmail,
        event: 'LOGIN_SUCCESS',
        ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
        userAgent: req.headers['user-agent'] || null,
      },
    });

    const token = generateToken(user);

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

/**
 * Get current authenticated user profile
 * GET /api/v1/auth/me
 */
const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
};

module.exports = {
  register,
  login,
  getMe,
};
