import {
  Activity,
  BookOpen,
  CheckCircle2,
  Flame,
  Library,
  Users,
} from "lucide-react";
import { db } from "@/lib/db";

export const metadata = { title: "Admin overview" };

export default async function AdminDashboard() {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const week = new Date(start);
  week.setUTCDate(week.getUTCDate() - 7);
  const [users, activeUsers, generated, completed, courses, completions] =
    await Promise.all([
      db.user.count(),
      db.user.count({
        where: { completions: { some: { completedAt: { gte: week } } } },
      }),
      db.dailyLesson.count({ where: { generatedAt: { gte: start } } }),
      db.lessonCompletion.count({ where: { completedAt: { gte: start } } }),
      db.course.count(),
      db.lessonCompletion.groupBy({ by: ["userId"], _count: true }),
    ]);
  const average = completions.length
    ? (
        completions.reduce((sum, item) => sum + item._count, 0) /
        completions.length
      ).toFixed(1)
    : "0";
  const cards = [
    [Users, "Users", users],
    [Activity, "Active this week", activeUsers],
    [BookOpen, "Imported today", generated],
    [CheckCircle2, "Completed today", completed],
    [Flame, "Avg. completions", average],
    [Library, "Community courses", courses],
  ] as const;
  return (
    <div>
      <header>
        <p className="eyebrow">Operations</p>
        <h1 className="display mt-3 text-5xl">Admin overview</h1>
      </header>
      <section className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([Icon, label, value]) => (
          <div className="bg-[var(--surface)] p-5" key={label}>
            <Icon className="text-[var(--accent)]" size={18} />
            <strong className="display mt-7 block text-3xl">{value}</strong>
            <span className="muted text-xs">{label}</span>
          </div>
        ))}
      </section>
      <section className="card mt-8 p-6">
        <h2 className="font-bold">No shared API billing required</h2>
        <p className="muted mt-2 max-w-2xl text-sm leading-6">
          Learners now generate a private, curriculum-aware prompt and use it
          with their own ChatGPT or preferred LLM account. The server validates
          and imports the response without receiving or storing their external
          account credentials.
        </p>
      </section>
    </div>
  );
}
