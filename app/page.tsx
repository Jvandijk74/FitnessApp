import Link from 'next/link';
import { ArrowRight } from './ui/icons';

const tiles = [
  {
    title: 'Training',
    description: 'Weekly plan, logging, and deterministic adjustments.',
    href: '/training',
    details: ['Fixed cadence', 'Rule-based progression', 'Strength in strict format']
  },
  {
    title: 'Nutrition',
    description: 'Fueling reminders that support the plan cadence.',
    href: '/nutrition',
    details: ['Carb targets by session', 'Protein guardrails', 'Hydration checks']
  },
  {
    title: 'Daily health stats',
    description: 'Rest, HRV, and sleep to guide future-week adjustments.',
    href: '/health',
    details: ['Rest HR', 'HRV', 'Sleep consistency']
  },
  {
    title: 'Ask coach',
    description: 'Explanations of workouts and rules—no overrides.',
    href: '/coach',
    details: ['Why this tempo?', 'How deloads trigger?', 'Strength RPE rationale']
  }
];

export default function Home() {
  return (
    <section className="space-y-6">
      <header className="card space-y-3">
        <p className="text-sm uppercase tracking-wide text-white/60">Home</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Personal training & endurance coaching</h1>
            <p className="text-white/70">
              Deterministic rules, immutable weekly cadence, and auditable decisions—built for trust.
            </p>
          </div>
          <Link href="/dashboard" className="btn-primary w-fit">
            Open training app <ArrowRight />
          </Link>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="card space-y-4">
          <h2 className="text-xl font-semibold">Choose a track</h2>
          <p className="text-white/70">Tap a tile to jump into training, nutrition, health signals, or chat.</p>
          <div className="grid gap-4 md:grid-cols-2">
            {tiles.map((tile) => (
              <Link
                key={tile.title}
                href={tile.href}
                className="group rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-primary/60 hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm uppercase tracking-wide text-white/60">{tile.title}</p>
                    <h3 className="text-lg font-semibold">{tile.description}</h3>
                  </div>
                  <ArrowRight />
                </div>
                <ul className="mt-3 space-y-1 text-white/75 text-sm">
                  {tile.details.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-white/60">Connect Strava</p>
                <h2 className="text-xl font-semibold">Keep runs in sync</h2>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-sm text-emerald-100">Ready</span>
            </div>
            <p className="text-white/70">Authorize Strava to import your runs for confirmation before they enter the log.</p>
            <a href="/api/strava/auth" className="btn-secondary w-full">Connect Strava</a>
          </div>

          <div className="card space-y-2">
            <p className="text-sm uppercase tracking-wide text-white/60">Immutable cadence</p>
            <h2 className="text-lg font-semibold">Monday through Sunday stays fixed</h2>
            <p className="text-white/70">
              Monday easy run, Tuesday full-body strength, Wednesday tempo, Thursday strength, Friday double day, Saturday rest,
              Sunday long run. The Coach Engine never rearranges these days.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
