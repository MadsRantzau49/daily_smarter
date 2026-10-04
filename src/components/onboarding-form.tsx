"use client";

import { useActionState, useEffect, useState } from "react";
import { Bell, Check, ChevronRight } from "lucide-react";
import { completeOnboardingAction } from "@/actions/settings";
import { initialActionState } from "@/lib/action-state";
import { SubmitButton } from "@/components/submit-button";

export function OnboardingForm({
  initialTimezone,
}: {
  initialTimezone: string;
}) {
  const [step, setStep] = useState(0);
  const [timezone, setTimezone] = useState(initialTimezone);
  const [difficulty, setDifficulty] = useState("BEGINNER");
  const [notificationTime, setNotificationTime] = useState("08:00");
  const [state, action] = useActionState(
    completeOnboardingAction,
    initialActionState,
  );
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setTimezone(
          Intl.DateTimeFormat().resolvedOptions().timeZone || initialTimezone,
        );
      } catch {}
    }, 0);
    return () => window.clearTimeout(timer);
  }, [initialTimezone]);
  const screens = [
    <div key="welcome">
      <p className="eyebrow">Welcome</p>
      <h1 className="display mt-5 text-5xl">A useful idea, every day.</h1>
      <p className="muted mt-5 text-lg leading-8">
        Learn one concept in less than ten minutes. Each lesson connects to what
        came before.
      </p>
    </div>,
    <div key="track">
      <p className="eyebrow">Your learning track</p>
      <h2 className="display mt-5 text-5xl">Low-level computing</h2>
      <p className="muted mt-5 text-lg leading-8">
        Start with physical foundations and gradually work upward through
        processors, memory, buses, firmware, and systems.
      </p>
      <div className="mt-8 rounded-2xl bg-[var(--surface-2)] p-5 text-sm font-bold">
        The curriculum adapts as you learn.
      </div>
    </div>,
    <div key="level">
      <p className="eyebrow">Your experience</p>
      <h2 className="display mt-5 text-5xl">Where should we begin?</h2>
      <div className="mt-8 grid gap-3">
        {["BEGINNER", "INTERMEDIATE", "ADVANCED"].map((level, index) => (
          <label
            key={level}
            className="flex cursor-pointer items-center gap-4 rounded-2xl border border-[var(--line)] p-4 has-[:checked]:border-[var(--accent)] has-[:checked]:bg-[var(--accent-2)]"
          >
            <input
              type="radio"
              value={level}
              checked={difficulty === level}
              onChange={() => setDifficulty(level)}
            />
            <span>
              <strong className="block capitalize">
                {level.toLowerCase()}
              </strong>
              <span className="muted text-sm">
                {index === 0
                  ? "No specialist knowledge assumed"
                  : index === 1
                    ? "Comfortable with core concepts"
                    : "Ready for deeper technical detail"}
              </span>
            </span>
          </label>
        ))}
      </div>
    </div>,
    <div key="time">
      <p className="eyebrow">Your daily rhythm</p>
      <h2 className="display mt-5 text-5xl">When should we remind you?</h2>
      <div className="mt-8 grid gap-5">
        <div className="field">
          <label htmlFor="notificationTimeInput">Reminder time</label>
          <input
            className="input"
            id="notificationTimeInput"
            type="time"
            value={notificationTime}
            onChange={(event) => setNotificationTime(event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="timezoneInput">Timezone</label>
          <input
            className="input"
            id="timezoneInput"
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
          />
        </div>
      </div>
    </div>,
    <div key="push">
      <Bell size={34} className="text-[var(--accent)]" />
      <p className="eyebrow mt-8">Stay consistent</p>
      <h2 className="display mt-5 text-5xl">
        A reminder when your lesson is ready.
      </h2>
      <p className="muted mt-5 text-lg leading-8">
        You can enable browser notifications from Settings after onboarding. We
        will only ask permission when you choose to enable them.
      </p>
      <div className="mt-8 flex items-center gap-3 text-sm">
        <span className="grid size-7 place-items-center rounded-full bg-[var(--accent-2)]">
          <Check size={15} />
        </span>
        No surprise permission popups
      </div>
    </div>,
  ];
  return (
    <form
      action={action}
      className="card min-h-[580px] p-7 shadow-[var(--shadow)] sm:p-12"
    >
      <input type="hidden" name="theme" value="SYSTEM" />
      <input type="hidden" name="difficulty" value={difficulty} />
      <input type="hidden" name="notificationTime" value={notificationTime} />
      <input type="hidden" name="timezone" value={timezone} />
      {screens[step]}
      <div className="mt-12 flex items-center justify-between">
        <div
          className="flex gap-2"
          aria-label={`Step ${step + 1} of ${screens.length}`}
        >
          {screens.map((_, index) => (
            <span
              key={index}
              className={`h-1.5 rounded-full transition-all ${index === step ? "w-8 bg-[var(--accent)]" : "w-2 bg-[var(--line)]"}`}
            />
          ))}
        </div>
        {step < screens.length - 1 ? (
          <button
            type="button"
            className="btn"
            onClick={() => setStep(step + 1)}
          >
            Continue <ChevronRight size={17} />
          </button>
        ) : (
          <SubmitButton pendingLabel="Setting up…">Start learning</SubmitButton>
        )}
      </div>
      {state.error && (
        <p role="alert" className="mt-4 text-sm text-[var(--danger)]">
          {state.error}
        </p>
      )}
    </form>
  );
}
