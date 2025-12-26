import { ChatPanel } from '@/components/chat/ChatPanel';

export default function CoachPage() {
  return (
    <section className="space-y-4">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-white/60">Ask coach</p>
        <h1 className="text-3xl font-semibold">Explain workouts, not override them</h1>
        <p className="text-white/70">
          The chat explains deterministic decisions and surfaces the rules behind your plan.
        </p>
      </header>
      <div className="card">
        <ChatPanel />
      </div>
    </section>
  );
}
