const healthStats = [
  { label: 'Rest HR', value: '49 bpm', detail: 'Rolling 7-day average' },
  { label: 'HRV', value: '82 ms', detail: 'Stable vs last week' },
  { label: 'Sleep', value: '7.6 hrs', detail: 'Consistent bedtime & wake time' }
];

export default function HealthPage() {
  return (
    <section className="space-y-4">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-white/60">Daily health stats</p>
        <h1 className="text-3xl font-semibold">Readiness signals</h1>
        <p className="text-white/70">Track rest, HRV, and sleep to inform future-week adjustments.</p>
      </header>
      <div className="card grid gap-4 sm:grid-cols-3">
        {healthStats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-white/60">{stat.label}</p>
            <p className="text-2xl font-semibold">{stat.value}</p>
            <p className="text-white/70 text-sm">{stat.detail}</p>
          </div>
        ))}
      </div>
      <div className="card">
        <h2 className="text-xl font-semibold mb-2">What we use</h2>
        <p className="text-white/70">
          These metrics guide readiness and progression rules for future weeks. Friday double days stay capped when fatigue
          markers rise.
        </p>
      </div>
    </section>
  );
}
