import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertSameOrigin } from "@/lib/security";

const subscriptionSchema = z.object({
  endpoint: z.string().url().max(2000),
  keys: z.object({
    p256dh: z.string().min(1).max(500),
    auth: z.string().min(1).max(500),
  }),
});

export async function POST(request: Request) {
  await assertSameOrigin();
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = subscriptionSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid subscription" },
      { status: 400 },
    );
  await db.$transaction([
    db.pushSubscription.upsert({
      where: { endpoint: parsed.data.endpoint },
      create: {
        userId: user.id,
        endpoint: parsed.data.endpoint,
        p256dh: parsed.data.keys.p256dh,
        auth: parsed.data.keys.auth,
        userAgent: request.headers.get("user-agent")?.slice(0, 500),
      },
      update: {
        userId: user.id,
        p256dh: parsed.data.keys.p256dh,
        auth: parsed.data.keys.auth,
      },
    }),
    db.userSettings.update({
      where: { userId: user.id },
      data: { notificationsEnabled: true },
    }),
  ]);
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await assertSameOrigin();
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await db.$transaction([
    db.pushSubscription.deleteMany({ where: { userId: user.id } }),
    db.userSettings.update({
      where: { userId: user.id },
      data: { notificationsEnabled: false },
    }),
  ]);
  return NextResponse.json({ ok: true });
}
