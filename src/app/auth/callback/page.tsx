"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  useEffect(() => {
    (async () => {
      // This ensures any auth state is established before redirecting
      await supabase.auth.getSession();
      window.location.replace("/shipments");
    })();
  }, []);

  return (
    <div className="rounded-2xl border border-[var(--wpl-border)] bg-white p-6 shadow-sm">
      Signing you in…
    </div>
  );
}
