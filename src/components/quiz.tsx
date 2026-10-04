"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Flame } from "lucide-react";
import { submitQuizAction } from "@/actions/lessons";

type Result = { correct: boolean; correctIndex: number; explanation: string };

export function Quiz({
  lessonId,
  options,
  previous,
  streak,
}: {
  lessonId: string;
  options: string[];
  previous?: { selectedIndex: number; correct: boolean };
  streak: number;
}) {
  const [selected, setSelected] = useState<number | null>(
    previous?.selectedIndex ?? null,
  );
  const [result, setResult] = useState<Result | null>(
    previous
      ? {
          correct: previous.correct,
          correctIndex: previous.correct ? previous.selectedIndex : -1,
          explanation: "This lesson is already complete.",
        }
      : null,
  );
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  function submit() {
    if (selected === null || result) return;
    setError("");
    startTransition(async () => {
      try {
        setResult(await submitQuizAction(lessonId, selected));
        if (navigator.vibrate) navigator.vibrate(30);
      } catch {
        setError("We could not save your answer. Please try again.");
      }
    });
  }
  if (result)
    return (
      <div className="enter mt-10">
        <div
          className={`rounded-2xl border p-6 ${result.correct ? "border-[var(--accent)] bg-[var(--accent-2)]" : "border-[var(--line)] bg-[var(--surface-2)]"}`}
        >
          <p className="text-xl font-bold">
            {result.correct ? "Correct." : "Not quite."}
          </p>
          {!result.correct && result.correctIndex >= 0 && (
            <p className="mt-3 font-bold">
              The correct answer is: {options[result.correctIndex]}
            </p>
          )}
          <p className="mt-3 leading-7">{result.explanation}</p>
        </div>
        <div className="mt-12 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-[var(--accent-2)] text-[var(--accent)]">
            <Check size={30} strokeWidth={3} />
          </div>
          <h2 className="display mt-5 text-4xl">Lesson complete</h2>
          <div className="mt-5 inline-flex items-center gap-2">
            <Flame className="flame text-[var(--accent)]" fill="currentColor" />
            <strong>{streak} day streak</strong>
          </div>
          <p className="muted mx-auto mt-4 max-w-md">
            Tomorrow we&apos;ll continue building your understanding.
          </p>
          <Link className="btn mt-7" href="/app">
            <ArrowLeft size={17} /> Back to dashboard
          </Link>
        </div>
      </div>
    );
  return (
    <div
      className="mt-8 grid gap-3"
      role="radiogroup"
      aria-label="Quiz answers"
    >
      {options.map((option, index) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={selected === index}
          onClick={() => setSelected(index)}
          className={`flex min-h-14 items-center gap-4 rounded-xl border p-4 text-left transition-colors ${selected === index ? "border-[var(--accent)] bg-[var(--accent-2)]" : "border-[var(--line)] hover:bg-[var(--surface-2)]"}`}
        >
          <span
            className={`grid size-6 shrink-0 place-items-center rounded-full border ${selected === index ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--bg)]" : "border-[var(--muted)]"}`}
          >
            {selected === index && (
              <span className="size-2 rounded-full bg-current" />
            )}
          </span>
          <span>{option}</span>
        </button>
      ))}
      {error && (
        <p role="alert" className="text-sm text-[var(--danger)]">
          {error}
        </p>
      )}
      <button
        className="btn mt-3 justify-self-start"
        type="button"
        disabled={selected === null || pending}
        onClick={submit}
      >
        {pending ? "Checking…" : "Check answer"}
      </button>
    </div>
  );
}
