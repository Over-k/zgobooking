// test-redis.js
import { Redis } from "ioredis";

// Option 1: use REDIS_URL
const useRedisUrl = !!process.env.REDIS_URL;

// Create Redis instance
const redis = useRedisUrl
  ? new Redis(process.env.REDIS_URL)
  : new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
    });

// Set up event listeners
redis.on("connect", () => {
  console.log("✅ Redis connected successfully.");
});

redis.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

// Test the connection
async function testConnection() {
  try {
    const pong = await redis.ping();
    console.log(`📡 Redis PING response: ${pong}`); // should be "PONG"
  } catch (error) {
    console.error("❌ Redis ping failed:", error);
  } finally {
    await redis.quit();
  }
}

testConnection();
