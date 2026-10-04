import { AlertTriangle, CheckCircle2, Clock3, Cpu } from "lucide-react";
import { db } from "@/lib/db";

export const metadata = { title: "Legacy API logs" };

export default async function AiHealthPage() {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const [logs, successCount, failureCount, aggregate] = await Promise.all([
    db.aiGenerationLog.findMany({
      include: {
        user: { select: { email: true } },
        lesson: {
          select: { id: true, title: true, localDate: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.aiGenerationLog.count({
      where: { status: "SUCCEEDED", createdAt: { gte: start } },
    }),
    db.aiGenerationLog.count({
      where: { status: "FAILED", createdAt: { gte: start } },
    }),
    db.aiGenerationLog.aggregate({
      where: { createdAt: { gte: start } },
      _avg: { durationMs: true },
      _sum: { inputTokens: true, outputTokens: true },
    }),
  ]);
  const cards = [
    [CheckCircle2, "Generated today", successCount],
    [AlertTriangle, "Failed attempts", failureCount],
    [
      Clock3,
      "Average duration",
      aggregate._avg.durationMs
        ? `${(aggregate._avg.durationMs / 1000).toFixed(1)}s`
        : "—",
    ],
    [
      Cpu,
      "Tokens today",
      (aggregate._sum.inputTokens ?? 0) + (aggregate._sum.outputTokens ?? 0),
    ],
  ] as const;
  return (
    <div>
      <header>
        <p className="eyebrow">Reliability and cost</p>
        <h1 className="display mt-3 text-5xl">Legacy API logs</h1>
        <p className="muted mt-3">
          Shared API generation is disabled. These records are retained for
          audit history.
        </p>
      </header>
      <section className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--line)] sm:grid-cols-4">
        {cards.map(([Icon, label, value]) => (
          <div key={label} className="bg-[var(--surface)] p-5">
            <Icon size={18} className="text-[var(--accent)]" />
            <strong className="display mt-6 block text-3xl">{value}</strong>
            <span className="muted text-xs">{label}</span>
          </div>
        ))}
      </section>
      <section className="mt-10">
        <h2 className="text-lg font-bold">Recent attempts</h2>
        {logs.length ? (
          <div className="mt-5 overflow-x-auto rounded-2xl border border-[var(--line)]">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-[var(--surface-2)]">
                <tr>
                  <th className="p-4">Status</th>
                  <th className="p-4">User / lesson</th>
                  <th className="p-4">Attempt</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Tokens</th>
                  <th className="p-4">Detail</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="p-4 font-bold">{log.status}</td>
                    <td className="p-4">
                      {log.user?.email ?? "Unknown"}
                      <span className="muted block max-w-52 truncate text-xs">
                        {log.lesson?.title ?? log.lesson?.localDate}
                      </span>
                    </td>
                    <td className="p-4">{log.attempt}</td>
                    <td className="p-4">
                      {log.durationMs
                        ? `${(log.durationMs / 1000).toFixed(1)}s`
                        : "—"}
                    </td>
                    <td className="p-4">
                      {(log.inputTokens ?? 0) + (log.outputTokens ?? 0) || "—"}
                    </td>
                    <td className="p-4">
                      <span
                        title={log.errorMessage ?? undefined}
                        className="block max-w-64 truncate text-[var(--danger)]"
                      >
                        {log.errorMessage ?? "—"}
                      </span>
                    </td>
                    <td className="p-4">
                      {log.status === "FAILED" && (
                        <span className="muted text-xs">
                          Legacy API attempt
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card mt-5 p-10 text-center muted">
            No legacy API attempts.
          </div>
        )}
      </section>
    </div>
  );
}
