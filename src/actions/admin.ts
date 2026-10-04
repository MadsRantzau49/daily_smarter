"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionState } from "@/lib/action-state";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertSameOrigin } from "@/lib/security";

const configSchema = z.object({
  domain: z.string().trim().min(3).max(150),
  guidance: z.string().trim().min(30).max(5000),
  emphasizedTopics: z.string().max(1000),
  avoidedTopics: z.string().max(1000),
  defaultDifficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  explanationLength: z.enum(["SHORT", "NORMAL", "LONG"]),
  teachingStyle: z.enum(["BEGINNER_FRIENDLY", "BALANCED", "TECHNICAL"]),
  additionalGuidance: z.string().trim().max(500).optional(),
});

function topicList(value: string) {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 30);
}

export async function saveLearningConfigAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertSameOrigin();
  const admin = await requireAdmin();
  const parsed = configSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid configuration",
    };
  const latest = await db.learningConfigVersion.findFirst({
    orderBy: { version: "desc" },
  });
  await db.$transaction([
    db.learningConfigVersion.updateMany({
      where: { active: true },
      data: { active: false },
    }),
    db.learningConfigVersion.create({
      data: {
        ...parsed.data,
        emphasizedTopics: topicList(parsed.data.emphasizedTopics),
        avoidedTopics: topicList(parsed.data.avoidedTopics),
        additionalGuidance: parsed.data.additionalGuidance || null,
        version: (latest?.version ?? 0) + 1,
        active: true,
        createdById: admin.id,
      },
    }),
    db.course.updateMany({
      where: { isSystem: true },
      data: {
        domain: parsed.data.domain,
        guidance: parsed.data.guidance,
        emphasizedTopics: topicList(parsed.data.emphasizedTopics),
        avoidedTopics: topicList(parsed.data.avoidedTopics),
        defaultDifficulty: parsed.data.defaultDifficulty,
        explanationLength: parsed.data.explanationLength,
        teachingStyle: parsed.data.teachingStyle,
        additionalGuidance: parsed.data.additionalGuidance || null,
      },
    }),
  ]);
  revalidatePath("/admin", "layout");
  return { success: "A new configuration version is active" };
}
