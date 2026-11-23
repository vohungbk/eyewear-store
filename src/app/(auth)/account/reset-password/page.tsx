import type { Metadata } from "next";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = { title: "Set a new password" };

// Reached from the emailed link via /auth/callback, which signs the user in.
// The middleware sends visitors without a session to /login.
export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
