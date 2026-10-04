import { describe, expect, it } from "vitest";
import { scoreQuizAnswer } from "@/lib/quiz";

describe("scoreQuizAnswer", () => {
  it("scores against the server-held correct index", () => {
    expect(scoreQuizAnswer(2, 2)).toBe(true);
    expect(scoreQuizAnswer(2, 1)).toBe(false);
  });
  it("rejects out-of-contract options", () => {
    expect(() => scoreQuizAnswer(2, 4)).toThrow("Invalid answer");
  });
});
