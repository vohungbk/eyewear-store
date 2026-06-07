"use client";

import { useActionState } from "react";
import { updateProfile } from "@/lib/actions/auth";
import type { FormState } from "@/lib/validations/auth";
import type { Profile } from "@/types/database";

export default function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action, isPending] = useActionState<FormState, FormData>(
    updateProfile,
    undefined
  );

  return (
    <form action={action} className="space-y-4 max-w-md">
      {state?.success && (
        <div className="p-3 rounded-md bg-green-50 text-green-700 text-sm">
          {state.message}
        </div>
      )}
      {state && !state.success && state.message && (
        <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">
          {state.message}
        </div>
      )}

      <div>
        <label htmlFor="full_name" className="block text-sm font-medium mb-1">
          Full name
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          defaultValue={profile.full_name ?? ""}
          className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-black"
        />
        {state && !state.success && state.errors?.full_name && (
          <p className="text-xs text-red-600 mt-1">
            {state.errors.full_name[0]}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-1">
          Phone <span className="text-neutral-400">(optional)</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={profile.phone ?? ""}
          className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-black"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-black text-white text-sm font-semibold px-6 py-2.5 rounded-md hover:bg-neutral-800 transition-colors disabled:opacity-60"
      >
        {isPending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
