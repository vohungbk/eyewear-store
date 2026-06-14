"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "footer" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("success");
        setMessage("You're subscribed! Check your inbox.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <p className="text-sm text-green-400">{message}</p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          required
          disabled={status === "loading"}
          className="flex-1 min-w-0 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 text-sm rounded-md px-3 py-2 focus:outline-none focus:border-neutral-400 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="shrink-0 bg-white text-black text-sm font-semibold px-4 py-2 rounded-md hover:bg-neutral-100 transition-colors disabled:opacity-60"
        >
          {status === "loading" ? "..." : "Subscribe"}
        </button>
      </div>
      {status === "error" && (
        <p className="mt-2 text-xs text-red-400">{message}</p>
      )}
    </form>
  );
}
