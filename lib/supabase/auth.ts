import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getOptionalUser() {
  const supabase = await createServerSupabaseClient();

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Failed to fetch current user", error);
      return { user: null, supabase };
    }

    return { user, supabase };
  } catch (error) {
    console.error("Unexpected auth error", error);
    return { user: null, supabase };
  }
}

export async function requireUser() {
  const { user, supabase } = await getOptionalUser();

  if (!user) {
    redirect("/");
  }

  return { user, supabase };
}
