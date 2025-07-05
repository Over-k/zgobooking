import { Redis } from "ioredis";

let redis: Redis;

try {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  const url = new URL(redisUrl);

  redis = new Redis({
    host: url.hostname,
    port: parseInt(url.port || "6379"),
    username: url.username || undefined,
    password: url.password || undefined,
    retryStrategy: (times) => Math.min(times * 50, 2000),
    connectTimeout: 5000,
  });

  redis.on("connect", () => {
    console.log("✅ Connected to Redis (singleton)");
  });

  redis.on("error", (err) => {
    console.error("❌ Redis connection error (singleton):", err);
  });
} catch (err) {
  console.error("❌ Failed to initialize Redis:", err);
  // You can fallback to a mock or throw if needed
  redis = new Redis(); // fallback to localhost
}

export { redis };
