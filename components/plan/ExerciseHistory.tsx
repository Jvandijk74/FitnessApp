interface HistoricalSet {
  weight: number;
  reps: number;
  rpe?: number;
  date: string;
}

interface ExerciseHistoryProps {
  exerciseName: string;
  history: HistoricalSet[][];
}

export function ExerciseHistory({ exerciseName, history }: ExerciseHistoryProps) {
  const calculateSessionVolume = (sets: HistoricalSet[]) => {
    return sets.reduce((total, set) => total + (set.weight * set.reps), 0);
  };

  const getVolumeChange = () => {
    if (history.length < 2) return null;
    const current = calculateSessionVolume(history[0]);
    const previous = calculateSessionVolume(history[1]);
    const change = ((current - previous) / previous) * 100;
    return { change, isPositive: change > 0 };
  };

  const volumeChange = getVolumeChange();

  return (
    <div className="mt-4 p-4 rounded-lg bg-surface-elevated border border-surface">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-text-primary">Exercise History</h4>
        {volumeChange && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            volumeChange.isPositive ? 'text-semantic-success' : 'text-semantic-error'
          }`}>
            <span>{volumeChange.isPositive ? '↗' : '↘'}</span>
            <span>{Math.abs(volumeChange.change).toFixed(1)}%</span>
            <span className="text-text-tertiary text-xs ml-1">vs last session</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {history.slice(0, 5).map((session, sessionIndex) => {
          const volume = calculateSessionVolume(session);
          const avgRpe = session.reduce((sum, set) => sum + (set.rpe || 0), 0) / session.length;

          return (
            <div key={sessionIndex} className="p-3 rounded-lg bg-surface border border-surface-elevated">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs text-text-tertiary">
                    {new Date(session[0].date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                    {sessionIndex === 0 && ' (Latest)'}
                  </p>
                  <p className="text-sm font-medium text-text-primary">
                    {session.length} sets • {volume} kg volume
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-tertiary">Avg RPE</p>
                  <p className="text-sm font-medium text-text-primary">{avgRpe.toFixed(1)}</p>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {session.map((set, setIndex) => (
                  <span
                    key={setIndex}
                    className="text-xs px-2 py-1 rounded bg-primary-500/10 text-primary-400 font-medium"
                  >
                    {set.weight}kg × {set.reps}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {history.length > 5 && (
        <button className="w-full mt-3 text-sm text-primary-400 hover:text-primary-300">
          View Full History →
        </button>
      )}
    </div>
  );
}
