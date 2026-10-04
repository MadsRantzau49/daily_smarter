import "server-only";

import {
  DEFAULT_DOMAIN,
  DEFAULT_EMPHASIZED_TOPICS,
  DEFAULT_GUIDANCE,
} from "@/lib/constants";
import { db } from "@/lib/db";

export async function getDefaultCourse() {
  return db.course.upsert({
    where: { slug: "low-level-computing" },
    create: {
      slug: "low-level-computing",
      title: "Low-level computing",
      description:
        "Build a connected understanding of computers from electricity and digital logic through processors, memory, buses, firmware, and hardware interfaces.",
      domain: DEFAULT_DOMAIN,
      guidance: DEFAULT_GUIDANCE,
      emphasizedTopics: DEFAULT_EMPHASIZED_TOPICS,
      avoidedTopics: [],
      defaultDifficulty: "BEGINNER",
      explanationLength: "NORMAL",
      teachingStyle: "BEGINNER_FRIENDLY",
      isPublic: true,
      isSystem: true,
    },
    update: {},
  });
}

export async function getSelectedCourse(userId: string) {
  const settings = await db.userSettings.findUnique({
    where: { userId },
    include: { selectedCourse: true },
  });
  if (settings?.selectedCourse) return settings.selectedCourse;
  const fallback = await db.course.findFirst({
    where: { isPublic: true },
    orderBy: [{ isSystem: "desc" }, { createdAt: "asc" }],
  });
  const course = fallback ?? (await getDefaultCourse());
  if (settings) {
    await db.userSettings.update({
      where: { id: settings.id },
      data: { selectedCourseId: course.id },
    });
  }
  return course;
}
