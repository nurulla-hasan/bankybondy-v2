import { z } from "zod";

/**
 * Zod 4 modern syntax:
 * - Direct standalone types: `z.email({ error: "..." })`
 * - Direct error strings or `{ error: "..." }` instead of `{ message: "..." }`
 */

export const loginSchema = z.object({
  email: z.email({ error: "Invalid email address" }),
  password: z.string().min(6, { error: "Password must be at least 6 characters" }),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, { error: "Name must be at least 2 characters" }),
    email: z.email({ error: "Invalid email address" }),
    password: z.string().min(6, { error: "Password must be at least 6 characters" }),
    confirmPassword: z.string().min(6, { error: "Please confirm your password" }),
    phone: z.string().optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    dateOfBirth: z.string().optional(),
    address: z.string().optional(),
    bio: z.string().optional(),
    skills: z.array(z.string()).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match",
    path: ["confirmPassword"],
  });


export type RegisterSchemaType = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email({ error: "Invalid email address" }),
});

export type ForgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>;

export const verifyCodeSchema = z.object({
  email: z.email({ error: "Invalid email address" }),
  verifyCode: z.string().min(4, { error: "Verification code must be at least 4 digits" }),
});

export type VerifyCodeSchemaType = z.infer<typeof verifyCodeSchema>;

export const resetPasswordSchema = z
  .object({
    email: z.email({ error: "Invalid email address" }),
    newPassword: z.string().min(6, { error: "New password must be at least 6 characters" }),
    confirmPassword: z.string().min(6, { error: "Please confirm your new password" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    error: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;

