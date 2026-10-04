"use client";

import { useActionState, useEffect } from "react";
import { updateSettingsAction } from "@/actions/settings";
import { SubmitButton } from "@/components/submit-button";
import { initialActionState } from "@/lib/action-state";

type Settings = {
  timezone: string;
  notificationTime: string;
  difficulty: string;
  theme: string;
};

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, action] = useActionState(
    updateSettingsAction,
    initialActionState,
  );
  useEffect(() => {
    const form = document.querySelector<HTMLFormElement>("#settings-form");
    const listener = () => {
      const theme = new FormData(form!).get("theme") as string;
      localStorage.setItem("theme", theme);
      if (theme === "SYSTEM") delete document.documentElement.dataset.theme;
      else document.documentElement.dataset.theme = theme.toLowerCase();
    };
    form?.addEventListener("change", listener);
    return () => form?.removeEventListener("change", listener);
  }, []);
  return (
    <form id="settings-form" action={action} className="grid gap-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="timezone">Timezone</label>
          <input
            className="input"
            id="timezone"
            name="timezone"
            defaultValue={settings.timezone}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="notificationTime">Daily reminder</label>
          <input
            className="input"
            id="notificationTime"
            name="notificationTime"
            type="time"
            defaultValue={settings.notificationTime}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="difficulty">Experience level</label>
          <select
            className="input"
            id="difficulty"
            name="difficulty"
            defaultValue={settings.difficulty}
          >
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="theme">Appearance</label>
          <select
            className="input"
            id="theme"
            name="theme"
            defaultValue={settings.theme}
          >
            <option value="SYSTEM">System</option>
            <option value="LIGHT">Light</option>
            <option value="DARK">Dark</option>
          </select>
        </div>
      </div>
      {state.error && (
        <p className="text-sm text-[var(--danger)]">{state.error}</p>
      )}
      {state.success && (
        <p className="text-sm text-[var(--accent)]">{state.success}</p>
      )}
      <SubmitButton className="btn justify-self-start" pendingLabel="Saving…">
        Save settings
      </SubmitButton>
    </form>
  );
}
