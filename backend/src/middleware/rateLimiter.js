const { redis } = require('../lib/redis');

/**
 * Redis-backed sliding window rate limiter middleware.
 * Falls back to a no-op if Redis is unavailable (graceful degradation).
 *
 * @param {Object} options
 * @param {number} options.windowMs   - Time window in milliseconds (default: 60000 = 1 min)
 * @param {number} options.max        - Max requests per window (default: 30)
 * @param {string} options.keyPrefix  - Redis key prefix (default: 'rl')
 * @param {string} [options.message]  - Custom error message
 */
const rateLimiter = ({
  windowMs = 60 * 1000,
  max = 30,
  keyPrefix = 'rl',
  message = 'Too many requests. Please try again later.',
} = {}) => {
  return async (req, res, next) => {
    // If Redis is not available, skip rate limiting
    if (!redis) {
      return next();
    }

    try {
      const identifier = req.user?.id || req.ip || req.headers['x-forwarded-for'] || 'anonymous';
      const key = `${keyPrefix}:${identifier}`;
      const windowSec = Math.ceil(windowMs / 1000);

      const current = await redis.incr(key);

      if (current === 1) {
        // First request in this window — set expiry
        await redis.expire(key, windowSec);
      }

      // Set rate limit headers
      const ttl = await redis.ttl(key);
      res.set({
        'X-RateLimit-Limit': String(max),
        'X-RateLimit-Remaining': String(Math.max(0, max - current)),
        'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + ttl),
      });

      if (current > max) {
        return res.status(429).json({
          error: message,
          retryAfter: ttl,
        });
      }

      next();
    } catch (err) {
      // On Redis error, fail open (allow the request through)
      console.error('Rate limiter error:', err.message);
      next();
    }
  };
};

/**
 * Pre-configured rate limiters for common routes
 */
const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  keyPrefix: 'rl:auth',
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
});

const paymentLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  keyPrefix: 'rl:pay',
  message: 'Too many payment requests. Please wait a moment.',
});

const aiLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  keyPrefix: 'rl:ai',
  message: 'AI support rate limit reached. Please try again in a minute.',
});

const generalLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  keyPrefix: 'rl:gen',
});

module.exports = {
  rateLimiter,
  authLimiter,
  paymentLimiter,
  aiLimiter,
  generalLimiter,
};
