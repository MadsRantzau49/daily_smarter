import { Clock3 } from "lucide-react";
import { z } from "zod";
import type { PublicLesson } from "@/services/lessons/lesson-service";
import { Quiz } from "@/components/quiz";

const keyTermsSchema = z.array(
  z.object({ term: z.string(), definition: z.string() }),
);
const stringArraySchema = z.array(z.string());

export function LessonView({
  lesson,
  streak,
}: {
  lesson: PublicLesson;
  streak: number;
}) {
  const terms = keyTermsSchema.safeParse(lesson.keyTerms).data ?? [];
  const options = stringArraySchema.safeParse(lesson.quizOptions).data ?? [];
  return (
    <article className="mx-auto max-w-3xl pb-20">
      <header className="border-b border-[var(--line)] pb-10">
        <p className="eyebrow">Today · {lesson.difficulty?.toLowerCase()}</p>
        <h1 className="display mt-5 text-5xl leading-[1.05] sm:text-6xl">
          {lesson.title}
        </h1>
        <p className="muted mt-6 text-xl leading-8">{lesson.introduction}</p>
        <div className="muted mt-6 flex items-center gap-2 text-sm">
          <Clock3 size={16} /> {lesson.estimatedReadingMinutes} minute read
        </div>
      </header>
      <div className="grid gap-14 py-12">
        {[
          ["The concept", lesson.concept],
          ["How it works", lesson.howItWorks],
          ["Why it matters", lesson.whyItMatters],
          ["A concrete example", lesson.concreteExample],
        ].map(([title, body]) => (
          <section key={title}>
            <p className="eyebrow mb-4">{title}</p>
            <div className="prose-reading">
              <p>{body}</p>
            </div>
          </section>
        ))}
        <section>
          <p className="eyebrow mb-5">Key terms</p>
          <dl className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {terms.map((term) => (
              <div
                key={term.term}
                className="grid gap-2 py-5 sm:grid-cols-[150px_1fr]"
              >
                <dt className="font-bold">{term.term}</dt>
                <dd className="muted leading-7">{term.definition}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
      <section className="card p-6 sm:p-9">
        <p className="eyebrow">Check your understanding</p>
        <h2 className="mt-5 text-xl font-bold leading-8">
          {lesson.quizQuestion}
        </h2>
        <Quiz
          lessonId={lesson.id}
          options={options}
          previous={lesson.quizAttempts[0]}
          streak={streak + (lesson.completion ? 0 : 1)}
        />
      </section>
    </article>
  );
}
