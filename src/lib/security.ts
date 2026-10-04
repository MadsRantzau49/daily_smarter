import { headers } from "next/headers";

export async function assertSameOrigin() {
  const headerStore = await headers();
  const origin = headerStore.get("origin");
  const host = headerStore.get("host");
  if (!origin || !host) return;
  if (new URL(origin).host !== host) throw new Error("Invalid request origin");
}

export function safeReturnPath(value: unknown, fallback = "/app") {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//")
    ? value
    : fallback;
}
