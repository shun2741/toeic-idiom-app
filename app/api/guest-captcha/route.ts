import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  createGuestCaptchaChallenge,
  createGuestVerifiedToken,
  GUEST_VERIFIED_COOKIE,
  verifyGuestCaptchaAnswer,
} from "@/lib/security/guest-captcha";
import { getClientIp, hashIdentifier } from "@/lib/security/ip";
import { consumeRateLimit } from "@/lib/security/rate-limit";

const challengeVerifySchema = z.object({
  token: z.string().min(1).max(1000),
  answer: z.string().trim().min(1).max(10),
  website: z.string().max(0).optional(),
});

const CAPTCHA_ISSUE_LIMIT = 20;
const CAPTCHA_VERIFY_LIMIT = 8;
const CAPTCHA_WINDOW_MS = 10 * 60 * 1000;
const CAPTCHA_BLOCK_MS = 30 * 60 * 1000;

export async function GET(request: NextRequest) {
  const ipHash = hashIdentifier(getClientIp(request));
  const rateLimit = consumeRateLimit({
    key: `guest-captcha-issue:${ipHash}`,
    limit: CAPTCHA_ISSUE_LIMIT,
    windowMs: CAPTCHA_WINDOW_MS,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "短時間に確認要求が集中しています。少し時間を空けてください。" },
      { status: 429 },
    );
  }

  return NextResponse.json(createGuestCaptchaChallenge());
}

export async function POST(request: NextRequest) {
  const parsed = challengeVerifySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力形式が不正です。" },
      { status: 400 },
    );
  }

  const ipHash = hashIdentifier(getClientIp(request));
  const rateLimit = consumeRateLimit({
    key: `guest-captcha-verify:${ipHash}`,
    limit: CAPTCHA_VERIFY_LIMIT,
    windowMs: CAPTCHA_WINDOW_MS,
    blockMs: CAPTCHA_BLOCK_MS,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "確認に失敗した回数が多いため、一時的に体験モードを停止しています。" },
      { status: 429 },
    );
  }

  const payload = parsed.data;
  if (payload.website) {
    return NextResponse.json(
      { error: "確認に失敗しました。" },
      { status: 400 },
    );
  }

  if (
    !verifyGuestCaptchaAnswer({
      token: payload.token,
      answer: payload.answer,
    })
  ) {
    return NextResponse.json(
      { error: "確認の答えが一致しませんでした。もう一度お試しください。" },
      { status: 400 },
    );
  }

  const verification = createGuestVerifiedToken();
  const response = NextResponse.json({ ok: true });

  response.cookies.set(GUEST_VERIFIED_COOKIE, verification.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: verification.maxAge,
  });

  return response;
}
