import { redirect } from "next/navigation";

import { BetaBanner } from "@/components/layout/beta-banner";
import { SiteFooter } from "@/components/layout/site-footer";
import { LoginPanel } from "@/components/auth/login-panel";
import { getOptionalUser } from "@/lib/supabase/auth";
import { hasServerSupabaseEnv } from "@/lib/supabase/env";

export default async function HomePage() {
  if (hasServerSupabaseEnv()) {
    const { user } = await getOptionalUser();

    if (user) {
      redirect("/dashboard");
    }
  }

  return (
    <div className="bg-grid min-h-screen">
      <main className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-12 sm:px-8">
        <div className="mb-6">
          <BetaBanner />
        </div>
        <LoginPanel />
      </main>
      <SiteFooter />
    </div>
  );
}
