interface Insight {
  id: string;
  title: string;
  detail: string;
  type?: 'success' | 'warning' | 'info';
  timestamp?: string;
}

interface InsightFeedProps {
  insights: Insight[];
}

const typeConfig = {
  success: {
    icon: '✓',
    iconBg: 'bg-semantic-success/10',
    iconColor: 'text-semantic-success',
    border: 'border-semantic-success/20',
    bg: 'bg-semantic-success/5',
  },
  warning: {
    icon: '⚠',
    iconBg: 'bg-semantic-warning/10',
    iconColor: 'text-semantic-warning',
    border: 'border-semantic-warning/20',
    bg: 'bg-semantic-warning/5',
  },
  info: {
    icon: 'ℹ',
    iconBg: 'bg-semantic-info/10',
    iconColor: 'text-semantic-info',
    border: 'border-semantic-info/20',
    bg: 'bg-semantic-info/5',
  },
};

function InsightCard({ insight }: { insight: Insight }) {
  const type = insight.type || 'info';
  const config = typeConfig[type];

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border p-4 transition-all duration-200
        hover:scale-[1.01] hover:shadow-md
        ${config.border} ${config.bg}
      `}
    >
      {/* Icon */}
      <div className="flex gap-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${config.iconBg} ${config.iconColor}`}>
          <span className="text-xl font-bold">{config.icon}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-text-primary">{insight.title}</h3>
            {insight.timestamp && (
              <span className="text-xs text-text-tertiary whitespace-nowrap">{insight.timestamp}</span>
            )}
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">{insight.detail}</p>
        </div>
      </div>
    </div>
  );
}

export function InsightFeed({ insights }: InsightFeedProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Insights</h2>
          <p className="text-sm text-text-secondary">Training trends and recommendations</p>
        </div>
        <button className="text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors">
          See All →
        </button>
      </div>

      {/* Insights list */}
      <div className="space-y-3">
        {insights.length > 0 ? (
          insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))
        ) : (
          <div className="text-center py-8 text-text-tertiary">
            <p className="text-2xl mb-2">💡</p>
            <p>No insights yet. Keep training to see trends!</p>
          </div>
        )}
      </div>
    </div>
  );
}
