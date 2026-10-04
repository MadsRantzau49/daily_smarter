import { redirect } from "next/navigation";
import { LessonView } from "@/components/lesson-view";
import { ManualLessonCreator } from "@/components/manual-lesson-creator";
import { requireUser } from "@/lib/auth";
import { buildUserLessonPrompt } from "@/services/lessons/manual-lesson-service";
import {
  getPublicLesson,
  getTodaysLesson,
  getUserStats,
} from "@/services/lessons/lesson-service";

export const metadata = { title: "Today's lesson" };

export default async function TodayPage() {
  const user = await requireUser();
  const timezone = user.settings?.timezone ?? "UTC";
  const summary = await getTodaysLesson(user.id, timezone);
  if (!summary || summary.status !== "READY") {
    const { prompt, course } = await buildUserLessonPrompt(user.id);
    return <ManualLessonCreator prompt={prompt} courseTitle={course.title} />;
  }
  const [lesson, stats] = await Promise.all([
    getPublicLesson(user.id, summary.id, true),
    getUserStats(user.id, timezone),
  ]);
  if (!lesson) redirect("/app");
  return <LessonView lesson={lesson} streak={stats.current} />;
}
