"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register } from "@/lib/actions/auth";
import type { FormState } from "@/lib/validations/auth";

export default function RegisterForm() {
  const [state, action, isPending] = useActionState<FormState, FormData>(
    register,
    undefined
  );

  if (state?.success) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="text-4xl mb-4">✉️</div>
        <h2 className="text-xl font-bold mb-2">Check your email</h2>
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
      <h1 className="text-2xl font-bold text-center mb-2">Create account</h1>
      <p className="text-sm text-neutral-500 text-center mb-8">
        Join EYEWEAR for a better shopping experience
      </p>

      {state && !state.success && state.message && (
        <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-sm">
          {state.message}
        </div>
      )}

      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium mb-1">
            Full name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            autoComplete="name"
            required
            className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-black"
          />
          {state && !state.success && state.errors?.full_name && (
            <p className="text-xs text-red-600 mt-1">
              {state.errors.full_name[0]}
            </p>
          )}
        </div>

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

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-black"
          />
          {state && !state.success && state.errors?.password && (
            <p className="text-xs text-red-600 mt-1">
              {state.errors.password[0]}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirm_password"
            className="block text-sm font-medium mb-1"
          >
            Confirm password
          </label>
          <input
            id="confirm_password"
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            required
            className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-black"
          />
          {state && !state.success && state.errors?.confirm_password && (
            <p className="text-xs text-red-600 mt-1">
              {state.errors.confirm_password[0]}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-black text-white text-sm font-semibold py-3 rounded-md hover:bg-neutral-800 transition-colors disabled:opacity-60"
        >
          {isPending ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-black hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
