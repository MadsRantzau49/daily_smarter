"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/lib/action-state";
import { requireUser } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/security";
import { importPastedLesson } from "@/services/lessons/manual-lesson-service";

const importSchema = z.object({
  response: z.string().trim().min(100).max(100_000),
});

export async function importLessonResponseAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertSameOrigin();
  const user = await requireUser();
  const parsed = importSchema.safeParse({ response: formData.get("response") });
  if (!parsed.success)
    return { error: "Paste the complete JSON response from your LLM" };
  try {
    await importPastedLesson(user.id, parsed.data.response);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Could not import this lesson",
    };
  }
  redirect("/app/today");
}
