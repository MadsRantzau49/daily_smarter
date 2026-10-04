import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().optional(),
  CRON_SECRET: z.string().min(16),
});

let parsed: z.infer<typeof serverSchema> | undefined;

export function env() {
  if (!parsed) parsed = serverSchema.parse(process.env);
  return parsed;
}

export function publicEnv() {
  return {
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    vapidPublicKey:
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ??
      process.env.VAPID_PUBLIC_KEY ??
      "",
  };
}
