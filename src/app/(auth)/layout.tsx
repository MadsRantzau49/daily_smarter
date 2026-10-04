import { Logo } from "@/components/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="shell grid min-h-screen place-items-center py-10">
      <div className="w-full max-w-md">
        <div className="mb-10">
          <Logo />
        </div>
        <div className="card p-7 shadow-[var(--shadow)] sm:p-9">{children}</div>
      </div>
    </main>
  );
}
