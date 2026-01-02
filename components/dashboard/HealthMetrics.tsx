interface HealthMetricsProps {
  rhr: number;
  hrv: number;
  recoveryRate: number;
  readiness: number;
}

interface Metric {
  label: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'poor';
  icon: JSX.Element;
  description: string;
}

export function HealthMetrics({ rhr, hrv, recoveryRate, readiness }: HealthMetricsProps) {
  const getStatus = (value: number, type: string): 'good' | 'warning' | 'poor' => {
    if (type === 'readiness' || type === 'recovery') {
      if (value >= 0.7) return 'good';
      if (value >= 0.5) return 'warning';
      return 'poor';
    }
    if (type === 'hrv') {
      if (value >= 60) return 'good';
      if (value >= 40) return 'warning';
      return 'poor';
    }
    if (type === 'rhr') {
      if (value <= 60) return 'good';
      if (value <= 70) return 'warning';
      return 'poor';
    }
    return 'good';
  };

  const metrics: Metric[] = [
    {
      label: 'Resting HR',
      value: rhr,
      unit: 'bpm',
      status: getStatus(rhr, 'rhr'),
      description: 'Morning resting heart rate',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      label: 'HRV',
      value: hrv,
      unit: 'ms',
      status: getStatus(hrv, 'hrv'),
      description: 'Heart rate variability',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      label: 'Recovery',
      value: Math.round(recoveryRate * 100),
      unit: '%',
      status: getStatus(recoveryRate, 'recovery'),
      description: 'Recovery score from last workout',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
    {
      label: 'Readiness',
      value: Math.round(readiness * 100),
      unit: '%',
      status: getStatus(readiness, 'readiness'),
      description: 'Overall training readiness',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const getStatusColor = (status: 'good' | 'warning' | 'poor') => {
    switch (status) {
      case 'good':
        return 'text-emerald-400 bg-emerald-500/20 ring-emerald-500/40';
      case 'warning':
        return 'text-yellow-400 bg-yellow-500/20 ring-yellow-500/40';
      case 'poor':
        return 'text-red-400 bg-red-500/20 ring-red-500/40';
    }
  };

  const getStatusBadge = (status: 'good' | 'warning' | 'poor') => {
    switch (status) {
      case 'good':
        return 'badge-success';
      case 'warning':
        return 'badge-warning';
      case 'poor':
        return 'badge-danger';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <div key={metric.label} className="card group">
          <div className="flex items-start justify-between mb-3">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${getStatusColor(metric.status)} transition-transform group-hover:scale-110 duration-200`}>
              {metric.icon}
            </div>
            <span className={getStatusBadge(metric.status)}>{metric.status}</span>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-white/60">{metric.label}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">{metric.value}</span>
              <span className="text-lg text-white/50">{metric.unit}</span>
            </div>
            <p className="text-xs text-white/50 mt-2">{metric.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
