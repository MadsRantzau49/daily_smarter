"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/security";
import { scoreAndCompleteLesson } from "@/services/lessons/lesson-service";

export async function submitQuizAction(
  lessonId: string,
  selectedIndex: number,
) {
  await assertSameOrigin();
  const user = await requireUser();
  const result = await scoreAndCompleteLesson(user.id, lessonId, selectedIndex);
  revalidatePath("/app", "layout");
  return result;
}
