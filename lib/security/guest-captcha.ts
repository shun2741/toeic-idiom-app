import { createHmac, randomUUID } from "node:crypto";

export const GUEST_VERIFIED_COOKIE = "tic_guest_verified";

const CAPTCHA_TTL_MS = 10 * 60 * 1000;
const VERIFIED_TTL_SECONDS = 12 * 60 * 60;

type CaptchaPayload = {
  left: number;
  right: number;
  operator: "+" | "-";
  nonce: string;
  exp: number;
};

type VerifiedPayload = {
  nonce: string;
  exp: number;
};

function getGuardSecret() {
  return (
    process.env.APP_GUARD_SECRET ||
    process.env.OPENAI_API_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "local-dev-guard"
  );
}

function encodePayload(payload: CaptchaPayload | VerifiedPayload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function signPayload(encodedPayload: string) {
  return createHmac("sha256", getGuardSecret())
    .update(encodedPayload)
    .digest("base64url");
}

function buildSignedToken(payload: CaptchaPayload | VerifiedPayload) {
  const encodedPayload = encodePayload(payload);
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

function parseSignedToken<T extends CaptchaPayload | VerifiedPayload>(token: string): T | null {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload);
  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as T;
    if (typeof parsed.exp !== "number" || parsed.exp < Date.now()) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function createGuestCaptchaChallenge() {
  const left = Math.floor(Math.random() * 8) + 1;
  const right = Math.floor(Math.random() * 8) + 1;
  const operator = Math.random() > 0.35 ? "+" : "-";
  const adjustedLeft = operator === "-" ? Math.max(left, right) : left;
  const adjustedRight = operator === "-" ? Math.min(left, right) : right;

  const payload: CaptchaPayload = {
    left: adjustedLeft,
    right: adjustedRight,
    operator,
    nonce: randomUUID(),
    exp: Date.now() + CAPTCHA_TTL_MS,
  };

  return {
    prompt:
      payload.operator === "+"
        ? `${payload.left} + ${payload.right} = ?`
        : `${payload.left} - ${payload.right} = ?`,
    token: buildSignedToken(payload),
  };
}

export function verifyGuestCaptchaAnswer({
  token,
  answer,
}: {
  token: string;
  answer: string;
}) {
  const payload = parseSignedToken<CaptchaPayload>(token);
  if (!payload) {
    return false;
  }

  const expected =
    payload.operator === "+"
      ? payload.left + payload.right
      : payload.left - payload.right;

  return Number(answer.trim()) === expected;
}

export function createGuestVerifiedToken() {
  const payload: VerifiedPayload = {
    nonce: randomUUID(),
    exp: Date.now() + VERIFIED_TTL_SECONDS * 1000,
  };

  return {
    token: buildSignedToken(payload),
    maxAge: VERIFIED_TTL_SECONDS,
  };
}

export function isGuestVerifiedToken(token: string | undefined) {
  if (!token) {
    return false;
  }

  return Boolean(parseSignedToken<VerifiedPayload>(token));
}
