import { previousIsoDate } from "@/lib/dates";

export function StreakCalendar({
  dates,
  today,
}: {
  dates: string[];
  today: string;
}) {
  const completed = new Set(dates);
  const days: string[] = [];
  let cursor = today;
  for (let i = 0; i < 98; i += 1) {
    days.unshift(cursor);
    cursor = previousIsoDate(cursor);
  }
  return (
    <div>
      <div
        className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto pb-2"
        aria-label="Completion calendar"
      >
        {days.map((date) => (
          <span
            key={date}
            title={`${date}${completed.has(date) ? ": completed" : ""}`}
            aria-label={`${date}${completed.has(date) ? ", lesson completed" : ""}`}
            className={`size-3.5 rounded-[3px] ${completed.has(date) ? "bg-[var(--accent)]" : "bg-[var(--surface-2)]"}`}
          />
        ))}
      </div>
      <div className="muted mt-3 flex items-center justify-end gap-2 text-xs">
        <span>Less</span>
        <span className="size-3 rounded-[3px] bg-[var(--surface-2)]" />
        <span className="size-3 rounded-[3px] bg-[var(--accent)]" />
        <span>Completed</span>
      </div>
    </div>
  );
}
