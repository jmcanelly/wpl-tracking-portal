"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        setStatus("error");
        setMessage(error.message || "Invalid email or password.");
        return;
      }

      // Success - redirect to shipments
      window.location.href = "/shipments";
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-[var(--wpl-border)] bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold">Sign in</h1>
      <p className="mt-1 text-sm text-[var(--wpl-gray)]">
        Enter your email and password to access the tracking portal.
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
            disabled={status === "loading"}
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold">Password</label>
            <Link 
              href="/forgot-password" 
              className="text-xs font-semibold text-[var(--wpl-blue)] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            className="mt-1 w-full rounded-lg border border-[var(--wpl-border)] px-3 py-2 text-sm"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={status === "loading"}
          />
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-lg bg-[var(--wpl-blue)] px-3 py-2 text-sm font-semibold text-white
                     disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-95"
        >
          {status === "loading" ? "Signing in…" : "Sign in"}
        </button>

        {message && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {message}
          </div>
        )}
      </form>

      <div className="mt-4 text-center text-sm">
        <span className="text-[var(--wpl-gray)]">Don't have an account? </span>
        <Link href="/signup" className="font-semibold text-[var(--wpl-blue)] hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  );
}
