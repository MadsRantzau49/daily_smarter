"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { ActionState } from "@/lib/action-state";
import { initialActionState } from "@/lib/action-state";
import { SubmitButton } from "@/components/submit-button";

export function AuthForm({
  mode,
  action,
}: {
  mode: "login" | "register";
  action: (state: ActionState, data: FormData) => Promise<ActionState>;
}) {
  const [state, formAction] = useActionState(action, initialActionState);
  const register = mode === "register";
  return (
    <form action={formAction} className="grid gap-5">
      {register && (
        <div className="field">
          <label htmlFor="name">Name</label>
          <input
            className="input"
            id="name"
            name="name"
            autoComplete="name"
            required
            minLength={2}
          />
        </div>
      )}
      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          className="input"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          className="input"
          id="password"
          name="password"
          type="password"
          autoComplete={register ? "new-password" : "current-password"}
          required
          minLength={10}
        />
        <span className="muted text-xs">
          {register ? "At least 10 characters" : ""}
        </span>
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-[var(--danger)]">
          {state.error}
        </p>
      )}
      <SubmitButton
        pendingLabel={register ? "Creating account…" : "Signing in…"}
      >
        {register ? "Create account" : "Sign in"}
      </SubmitButton>
      <p className="muted text-center text-sm">
        {register ? "Already learning?" : "New here?"}{" "}
        <Link
          className="font-bold text-[var(--ink)] underline underline-offset-4"
          href={register ? "/login" : "/register"}
        >
          {register ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
