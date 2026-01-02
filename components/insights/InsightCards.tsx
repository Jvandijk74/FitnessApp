interface InsightCardsProps {
  insights: { id: string; title: string; detail: string }[];
}

const insightIcons: Record<string, JSX.Element> = {
  'tempo-pace': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  'strength-rpe': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  'hr-drift': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
};

const insightBadges: Record<string, { text: string; className: string }> = {
  'tempo-pace': { text: 'Improving', className: 'badge-success' },
  'strength-rpe': { text: 'Warning', className: 'badge-warning' },
  'hr-drift': { text: 'Attention', className: 'badge-accent' },
};

export function InsightCards({ insights }: InsightCardsProps) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {insights.map((insight) => {
        const badge = insightBadges[insight.id] || { text: 'Insight', className: 'badge-primary' };
        const icon = insightIcons[insight.id];

        return (
          <div key={insight.id} className="card group">
            <div className="flex items-start justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                {icon}
              </div>
              <span className={badge.className}>{badge.text}</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{insight.title}</h3>
            <p className="text-white/70 text-sm leading-relaxed">{insight.detail}</p>
          </div>
        );
      })}
    </div>
  );
}
