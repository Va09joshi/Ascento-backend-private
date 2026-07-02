import http from 'http';
import app from './app.js';
import logger from './utils/logger.js';
import { redisConnection } from './config/redis.js';

import { supabaseAdmin } from './config/supabase.js';
import razorpayInstance from './config/razorpay.js';
import groqInstance from './config/groq.js';

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(PORT, () => {
  logger.info(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  
  if (supabaseAdmin) logger.info('✅ Supabase connected');
  if (razorpayInstance) logger.info('✅ Razorpay connected');
  if (groqInstance) logger.info('✅ Groq AI connected');
  
  logger.info('🚀 All services connected successfully');
});

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down server gracefully...');
  server.close(async () => {
    logger.info('HTTP server closed.');
    if (redisConnection) {
      await redisConnection.quit();
      logger.info('Redis connection closed.');
    }
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
