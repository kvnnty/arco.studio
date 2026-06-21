import { Injectable } from '@nestjs/common';

type RateLimitRule = {
  max: number;
  windowMs: number;
};

type BucketEntry = {
  count: number;
  resetAt: number;
};

/**
 * In-process sliding-window rate limiter.
 * Replace backing store with Redis for multi-instance horizontal scaling.
 */
@Injectable()
export class RateLimitService {
  private readonly buckets = new Map<string, BucketEntry>();

  consume(key: string, rule: RateLimitRule): boolean {
    const now = Date.now();
    const existing = this.buckets.get(key);

    if (!existing || existing.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + rule.windowMs });
      return true;
    }

    if (existing.count >= rule.max) {
      return false;
    }

    existing.count += 1;
    return true;
  }

  reset(key: string): void {
    this.buckets.delete(key);
  }
}
