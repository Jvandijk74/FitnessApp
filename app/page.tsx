import Link from 'next/link';
import { ArrowRight } from './ui/icons';

export default function Home() {
  return (
    <section className="grid gap-8 animate-fadeIn">
      {/* Hero Section */}
      <div className="card-highlight">
        <div className="space-y-4">
          <div className="inline-block">
            <span className="badge-primary">AI-Powered Coaching</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gradient-subtle">
            Personal Training & Endurance Coaching
          </h1>
          <p className="text-lg text-white/80 leading-relaxed max-w-3xl">
            Deterministic weekly structure with auditable logic. No hidden AI decisions—every progression and deload is rule-based.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link href="/dashboard" className="btn-primary">
              Go to dashboard <ArrowRight />
            </Link>
            <a href="/api/strava/auth" className="btn-secondary">
              Connect Strava
            </a>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="card group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="section-subtitle">Immutable cadence</span>
              <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white">Fixed weekly structure</h2>
            <p className="text-white/70 leading-relaxed">
              Monday easy run, Tuesday full-body strength, Wednesday tempo, Thursday strength, Friday double (easy + strength), Saturday
              rest, Sunday long run. The Coach Engine respects this cadence and never reorders days.
            </p>
          </div>
        </div>

        <div className="card group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="section-subtitle">Deterministic logic</span>
              <div className="h-8 w-8 rounded-lg bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white">Progression you can audit</h2>
            <p className="text-white/70 leading-relaxed">
              Progressive overload, deload triggers, and readiness gates are encoded in TypeScript so you can inspect and trust the
              decisions.
            </p>
          </div>
        </div>
      </div>

      {/* Additional Features */}
      <div className="card-gradient">
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Why Choose Our Platform?</h3>
          <div className="grid gap-3">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-white">Data-driven insights</p>
                <p className="text-sm text-white/60">Track your progress with detailed analytics and performance metrics</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-white">Strava integration</p>
                <p className="text-sm text-white/60">Seamlessly sync your workouts and training data</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-white">Personalized training plans</p>
                <p className="text-sm text-white/60">Adaptive programs based on your goals and readiness</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
