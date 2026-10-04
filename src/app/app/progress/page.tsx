import { Award, Brain, Clock3, Flame, Target } from "lucide-react";
import { StreakCalendar } from "@/components/streak-calendar";
import { requireUser } from "@/lib/auth";
import { localDate } from "@/lib/dates";
import { getUserStats } from "@/services/lessons/lesson-service";

export const metadata = { title: "Progress" };

export default async function ProgressPage() {
  const user = await requireUser();
  const timezone = user.settings?.timezone ?? "UTC";
  const stats = await getUserStats(user.id, timezone);
  const items = [
    [Flame, "Current streak", stats.current, "days"],
    [Award, "Longest streak", stats.longest, "days"],
    [Brain, "Lessons completed", stats.total, "lessons"],
    [Target, "Quiz accuracy", stats.accuracy, "percent"],
    [Clock3, "Minutes learned", stats.minutes, "minutes"],
  ] as const;
  return (
    <div>
      <header>
        <p className="eyebrow">Your momentum</p>
        <h1 className="display mt-3 text-6xl">Progress</h1>
        <p className="muted mt-4">
          A clear view of the work you have actually done.
        </p>
      </header>
      <section className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-5">
        {items.map(([Icon, label, value, unit]) => (
          <div key={label} className="bg-[var(--surface)] p-6">
            <Icon size={19} className="text-[var(--accent)]" />
            <strong className="display mt-8 block text-4xl">
              {value}
              {unit === "percent" ? "%" : ""}
            </strong>
            <span className="muted mt-1 block text-xs">{label}</span>
          </div>
        ))}
      </section>
      <section className="card mt-8 p-6 sm:p-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="eyebrow">Last 14 weeks</p>
            <h2 className="mt-2 text-xl font-bold">Learning rhythm</h2>
          </div>
          <p className="muted text-sm">{stats.topics} topics explored</p>
        </div>
        {stats.total ? (
          <StreakCalendar
            dates={stats.dates}
            today={localDate(new Date(), timezone)}
          />
        ) : (
          <div className="rounded-xl bg-[var(--surface-2)] p-8 text-center">
            <p className="font-bold">Your calendar starts with one lesson.</p>
            <p className="muted mt-2 text-sm">
              Complete today&apos;s concept to make the first mark.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
