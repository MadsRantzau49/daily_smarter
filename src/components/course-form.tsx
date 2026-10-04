"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/action-state";
import { initialActionState } from "@/lib/action-state";
import { SubmitButton } from "@/components/submit-button";

type CourseInput = {
  title: string;
  description: string;
  domain: string;
  guidance: string;
  emphasizedTopics: unknown;
  avoidedTopics: unknown;
  defaultDifficulty: string;
  explanationLength: string;
  teachingStyle: string;
  additionalGuidance: string | null;
  isPublic: boolean;
};

const list = (value: unknown) =>
  Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .join("\n")
    : "";

export function CourseForm({
  action,
  course,
}: {
  action: (state: ActionState, data: FormData) => Promise<ActionState>;
  course?: CourseInput;
}) {
  const [state, formAction] = useActionState(action, initialActionState);
  return (
    <form action={formAction} className="grid gap-7">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="title">Course name</label>
          <input
            className="input"
            id="title"
            name="title"
            defaultValue={course?.title}
            required
            maxLength={100}
            placeholder="Databases from first principles"
          />
        </div>
        <div className="field">
          <label htmlFor="domain">Learning domain</label>
          <input
            className="input"
            id="domain"
            name="domain"
            defaultValue={course?.domain}
            required
            maxLength={150}
            placeholder="Databases and distributed systems"
          />
        </div>
      </div>
      <div className="field">
        <label htmlFor="description">Short description</label>
        <textarea
          className="input !min-h-24"
          id="description"
          name="description"
          defaultValue={course?.description}
          required
          maxLength={500}
          placeholder="Tell learners what this course builds toward."
        />
      </div>
      <div className="field">
        <label htmlFor="guidance">Curriculum guidance</label>
        <textarea
          className="input min-h-64"
          id="guidance"
          name="guidance"
          defaultValue={course?.guidance}
          required
          maxLength={5000}
          placeholder="Describe the concepts, progression, prerequisites, and practical emphasis."
        />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="emphasizedTopics">Topics to emphasize</label>
          <textarea
            className="input"
            id="emphasizedTopics"
            name="emphasizedTopics"
            defaultValue={list(course?.emphasizedTopics)}
            maxLength={1000}
            placeholder="One topic per line"
          />
        </div>
        <div className="field">
          <label htmlFor="avoidedTopics">Topics to avoid</label>
          <textarea
            className="input"
            id="avoidedTopics"
            name="avoidedTopics"
            defaultValue={list(course?.avoidedTopics)}
            maxLength={1000}
            placeholder="Optional, one topic per line"
          />
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="field">
          <label htmlFor="defaultDifficulty">Default level</label>
          <select
            className="input"
            id="defaultDifficulty"
            name="defaultDifficulty"
            defaultValue={course?.defaultDifficulty ?? "BEGINNER"}
          >
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="explanationLength">Lesson length</label>
          <select
            className="input"
            id="explanationLength"
            name="explanationLength"
            defaultValue={course?.explanationLength ?? "NORMAL"}
          >
            <option value="SHORT">Short · 3–5 min</option>
            <option value="NORMAL">Normal · 5–8 min</option>
            <option value="LONG">Long · 8–10 min</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="teachingStyle">Teaching style</label>
          <select
            className="input"
            id="teachingStyle"
            name="teachingStyle"
            defaultValue={course?.teachingStyle ?? "BEGINNER_FRIENDLY"}
          >
            <option value="BEGINNER_FRIENDLY">Beginner friendly</option>
            <option value="BALANCED">Balanced</option>
            <option value="TECHNICAL">Technical</option>
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="additionalGuidance">Additional guidance</label>
        <textarea
          className="input !min-h-24"
          id="additionalGuidance"
          name="additionalGuidance"
          defaultValue={course?.additionalGuidance ?? ""}
          maxLength={500}
          placeholder="Use more analogies or practical examples."
        />
        <span className="muted text-xs">
          Course text cannot override the fixed lesson schema or protected
          prompt rules.
        </span>
      </div>
      <label className="flex items-start gap-3 rounded-xl border border-[var(--line)] p-4">
        <input
          className="mt-1"
          type="checkbox"
          name="isPublic"
          defaultChecked={course?.isPublic ?? true}
        />
        <span>
          <strong className="block text-sm">List this course publicly</strong>
          <span className="muted text-xs">
            Other learners can select and rate it.
          </span>
        </span>
      </label>
      {state.error && (
        <p className="text-sm font-bold text-[var(--danger)]" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm font-bold text-[var(--accent)]" role="status">
          {state.success}
        </p>
      )}
      <SubmitButton
        className="btn justify-self-start"
        pendingLabel="Saving course…"
      >
        {course ? "Save changes" : "Create and use course"}
      </SubmitButton>
    </form>
  );
}
