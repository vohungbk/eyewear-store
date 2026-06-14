"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/lib/actions/auth";
import type { FormState } from "@/lib/validations/auth";
import GoogleButton from "@/components/auth/GoogleButton";

export default function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, action, isPending] = useActionState<FormState, FormData>(
    login,
    undefined
  );

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-bold text-center mb-2">Sign in</h1>
      <p className="text-sm text-neutral-500 text-center mb-8">
        Welcome back to EYEWEAR
      </p>

      {state && !state.success && state.message && (
        <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-sm">
          {state.message}
        </div>
      )}

      <GoogleButton redirectTo={redirectTo} />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs text-neutral-400">or continue with email</span>
        </div>
      </div>

      <form action={action} className="space-y-4">
        {redirectTo && (
          <input type="hidden" name="redirectTo" value={redirectTo} />
        )}

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
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-neutral-500 hover:text-black"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-black"
          />
          {state && !state.success && state.errors?.password && (
            <p className="text-xs text-red-600 mt-1">
              {state.errors.password[0]}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-black text-white text-sm font-semibold py-3 rounded-md hover:bg-neutral-800 transition-colors disabled:opacity-60"
        >
          {isPending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-black hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
