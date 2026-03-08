type CircuitState = {
  hits: number[];
  openUntil: number;
};

type CircuitResult = {
  allowed: boolean;
  retryAfterMs: number;
};

const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 60;
const COOLDOWN_MS = 15 * 60 * 1000;

declare global {
  // eslint-disable-next-line no-var
  var __toeicLlmCircuitState: CircuitState | undefined;
}

function getState() {
  globalThis.__toeicLlmCircuitState ||= {
    hits: [],
    openUntil: 0,
  };

  return globalThis.__toeicLlmCircuitState;
}

function pruneHits(state: CircuitState, now: number) {
  const threshold = now - WINDOW_MS;
  state.hits = state.hits.filter((hit) => hit >= threshold);
}

export function acquireLlmCircuitSlot(): CircuitResult {
  const now = Date.now();
  const state = getState();

  pruneHits(state, now);

  if (state.openUntil > now) {
    return {
      allowed: false,
      retryAfterMs: state.openUntil - now,
    };
  }

  if (state.hits.length >= LIMIT) {
    state.openUntil = now + COOLDOWN_MS;
    return {
      allowed: false,
      retryAfterMs: COOLDOWN_MS,
    };
  }

  state.hits.push(now);
  return {
    allowed: true,
    retryAfterMs: 0,
  };
}
