import { previousIsoDate } from "@/lib/dates";

export type StreakStats = {
  current: number;
  longest: number;
  total: number;
};

export function calculateStreaks(
  completionDates: string[],
  today: string,
): StreakStats {
  const dates = [...new Set(completionDates)].sort().reverse();
  if (!dates.length) return { current: 0, longest: 0, total: 0 };

  let longest = 1;
  let run = 1;
  for (let index = 1; index < dates.length; index += 1) {
    if (previousIsoDate(dates[index - 1]) === dates[index]) run += 1;
    else run = 1;
    longest = Math.max(longest, run);
  }

  const startsCurrent =
    dates[0] === today || dates[0] === previousIsoDate(today);
  let current = startsCurrent ? 1 : 0;
  if (startsCurrent) {
    for (let index = 1; index < dates.length; index += 1) {
      if (previousIsoDate(dates[index - 1]) !== dates[index]) break;
      current += 1;
    }
  }

  return { current, longest, total: dates.length };
}
