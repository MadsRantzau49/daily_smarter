import { describe, expect, it } from "vitest";
import { isValidTimezone, localDate, localTime } from "@/lib/dates";

describe("local calendar calculations", () => {
  it("uses the user's calendar date rather than UTC", () => {
    const instant = new Date("2026-10-03T23:30:00Z");
    expect(localDate(instant, "Europe/Copenhagen")).toBe("2026-10-04");
    expect(localDate(instant, "America/New_York")).toBe("2026-10-03");
  });
  it("returns a due-time comparable 24-hour value", () => {
    expect(
      localTime(new Date("2026-10-04T06:15:00Z"), "Europe/Copenhagen"),
    ).toBe("08:15");
  });
  it("rejects unknown timezones", () => {
    expect(isValidTimezone("Mars/Olympus_Mons")).toBe(false);
  });
});
