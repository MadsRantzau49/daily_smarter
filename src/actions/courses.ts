"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/lib/action-state";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { assertSameOrigin } from "@/lib/security";

const courseSchema = z.object({
  title: z.string().trim().min(3).max(100),
  description: z.string().trim().min(20).max(500),
  domain: z.string().trim().min(3).max(150),
  guidance: z.string().trim().min(30).max(5000),
  emphasizedTopics: z.string().max(1000),
  avoidedTopics: z.string().max(1000),
  defaultDifficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  explanationLength: z.enum(["SHORT", "NORMAL", "LONG"]),
  teachingStyle: z.enum(["BEGINNER_FRIENDLY", "BALANCED", "TECHNICAL"]),
  additionalGuidance: z.string().trim().max(500).optional(),
  isPublic: z.boolean(),
});

function parseCourse(formData: FormData) {
  return courseSchema.safeParse({
    ...Object.fromEntries(formData),
    isPublic: formData.get("isPublic") === "on",
  });
}

function topicList(value: string) {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 30);
}

function slugify(title: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);
  return `${base || "course"}-${randomBytes(3).toString("hex")}`;
}

function courseData(data: z.infer<typeof courseSchema>) {
  return {
    ...data,
    emphasizedTopics: topicList(data.emphasizedTopics),
    avoidedTopics: topicList(data.avoidedTopics),
    additionalGuidance: data.additionalGuidance || null,
  };
}

export async function createCourseAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertSameOrigin();
  const user = await requireUser();
  await rateLimit(`course-create:${user.id}`, 20, 60 * 60 * 1000);
  const parsed = parseCourse(formData);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid course" };
  const course = await db.course.create({
    data: {
      ...courseData(parsed.data),
      slug: slugify(parsed.data.title),
      creatorId: user.id,
    },
  });
  await db.userSettings.update({
    where: { userId: user.id },
    data: { selectedCourseId: course.id },
  });
  redirect("/app/courses");
}

export async function updateCourseAction(
  courseId: string,
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertSameOrigin();
  const user = await requireUser();
  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course || (course.creatorId !== user.id && user.role !== "ADMIN")) {
    return { error: "You cannot edit this course" };
  }
  const parsed = parseCourse(formData);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid course" };
  await db.course.update({
    where: { id: courseId },
    data: courseData(parsed.data),
  });
  revalidatePath("/app/courses");
  return { success: "Course updated" };
}

export async function deleteCourseAction(courseId: string) {
  await assertSameOrigin();
  const user = await requireUser();
  const course = await db.course.findUnique({ where: { id: courseId } });
  if (
    !course ||
    course.isSystem ||
    (course.creatorId !== user.id && user.role !== "ADMIN")
  ) {
    throw new Error("This course cannot be deleted");
  }
  await db.course.delete({ where: { id: courseId } });
  revalidatePath("/app/courses");
}

export async function selectCourseAction(courseId: string) {
  await assertSameOrigin();
  const user = await requireUser();
  const course = await db.course.findFirst({
    where: { id: courseId, OR: [{ isPublic: true }, { creatorId: user.id }] },
    select: { id: true },
  });
  if (!course) throw new Error("Course not found");
  await db.userSettings.update({
    where: { userId: user.id },
    data: { selectedCourseId: course.id },
  });
  revalidatePath("/app", "layout");
}

export async function rateCourseAction(courseId: string, formData: FormData) {
  await assertSameOrigin();
  const user = await requireUser();
  const score = z.coerce
    .number()
    .int()
    .min(1)
    .max(5)
    .parse(formData.get("score"));
  const course = await db.course.findFirst({
    where: { id: courseId, isPublic: true },
  });
  if (!course) throw new Error("Course not found");
  await db.courseRating.upsert({
    where: { courseId_userId: { courseId, userId: user.id } },
    create: { courseId, userId: user.id, score },
    update: { score },
  });
  revalidatePath("/app/courses");
}
