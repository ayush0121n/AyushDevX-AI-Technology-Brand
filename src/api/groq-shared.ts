/**
 * groq-shared.ts
 * Shared security utilities for all Groq server functions.
 * All utilities are server-side only.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Rate Limiter — sliding window, in-memory
// Protects the Groq API quota. Resets every minute per client identifier.
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_MAX_REQUESTS = 10; // per window per IP
const WINDOW_MS = 60_000; // 1 minute

interface RateEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateEntry>();

// Prune stale entries every 5 minutes to prevent memory leak
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore) {
      if (now > entry.resetAt + WINDOW_MS) {
        rateLimitStore.delete(key);
      }
    }
  },
  5 * 60_000,
);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

/**
 * Check and increment rate limit for a given identifier (IP + agent).
 * Returns whether the request is allowed and how many remain.
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = DEFAULT_MAX_REQUESTS,
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: maxRequests - 1, retryAfterMs: 0 };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: entry.resetAt - now,
    };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    retryAfterMs: 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Client ID Resolution
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolve a stable client identifier from a Request object.
 * Falls back to "anonymous" when behind certain proxies or in dev mode.
 * Call getRequest() from @tanstack/react-start/server before calling this.
 */
export function getClientId(request: Request | null | undefined, suffix: string): string {
  if (!request) return `anon-${suffix}`;

  // Standard reverse-proxy header
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const ip = forwarded.split(",")[0].trim();
    if (ip) return `${ip}-${suffix}`;
  }

  // Nginx / HAProxy
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return `${realIp.trim()}-${suffix}`;

  // Cloudflare
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return `${cfIp.trim()}-${suffix}`;

  return `anon-${suffix}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Key Validation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates that the Groq API key exists and matches expected format.
 * Also handles the common .env.local bug where the key name has a leading
 * space (e.g. " GROQ_API_KEY=...") which makes process.env.GROQ_API_KEY
 * return undefined in some dotenv parsers.
 */
export function resolveGroqApiKey(): string | null {
  const key = process.env.GROQ_API_KEY?.trim();
  if (key && isValidGroqKey(key)) return key;

  // Fallback: leading-space variant (common .env.local typo)
  const keyWithSpace = process.env[" GROQ_API_KEY"]?.trim();
  if (keyWithSpace && isValidGroqKey(keyWithSpace)) return keyWithSpace;

  return null;
}

function isValidGroqKey(key: string): boolean {
  return key.startsWith("gsk_") && key.length >= 40 && key.length <= 120;
}

// ─────────────────────────────────────────────────────────────────────────────
// Input Sanitization
// ─────────────────────────────────────────────────────────────────────────────

// Strip null bytes and non-printable control chars (keep \n=10, \r=13, \t=9)
const CONTROL_CHAR_RE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

/**
 * Sanitize a raw user text input before injecting into LLM prompts.
 */
export function sanitizeInput(text: string): string {
  return text
    .replace(CONTROL_CHAR_RE, "")
    .replace(/\n{3,}/g, "\n\n") // collapse excessive newlines
    .trim();
}

/**
 * Sanitize conversation history from the client.
 *
 * Security rationale: history is sent from the browser — an attacker could
 * craft fake "assistant" turns or inject system-level instructions into
 * prior messages to manipulate the LLM context. We validate shape, role
 * values, and cap each message length.
 */
export function sanitizeHistory(
  history: { role: "user" | "assistant"; content: string }[],
): { role: "user" | "assistant"; content: string }[] {
  return history
    .filter(
      (h) =>
        h !== null &&
        h !== undefined &&
        typeof h.role === "string" &&
        (h.role === "user" || h.role === "assistant") &&
        typeof h.content === "string" &&
        h.content.length > 0,
    )
    .map((h) => ({
      role: h.role,
      content: sanitizeInput(h.content).slice(0, 600), // cap each message at 600 chars
    }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Unified Groq Fetch Wrapper
// ─────────────────────────────────────────────────────────────────────────────

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GroqCallOptions {
  model: string;
  messages: GroqMessage[];
  maxTokens: number;
  temperature: number;
  timeoutMs?: number;
  jsonMode?: boolean;
}

export type GroqErrorCode =
  | "rate_limited"
  | "auth_error"
  | "api_error"
  | "timeout"
  | "parse_error";

export interface GroqCallResult {
  text: string;
  error?: GroqErrorCode;
}

/**
 * Single shared Groq API call with unified error classification.
 * Never throws — always returns a typed result.
 */
export async function callGroq(
  apiKey: string,
  opts: GroqCallOptions,
): Promise<GroqCallResult> {
  const body: Record<string, unknown> = {
    model: opts.model,
    messages: opts.messages,
    max_tokens: opts.maxTokens,
    temperature: opts.temperature,
    stream: false,
  };

  if (opts.jsonMode) {
    body.response_format = { type: "json_object" };
  }

  let response: Response;
  try {
    response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(opts.timeoutMs ?? 18_000),
    });
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      return { text: "", error: "timeout" };
    }
    return { text: "", error: "api_error" };
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      console.error(`[Groq] Auth error: ${response.status}`);
      return { text: "", error: "auth_error" };
    }
    if (response.status === 429) {
      return { text: "", error: "rate_limited" };
    }
    console.error(`[Groq] HTTP error: ${response.status}`);
    return { text: "", error: "api_error" };
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    return { text: "", error: "parse_error" };
  }

  const text =
    (
      json as {
        choices?: { message?: { content?: string } }[];
      }
    )?.choices?.[0]?.message?.content?.trim() ?? "";

  return { text };
}
