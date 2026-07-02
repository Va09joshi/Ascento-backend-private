// Redis removed as per user request
// Mocking the connection so other files don't break

export const redisConnection = {
  get: async () => null,
  setex: async () => null,
  del: async () => null,
  incr: async () => 1,
  expire: async () => null,
  quit: async () => null,
  on: () => null
};
