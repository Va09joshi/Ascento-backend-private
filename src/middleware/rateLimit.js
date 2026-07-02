import { redisConnection } from '../config/redis.js';

export const rateLimit = (limit = 100, windowSeconds = 60) => async (req, res, next) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const key = `ratelimit:${req.path}:${ip}`;
    
    const current = await redisConnection.incr(key);
    
    if (current === 1) {
      await redisConnection.expire(key, windowSeconds);
    }
    
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - current));
    
    if (current > limit) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: 'Rate limit exceeded. Please try again later.',
        },
      });
    }
    
    next();
  } catch (error) {
    // If Redis fails, allow the request to pass through
    next();
  }
};
