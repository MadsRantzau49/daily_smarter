import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LearnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  if (!user.settings?.onboardingCompleted) redirect("/onboarding");
  return (
    <div>
      <AppNav admin={user.role === "ADMIN"} />
      <main className="min-h-screen pb-24 md:ml-64 md:pb-0">
        <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
          {children}
        </div>
      </main>
    </div>
  );
}
