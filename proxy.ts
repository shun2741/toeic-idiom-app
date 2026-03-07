import { type NextRequest } from "next/server";

import { hasServerSupabaseEnv } from "@/lib/supabase/env";
import { updateSession } from "@/lib/supabase/proxy";

export function proxy(request: NextRequest) {
  if (!hasServerSupabaseEnv()) {
    return;
  }

  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
