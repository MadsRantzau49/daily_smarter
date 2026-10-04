import "server-only";

import webpush from "web-push";
import { db } from "@/lib/db";

function configurePush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

export async function sendLearningReminderPush(userId: string) {
  if (!configurePush()) return { sent: 0, unavailable: true };
  const subscriptions = await db.pushSubscription.findMany({
    where: { userId },
  });
  let sent = 0;
  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          JSON.stringify({
            title: "Ready for today's lesson?",
            body: "Build your personalized prompt and use it with your preferred AI.",
            url: "/app/today",
          }),
        );
        sent += 1;
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await db.pushSubscription.delete({ where: { id: subscription.id } });
        }
      }
    }),
  );
  return { sent, unavailable: false };
}
