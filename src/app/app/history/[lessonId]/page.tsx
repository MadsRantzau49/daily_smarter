import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { LessonView } from "@/components/lesson-view";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  getPublicLesson,
  getUserStats,
} from "@/services/lessons/lesson-service";

export default async function HistoricalLessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const user = await requireUser();
  const { lessonId } = await params;
  const [lesson, stats] = await Promise.all([
    getPublicLesson(user.id, lessonId),
    getUserStats(user.id, user.settings?.timezone ?? "UTC"),
  ]);
  if (!lesson || !lesson.completion) notFound();
  const [previous, next] = await Promise.all([
    db.dailyLesson.findFirst({
      where: {
        userId: user.id,
        localDate: { lt: lesson.localDate },
        completion: { isNot: null },
      },
      orderBy: { localDate: "desc" },
      select: { id: true },
    }),
    db.dailyLesson.findFirst({
      where: {
        userId: user.id,
        localDate: { gt: lesson.localDate },
        completion: { isNot: null },
      },
      orderBy: { localDate: "asc" },
      select: { id: true },
    }),
  ]);
  return (
    <>
      <nav className="mx-auto mb-8 flex max-w-3xl items-center justify-between text-sm font-bold">
        <Link href="/app/history" className="flex items-center gap-2">
          <ArrowLeft size={16} /> History
        </Link>
        <div className="flex gap-4">
          {previous && (
            <Link href={`/app/history/${previous.id}`}>Previous</Link>
          )}
          {next && (
            <Link
              className="flex items-center gap-1"
              href={`/app/history/${next.id}`}
            >
              Next <ArrowRight size={15} />
            </Link>
          )}
        </div>
      </nav>
      <LessonView lesson={lesson} streak={stats.current} />
    </>
  );
}
