import Link from "next/link";
import { Check, Search } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatIsoDate } from "@/lib/dates";

export const metadata = { title: "Learning history" };

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; difficulty?: string }>;
}) {
  const user = await requireUser();
  const filters = await searchParams;
  const difficulty = ["BEGINNER", "INTERMEDIATE", "ADVANCED"].includes(
    filters.difficulty ?? "",
  )
    ? (filters.difficulty as "BEGINNER" | "INTERMEDIATE" | "ADVANCED")
    : undefined;
  const lessons = await db.dailyLesson.findMany({
    where: {
      userId: user.id,
      status: "READY",
      completion: { isNot: null },
      ...(difficulty ? { difficulty } : {}),
      ...(filters.q
        ? {
            OR: [
              { title: { contains: filters.q, mode: "insensitive" } },
              { topicKey: { contains: filters.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { completion: true },
    orderBy: { localDate: "desc" },
    take: 100,
  });
  return (
    <div className="mx-auto max-w-4xl">
      <header>
        <p className="eyebrow">Your library</p>
        <h1 className="display mt-3 text-6xl">Learning history</h1>
        <p className="muted mt-4">Every concept you have added to your map.</p>
      </header>
      <form className="mt-10 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <Search className="muted absolute left-4 top-3.5" size={18} />
          <span className="sr-only">Search lessons</span>
          <input
            className="input !pl-11"
            name="q"
            defaultValue={filters.q}
            placeholder="Search lessons"
          />
        </label>
        <select
          className="input sm:w-48"
          name="difficulty"
          defaultValue={filters.difficulty ?? ""}
          aria-label="Filter by difficulty"
        >
          <option value="">All levels</option>
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </select>
        <button className="btn btn-secondary" type="submit">
          Filter
        </button>
      </form>
      {lessons.length ? (
        <div className="mt-10 divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {lessons.map((lesson) => (
            <Link
              href={`/app/history/${lesson.id}`}
              key={lesson.id}
              className="group grid grid-cols-[36px_1fr_auto] items-center gap-4 py-6"
            >
              <span className="grid size-8 place-items-center rounded-full bg-[var(--accent-2)] text-[var(--accent)]">
                <Check size={16} />
              </span>
              <span>
                <strong className="block group-hover:text-[var(--accent)]">
                  {lesson.title}
                </strong>
                <span className="muted mt-1 block text-xs capitalize">
                  {lesson.topicKey?.replaceAll("_", " ")} ·{" "}
                  {lesson.difficulty?.toLowerCase()} ·{" "}
                  {lesson.completion?.quizCorrect
                    ? "quiz correct"
                    : "review recommended"}
                </span>
              </span>
              <time className="muted text-sm" dateTime={lesson.localDate}>
                {formatIsoDate(lesson.localDate)}
              </time>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card mt-10 p-10 text-center">
          <h2 className="text-xl font-bold">No lessons here yet</h2>
          <p className="muted mt-2">
            Complete today&apos;s lesson and it will become part of your
            history.
          </p>
        </div>
      )}
    </div>
  );
}
