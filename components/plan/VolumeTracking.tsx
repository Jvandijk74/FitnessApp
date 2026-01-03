'use client';

interface VolumeData {
  muscleGroup: string;
  volume: number; // total weight × reps × sets
  sets: number;
  color: string;
}

interface VolumeTrackingProps {
  weekData: VolumeData[];
  previousWeekData?: VolumeData[];
}

const MUSCLE_GROUP_COLORS: Record<string, string> = {
  'Legs': '#0ea5e9', // primary blue
  'Chest': '#f97316', // accent orange
  'Back': '#10b981', // emerald
  'Shoulders': '#8b5cf6', // purple
  'Arms': '#ec4899', // pink
  'Core': '#f59e0b', // amber
};

export function VolumeTracking({ weekData, previousWeekData }: VolumeTrackingProps) {
  const maxVolume = Math.max(...weekData.map(d => d.volume), 1);

  const getVolumeChange = (muscleGroup: string) => {
    if (!previousWeekData) return null;
    const current = weekData.find(d => d.muscleGroup === muscleGroup);
    const previous = previousWeekData.find(d => d.muscleGroup === muscleGroup);

    if (!current || !previous || previous.volume === 0) return null;

    const change = ((current.volume - previous.volume) / previous.volume) * 100;
    return change;
  };

  const getTotalVolume = () => weekData.reduce((sum, d) => sum + d.volume, 0);
  const getPreviousTotalVolume = () => previousWeekData?.reduce((sum, d) => sum + d.volume, 0) || 0;

  const totalVolumeChange = previousWeekData && getPreviousTotalVolume() > 0
    ? ((getTotalVolume() - getPreviousTotalVolume()) / getPreviousTotalVolume()) * 100
    : null;

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Weekly Volume by Muscle Group</h3>
          <p className="text-sm text-white/60">Total training volume (weight × reps × sets)</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-white/60">Total Volume</p>
          <p className="text-2xl font-bold text-white">{(getTotalVolume() / 1000).toFixed(1)}k</p>
          {totalVolumeChange !== null && (
            <div className={`text-xs font-medium ${totalVolumeChange > 0 ? 'text-emerald-400' : totalVolumeChange < 0 ? 'text-red-400' : 'text-white/60'}`}>
              {totalVolumeChange > 0 ? '+' : ''}{totalVolumeChange.toFixed(1)}% vs last week
            </div>
          )}
        </div>
      </div>

      {/* Volume Chart */}
      <div className="space-y-4">
        {weekData.map((data) => {
          const percentage = (data.volume / maxVolume) * 100;
          const change = getVolumeChange(data.muscleGroup);

          return (
            <div key={data.muscleGroup} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: data.color }}
                  ></div>
                  <span className="font-medium text-white">{data.muscleGroup}</span>
                  <span className="text-white/50">({data.sets} sets)</span>
                </div>
                <div className="flex items-center gap-3">
                  {change !== null && (
                    <span className={`text-xs font-medium ${change > 0 ? 'text-emerald-400' : change < 0 ? 'text-red-400' : 'text-white/60'}`}>
                      {change > 0 ? '+' : ''}{change.toFixed(1)}%
                    </span>
                  )}
                  <span className="font-bold text-white">{(data.volume / 1000).toFixed(1)}k</span>
                </div>
              </div>
              <div className="h-8 bg-white/5 rounded-lg overflow-hidden relative group">
                <div
                  className="h-full rounded-lg transition-all duration-500 flex items-center justify-end px-3"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: data.color,
                    opacity: 0.8
                  }}
                >
                  <span className="text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    {data.volume.toLocaleString()} kg
                  </span>
                </div>
                {/* Hover tooltip */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-surface-elevated px-3 py-1 rounded text-xs font-medium whitespace-nowrap">
                    {data.volume.toLocaleString()} kg total
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Warning Indicator */}
      {totalVolumeChange !== null && totalVolumeChange > 15 && (
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-3">
          <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-yellow-400">High Volume Increase Detected</p>
            <p className="text-xs text-yellow-400/80 mt-1">
              {totalVolumeChange.toFixed(1)}% increase from last week. Consider monitoring for signs of overtraining.
            </p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <p className="text-xs text-white/60 mb-3">Muscle Groups</p>
        <div className="grid grid-cols-3 gap-2">
          {weekData.map((data) => (
            <div key={data.muscleGroup} className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: data.color }}
              ></div>
              <span className="text-xs text-white/70">{data.muscleGroup}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
