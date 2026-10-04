"use client";

import { useActionState } from "react";
import { saveLearningConfigAction } from "@/actions/admin";
import { SubmitButton } from "@/components/submit-button";
import { initialActionState } from "@/lib/action-state";

type Config = {
  domain: string;
  guidance: string;
  emphasizedTopics: unknown;
  avoidedTopics: unknown;
  defaultDifficulty: string;
  explanationLength: string;
  teachingStyle: string;
  additionalGuidance: string | null;
  version: number;
};
const list = (value: unknown) =>
  Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .join("\n")
    : "";

export function ConfigForm({ config }: { config: Config }) {
  const [state, action] = useActionState(
    saveLearningConfigAction,
    initialActionState,
  );
  return (
    <form action={action} className="grid gap-7">
      <div className="field">
        <label htmlFor="domain">Learning domain</label>
        <input
          className="input"
          id="domain"
          name="domain"
          defaultValue={config.domain}
          maxLength={150}
          required
        />
        <span className="muted text-xs">
          The subject future lessons will follow.
        </span>
      </div>
      <div className="field">
        <label htmlFor="guidance">Domain description and topic guidance</label>
        <textarea
          className="input min-h-64"
          id="guidance"
          name="guidance"
          defaultValue={config.guidance}
          maxLength={5000}
          required
        />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="emphasizedTopics">Topics to emphasize</label>
          <textarea
            className="input"
            id="emphasizedTopics"
            name="emphasizedTopics"
            defaultValue={list(config.emphasizedTopics)}
            placeholder="One per line"
            maxLength={1000}
          />
        </div>
        <div className="field">
          <label htmlFor="avoidedTopics">Topics to avoid</label>
          <textarea
            className="input"
            id="avoidedTopics"
            name="avoidedTopics"
            defaultValue={list(config.avoidedTopics)}
            placeholder="Optional, one per line"
            maxLength={1000}
          />
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="field">
          <label htmlFor="defaultDifficulty">Default difficulty</label>
          <select
            className="input"
            id="defaultDifficulty"
            name="defaultDifficulty"
            defaultValue={config.defaultDifficulty}
          >
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="explanationLength">Explanation length</label>
          <select
            className="input"
            id="explanationLength"
            name="explanationLength"
            defaultValue={config.explanationLength}
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
            defaultValue={config.teachingStyle}
          >
            <option value="BEGINNER_FRIENDLY">Very beginner friendly</option>
            <option value="BALANCED">Balanced</option>
            <option value="TECHNICAL">Technical</option>
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="additionalGuidance">Additional teaching guidance</label>
        <textarea
          className="input"
          id="additionalGuidance"
          name="additionalGuidance"
          defaultValue={config.additionalGuidance ?? ""}
          maxLength={500}
          placeholder="For example: Use more analogies."
        />
        <span className="muted text-xs">
          Limited to 500 characters. This cannot override the protected lesson
          structure or core prompt.
        </span>
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-[var(--danger)]">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-sm text-[var(--accent)]">
          {state.success}
        </p>
      )}
      <div className="flex items-center gap-4">
        <SubmitButton pendingLabel="Activating…">
          Create and activate version {config.version + 1}
        </SubmitButton>
        <span className="muted text-xs">Existing lessons stay unchanged.</span>
      </div>
    </form>
  );
}
