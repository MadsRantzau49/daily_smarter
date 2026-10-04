import { describe, expect, it } from "vitest";
import { courseRating } from "@/lib/course-rating";

describe("courseRating", () => {
  it("returns an average without inventing a rating for new courses", () => {
    expect(courseRating([])).toBe(0);
    expect(courseRating([{ score: 5 }, { score: 4 }, { score: 3 }])).toBe(4);
  });
});
