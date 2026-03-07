import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { hasServerSupabaseEnv } from "@/lib/supabase/env";
import { requireUser } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!hasServerSupabaseEnv()) {
    redirect("/");
  }

  const { user } = await requireUser();

  return <AppShell userEmail={user.email}>{children}</AppShell>;
}
