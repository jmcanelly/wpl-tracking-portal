"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: redirectUrl,
        }
      );

      if (error) {
        setStatus("error");
        setMessage(error.message || "Unable to send reset email.");
        return;
      }

      setStatus("sent");
      setMessage("Check your email for a password reset link.");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-[var(--wpl-border)] bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold">Reset Password</h1>
      <p className="mt-1 text-sm text-[var(--wpl-gray)]">
        Enter your email and we'll send you a link to reset your password.
      </p>

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <div>
          <label className="text-sm font-semibold">Email</label>
          <input
            className="mt-1 w-full rounded-lg border border-[var(--wpl-border)] px-3 py-2 text-sm"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={status === "loading" || status === "sent"}
          />
        </div>

        <button
          type="submit"
          disabled={status === "loading" || status === "sent"}
          className="w-full rounded-lg bg-[var(--wpl-blue)] px-3 py-2 text-sm font-semibold text-white
                     disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-95"
        >
          {status === "loading" ? "Sending…" : "Send Reset Link"}
        </button>

        {message && (
          <div
            className={[
              "rounded-lg border px-3 py-2 text-sm",
              status === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-700",
            ].join(" ")}
          >
            {message}
          </div>
        )}
      </form>

      <div className="mt-4 text-center text-sm">
        <Link href="/login" className="font-semibold text-[var(--wpl-blue)] hover:underline">
          ← Back to sign in
        </Link>
      </div>
    </div>
  );
}
