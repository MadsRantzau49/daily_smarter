"use client";

import { useActionState, useState } from "react";
import { Check, Clipboard, ExternalLink } from "lucide-react";
import { importLessonResponseAction } from "@/actions/manual-lessons";
import { SubmitButton } from "@/components/submit-button";
import { initialActionState } from "@/lib/action-state";

export function ManualLessonCreator({
  prompt,
  courseTitle,
}: {
  prompt: string;
  courseTitle: string;
}) {
  const [state, action] = useActionState(
    importLessonResponseAction,
    initialActionState,
  );
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyError(false);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError(true);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <header className="max-w-2xl">
        <p className="eyebrow">Today&apos;s lesson · {courseTitle}</p>
        <h1 className="display mt-4 text-5xl sm:text-6xl">
          Bring your own AI.
        </h1>
        <p className="muted mt-5 text-lg leading-8">
          Your learning history is already included. Copy the prompt, send it to
          ChatGPT or another capable LLM, then paste its JSON response here.
        </p>
      </header>

      <ol className="mt-10 grid gap-6">
        <li className="card p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-sm font-black text-[var(--bg)]">
              1
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold">Copy your lesson prompt</h2>
              <p className="muted mt-2 text-sm leading-6">
                It contains the selected course, your level, recent topics, weak
                areas, and the exact required JSON contract.
              </p>
              <textarea
                className="input mt-5 h-48 font-mono text-xs leading-5"
                value={prompt}
                readOnly
                aria-label="Generated lesson prompt"
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <button className="btn" type="button" onClick={copyPrompt}>
                  {copied ? <Check size={17} /> : <Clipboard size={17} />}
                  {copied ? "Copied" : "Copy prompt"}
                </button>
                <a
                  className="btn btn-secondary"
                  href="https://chatgpt.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open ChatGPT <ExternalLink size={15} />
                </a>
              </div>
              {copyError && (
                <p className="muted mt-3 text-xs" role="status">
                  Clipboard access is unavailable. Select the prompt text above
                  and copy it manually.
                </p>
              )}
            </div>
          </div>
        </li>

        <li className="card p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-sm font-black text-[var(--bg)]">
              2
            </span>
            <div>
              <h2 className="text-lg font-bold">Generate the response</h2>
              <p className="muted mt-2 text-sm leading-6">
                Send the prompt without changing it. The model should return one
                JSON object with no commentary. Markdown JSON fences are also
                accepted.
              </p>
            </div>
          </div>
        </li>

        <li className="card p-6 sm:p-8">
          <form action={action} className="flex items-start gap-4">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-sm font-black text-[var(--bg)]">
              3
            </span>
            <div className="min-w-0 flex-1">
              <label className="text-lg font-bold" htmlFor="response">
                Paste and validate the lesson
              </label>
              <p className="muted mt-2 text-sm leading-6">
                The app checks every field, all four quiz options, reading
                length, topic keys, and answer index before saving anything.
              </p>
              <textarea
                className="input mt-5 min-h-80 font-mono text-xs leading-5"
                id="response"
                name="response"
                required
                placeholder={'{"title":"...","topic_key":"..."}'}
              />
              {state.error && (
                <p
                  className="mt-4 text-sm font-bold text-[var(--danger)]"
                  role="alert"
                >
                  {state.error}
                </p>
              )}
              <SubmitButton
                className="btn mt-4"
                pendingLabel="Validating lesson…"
              >
                Validate and create lesson
              </SubmitButton>
            </div>
          </form>
        </li>
      </ol>
    </div>
  );
}
