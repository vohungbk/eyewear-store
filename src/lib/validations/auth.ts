import { z } from "zod";

export const LoginSchema = z.object({
  email: z.email({ error: "Please enter a valid email address." }).trim(),
  password: z.string().min(1, { error: "Password is required." }),
});

export const RegisterSchema = z.object({
  full_name: z
    .string()
    .min(2, { error: "Name must be at least 2 characters." })
    .trim(),
  email: z.email({ error: "Please enter a valid email address." }).trim(),
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters." })
    .regex(/[a-zA-Z]/, { error: "Password must contain at least one letter." })
    .regex(/[0-9]/, { error: "Password must contain at least one number." }),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  error: "Passwords do not match.",
  path: ["confirm_password"],
});

export const ForgotPasswordSchema = z.object({
  email: z.email({ error: "Please enter a valid email address." }).trim(),
});

export const UpdateProfileSchema = z.object({
  full_name: z
    .string()
    .min(2, { error: "Name must be at least 2 characters." })
    .trim(),
  phone: z.string().optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;

export type FormState<T extends Record<string, string[]> = Record<string, string[]>> =
  | { success: true; message?: string }
  | { success: false; errors?: Partial<T>; message?: string }
  | undefined;
