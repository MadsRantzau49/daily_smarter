import Link from "next/link";
import { ArrowRight, Bell, BrainCircuit, Clock3, Layers3 } from "lucide-react";
import { Logo } from "@/components/logo";

const path = ["Registers", "CPU cache", "Cache lines", "Memory buses"];

export default function LandingPage() {
  return (
    <main className="overflow-hidden">
      <nav className="shell flex h-20 items-center justify-between">
        <Logo />
        <div className="flex items-center gap-3">
          <Link className="hidden text-sm font-bold sm:block" href="/login">
            Sign in
          </Link>
          <Link className="btn !min-h-10 !px-4 text-sm" href="/register">
            Start learning
          </Link>
        </div>
      </nav>
      <section className="shell grid min-h-[720px] items-center gap-16 py-16 lg:grid-cols-[1.1fr_.9fr]">
        <div className="enter">
          <p className="eyebrow mb-6">A daily learning ritual</p>
          <h1 className="display max-w-3xl text-6xl leading-[.96] sm:text-7xl lg:text-8xl">
            Learn something useful. Every single day.
          </h1>
          <p className="muted mt-8 max-w-xl text-lg leading-8">
            One personalized lesson. Less than ten minutes. Use your own AI
            account with a prompt that remembers what you know and chooses what
            should come next.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link className="btn" href="/register">
              Begin your first lesson <ArrowRight size={18} />
            </Link>
            <a className="btn btn-secondary" href="#how">
              See how it works
            </a>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-24 -z-10 rounded-full bg-[var(--accent-2)] opacity-30 blur-3xl" />
          <div className="card p-5 shadow-[var(--shadow)] sm:p-8">
            <div className="flex items-center justify-between">
              <span className="eyebrow">Your path</span>
              <span className="muted text-xs">4 days</span>
            </div>
            <div className="mt-8 grid gap-0">
              {path.map((topic, index) => (
                <div key={topic} className="grid grid-cols-[38px_1fr] gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      className={`grid size-8 place-items-center rounded-full text-xs font-black ${index === 3 ? "bg-[var(--accent)] text-[var(--bg)]" : "bg-[var(--surface-2)]"}`}
                    >
                      {index + 1}
                    </span>
                    {index < 3 && (
                      <span className="h-12 w-px bg-[var(--line)]" />
                    )}
                  </div>
                  <div className="pt-1">
                    <p className="font-bold">{topic}</p>
                    <p className="muted text-xs">Day {index + 1}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-7 rounded-2xl bg-[var(--surface-2)] p-5">
              <p className="text-sm font-bold">
                Next: how data moves without the CPU
              </p>
              <p className="muted mt-1 text-xs">
                Prompted from your learning history
              </p>
            </div>
          </div>
        </div>
      </section>
      <section
        id="how"
        className="border-y border-[var(--line)] bg-[var(--surface)] py-24"
      >
        <div className="shell">
          <p className="eyebrow">Small sessions, connected ideas</p>
          <h2 className="display mt-4 max-w-2xl text-5xl">
            Knowledge compounds when each idea has somewhere to land.
          </h2>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              [
                BrainCircuit,
                "Bring your own AI",
                "Copy one structured prompt into ChatGPT or another LLM, then import its validated response.",
              ],
              [
                Clock3,
                "Made for real days",
                "Focused explanations, concrete examples, and one useful question in under ten minutes.",
              ],
              [
                Layers3,
                "A path, not a feed",
                "Concepts build from foundations toward a broad, connected understanding.",
              ],
            ].map(([Icon, title, body]) => {
              const IconComponent = Icon as typeof BrainCircuit;
              return (
                <article
                  key={title as string}
                  className="border-t border-[var(--line)] pt-6"
                >
                  <IconComponent className="text-[var(--accent)]" />
                  <h3 className="mt-8 text-lg font-bold">{title as string}</h3>
                  <p className="muted mt-3 leading-7">{body as string}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section className="shell grid gap-10 py-24 md:grid-cols-2">
        <div>
          <Bell className="text-[var(--accent)]" />
          <h2 className="display mt-6 text-5xl">
            A quiet reminder. A stronger habit.
          </h2>
        </div>
        <div className="self-end">
          <p className="muted max-w-lg text-lg leading-8">
            Install Daily Smarter on your phone or desktop. Choose when you want
            a reminder, learn even when a downloaded lesson is offline, and
            watch your streak grow without turning learning into a game.
          </p>
          <Link
            className="mt-8 inline-flex items-center gap-2 font-bold text-[var(--accent)]"
            href="/register"
          >
            Start learning <ArrowRight size={17} />
          </Link>
        </div>
      </section>
      <footer className="border-t border-[var(--line)] py-10">
        <div className="shell flex flex-wrap items-center justify-between gap-4">
          <Logo />
          <p className="muted text-sm">
            One concept today. A connected understanding tomorrow.
          </p>
        </div>
      </footer>
    </main>
  );
}
