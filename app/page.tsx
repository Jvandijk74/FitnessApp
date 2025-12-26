import Link from 'next/link';
import { ArrowRight } from './ui/icons';

export default function Home() {
  return (
    <section className="grid gap-6">
      <div className="card">
        <h1 className="text-3xl font-semibold">Personal Training & Endurance Coaching</h1>
        <p className="text-white/70 mt-2">
          Deterministic weekly structure with auditable logic. No hidden AI decisions—every progression and deload is rule-based.
        </p>
        <div className="flex gap-3 mt-4">
          <Link href="/dashboard" className="btn-primary">
            Go to dashboard <ArrowRight />
          </Link>
          <a href="/api/strava/auth" className="btn-secondary">
            Connect Strava
          </a>
        </div>
      </div>
      <div className="card grid sm:grid-cols-2 gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-white/60">Immutable cadence</p>
          <h2 className="text-xl font-semibold">Fixed weekly structure</h2>
          <p className="text-white/70 mt-2">
            Monday easy run, Tuesday full-body strength, Wednesday tempo, Thursday strength, Friday double (easy + strength), Saturday
            rest, Sunday long run. The Coach Engine respects this cadence and never reorders days.
          </p>
        </div>
        <div>
          <p className="text-sm uppercase tracking-wide text-white/60">Deterministic logic</p>
          <h2 className="text-xl font-semibold">Progression you can audit</h2>
          <p className="text-white/70 mt-2">
            Progressive overload, deload triggers, and readiness gates are encoded in TypeScript so you can inspect and trust the
            decisions.
          </p>
        </div>
      </div>
    </section>
  );
}
