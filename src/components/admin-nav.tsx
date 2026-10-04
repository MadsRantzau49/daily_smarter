import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  LayoutDashboard,
  Settings2,
  Users,
} from "lucide-react";
import { Logo } from "@/components/logo";

export function AdminNav() {
  const links = [
    [LayoutDashboard, "Overview", "/admin"],
    [Settings2, "Learning config", "/admin/learning-config"],
    [Users, "Users", "/admin/users"],
    [Activity, "Legacy API logs", "/admin/ai"],
  ] as const;
  return (
    <aside className="border-b border-[var(--line)] bg-[var(--surface)] px-5 py-5 lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:border-b-0 lg:border-r lg:p-6">
      <Logo href="/admin" />
      <nav className="mt-6 flex gap-2 overflow-auto lg:mt-12 lg:grid">
        {links.map(([Icon, label, href]) => (
          <Link
            key={href}
            href={href}
            className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold hover:bg-[var(--surface-2)]"
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
      <Link
        href="/app"
        className="mt-8 hidden items-center gap-2 text-sm font-bold text-[var(--muted)] lg:flex lg:absolute lg:bottom-7"
      >
        <ArrowLeft size={16} /> Learner app
      </Link>
    </aside>
  );
}
