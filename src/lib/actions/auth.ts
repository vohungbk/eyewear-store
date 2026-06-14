"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  LoginSchema,
  RegisterSchema,
  ForgotPasswordSchema,
  UpdateProfileSchema,
  type FormState,
} from "@/lib/validations/auth";

export async function login(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { success: false, message: "Invalid email or password." };
  }

  const redirectTo = formData.get("redirectTo") as string | null;
  redirect(redirectTo && redirectTo.startsWith("/") ? redirectTo : "/account");
}

export async function register(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const raw = {
    full_name: formData.get("full_name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirm_password: formData.get("confirm_password") as string,
  };

  const parsed = RegisterSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.full_name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { success: false, message: "An account with this email already exists." };
    }
    return { success: false, message: "Could not create account. Please try again." };
  }

  return {
    success: true,
    message: "Check your email to confirm your account before signing in.",
  };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function forgotPassword(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const raw = { email: formData.get("email") as string };

  const parsed = ForgotPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/account/reset-password`,
  });

  if (error) {
    return { success: false, message: "Could not send reset email. Please try again." };
  }

  return {
    success: true,
    message: "Password reset email sent. Check your inbox.",
  };
}

export async function signInWithGoogle(formData: FormData): Promise<void> {
  const redirectTo = formData.get("redirectTo") as string | null;
  const next = redirectTo && redirectTo.startsWith("/") ? redirectTo : "/account";

  const supabase = await createClient();
  const { data } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${next}`,
    },
  });

  if (data.url) redirect(data.url);
}

export async function updateProfile(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const raw = {
    full_name: formData.get("full_name") as string,
    phone: (formData.get("phone") as string) || undefined,
  };

  const parsed = UpdateProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.full_name, phone: parsed.data.phone ?? null } as never)
    .eq("id", user.id);

  if (error) {
    return { success: false, message: "Could not update profile. Please try again." };
  }

  revalidatePath("/account");
  return { success: true, message: "Profile updated." };
}
