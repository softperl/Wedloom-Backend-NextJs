import { Request, Response, NextFunction } from "express";
import { redis } from "../lib/redis";

const rateLimitMiddleware = (limit: number, duration: number) => {
  return (req: any, res: Response, next: NextFunction) => {
    const { ip, originalUrl } = req; // Get client IP address and requested URL
    const key = `${originalUrl}::${ip}::${Math.floor(
      Date.now() / 1000 / duration
    )}`;

    redis.exists(key, (err, exists) => {
      if (err) {
        console.error("Redis error:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      if (exists) {
        redis.incr(key, (err, count) => {
          if (err) {
            console.error("Redis error:", err);
            return res.status(500).json({ error: "Internal server error" });
          }
          if (count! > limit) {
            return res.status(429).json({ error: "Rate limit exceeded" });
          }
          next();
        });
      } else {
        redis.setex(key, duration, 1, (err) => {
          if (err) {
            console.error("Redis error:", err);
            return res.status(500).json({ error: "Internal server error" });
          }
          next();
        });
      }
    });
  };
};

export default rateLimitMiddleware;
