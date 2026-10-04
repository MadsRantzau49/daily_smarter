import "server-only";

import type { Difficulty } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { localDate } from "@/lib/dates";
import { parsePastedLesson } from "@/lib/lesson-import";
import { buildCopyableLessonPrompt } from "@/services/ai/build-lesson-prompt";
import { getSelectedCourse } from "@/services/courses/course-service";

function dbDifficulty(
  value: "beginner" | "intermediate" | "advanced",
): Difficulty {
  return value.toUpperCase() as Difficulty;
}

export async function buildUserLessonPrompt(userId: string) {
  const [user, course, recent, progress] = await Promise.all([
    db.user.findUniqueOrThrow({
      where: { id: userId },
      include: { settings: true },
    }),
    getSelectedCourse(userId),
    db.dailyLesson.findMany({
      where: { userId, status: "READY" },
      select: { topicKey: true, title: true, localDate: true },
      orderBy: { localDate: "desc" },
      take: 20,
    }),
    db.userTopicProgress.findMany({
      where: { userId },
      select: { topicKey: true, timesCompleted: true, correctAnswers: true },
      orderBy: { lastStudiedAt: "desc" },
      take: 60,
    }),
  ]);
  if (!course)
    throw new Error(
      "Choose or create a course before building a lesson prompt",
    );
  return {
    course,
    prompt: buildCopyableLessonPrompt({
      config: course,
      difficulty: user.settings?.difficulty ?? course.defaultDifficulty,
      recent,
      progress,
      yesterday: recent[0],
    }),
  };
}

export async function importPastedLesson(userId: string, response: string) {
  const [user, course] = await Promise.all([
    db.user.findUniqueOrThrow({
      where: { id: userId },
      include: { settings: true },
    }),
    getSelectedCourse(userId),
  ]);
  if (!course)
    throw new Error("Choose or create a course before importing a lesson");
  const generated = parsePastedLesson(response);
  const lessonDate = localDate(new Date(), user.settings?.timezone ?? "UTC");
  const existing = await db.dailyLesson.findUnique({
    where: { userId_localDate: { userId, localDate: lessonDate } },
  });
  if (existing?.status === "READY")
    throw new Error("Today's lesson has already been imported");

  const data = {
    status: "READY" as const,
    title: generated.title,
    topicKey: generated.topic_key,
    difficulty: dbDifficulty(generated.difficulty),
    estimatedReadingMinutes: generated.estimated_reading_minutes,
    introduction: generated.introduction,
    concept: generated.concept,
    howItWorks: generated.how_it_works,
    whyItMatters: generated.why_it_matters,
    concreteExample: generated.concrete_example,
    keyTerms: generated.key_terms,
    quizQuestion: generated.quiz.question,
    quizOptions: generated.quiz.options,
    quizCorrectIndex: generated.quiz.correct_option,
    quizExplanation: generated.quiz.explanation,
    prerequisiteTopics: generated.prerequisite_topics,
    relatedTopics: generated.related_topics,
    courseId: course.id,
    learningConfigVersionId: null,
    aiModel: "user-provided-llm",
    generatedAt: new Date(),
  };

  if (existing) {
    return db.dailyLesson.update({ where: { id: existing.id }, data });
  }
  return db.dailyLesson.create({
    data: { ...data, userId, localDate: lessonDate },
  });
}
