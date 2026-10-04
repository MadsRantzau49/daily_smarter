import { db } from "@/lib/db";

export const metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    include: {
      settings: true,
      _count: {
        select: { completions: true, lessons: true, pushSubscriptions: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return (
    <div>
      <header>
        <p className="eyebrow">Accounts</p>
        <h1 className="display mt-3 text-5xl">Users</h1>
      </header>
      <div className="mt-10 overflow-x-auto rounded-2xl border border-[var(--line)]">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="bg-[var(--surface-2)]">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Role</th>
              <th className="p-4">Level</th>
              <th className="p-4">Lessons</th>
              <th className="p-4">Completed</th>
              <th className="p-4">Push</th>
              <th className="p-4">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="p-4">
                  <strong>{user.name}</strong>
                  <span className="muted block text-xs">{user.email}</span>
                </td>
                <td className="p-4">{user.role}</td>
                <td className="p-4 capitalize">
                  {user.settings?.difficulty.toLowerCase() ?? "—"}
                </td>
                <td className="p-4">{user._count.lessons}</td>
                <td className="p-4">{user._count.completions}</td>
                <td className="p-4">
                  {user._count.pushSubscriptions ? "Enabled" : "Off"}
                </td>
                <td className="p-4">{user.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
