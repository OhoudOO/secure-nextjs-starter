// Fixed-window rate limiting behind an interface, so the in-memory version used here
// can be swapped for Redis or Upstash when the app runs on more than one instance.
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export interface RateLimiter {
  consume(key: string): Promise<RateLimitResult>;
}

export class MemoryRateLimiter implements RateLimiter {
  private readonly windows = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  async consume(key: string): Promise<RateLimitResult> {
    const time = this.now();
    const current = this.windows.get(key);
    const window = current && current.resetAt > time ? current : { count: 0, resetAt: time + this.windowMs };
    window.count += 1;
    this.windows.set(key, window);
    return { allowed: window.count <= this.limit, remaining: Math.max(0, this.limit - window.count), resetAt: window.resetAt };
  }
}

// The client IP as seen by the platform's proxy. Only trust x-forwarded-for behind a proxy you control.
export function clientKey(headers: Headers): string {
  return headers.get("x-real-ip") ?? headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
