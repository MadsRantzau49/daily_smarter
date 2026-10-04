"use server";

import argon2 from "argon2";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/lib/action-state";
import { createSession, destroySession } from "@/lib/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { assertSameOrigin, safeReturnPath } from "@/lib/security";
import { getDefaultCourse } from "@/services/courses/course-service";

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(10).max(200),
});

const registerSchema = credentialsSchema.extend({
  name: z.string().trim().min(2).max(80),
});

async function requestKey(prefix: string, email: string) {
  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  return `${prefix}:${ip}:${email}`;
}

export async function registerAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertSameOrigin();
  const result = registerSchema.safeParse(Object.fromEntries(formData));
  if (!result.success)
    return { error: result.error.issues[0]?.message ?? "Check your details" };
  await rateLimit(
    await requestKey("register", result.data.email),
    5,
    15 * 60 * 1000,
  );
  const existing = await db.user.findUnique({
    where: { email: result.data.email },
  });
  if (existing) return { error: "An account with that email already exists" };
  const passwordHash = await argon2.hash(result.data.password, {
    type: argon2.argon2id,
  });
  const defaultCourse = await getDefaultCourse();
  const user = await db.user.create({
    data: {
      email: result.data.email,
      name: result.data.name,
      passwordHash,
      settings: { create: { selectedCourseId: defaultCourse.id } },
    },
  });
  await createSession(user.id);
  redirect("/onboarding");
}

export async function loginAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertSameOrigin();
  const result = credentialsSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { error: "Invalid email or password" };
  await rateLimit(
    await requestKey("login", result.data.email),
    10,
    15 * 60 * 1000,
  );
  const user = await db.user.findUnique({
    where: { email: result.data.email },
    include: { settings: true },
  });
  if (
    !user ||
    !(await argon2.verify(user.passwordHash, result.data.password))
  ) {
    return { error: "Invalid email or password" };
  }
  await createSession(user.id);
  const returnTo = safeReturnPath(formData.get("returnTo"));
  redirect(user.settings ? returnTo : "/onboarding");
}

export async function logoutAction() {
  await assertSameOrigin();
  await destroySession();
  redirect("/");
}
