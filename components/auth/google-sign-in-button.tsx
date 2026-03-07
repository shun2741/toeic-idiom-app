"use client";

import { Chrome, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createBrowserSupabaseClient, hasSupabaseEnv } from "@/lib/supabase/client";

export function GoogleSignInButton() {
  const [pending, setPending] = useState(false);
  const enabled = hasSupabaseEnv();

  async function handleSignIn() {
    if (!enabled || pending) {
      return;
    }

    setPending(true);

    const supabase = createBrowserSupabaseClient();
    const redirectTo =
      typeof window === "undefined"
        ? undefined
        : `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      setPending(false);
      window.alert(error.message);
    }
  }

  return (
    <Button className="w-full gap-2" onClick={handleSignIn} size="lg">
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Chrome className="h-4 w-4" />}
      {enabled ? "Googleでログイン" : "Supabase設定後にGoogleログイン"}
    </Button>
  );
}
