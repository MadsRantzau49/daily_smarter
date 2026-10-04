import Link from "next/link";
import { Check, Edit3, Plus, Search, Star, Trash2, Users } from "lucide-react";
import {
  deleteCourseAction,
  rateCourseAction,
  selectCourseAction,
} from "@/actions/courses";
import { SubmitButton } from "@/components/submit-button";
import { requireUser } from "@/lib/auth";
import { courseRating } from "@/lib/course-rating";
import { db } from "@/lib/db";

export const metadata = { title: "Courses" };

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; min?: string; sort?: string }>;
}) {
  const user = await requireUser();
  const filters = await searchParams;
  const minimum = Math.max(0, Math.min(5, Number(filters.min) || 0));
  const selectedId = user.settings?.selectedCourseId;
  const records = await db.course.findMany({
    where: {
      AND: [
        { OR: [{ isPublic: true }, { creatorId: user.id }] },
        ...(filters.q
          ? [
              {
                OR: [
                  {
                    title: {
                      contains: filters.q,
                      mode: "insensitive" as const,
                    },
                  },
                  {
                    domain: {
                      contains: filters.q,
                      mode: "insensitive" as const,
                    },
                  },
                  {
                    description: {
                      contains: filters.q,
                      mode: "insensitive" as const,
                    },
                  },
                ],
              },
            ]
          : []),
      ],
    },
    include: {
      ratings: { select: { score: true, userId: true } },
      creator: { select: { name: true } },
      _count: { select: { selectedBy: true } },
    },
    take: 200,
  });
  const courses = records
    .map((course) => ({ ...course, average: courseRating(course.ratings) }))
    .filter((course) => course.average >= minimum)
    .sort((a, b) =>
      filters.sort === "new"
        ? b.createdAt.getTime() - a.createdAt.getTime()
        : filters.sort === "popular"
          ? b._count.selectedBy - a._count.selectedBy
          : b.average - a.average || b.ratings.length - a.ratings.length,
    );

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Community curriculum</p>
          <h1 className="display mt-3 text-6xl">Courses</h1>
          <p className="muted mt-4 max-w-xl">
            Choose a learning path, publish your own, and rate courses after
            trying them.
          </p>
        </div>
        <Link className="btn" href="/app/courses/new">
          <Plus size={17} /> Create course
        </Link>
      </header>
      <form className="mt-10 grid gap-3 sm:grid-cols-[1fr_160px_160px_auto]">
        <label className="relative">
          <Search className="muted absolute left-4 top-3.5" size={18} />
          <span className="sr-only">Search courses</span>
          <input
            className="input !pl-11"
            name="q"
            defaultValue={filters.q}
            placeholder="Search courses"
          />
        </label>
        <select
          className="input"
          name="min"
          defaultValue={filters.min ?? "0"}
          aria-label="Minimum rating"
        >
          <option value="0">Any rating</option>
          <option value="3">3+ stars</option>
          <option value="4">4+ stars</option>
          <option value="4.5">4.5+ stars</option>
        </select>
        <select
          className="input"
          name="sort"
          defaultValue={filters.sort ?? "rating"}
          aria-label="Sort courses"
        >
          <option value="rating">Best rated</option>
          <option value="popular">Most used</option>
          <option value="new">Newest</option>
        </select>
        <button className="btn btn-secondary" type="submit">
          Filter
        </button>
      </form>
      {courses.length ? (
        <section className="mt-8 grid gap-5 md:grid-cols-2">
          {courses.map((course) => {
            const own = course.creatorId === user.id || user.role === "ADMIN";
            const userScore = course.ratings.find(
              (rating) => rating.userId === user.id,
            )?.score;
            return (
              <article
                className={`card p-6 ${selectedId === course.id ? "border-[var(--accent)]" : ""}`}
                key={course.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      {course.isSystem && (
                        <span className="eyebrow">Official</span>
                      )}
                      {!course.isPublic && (
                        <span className="eyebrow">Private</span>
                      )}
                    </div>
                    <h2 className="mt-2 text-xl font-bold">{course.title}</h2>
                    <p className="muted mt-1 text-xs">
                      by {course.creator?.name ?? "Daily Smarter"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 font-bold">
                    <Star
                      size={17}
                      fill="currentColor"
                      className="text-[var(--accent)]"
                    />
                    {course.ratings.length ? course.average.toFixed(1) : "New"}
                  </div>
                </div>
                <p className="muted mt-5 line-clamp-3 text-sm leading-6">
                  {course.description}
                </p>
                <div className="muted mt-5 flex items-center gap-4 text-xs">
                  <span className="capitalize">
                    {course.defaultDifficulty.toLowerCase()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={14} /> {course._count.selectedBy} learners
                  </span>
                  <span>{course.ratings.length} ratings</span>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  {selectedId === course.id ? (
                    <span className="btn btn-secondary !min-h-10 text-sm">
                      <Check size={15} /> Current course
                    </span>
                  ) : (
                    <form action={selectCourseAction.bind(null, course.id)}>
                      <SubmitButton
                        className="btn !min-h-10 text-sm"
                        pendingLabel="Selecting…"
                      >
                        Use course
                      </SubmitButton>
                    </form>
                  )}
                  {own && !course.isSystem && (
                    <>
                      <Link
                        className="btn btn-secondary !min-h-10 !px-3"
                        href={`/app/courses/${course.id}/edit`}
                        aria-label={`Edit ${course.title}`}
                      >
                        <Edit3 size={15} />
                      </Link>
                      <form action={deleteCourseAction.bind(null, course.id)}>
                        <SubmitButton
                          className="btn btn-secondary !min-h-10 !px-3"
                          pendingLabel="…"
                        >
                          <Trash2 size={15} />
                          <span className="sr-only">Delete {course.title}</span>
                        </SubmitButton>
                      </form>
                    </>
                  )}
                </div>
                {course.isPublic && (
                  <form
                    action={rateCourseAction.bind(null, course.id)}
                    className="mt-5 flex items-center gap-2 border-t border-[var(--line)] pt-5"
                  >
                    <label
                      className="muted text-xs font-bold"
                      htmlFor={`score-${course.id}`}
                    >
                      Your rating
                    </label>
                    <select
                      className="input !min-h-9 !w-24 !py-1"
                      id={`score-${course.id}`}
                      name="score"
                      defaultValue={userScore ?? 5}
                    >
                      {[5, 4, 3, 2, 1].map((score) => (
                        <option key={score} value={score}>
                          {score} ★
                        </option>
                      ))}
                    </select>
                    <button
                      className="text-xs font-bold text-[var(--accent)]"
                      type="submit"
                    >
                      Save
                    </button>
                  </form>
                )}
              </article>
            );
          })}
        </section>
      ) : (
        <div className="card mt-8 p-10 text-center">
          <h2 className="text-xl font-bold">No courses match these filters.</h2>
          <p className="muted mt-2">
            Lower the minimum rating or create a focused course of your own.
          </p>
        </div>
      )}
    </div>
  );
}
