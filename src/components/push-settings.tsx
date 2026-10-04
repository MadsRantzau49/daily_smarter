"use client";

import { useState } from "react";
import { Bell, BellOff } from "lucide-react";

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}

export function PushSettings({
  publicKey,
  enabled,
}: {
  publicKey: string;
  enabled: boolean;
}) {
  const [active, setActive] = useState(enabled);
  const [status, setStatus] = useState("");
  const supported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window;
  const denied =
    typeof Notification !== "undefined" && Notification.permission === "denied";
  async function enable() {
    try {
      if (!publicKey) throw new Error("Push is not configured on this server.");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(
          "Permission was not granted. You can change this in your browser settings.",
        );
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      const response = await fetch("/api/push/subscriptions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(subscription),
      });
      if (!response.ok) throw new Error("Could not save subscription");
      setActive(true);
      setStatus("Daily reminders are enabled.");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Could not enable notifications.",
      );
    }
  }
  async function disable() {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    await subscription?.unsubscribe();
    await fetch("/api/push/subscriptions", { method: "DELETE" });
    setActive(false);
    setStatus("Daily reminders are off.");
  }
  if (!supported)
    return (
      <p className="muted text-sm">
        Push notifications are not supported by this browser.
      </p>
    );
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {active ? (
            <Bell className="text-[var(--accent)]" />
          ) : (
            <BellOff className="muted" />
          )}
          <div>
            <p className="font-bold">Daily lesson reminders</p>
            <p className="muted text-sm">
              {active ? "Enabled on this account" : "Off"}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={active ? disable : enable}
        >
          {active ? "Disable" : "Enable notifications"}
        </button>
      </div>
      {(status || denied) && (
        <p role="status" className="muted mt-4 text-sm">
          {status || "Notifications are blocked in your browser settings."}
        </p>
      )}
    </div>
  );
}
