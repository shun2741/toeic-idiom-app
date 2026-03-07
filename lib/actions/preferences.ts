"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import {
  LEVEL_FILTER_COOKIE,
  LEVEL_BANDS,
  normalizeLevelBands,
  serializeLevelBands,
} from "@/lib/preferences/level-filter";

export async function saveLevelBandsAction(formData: FormData) {
  const cookieStore = await cookies();
  const selected = normalizeLevelBands(
    formData.getAll("levelBand").map((value) => String(value)),
  );

  cookieStore.set(LEVEL_FILTER_COOKIE, serializeLevelBands(selected), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });

  revalidatePath("/dashboard");
  revalidatePath("/learn");
  revalidatePath("/");
}

export async function resetLevelBandsAction() {
  const cookieStore = await cookies();

  cookieStore.set(LEVEL_FILTER_COOKIE, serializeLevelBands(LEVEL_BANDS), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });

  revalidatePath("/dashboard");
  revalidatePath("/learn");
  revalidatePath("/");
}
