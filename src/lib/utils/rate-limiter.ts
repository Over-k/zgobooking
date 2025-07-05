import { redis } from "@/lib/redis";

export class RateLimiter {
  constructor(private options: { points: number; duration: number }) { }

  async check(ip: string): Promise<void> {
    const key = `rate-limit:${ip}`;
    const current = await redis.get(key);

    if (current) {
      const count = parseInt(current, 10);
      if (count >= this.options.points) {
        throw new Error(
          `Rate limit exceeded. Please wait ${this.options.duration} seconds.`
        );
      }
    }

    await redis
      .multi()
      .incr(key)
      .expire(key, this.options.duration)
      .exec();
  }

  async reset(ip: string): Promise<void> {
    await redis.del(`rate-limit:${ip}`);
  }
}
