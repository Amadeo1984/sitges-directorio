import 'server-only';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { db } from './db';
import { sendVerificationEmail, sendResetPasswordEmail } from './email';

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: 'postgresql' }),
  baseURL: appUrl,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [appUrl],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // permitimos uso inmediato y reenviamos verificación aparte
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      await sendResetPasswordEmail(user.email, url);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, url);
    },
  },
  socialProviders: process.env.GOOGLE_CLIENT_ID
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
        },
      }
    : undefined,
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'OWNER',
        input: false, // no editable desde signup
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 días
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
