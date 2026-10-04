import { z } from "zod";

const text = z.string().trim().min(20).max(5000);
const topicKey = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/);

export const lessonSchema = z
  .object({
    title: z.string().trim().min(5).max(140),
    topic_key: topicKey,
    difficulty: z.enum(["beginner", "intermediate", "advanced"]),
    estimated_reading_minutes: z.number().int().min(3).max(10),
    introduction: text.max(800),
    concept: text,
    how_it_works: text,
    why_it_matters: text,
    concrete_example: text,
    key_terms: z
      .array(
        z
          .object({
            term: z.string().trim().min(1).max(80),
            definition: z.string().trim().min(5).max(500),
          })
          .strict(),
      )
      .min(3)
      .max(5),
    quiz: z
      .object({
        question: z.string().trim().min(10).max(500),
        options: z.array(z.string().trim().min(1).max(300)).length(4),
        correct_option: z.number().int().min(0).max(3),
        explanation: z.string().trim().min(10).max(1200),
      })
      .strict(),
    prerequisite_topics: z.array(topicKey).max(8),
    related_topics: z.array(topicKey).min(1).max(8),
  })
  .strict();

export type GeneratedLesson = z.infer<typeof lessonSchema>;
