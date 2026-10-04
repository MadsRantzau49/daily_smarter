import { redirect } from "next/navigation";
import { registerAction } from "@/actions/auth";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Create account" };

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/app");
  return (
    <>
      <p className="eyebrow">Begin today</p>
      <h1 className="display mt-3 text-4xl">Build what you know.</h1>
      <p className="muted mb-8 mt-3">One focused lesson each day.</p>
      <AuthForm mode="register" action={registerAction} />
    </>
  );
}
