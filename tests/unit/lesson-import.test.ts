import { describe, expect, it } from "vitest";
import { parsePastedLesson } from "@/lib/lesson-import";
import { validLesson } from "../fixtures/lessons";

describe("parsePastedLesson", () => {
  it("accepts raw JSON and common JSON code fences", () => {
    const json = JSON.stringify(validLesson);
    expect(parsePastedLesson(json).topic_key).toBe("direct_memory_access");
    expect(parsePastedLesson(`\`\`\`json\n${json}\n\`\`\``).title).toBe(
      validLesson.title,
    );
  });

  it("rejects commentary wrapped around otherwise valid JSON", () => {
    expect(() =>
      parsePastedLesson(`Here you go: ${JSON.stringify(validLesson)}`),
    ).toThrow("not valid JSON");
  });

  it("returns the failing contract path", () => {
    const invalid = {
      ...validLesson,
      quiz: { ...validLesson.quiz, correct_option: 8 },
    };
    expect(() => parsePastedLesson(JSON.stringify(invalid))).toThrow(
      "quiz.correct_option",
    );
  });
});
