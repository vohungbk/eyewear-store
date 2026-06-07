"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { forgotPassword } from "@/lib/actions/auth";
import type { FormState } from "@/lib/validations/auth";

// Note: metadata can't be exported from a "use client" file —
// move to a server wrapper if SEO for this page is important.

export default function ForgotPasswordPage() {
  const [state, action, isPending] = useActionState<FormState, FormData>(
    forgotPassword,
    undefined
  );

  if (state?.success) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="text-4xl mb-4">✉️</div>
        <h2 className="text-xl font-bold mb-2">Email sent</h2>
        <p className="text-sm text-neutral-500">{state.message}</p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-medium underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-bold text-center mb-2">Reset password</h1>
      <p className="text-sm text-neutral-500 text-center mb-8">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      {state && !state.success && state.message && (
        <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-sm">
          {state.message}
        </div>
      )}

      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-black"
          />
          {state && !state.success && state.errors?.email && (
            <p className="text-xs text-red-600 mt-1">{state.errors.email[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-black text-white text-sm font-semibold py-3 rounded-md hover:bg-neutral-800 transition-colors disabled:opacity-60"
        >
          {isPending ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="text-neutral-500 hover:text-black">
          ← Back to sign in
        </Link>
      </p>
    </div>
  );
}
