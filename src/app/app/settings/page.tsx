import { logoutAction } from "@/actions/auth";
import { PushSettings } from "@/components/push-settings";
import { SettingsForm } from "@/components/settings-form";
import { SubmitButton } from "@/components/submit-button";
import { requireUser } from "@/lib/auth";
import { publicEnv } from "@/lib/env";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser();
  const settings = user.settings!;
  return (
    <div className="mx-auto max-w-3xl">
      <header>
        <p className="eyebrow">Preferences</p>
        <h1 className="display mt-3 text-6xl">Settings</h1>
      </header>
      <section className="mt-10 border-t border-[var(--line)] py-8">
        <h2 className="mb-6 text-lg font-bold">Learning and appearance</h2>
        <SettingsForm settings={settings} />
      </section>
      <section className="border-t border-[var(--line)] py-8">
        <h2 className="mb-6 text-lg font-bold">Notifications</h2>
        <PushSettings
          publicKey={publicEnv().vapidPublicKey}
          enabled={settings.notificationsEnabled}
        />
      </section>
      <section className="border-t border-[var(--line)] py-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-bold">Signed in as {user.name}</h2>
            <p className="muted mt-1 text-sm">{user.email}</p>
          </div>
          <form action={logoutAction}>
            <SubmitButton
              className="btn btn-secondary"
              pendingLabel="Signing out…"
            >
              Sign out
            </SubmitButton>
          </form>
        </div>
      </section>
    </div>
  );
}
