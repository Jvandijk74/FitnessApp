import Link from 'next/link';
import { ArrowRight } from './ui/icons';

const tiles = [
  {
    title: 'Training',
    description: 'See the next session, log work, and follow the immutable cadence.',
    href: '/training',
    meta: ['Fixed Monday–Sunday structure', 'Rule-based progression', 'Strength format enforced']
  },
  {
    title: 'Nutrition',
    description: 'Fueling and hydration prompts aligned to each training day.',
    href: '/nutrition',
    meta: ['Carb timing by session', 'Protein guardrails', 'Hydration checks']
  },
  {
    title: 'Health stats',
    description: 'Rest, HR, HRV, and sleep snapshots for readiness and deload triggers.',
    href: '/health',
    meta: ['Resting HR', 'HRV trends', 'Sleep duration & consistency']
  },
  {
    title: 'Ask coach',
    description: 'Ask why a workout is built this way. Explanations only—rules stay fixed.',
    href: '/coach',
    meta: ['Session intent', 'Deload criteria', 'Strength RPE rationale']
  }
];

export default function Home() {
  return (
    <section className="space-y-6">
      <header className="card space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm uppercase tracking-wide text-white/60">Personal training & endurance coaching</p>
            <h1 className="text-3xl font-semibold">Home hub</h1>
            <p className="text-white/70">
              Jump into training, nutrition, daily health signals, or ask the coach. The weekly cadence stays immutable and every
              decision is auditable.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <Link href="/dashboard" className="btn-primary w-full sm:w-fit">
              Go to dashboard <ArrowRight />
            </Link>
            <Link href="/coach" className="btn-secondary w-full sm:w-fit">
              Ask the coach
            </Link>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-white/5 p-3 text-sm text-white/80">
            <p className="text-xs uppercase tracking-wide text-white/60">Fixed cadence</p>
            Monday easy, Tuesday strength, Wednesday tempo, Thursday strength, Friday double, Saturday rest, Sunday long run.
          </div>
          <div className="rounded-lg bg-white/5 p-3 text-sm text-white/80">
            <p className="text-xs uppercase tracking-wide text-white/60">Deterministic rules</p>
            Progression, deloads, and readiness gates are typed in code—no hidden AI decisions.
          </div>
          <div className="rounded-lg bg-white/5 p-3 text-sm text-white/80">
            <p className="text-xs uppercase tracking-wide text-white/60">PWA ready</p>
            Installable experience with offline caching for the plan and logging views.
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Pick where to go</h2>
              <p className="text-white/70">Tiles move you into the dedicated screens for training, nutrition, health, and coach.</p>
            </div>
            <Link href="/coach" className="hidden rounded-full bg-primary/10 px-3 py-1 text-sm text-primary sm:inline-flex">
              Ask coach
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {tiles.map((tile) => (
              <Link
                key={tile.title}
                href={tile.href}
                className="group rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-4 transition hover:border-primary/60 hover:from-primary/10"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm uppercase tracking-wide text-white/60">{tile.title}</p>
                    <h3 className="text-lg font-semibold">{tile.description}</h3>
                  </div>
                  <ArrowRight />
                </div>
                <ul className="mt-3 space-y-1 text-sm text-white/75">
                  {tile.meta.map((item) => (
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
            <p className="text-sm uppercase tracking-wide text-white/60">Daily health snapshot</p>
            <h2 className="text-lg font-semibold">Rest, heart rate, HRV, and sleep</h2>
            <p className="text-white/70">
              Capture morning rest, resting HR, HRV, and sleep duration/consistency. These guide readiness and future-week
              adjustments without changing the current week.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
