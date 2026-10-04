"use client";

export default function AppError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl py-24 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="display mt-5 text-5xl">Your progress is safe.</h1>
      <p className="muted my-6">We could not load this view. Try once more.</p>
      <button className="btn" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
