type RateLimitState = {
  hits: number[];
  blockedUntil: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __toeicRateLimitStore: Map<string, RateLimitState> | undefined;
}

function getStore() {
  globalThis.__toeicRateLimitStore ||= new Map<string, RateLimitState>();
  return globalThis.__toeicRateLimitStore;
}

function getState(key: string) {
  const store = getStore();
  const current = store.get(key) ?? { hits: [], blockedUntil: 0 };
  store.set(key, current);
  return current;
}

function pruneHits(state: RateLimitState, now: number, windowMs: number) {
  const threshold = now - windowMs;
  state.hits = state.hits.filter((hit) => hit >= threshold);
}

export function peekRateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}): RateLimitResult {
  const now = Date.now();
  const state = getState(key);

  pruneHits(state, now, windowMs);

  if (state.blockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: state.blockedUntil - now,
    };
  }

  return {
    allowed: state.hits.length < limit,
    remaining: Math.max(0, limit - state.hits.length),
    retryAfterMs: 0,
  };
}

export function consumeRateLimit({
  key,
  limit,
  windowMs,
  blockMs = windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
  blockMs?: number;
}): RateLimitResult {
  const now = Date.now();
  const state = getState(key);

  pruneHits(state, now, windowMs);

  if (state.blockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: state.blockedUntil - now,
    };
  }

  if (state.hits.length >= limit) {
    state.blockedUntil = now + blockMs;
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: blockMs,
    };
  }

  state.hits.push(now);
  return {
    allowed: true,
    remaining: Math.max(0, limit - state.hits.length),
    retryAfterMs: 0,
  };
}
