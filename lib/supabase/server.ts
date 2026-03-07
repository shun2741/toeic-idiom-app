import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { hasServerSupabaseEnv } from "@/lib/supabase/env";

export async function createServerSupabaseClient() {
  if (!hasServerSupabaseEnv()) {
    throw new Error("Supabase environment variables are missing.");
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );
}
