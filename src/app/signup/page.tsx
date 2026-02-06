"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    // Basic validation
    if (password.length < 8) {
      setStatus("error");
      setMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          password 
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(json.error || "Unable to create account.");
        return;
      }

      setStatus("success");
      setMessage("Account created! Redirecting to login...");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-[var(--wpl-border)] bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold">Create Account</h1>
      <p className="mt-1 text-sm text-[var(--wpl-gray)]">
        Only authorized email addresses can create an account.
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
            disabled={status === "loading" || status === "success"}
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Password</label>
          <input
            className="mt-1 w-full rounded-lg border border-[var(--wpl-border)] px-3 py-2 text-sm"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={status === "loading" || status === "success"}
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Confirm Password</label>
          <input
            className="mt-1 w-full rounded-lg border border-[var(--wpl-border)] px-3 py-2 text-sm"
            type="password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={status === "loading" || status === "success"}
          />
        </div>

        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className="w-full rounded-lg bg-[var(--wpl-blue)] px-3 py-2 text-sm font-semibold text-white
                     disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-95"
        >
          {status === "loading" ? "Creating account…" : "Create Account"}
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
        <span className="text-[var(--wpl-gray)]">Already have an account? </span>
        <Link href="/login" className="font-semibold text-[var(--wpl-blue)] hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
