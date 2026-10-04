import { describe, expect, it } from "vitest";
import { calculateStreaks } from "@/lib/streaks";

describe("calculateStreaks", () => {
  it("reconstructs current and longest streaks from unordered records", () => {
    expect(
      calculateStreaks(
        ["2026-10-04", "2026-10-02", "2026-10-03", "2026-09-20"],
        "2026-10-04",
      ),
    ).toEqual({ current: 3, longest: 3, total: 4 });
  });
  it("keeps yesterday's streak alive before today's completion", () => {
    expect(
      calculateStreaks(["2026-10-03", "2026-10-02"], "2026-10-04").current,
    ).toBe(2);
  });
  it("deduplicates dates and expires an old streak", () => {
    expect(
      calculateStreaks(["2026-10-01", "2026-10-01"], "2026-10-04"),
    ).toEqual({ current: 0, longest: 1, total: 1 });
  });
});
