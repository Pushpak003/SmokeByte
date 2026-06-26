import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL;
const isTls = redisUrl?.startsWith("rediss://");

export const redisConnection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  enableOfflineQueue: true,
  // Force IPv4 — prevents ECONNREFUSED ::1:6379 on Windows/some Linux setups
  family: 4,
  ...(isTls ? { tls: { rejectUnauthorized: false } } : {}),
});

redisConnection.on("error", (err) => {
  console.error("Redis connection error:", err.message);
});

redisConnection.on("connect", () => {
  console.log("✅ Redis connected");
});