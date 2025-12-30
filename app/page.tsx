import Link from 'next/link';
import { ArrowRight } from './ui/icons';

const macroData = [
  { label: 'Calories', value: '1,240', target: '2,400', progress: 52 },
  { label: 'Protein', value: '84g', target: '160g', progress: 53 },
  { label: 'Carbs', value: '150g', target: '260g', progress: 58 },
  { label: 'Fats', value: '38g', target: '70g', progress: 54 },
];

export default function Home() {
  return (
    <section className="grid gap-6">
      <div className="card flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-white/60">Today&apos;s snapshot</p>
            <h1 className="text-3xl font-semibold">Personal Training &amp; Endurance Coaching</h1>
            <p className="text-white/70">
              Quick overview of your day with shortcuts to planning, nutrition, and health checks.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-white/5 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-white/60">Training focus</p>
              <p className="text-lg font-semibold">Tempo run + mobility</p>
              <p className="text-white/60 text-sm">45 min run · 15 min mobility</p>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-white/60">Readiness</p>
              <p className="text-lg font-semibold">Green</p>
              <p className="text-white/60 text-sm">Recovered and ready to push</p>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-white/60">Nutrition</p>
              <p className="text-lg font-semibold">1,240 / 2,400 kcal</p>
              <p className="text-white/60 text-sm">Keep fueling through lunch</p>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-white/60">Recovery</p>
              <p className="text-lg font-semibold">HRV 82 · RHR 46</p>
              <p className="text-white/60 text-sm">Synced via Strava</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 self-start">
          <Link href="/dashboard" className="btn-primary">
            Go to dashboard <ArrowRight />
          </Link>
          <a href="/api/strava/auth" className="btn-secondary">
            Connect Strava
          </a>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-wide text-white/60">Training plan</p>
              <h2 className="text-xl font-semibold">Training dashboard</h2>
              <p className="text-white/70 mt-1">
                Jump to your structured plan, view the week, and log today&apos;s results.
              </p>
            </div>
            <Link href="/dashboard" className="btn-secondary whitespace-nowrap">
              Open plan
            </Link>
          </div>
          <div className="grid gap-3 rounded-lg border border-white/5 bg-white/5 p-4">
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="uppercase tracking-wide text-white/60">Next</p>
                <p className="font-semibold">Tempo run · 6 km</p>
              </div>
              <span className="rounded-full bg-primary/20 px-3 py-1 text-xs text-primary">Today</span>
            </div>
            <div className="flex items-center justify-between text-sm text-white/70">
              <span>Start warm-up</span>
              <span>10 min</span>
            </div>
            <div className="flex items-center justify-between text-sm text-white/70">
              <span>Main set</span>
              <span>4 × 6 min @ 10k pace</span>
            </div>
            <div className="flex items-center justify-between text-sm text-white/70">
              <span>Cooldown</span>
              <span>10 min easy</span>
            </div>
          </div>
        </div>

        <div className="card flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-wide text-white/60">Today&apos;s nutrition</p>
              <h2 className="text-xl font-semibold">Fuel overview</h2>
              <p className="text-white/70 mt-1">Total calories, protein, carbs, and fats based on today&apos;s activity.</p>
            </div>
            <button className="btn-secondary whitespace-nowrap">Log meal</button>
          </div>
          <div className="grid gap-3">
            {macroData.map((macro) => (
              <div key={macro.label} className="space-y-2 rounded-lg border border-white/5 bg-white/5 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-wide text-white/60">{macro.label}</p>
                    <p className="text-lg font-semibold">{macro.value}</p>
                  </div>
                  <span className="text-sm text-white/60">Target {macro.target}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-blue-400"
                    style={{ width: `${macro.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-white/60">Ask coach something</p>
            <h2 className="text-xl font-semibold">Need quick guidance?</h2>
            <p className="text-white/70">Send a message to the AI coach for pacing, fueling, or recovery questions.</p>
          </div>
          <button className="btn-primary whitespace-nowrap">Open coach chat</button>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Ask about today&apos;s plan, substitutions, or nutrition adjustments"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-sm focus:border-primary focus:outline-none"
          />
          <button className="btn-secondary sm:w-40">Send question</button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-wide text-white/60">Today&apos;s training</p>
              <h2 className="text-xl font-semibold">Quick overview</h2>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">Ready</span>
          </div>
          <p className="text-white/70">Tempo intervals with mobility finisher. Log splits and RPE once done.</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-white/5 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-wide text-white/60">Duration</p>
              <p className="text-lg font-semibold">70 min</p>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-wide text-white/60">Target</p>
              <p className="text-lg font-semibold">10k pace</p>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-wide text-white/60">Finish</p>
              <p className="text-lg font-semibold">Mobility 15 min</p>
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-wide text-white/60">Daily health check</p>
              <h2 className="text-xl font-semibold">Strava sync</h2>
              <p className="text-white/70">Resting heart rate and HRV pulled from your latest Strava sync.</p>
            </div>
            <a href="/api/strava/auth" className="btn-secondary whitespace-nowrap">
              Refresh data
            </a>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-white/5 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-white/60">Rest heart rate</p>
              <p className="text-2xl font-semibold">46 bpm</p>
              <p className="text-sm text-white/60">Lower than 7-day average (48 bpm)</p>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-white/60">HRV</p>
              <p className="text-2xl font-semibold">82 ms</p>
              <p className="text-sm text-white/60">Steady and in the green zone</p>
            </div>
          </div>
          <div className="rounded-lg border border-white/5 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-white/60">Notes</p>
            <p className="text-white/70">Hydrate early and add an extra 10 minute cooldown if legs feel heavy.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
