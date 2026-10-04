import { ConfigForm } from "@/components/config-form";
import { db } from "@/lib/db";

export const metadata = { title: "Learning configuration" };

export default async function LearningConfigPage() {
  const config = await db.learningConfigVersion.findFirst({
    where: { active: true },
    orderBy: { version: "desc" },
  });
  if (!config)
    return (
      <div>
        <h1 className="display text-5xl">No active configuration</h1>
        <p className="muted mt-4">
          Run the seed command to create the protected default curriculum.
        </p>
      </div>
    );
  const versions = await db.learningConfigVersion.findMany({
    orderBy: { version: "desc" },
    take: 8,
    select: {
      id: true,
      version: true,
      domain: true,
      active: true,
      createdAt: true,
      createdBy: { select: { name: true } },
    },
  });
  return (
    <div>
      <header>
        <p className="eyebrow">Protected curriculum controls</p>
        <h1 className="display mt-3 text-5xl">Learning configuration</h1>
        <p className="muted mt-4 max-w-2xl leading-7">
          Change curriculum inputs without exposing or replacing the locked
          prompt architecture. Saving always creates a new version.
        </p>
      </header>
      <section className="card mt-10 p-6 sm:p-8">
        <ConfigForm config={config} />
      </section>
      <section className="mt-12">
        <h2 className="text-lg font-bold">Version history</h2>
        <div className="mt-5 divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {versions.map((version) => (
            <div
              key={version.id}
              className="grid grid-cols-[70px_1fr_auto] gap-4 py-4 text-sm"
            >
              <strong>v{version.version}</strong>
              <span>
                {version.domain}
                <span className="muted block text-xs">
                  {version.createdBy?.name ?? "System seed"}
                </span>
              </span>
              <span
                className={version.active ? "text-[var(--accent)]" : "muted"}
              >
                {version.active
                  ? "Active"
                  : version.createdAt.toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
