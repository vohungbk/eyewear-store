"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPassword } from "@/lib/actions/auth";
import type { FormState } from "@/lib/validations/auth";

const inputClass =
  "w-full border border-neutral-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-black";

export default function ResetPasswordForm() {
  const [state, action, isPending] = useActionState<FormState, FormData>(
    resetPassword,
    undefined
  );
  const errors = state && !state.success ? state.errors : undefined;

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-bold text-center mb-2">Set a new password</h1>
      <p className="text-sm text-neutral-500 text-center mb-8">
        Choose a new password for your account.
      </p>

      {state && !state.success && state.message && (
        <div role="alert" className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-sm">
          {state.message}{" "}
          <Link href="/forgot-password" className="underline">
            Request a new link
          </Link>
        </div>
      )}

      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className={inputClass}
          />
          {errors?.password && (
            <p className="text-xs text-red-600 mt-1">{errors.password[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirm_password" className="block text-sm font-medium mb-1">
            Confirm new password
          </label>
          <input
            id="confirm_password"
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            required
            className={inputClass}
          />
          {errors?.confirm_password && (
            <p className="text-xs text-red-600 mt-1">{errors.confirm_password[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-black text-white text-sm font-semibold py-3 rounded-md hover:bg-neutral-800 transition-colors disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
