import { describe, expect, it } from "vitest";
import { lessonSchema } from "@/services/ai/lesson-schema";
import { validLesson } from "../fixtures/lessons";

describe("lessonSchema", () => {
  it("accepts the fixed contract", () => {
    expect(lessonSchema.parse(validLesson).topic_key).toBe(
      "direct_memory_access",
    );
  });
  it("rejects malformed topic keys and a non-four-choice quiz", () => {
    const invalid = {
      ...validLesson,
      topic_key: "DMA today!",
      quiz: { ...validLesson.quiz, options: ["one", "two"] },
    };
    expect(lessonSchema.safeParse(invalid).success).toBe(false);
  });
  it("caps lesson reading time", () => {
    expect(
      lessonSchema.safeParse({ ...validLesson, estimated_reading_minutes: 25 })
        .success,
    ).toBe(false);
  });
  it("rejects unexpected fields", () => {
    expect(
      lessonSchema.safeParse({ ...validLesson, extra_section: "not allowed" })
        .success,
    ).toBe(false);
  });
});
