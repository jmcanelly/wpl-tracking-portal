"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const [lastSentAt, setLastSentAt] = useState<number>(0);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const now = Date.now();
    if (now - lastSentAt < 30_000) {
      setStatus("error");
      setMessage("Please wait 30 seconds before requesting another link.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/request-magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setMessage(json?.error || "Unable to send link.");
        return;
      }

      setLastSentAt(now);
      setStatus("sent");
      setMessage("Check your email for a secure sign-in link.");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-[var(--wpl-border)] bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold">Sign in</h1>
      <p className="mt-1 text-sm text-[var(--wpl-gray)]">
        Approved users will receive a secure sign-in link.
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

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-lg bg-[var(--wpl-blue)] px-3 py-2 text-sm font-semibold text-white
                     disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === "loading" ? "Sending…" : "Send magic link"}
        </button>

        {message && (
          <div
            className={[
              "rounded-lg border px-3 py-2 text-sm",
              status === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-[var(--wpl-border)] bg-[var(--wpl-bg)] text-[var(--wpl-gray)]",
            ].join(" ")}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
