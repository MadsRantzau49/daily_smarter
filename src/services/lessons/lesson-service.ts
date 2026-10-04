import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { localDate } from "@/lib/dates";
import { scoreQuizAnswer } from "@/lib/quiz";
import { calculateStreaks } from "@/lib/streaks";

const publicLessonSelect = {
  id: true,
  localDate: true,
  status: true,
  title: true,
  topicKey: true,
  difficulty: true,
  estimatedReadingMinutes: true,
  introduction: true,
  concept: true,
  howItWorks: true,
  whyItMatters: true,
  concreteExample: true,
  keyTerms: true,
  quizQuestion: true,
  quizOptions: true,
  prerequisiteTopics: true,
  relatedTopics: true,
  openedAt: true,
  generatedAt: true,
  completion: { select: { quizCorrect: true, completedAt: true } },
  quizAttempts: { select: { selectedIndex: true, correct: true }, take: 1 },
} satisfies Prisma.DailyLessonSelect;

export type PublicLesson = Prisma.DailyLessonGetPayload<{
  select: typeof publicLessonSelect;
}>;

export async function getPublicLesson(
  userId: string,
  lessonId: string,
  markOpened = false,
) {
  const lesson = await db.dailyLesson.findFirst({
    where: { id: lessonId, userId },
    select: publicLessonSelect,
  });
  if (!lesson) return null;
  if (markOpened && lesson.status === "READY" && !lesson.openedAt) {
    await db.dailyLesson.updateMany({
      where: { id: lessonId, userId, openedAt: null },
      data: { openedAt: new Date() },
    });
  }
  return lesson;
}

export async function getTodaysLesson(userId: string, timezone: string) {
  return db.dailyLesson.findUnique({
    where: {
      userId_localDate: { userId, localDate: localDate(new Date(), timezone) },
    },
    select: publicLessonSelect,
  });
}

export async function scoreAndCompleteLesson(
  userId: string,
  lessonId: string,
  selectedIndex: number,
) {
  const lesson = await db.dailyLesson.findFirst({
    where: { id: lessonId, userId },
  });
  if (
    !lesson ||
    lesson.status !== "READY" ||
    lesson.quizCorrectIndex === null
  ) {
    throw new Error("Lesson is not available");
  }
  if (!lesson.openedAt) throw new Error("Open the lesson before completing it");
  const correct = scoreQuizAnswer(lesson.quizCorrectIndex, selectedIndex);

  try {
    await db.$transaction(async (tx) => {
      await tx.quizAttempt.create({
        data: { lessonId, userId, selectedIndex, correct },
      });
      await tx.lessonCompletion.create({
        data: {
          lessonId,
          userId,
          localDate: lesson.localDate,
          quizCorrect: correct,
        },
      });
      if (lesson.topicKey) {
        await tx.userTopicProgress.upsert({
          where: { userId_topicKey: { userId, topicKey: lesson.topicKey } },
          create: {
            userId,
            topicKey: lesson.topicKey,
            timesCompleted: 1,
            correctAnswers: correct ? 1 : 0,
            lastStudiedAt: new Date(),
          },
          update: {
            timesCompleted: { increment: 1 },
            correctAnswers: { increment: correct ? 1 : 0 },
            lastStudiedAt: new Date(),
          },
        });
      }
    });
  } catch (error) {
    if (
      !(error instanceof Prisma.PrismaClientKnownRequestError) ||
      error.code !== "P2002"
    ) {
      throw error;
    }
  }

  return {
    correct,
    correctIndex: lesson.quizCorrectIndex,
    explanation: lesson.quizExplanation ?? "",
  };
}

export async function getUserStats(userId: string, timezone: string) {
  const completions = await db.lessonCompletion.findMany({
    where: { userId },
    select: {
      localDate: true,
      quizCorrect: true,
      lesson: { select: { estimatedReadingMinutes: true, topicKey: true } },
    },
    orderBy: { localDate: "asc" },
  });
  const streaks = calculateStreaks(
    completions.map((item) => item.localDate),
    localDate(new Date(), timezone),
  );
  const correct = completions.filter((item) => item.quizCorrect).length;
  return {
    ...streaks,
    accuracy: completions.length
      ? Math.round((correct / completions.length) * 100)
      : 0,
    minutes: completions.reduce(
      (sum, item) => sum + (item.lesson.estimatedReadingMinutes ?? 0),
      0,
    ),
    topics: new Set(
      completions.map((item) => item.lesson.topicKey).filter(Boolean),
    ).size,
    dates: completions.map((item) => item.localDate),
  };
}
