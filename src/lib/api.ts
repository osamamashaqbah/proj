import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(message: string, status = 400, extra?: any) {
  return NextResponse.json({ ok: false, error: message, ...extra }, { status });
}

export function handleError(err: unknown) {
  if (err instanceof ZodError) {
    return fail("Validation failed", 400, { issues: err.flatten() });
  }
  const status = (err as any)?.status ?? 500;
  const message = (err as Error)?.message ?? "Internal error";
  if (status >= 500) console.error(err);
  return fail(message, status);
}

// Naive in-memory rate limiter (per-process). Good enough for MVP local/dev.
// For production: replace with @upstash/ratelimit + Redis.
const buckets = new Map<string, { count: number; resetAt: number }>();
export function rateLimit(key: string, limit = 30, windowMs = 60_000) {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || entry.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  if (entry.count >= limit) {
    return { ok: false, remaining: 0, retryAfter: entry.resetAt - now };
  }
  entry.count++;
  return { ok: true, remaining: limit - entry.count };
}

export function sanitizeText(s: string, maxLen = 5000) {
  return s.replace(/\u0000/g, "").slice(0, maxLen).trim();
}
