const Redis = require('ioredis');

let redis = null;

const REDIS_URL = process.env.REDIS_URL;

if (REDIS_URL) {
  redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 5) {
        console.error('❌ Redis: Max retry attempts reached. Giving up.');
        return null; // Stop retrying
      }
      const delay = Math.min(times * 200, 2000);
      return delay;
    },
    tls: REDIS_URL.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
  });

  redis.on('connect', () => {
    console.log('🟢 Redis: Connected successfully');
  });

  redis.on('error', (err) => {
    console.error('🔴 Redis: Connection error:', err.message);
  });

  redis.on('close', () => {
    console.warn('🟡 Redis: Connection closed');
  });
} else {
  console.warn('⚠️  Redis: REDIS_URL not configured. Caching and rate limiting disabled.');
}

/**
 * Get a cached value by key.
 * Returns null if Redis is unavailable or key doesn't exist.
 */
async function cacheGet(key) {
  if (!redis) return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Redis cacheGet error:', err.message);
    return null;
  }
}

/**
 * Set a cached value with TTL (seconds).
 */
async function cacheSet(key, value, ttlSeconds = 60) {
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (err) {
    console.error('Redis cacheSet error:', err.message);
  }
}

/**
 * Delete a cached key (cache invalidation).
 */
async function cacheDel(key) {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch (err) {
    console.error('Redis cacheDel error:', err.message);
  }
}

/**
 * Delete all keys matching a pattern (e.g., 'vendors:*').
 */
async function cacheInvalidatePattern(pattern) {
  if (!redis) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    console.error('Redis cacheInvalidatePattern error:', err.message);
  }
}

module.exports = {
  redis,
  cacheGet,
  cacheSet,
  cacheDel,
  cacheInvalidatePattern,
};
