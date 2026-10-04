import { lessonSchema } from "@/services/ai/lesson-schema";

export function parsePastedLesson(value: string) {
  let content = value.trim();
  const fenced = content.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenced) content = fenced[1];
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error(
      "The response is not valid JSON. Ask the LLM to return only the JSON object.",
    );
  }
  const result = lessonSchema.safeParse(parsed);
  if (!result.success) {
    const issue = result.error.issues[0];
    const field = issue.path.length ? issue.path.join(".") : "response";
    throw new Error(`Invalid ${field}: ${issue.message}`);
  }
  return result.data;
}
