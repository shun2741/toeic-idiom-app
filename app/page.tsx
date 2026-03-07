import { redirect } from "next/navigation";

import { LoginPanel } from "@/components/auth/login-panel";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasServerSupabaseEnv } from "@/lib/supabase/env";

export default async function HomePage() {
  if (hasServerSupabaseEnv()) {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      redirect("/dashboard");
    }
  }

  return (
    <main className="bg-grid min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-12 sm:px-8">
        <LoginPanel />
      </div>
    </main>
  );
}
