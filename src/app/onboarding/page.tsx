import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding-form";
import { Logo } from "@/components/logo";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Welcome" };

export default async function OnboardingPage() {
  const user = await requireUser();
  if (user.settings?.onboardingCompleted) redirect("/app");
  return (
    <main className="shell py-8 sm:py-12">
      <div className="mx-auto mb-8 max-w-2xl">
        <Logo />
      </div>
      <div className="mx-auto max-w-2xl">
        <OnboardingForm initialTimezone={user.settings?.timezone ?? "UTC"} />
      </div>
    </main>
  );
}
