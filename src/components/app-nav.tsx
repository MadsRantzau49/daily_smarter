import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  Library,
  Settings,
  Shield,
} from "lucide-react";
import { Logo } from "@/components/logo";

const links = [
  { href: "/app", label: "Today", icon: BookOpen },
  { href: "/app/history", label: "History", icon: CalendarDays },
  { href: "/app/courses", label: "Courses", icon: Library },
  { href: "/app/progress", label: "Progress", icon: BarChart3 },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function AppNav({ admin }: { admin: boolean }) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-[var(--line)] bg-[var(--surface)] p-6 md:flex md:flex-col">
        <Logo href="/app" />
        <nav className="mt-12 grid gap-2">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold hover:bg-[var(--surface-2)]"
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        {admin && (
          <Link
            href="/admin"
            className="mt-auto flex items-center gap-3 rounded-xl border border-[var(--line)] px-3 py-3 text-sm font-bold"
          >
            <Shield size={18} />
            Admin console
          </Link>
        )}
      </aside>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-[var(--line)] bg-[color:var(--surface)]/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex min-h-16 flex-col items-center justify-center gap-1 text-[.68rem] font-bold"
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
