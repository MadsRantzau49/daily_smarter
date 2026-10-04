import { AdminNav } from "@/components/admin-nav";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return (
    <div>
      <AdminNav />
      <main className="lg:ml-64">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">{children}</div>
      </main>
    </div>
  );
}
