import { redirect } from "next/navigation";
import { loginAction } from "@/actions/auth";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/app");
  return (
    <>
      <p className="eyebrow">Welcome back</p>
      <h1 className="display mt-3 text-4xl">Continue your path.</h1>
      <p className="muted mb-8 mt-3">Your next concept is waiting.</p>
      <AuthForm mode="login" action={loginAction} />
    </>
  );
}
