'use client';

import { useState, useEffect } from 'react';
import { WeekNavigation } from '@/components/plan/WeekNavigation';
import { VolumeTracking } from '@/components/plan/VolumeTracking';
import { ProgressiveOverloadScore } from '@/components/plan/ProgressiveOverloadScore';
import { TrainingDay } from '@/lib/db/types';

interface Exercise {
  name: string;
  targetSets: string;
  targetReps: string;
  tempo: string;
  rest: string;
  targetRpe?: string;
  targetRir?: string;
  notes?: string;
  optional?: boolean;
}

interface LoggedSet {
  weight: number;
  reps: number;
  rpe?: number;
  rir?: number;
}

interface DayWorkout {
  day: TrainingDay;
  type: 'run' | 'strength' | 'rest';
  run?: {
    duration: number;
    intensity: string;
    targetRpe: number;
  };
  exercises?: Exercise[];
}

const WEEK_WORKOUTS: DayWorkout[] = [
  {
    day: 'monday',
    type: 'strength',
    exercises: [
      {
        name: 'Hack squat / Goblet squat / Belt squat',
        targetSets: '4',
        targetReps: '6-8',
        tempo: '3-1-1-0',
        rest: '2-3 min',
        targetRpe: '7-8',
        notes: 'Strength/Mechanical Tension'
      },
      {
        name: 'Romanian Deadlift',
        targetSets: '3',
        targetReps: '6-8',
        tempo: '4-0-1-0',
        rest: '2-3 min',
        targetRpe: '7-8'
      },
      {
        name: 'Incline Dumbbell Press',
        targetSets: '4',
        targetReps: '8',
        tempo: '3-0-1-0',
        rest: '2-3 min',
        targetRir: '1-2'
      },
      {
        name: 'Chest-Supported Row',
        targetSets: '3',
        targetReps: '8-10',
        tempo: '2-1-1-1',
        rest: '90 sec',
        targetRir: '1-2'
      },
    ],
  },
  {
    day: 'tuesday',
    type: 'rest',
  },
  {
    day: 'wednesday',
    type: 'rest',
  },
  {
    day: 'thursday',
    type: 'strength',
    exercises: [
      {
        name: 'Split Squat (long stance)',
        targetSets: '2',
        targetReps: '8/side',
        tempo: '3-1-1-0',
        rest: '2-3 min',
        targetRpe: '6-7',
        notes: 'Post Tempo/Maintenance'
      },
      {
        name: 'Lat Pulldown',
        targetSets: '3',
        targetReps: '10-12',
        tempo: '2-1-2-1',
        rest: '90 sec',
        targetRir: '1-2'
      },
    ],
  },
  {
    day: 'friday',
    type: 'strength',
    exercises: [
      {
        name: 'Leg Press',
        targetSets: '3',
        targetReps: '15',
        tempo: '3-1-2-0',
        rest: '90 sec',
        targetRpe: '7-8'
      },
      {
        name: 'Seated Leg Curl',
        targetSets: '4',
        targetReps: '10-12',
        tempo: '3-1-1-1',
        rest: '75-90 sec',
        targetRir: '0-1',
      },
    ],
  },
  {
    day: 'saturday',
    type: 'rest',
  },
  {
    day: 'sunday',
    type: 'rest',
  },
];

function getCurrentWeek() {
  const now = new Date();
  const onejan = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil((((now.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
  return { week, year: now.getFullYear() };
}

export default function PlanPage() {
  const { week: currentWeekNum, year: currentYearNum } = getCurrentWeek();
  const [currentWeek, setCurrentWeek] = useState(currentWeekNum);
  const [currentYear, setCurrentYear] = useState(currentYearNum);
  const [volumeData, setVolumeData] = useState<any[]>([]);
  const [previousVolumeData, setPreviousVolumeData] = useState<any[]>([]);
  const [overloadFactors, setOverloadFactors] = useState({
    volumeIncrease: 0,
    intensityIncrease: 0,
    frequencyConsistency: 0,
    recoveryQuality: 70
  });
  const [loading, setLoading] = useState(true);

  // Fetch volume data when week changes
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch current week volume
        const currentRes = await fetch(`/api/volume?week=${currentWeek}&year=${currentYear}`);
        const currentData = await currentRes.json();
        setVolumeData(currentData.volumeData || []);

        // Fetch previous week volume
        let prevWeek = currentWeek - 1;
        let prevYear = currentYear;
        if (prevWeek === 0) {
          prevWeek = 52;
          prevYear = currentYear - 1;
        }

        const prevRes = await fetch(`/api/volume?week=${prevWeek}&year=${prevYear}`);
        const prevData = await prevRes.json();
        setPreviousVolumeData(prevData.volumeData || []);

        // Fetch progressive overload factors
        const overloadRes = await fetch(`/api/volume/overload?week=${currentWeek}&year=${currentYear}`);
        const overloadData = await overloadRes.json();
        setOverloadFactors(overloadData.factors || overloadFactors);
      } catch (error) {
        console.error('Error fetching volume data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentWeek, currentYear]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Training Plan</h1>
        <p className="text-text-secondary">Your weekly strength training program</p>
      </div>

      {/* Week Navigation */}
      <WeekNavigation
        currentWeek={currentWeek}
        currentYear={currentYear}
        onWeekChange={(week, year) => {
          setCurrentWeek(week);
          setCurrentYear(year);
        }}
      />

      {/* Metrics Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Volume Tracking */}
        {!loading && volumeData.length > 0 ? (
          <VolumeTracking
            weekData={volumeData}
            previousWeekData={previousVolumeData}
          />
        ) : (
          <div className="card">
            <h3 className="text-xl font-bold text-white mb-4">Weekly Volume by Muscle Group</h3>
            <div className="text-center py-8 text-white/60">
              <p className="text-2xl mb-2">📊</p>
              <p>No training data for this week yet</p>
              <p className="text-sm mt-1">Start logging your workouts to see volume tracking</p>
            </div>
          </div>
        )}

        {/* Progressive Overload Score */}
        <ProgressiveOverloadScore
          factors={overloadFactors}
          weekOverWeekChange={overloadFactors.volumeIncrease}
        />
      </div>

      {/* Weekly Workouts */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Weekly Schedule</h2>
        <div className="grid gap-4">
          {WEEK_WORKOUTS.map((workout) => (
            <DayCard key={workout.day} workout={workout} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DayCard({ workout }: { workout: DayWorkout }) {
  const [expanded, setExpanded] = useState(false);
  const [loggedSets, setLoggedSets] = useState<{ [key: string]: LoggedSet[] }>({});
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const dayLabels: Record<TrainingDay, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  };

  const addSet = (exerciseName: string) => {
    setLoggedSets(prev => ({
      ...prev,
      [exerciseName]: [...(prev[exerciseName] || []), { weight: 0, reps: 0, rpe: 7 }]
    }));
  };

  const updateSet = (exerciseName: string, setIndex: number, field: keyof LoggedSet, value: number) => {
    setLoggedSets(prev => ({
      ...prev,
      [exerciseName]: prev[exerciseName].map((set, i) =>
        i === setIndex ? { ...set, [field]: value } : set
      )
    }));
  };

  const removeSet = (exerciseName: string, setIndex: number) => {
    setLoggedSets(prev => ({
      ...prev,
      [exerciseName]: prev[exerciseName].filter((_, i) => i !== setIndex)
    }));
  };

  const getTotalVolume = () => {
    let total = 0;
    Object.values(loggedSets).forEach(sets => {
      sets.forEach(set => {
        total += set.weight * set.reps;
      });
    });
    return total;
  };

  const saveWorkout = async () => {
    setSaving(true);
    setSaveMessage('');

    try {
      // Save each exercise
      for (const [exerciseName, sets] of Object.entries(loggedSets)) {
        if (sets.length === 0) continue;

        const response = await fetch('/api/plan/log-strength', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: 'demo-user',
            day: workout.day,
            exercise: exerciseName,
            sets: sets.map(s => ({
              weight: Number(s.weight),
              reps: Number(s.reps),
              rpe: s.rpe ? Number(s.rpe) : undefined,
              rir: s.rir ? Number(s.rir) : undefined
            }))
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to save ${exerciseName}`);
        }
      }

      setSaveMessage('✅ Workout saved successfully!');
      setTimeout(() => {
        setSaveMessage('');
        setLoggedSets({});
      }, 3000);
    } catch (error) {
      console.error('Error saving workout:', error);
      setSaveMessage('❌ Failed to save workout. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      {/* Day Header */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
            workout.type === 'strength' ? 'bg-accent/20' : 'bg-white/5'
          }`}>
            {workout.type === 'strength' ? '💪' : '😴'}
          </div>
          <div>
            <h3 className="font-semibold text-white">{dayLabels[workout.day]}</h3>
            <p className="text-sm text-white/60">
              {workout.type === 'strength' && `${workout.exercises?.length} exercises`}
              {workout.type === 'rest' && 'Rest day'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {workout.type === 'strength' && getTotalVolume() > 0 && (
            <div className="text-right">
              <p className="text-xs text-white/60">Total Volume</p>
              <p className="text-lg font-bold text-accent">{getTotalVolume()} kg</p>
            </div>
          )}
          <svg
            className={`w-5 h-5 text-white/60 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && workout.type === 'strength' && (
        <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
          {workout.exercises?.map((exercise, exIndex) => (
            <div key={exIndex} className="border border-white/10 rounded-lg p-4">
              {/* Exercise Header */}
              <div className="mb-3">
                <h4 className="font-semibold text-white">{exercise.name}</h4>
                <p className="text-xs text-white/60 mt-1">
                  Target: {exercise.targetSets} sets × {exercise.targetReps} reps • Tempo {exercise.tempo} • Rest {exercise.rest}
                  {exercise.targetRpe && ` • RPE ${exercise.targetRpe}`}
                  {exercise.targetRir && ` • RIR ${exercise.targetRir}`}
                </p>
                {exercise.notes && (
                  <p className="text-xs text-primary mt-1">{exercise.notes}</p>
                )}
              </div>

              {/* Logged Sets */}
              {loggedSets[exercise.name] && loggedSets[exercise.name].length > 0 && (
                <div className="space-y-2 mb-3">
                  {loggedSets[exercise.name].map((set, setIndex) => (
                    <div key={setIndex} className="grid grid-cols-12 gap-2">
                      <div className="col-span-1 flex items-center">
                        <span className="text-sm font-medium text-white/70">{setIndex + 1}</span>
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          placeholder="Weight"
                          value={set.weight || ''}
                          onChange={(e) => updateSet(exercise.name, setIndex, 'weight', Number(e.target.value))}
                          className="form-input w-full text-sm"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          placeholder="Reps"
                          value={set.reps || ''}
                          onChange={(e) => updateSet(exercise.name, setIndex, 'reps', Number(e.target.value))}
                          className="form-input w-full text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="RPE"
                          value={set.rpe || ''}
                          onChange={(e) => updateSet(exercise.name, setIndex, 'rpe', Number(e.target.value))}
                          className="form-input w-full text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <span className="text-xs text-white/60">
                          {set.weight && set.reps ? `${set.weight * set.reps} kg` : '—'}
                        </span>
                      </div>
                      <div className="col-span-1 flex items-center">
                        <button
                          onClick={() => removeSet(exercise.name, setIndex)}
                          className="text-red-400 hover:text-red-300"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Set Button */}
              <button
                onClick={() => addSet(exercise.name)}
                className="btn-secondary w-full text-sm"
              >
                + Add Set
              </button>
            </div>
          ))}

          {/* Save Button */}
          {Object.keys(loggedSets).length > 0 && (
            <div className="pt-4 border-t border-white/10">
              <button
                onClick={saveWorkout}
                disabled={saving}
                className="btn-primary w-full"
              >
                {saving ? 'Saving...' : 'Save Workout'}
              </button>
              {saveMessage && (
                <p className="text-sm text-center mt-2">{saveMessage}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
