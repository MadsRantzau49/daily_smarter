import Link from "next/link";
import { ArrowRight, Check, Clock3, Flame, Layers3 } from "lucide-react";
import { PrepareLessonButton } from "@/components/prepare-lesson-button";
import { requireUser } from "@/lib/auth";
import { getSelectedCourse } from "@/services/courses/course-service";
import {
  getTodaysLesson,
  getUserStats,
} from "@/services/lessons/lesson-service";

export const metadata = { title: "Today" };

export default async function DashboardPage() {
  const user = await requireUser();
  const timezone = user.settings?.timezone ?? "UTC";
  const [lesson, stats, course] = await Promise.all([
    getTodaysLesson(user.id, timezone),
    getUserStats(user.id, timezone),
    getSelectedCourse(user.id),
  ]);
  const hour = Number(
    new Intl.DateTimeFormat("en", {
      timeZone: timezone,
      hour: "numeric",
      hourCycle: "h23",
    }).format(new Date()),
  );
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return (
    <div className="enter">
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="muted text-sm">
            {greeting}, {user.name.split(" ")[0]}
          </p>
          <h1 className="display mt-2 text-5xl sm:text-6xl">
            What will you learn today?
          </h1>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-[var(--surface-2)] px-5 py-3">
          <Flame
            className="flame text-[var(--accent)]"
            fill="currentColor"
            size={22}
          />
          <div>
            <strong className="block text-xl leading-none">
              {stats.current}
            </strong>
            <span className="muted text-xs">day streak</span>
          </div>
        </div>
      </header>
      <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_300px]">
        <article className="card relative overflow-hidden p-7 shadow-[var(--shadow)] sm:p-10">
          <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-full bg-[var(--accent-2)] opacity-60" />
          <p className="eyebrow relative">Today&apos;s lesson</p>
          {!lesson ? (
            <div className="relative mt-16 max-w-xl pb-5">
              <h2 className="display text-4xl">
                Your next idea is ready to take shape.
              </h2>
              <p className="muted my-6 leading-7">
                Copy a personalized prompt into your preferred LLM, then paste
                the validated response back here.
              </p>
              <PrepareLessonButton />
            </div>
          ) : lesson.status === "READY" ? (
            <div className="relative mt-12 max-w-2xl">
              <div className="mb-6 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                <span className="flex items-center gap-2">
                  <Clock3 size={15} />
                  {lesson.estimatedReadingMinutes} min
                </span>
                <span>·</span>
                <span>{lesson.difficulty?.toLowerCase()}</span>
              </div>
              <h2 className="display text-4xl sm:text-5xl">{lesson.title}</h2>
              <p className="muted mt-5 max-w-xl text-lg leading-8">
                {lesson.introduction}
              </p>
              <Link className="btn mt-8" href="/app/today">
                {lesson.completion ? (
                  <>
                    <Check size={18} /> Review today&apos;s lesson
                  </>
                ) : (
                  <>
                    Start today&apos;s lesson <ArrowRight size={18} />
                  </>
                )}
              </Link>
            </div>
          ) : (
            <div className="mt-16 pb-8">
              <div className="mb-5 h-2 w-32 animate-pulse rounded bg-[var(--accent-2)]" />
              <h2 className="display text-4xl">
                {lesson.status === "FAILED"
                  ? "This lesson still needs a valid response."
                  : "Finish importing today’s lesson."}
              </h2>
              <p className="muted my-5">
                {lesson.status === "FAILED"
                  ? "Use your own ChatGPT account. Your history and streak are safe."
                  : "Return to the prompt and paste the generated JSON."}
              </p>
              <PrepareLessonButton />
            </div>
          )}
        </article>
        <aside className="grid gap-4">
          <div className="card p-6">
            <Layers3 className="text-[var(--accent)]" size={20} />
            <p className="muted mt-6 text-xs font-bold uppercase tracking-wider">
              Current track
            </p>
            <p className="mt-2 font-bold leading-6">
              {course?.title ?? "Choose a course"}
            </p>
          </div>
          <div className="card p-6">
            <p className="muted text-xs font-bold uppercase tracking-wider">
              Your progress
            </p>
            <div className="mt-6 grid grid-cols-2 gap-5">
              <div>
                <strong className="display block text-3xl">
                  {stats.total}
                </strong>
                <span className="muted text-xs">completed</span>
              </div>
              <div>
                <strong className="display block text-3xl">
                  {stats.accuracy}%
                </strong>
                <span className="muted text-xs">quiz accuracy</span>
              </div>
            </div>
            <Link
              href="/app/progress"
              className="mt-7 flex items-center gap-2 text-sm font-bold text-[var(--accent)]"
            >
              View progress <ArrowRight size={15} />
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}
