"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/lib/action-state";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { isValidTimezone } from "@/lib/dates";
import { assertSameOrigin } from "@/lib/security";

const settingsSchema = z
  .object({
    timezone: z.string().min(1).max(100),
    notificationTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
    theme: z.enum(["SYSTEM", "LIGHT", "DARK"]).default("SYSTEM"),
  })
  .refine((value) => isValidTimezone(value.timezone), {
    message: "Choose a valid IANA timezone",
    path: ["timezone"],
  });

export async function completeOnboardingAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertSameOrigin();
  const user = await requireUser();
  const parsed = settingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid settings" };
  await db.userSettings.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...parsed.data, onboardingCompleted: true },
    update: { ...parsed.data, onboardingCompleted: true },
  });
  redirect("/app");
}

export async function updateSettingsAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertSameOrigin();
  const user = await requireUser();
  const parsed = settingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid settings" };
  await db.userSettings.update({
    where: { userId: user.id },
    data: parsed.data,
  });
  revalidatePath("/app", "layout");
  return { success: "Settings saved" };
}
