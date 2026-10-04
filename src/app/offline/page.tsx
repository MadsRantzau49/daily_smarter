import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <main className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <WifiOff className="mx-auto text-[var(--accent)]" size={36} />
        <h1 className="display mt-6 text-5xl">You are offline.</h1>
        <p className="muted mx-auto mt-4 max-w-md leading-7">
          Previously opened lessons may still be available. Reconnect to prepare
          a new lesson or submit an answer.
        </p>
      </div>
    </main>
  );
}
