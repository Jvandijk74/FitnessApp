interface InsightCardsProps {
  insights: { id: string; title: string; detail: string }[];
}

export function InsightCards({ insights }: InsightCardsProps) {
  return (
    <div className="grid md:grid-cols-3 gap-3">
      {insights.map((insight) => (
        <div key={insight.id} className="card">
          <p className="text-sm text-white/60">Insight</p>
          <h3 className="text-lg font-semibold">{insight.title}</h3>
          <p className="text-white/70 text-sm mt-1">{insight.detail}</p>
        </div>
      ))}
    </div>
  );
}
