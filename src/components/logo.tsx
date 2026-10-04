import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 font-bold tracking-tight"
    >
      <span className="grid size-8 place-items-center rounded-lg bg-[var(--ink)] text-[var(--bg)]">
        D
      </span>
      Daily Smarter
    </Link>
  );
}
