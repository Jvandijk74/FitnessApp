interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: string;
  variant?: 'default' | 'success' | 'warning' | 'info';
}

export function StatsCard({ title, value, trend, icon, variant = 'default' }: StatsCardProps) {
  const variantStyles = {
    default: 'border-primary-500/20 hover:border-primary-500/40',
    success: 'border-semantic-success/20 hover:border-semantic-success/40',
    warning: 'border-semantic-warning/20 hover:border-semantic-warning/40',
    info: 'border-semantic-info/20 hover:border-semantic-info/40',
  };

  const trendColor = trend?.isPositive ? 'text-semantic-success' : 'text-semantic-error';
  const trendIcon = trend?.isPositive ? '↗' : '↘';

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border bg-surface p-6
        transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary-500/10
        ${variantStyles[variant]}
      `}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent" />

      {/* Content */}
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-text-secondary">{title}</p>
          {icon && <span className="text-2xl opacity-50">{icon}</span>}
        </div>

        {/* Value */}
        <p className="text-3xl font-bold text-text-primary mb-1">{value}</p>

        {/* Trend */}
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
            <span>{trendIcon}</span>
            <span>{Math.abs(trend.value)}%</span>
            <span className="text-text-tertiary text-xs ml-1">vs last week</span>
          </div>
        )}
      </div>
    </div>
  );
}
