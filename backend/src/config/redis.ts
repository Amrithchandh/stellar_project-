import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = createClient({
  url: REDIS_URL
});

export const connectRedis = async (): Promise<void> => {
  try {
    redisClient.on('error', (err) => console.error('[Redis]: Client Error:', err));
    await redisClient.connect();
    console.log('[Redis]: Connection successfully established.');
  } catch (error) {
    console.error('[Redis]: Connection failure:', error);
    process.exit(1);
  }
};
