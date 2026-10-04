import { db } from "@/lib/db";

export async function rateLimit(key: string, limit: number, windowMs: number) {
  const now = new Date();
  const existing = await db.rateLimit.findUnique({ where: { key } });
  if (!existing || existing.resetAt <= now) {
    await db.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, resetAt: new Date(now.getTime() + windowMs) },
      update: { count: 1, resetAt: new Date(now.getTime() + windowMs) },
    });
    return;
  }
  if (existing.count >= limit)
    throw new Error("Too many requests. Try again later.");
  await db.rateLimit.update({
    where: { key },
    data: { count: { increment: 1 } },
  });
}
