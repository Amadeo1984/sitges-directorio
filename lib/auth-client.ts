import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
});

export const { signIn, signOut, signUp, useSession, sendVerificationEmail } = authClient;

// Reset password helpers (typed loosely por la fricción TS de better-auth en esta versión)
export const forgetPassword: (input: { email: string; redirectTo?: string }) => Promise<{ error?: { message?: string } | null }> =
  (input) => (authClient as unknown as { forgetPassword: (i: typeof input) => Promise<{ error?: { message?: string } | null }> }).forgetPassword(input);

export const resetPassword: (input: { newPassword: string; token: string }) => Promise<{ error?: { message?: string } | null }> =
  (input) => (authClient as unknown as { resetPassword: (i: typeof input) => Promise<{ error?: { message?: string } | null }> }).resetPassword(input);
