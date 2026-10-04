import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { localDate, localTime } from "@/lib/dates";
import { sendLearningReminderPush } from "@/services/push";

export async function runDailyScheduler(now = new Date()) {
  const users = await db.user.findMany({
    where: {
      settings: { onboardingCompleted: true, notificationsEnabled: true },
    },
    include: { settings: true },
  });
  const due = users.filter((user) => {
    const settings = user.settings;
    return (
      settings && localTime(now, settings.timezone) >= settings.notificationTime
    );
  });
  const results = await Promise.allSettled(
    due.map(async (user) => {
      const settings = user.settings!;
      const date = localDate(now, settings.timezone);
      const completion = await db.lessonCompletion.findUnique({
        where: { userId_localDate: { userId: user.id, localDate: date } },
        select: { id: true },
      });
      if (completion) return "completed";
      try {
        await db.reminderDelivery.create({
          data: { userId: user.id, localDate: date },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          return "already-sent";
        }
        throw error;
      }
      await sendLearningReminderPush(user.id);
      return "sent";
    }),
  );
  return {
    checked: users.length,
    due: due.length,
    notified: results.filter(
      (result) => result.status === "fulfilled" && result.value === "sent",
    ).length,
    failed: results.filter((result) => result.status === "rejected").length,
  };
}
