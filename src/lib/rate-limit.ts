/**
 * Simple in-memory rate limiter for critical endpoints
 * Prevents brute force attacks on password/email/auth endpoints
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check if a request should be rate limited
 * @param key - Unique identifier (IP, email, user ID, etc)
 * @param maxRequests - Maximum requests allowed in the time window
 * @param windowSeconds - Time window in seconds (default: 60)
 * @returns true if request should be ALLOWED, false if RATE LIMITED
 */
export function checkRateLimit(
    key: string,
    maxRequests: number = 5,
    windowSeconds: number = 60
): boolean {
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    // Clean up expired entries
    if (entry && now > entry.resetTime) {
        rateLimitStore.delete(key);
    }

    const current = rateLimitStore.get(key) || {
        count: 0,
        resetTime: now + windowSeconds * 1000,
    };

    if (current.count >= maxRequests) {
        return false; // RATE LIMIT EXCEEDED
    }

    current.count++;
    rateLimitStore.set(key, current);
    return true; // REQUEST ALLOWED
}

/**
 * Reset rate limit for a specific key
 */
export function resetRateLimit(key: string): void {
    rateLimitStore.delete(key);
}

/**
 * Clear all rate limit entries (useful for testing)
 */
export function clearRateLimitStore(): void {
    rateLimitStore.clear();
}

/**
 * Get client IP from request headers
 */
export function getClientIp(headers: Headers): string {
    const forwarded = headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : headers.get("x-real-ip") || "unknown";
    return ip;
}
