'use client';

import { useState } from 'react';
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
  logged?: {
    [exerciseName: string]: LoggedSet[];
  };
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
      {
        name: 'Seated Dumbbell Shoulder Press',
        targetSets: '3',
        targetReps: '8-10',
        tempo: '3-0-1-0',
        rest: '90 sec',
        targetRir: '1-2'
      },
      {
        name: 'Abdominal crunch',
        targetSets: '3',
        targetReps: '10-12',
        tempo: '3-1-1-0',
        rest: '60 sec',
        targetRpe: '8'
      },
      {
        name: 'Oblique woodchopper',
        targetSets: '3',
        targetReps: '10-12',
        tempo: '3-1-1-0',
        rest: '60 sec',
        targetRpe: '8'
      },
      {
        name: 'Weighted Reverse Crunch',
        targetSets: '2-3',
        targetReps: '8-10',
        tempo: '3-1-1-1',
        rest: '60 sec',
        targetRpe: '8',
        optional: true
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
        name: 'Romanian Deadlift (light)',
        targetSets: '2',
        targetReps: '8-10',
        tempo: '4-0-1-0',
        rest: '2 min',
        targetRpe: '6'
      },
      {
        name: 'Lat Pulldown',
        targetSets: '3',
        targetReps: '10-12',
        tempo: '2-1-2-1',
        rest: '90 sec',
        targetRir: '1-2'
      },
      {
        name: 'Seated Dumbbell Shoulder Press',
        targetSets: '3',
        targetReps: '10',
        tempo: '3-0-1-1',
        rest: '90 sec',
        targetRpe: '7'
      },
      {
        name: 'Cable Chest Fly',
        targetSets: '2-3',
        targetReps: '12-15',
        tempo: '3-1-2-1',
        rest: '75 sec',
        targetRpe: '8'
      },
      {
        name: 'Cable Crunch',
        targetSets: '3',
        targetReps: '10-12',
        tempo: '3-1-1-0',
        rest: '60 sec',
        targetRpe: '8'
      },
      {
        name: 'Cable Woodchopper',
        targetSets: '2',
        targetReps: '10/side',
        tempo: '2-0-2-0',
        rest: '45-60 sec',
        targetRpe: '7-8'
      },
      {
        name: 'Reverse Crunch',
        targetSets: '2',
        targetReps: '10',
        tempo: '3-1-1-1',
        rest: '60 sec',
        targetRpe: '7-8'
      },
    ],
  },
  {
    day: 'friday',
    type: 'strength',
    exercises: [
      {
        name: 'Hack squat / Pendulum / Belt squat',
        targetSets: '3',
        targetReps: '10-15',
        tempo: '3-0-2-0',
        rest: '90-120 sec',
        targetRpe: '8-9',
        notes: 'Hypertrophy/Pump'
      },
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
        notes: 'Last 2 sets'
      },
      {
        name: 'Hip Thrust',
        targetSets: '3',
        targetReps: '10-12',
        tempo: '2-1-1-2',
        rest: '90 sec',
        targetRpe: '8'
      },
      {
        name: 'Machine Chest Press',
        targetSets: '3',
        targetReps: '12-15',
        tempo: '2-0-2-0',
        rest: '75 sec',
        targetRpe: '8'
      },
      {
        name: 'Seated Row',
        targetSets: '3',
        targetReps: '12-15',
        tempo: '2-1-2-1',
        rest: '90 sec',
        targetRpe: '8'
      },
      {
        name: 'Lateral Raises',
        targetSets: '4',
        targetReps: '15-20',
        tempo: '2-0-2-0',
        rest: '45-60 sec',
        targetRpe: '8'
      },
      {
        name: 'Cable Curl',
        targetSets: '3',
        targetReps: '12-15',
        tempo: '2-0-2-1',
        rest: '60 sec',
        targetRir: '0-1',
        notes: 'Last set'
      },
      {
        name: 'Rope Pushdown',
        targetSets: '3',
        targetReps: '12-15',
        tempo: '2-0-2-1',
        rest: '60 sec',
        targetRir: '0-1',
        notes: 'Last set'
      },
      {
        name: 'Hanging Knee Raise',
        targetSets: '3',
        targetReps: '12-15',
        tempo: '2-1-2-1',
        rest: '60 sec',
        targetRpe: '7-8'
      },
      {
        name: 'Cable Crunch (light)',
        targetSets: '2',
        targetReps: '15',
        tempo: '2-1-2-0',
        rest: '60 sec',
        targetRpe: '7'
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

function calculateVolume(sets: LoggedSet[]): number {
  return sets.reduce((total, set) => total + (set.weight * set.reps), 0);
}

function DayCard({ workout }: { workout: DayWorkout }) {
  const [expanded, setExpanded] = useState(false);
  const [logging, setLogging] = useState(false);
  const [loggedSets, setLoggedSets] = useState<{ [key: string]: LoggedSet[] }>({});

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
      total += calculateVolume(sets);
    });
    return total;
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
            workout.type === 'run' ? 'bg-primary-500/10' :
            workout.type === 'strength' ? 'bg-accent-500/10' :
            'bg-surface-elevated'
          }`}>
            {workout.type === 'run' ? '🏃' : workout.type === 'strength' ? '💪' : '😴'}
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">{dayLabels[workout.day]}</h3>
            <p className="text-sm text-text-secondary">
              {workout.type === 'run' && `${workout.run?.duration} min • ${workout.run?.intensity}`}
              {workout.type === 'strength' && (
                <>
                  {workout.exercises?.length} exercises
                  {workout.exercises && workout.exercises[0]?.notes && ` • ${workout.exercises[0].notes}`}
                </>
              )}
              {workout.type === 'rest' && 'Rest day'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {workout.type === 'strength' && Object.keys(loggedSets).length > 0 && (
            <div className="text-right">
              <p className="text-xs text-text-tertiary">Total Volume</p>
              <p className="text-lg font-bold text-primary-400">{getTotalVolume()} kg</p>
            </div>
          )}
          <svg
            className={`w-5 h-5 text-text-tertiary transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="mt-4 space-y-4 border-t border-surface-elevated pt-4">
          {workout.type === 'run' && (
            <div className="p-4 rounded-lg bg-primary-500/5 border border-primary-500/20">
              <p className="text-sm text-text-secondary">
                Target: {workout.run?.duration} min • {workout.run?.intensity} • RPE {workout.run?.targetRpe}
              </p>
              <button className="btn-primary mt-3">Log Run</button>
            </div>
          )}

          {workout.type === 'strength' && (
            <div className="space-y-4">
              {workout.exercises?.map((exercise, exIndex) => (
                <div key={exIndex} className="border border-surface-elevated rounded-lg p-4">
                  {/* Exercise Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-text-primary">{exercise.name}</h4>
                        {exercise.optional && (
                          <span className="text-xs px-2 py-0.5 rounded bg-surface-elevated text-text-tertiary border border-surface">
                            Optional
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-tertiary mt-1">
                        Target: {exercise.targetSets} sets × {exercise.targetReps} reps
                        {' • '}Tempo {exercise.tempo}
                        {' • '}Rest {exercise.rest}
                        {exercise.targetRpe && ` • RPE ${exercise.targetRpe}`}
                        {exercise.targetRir && ` • RIR ${exercise.targetRir}`}
                      </p>
                      {exercise.notes && (
                        <p className="text-xs text-primary-400 mt-1">
                          {exercise.notes}
                        </p>
                      )}
                    </div>
                    {loggedSets[exercise.name] && loggedSets[exercise.name].length > 0 && (
                      <div className="text-right ml-3">
                        <p className="text-xs text-text-tertiary">Volume</p>
                        <p className="text-sm font-bold text-accent-400">
                          {calculateVolume(loggedSets[exercise.name])} kg
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Logged Sets */}
                  {loggedSets[exercise.name] && loggedSets[exercise.name].length > 0 && (
                    <div className="space-y-2 mb-3">
                      <div className="grid grid-cols-12 gap-2 text-xs text-text-tertiary font-medium px-2">
                        <span className="col-span-1">Set</span>
                        <span className="col-span-3">Weight (kg)</span>
                        <span className="col-span-2">Reps</span>
                        <span className="col-span-2">RPE</span>
                        <span className="col-span-3">Volume</span>
                        <span className="col-span-1"></span>
                      </div>
                      {loggedSets[exercise.name].map((set, setIndex) => (
                        <div key={setIndex} className="grid grid-cols-12 gap-2 items-center">
                          <span className="col-span-1 text-sm text-text-secondary font-medium">
                            {setIndex + 1}
                          </span>
                          <input
                            type="number"
                            value={set.weight || ''}
                            onChange={(e) => updateSet(exercise.name, setIndex, 'weight', parseFloat(e.target.value) || 0)}
                            className="col-span-3 px-3 py-2 rounded-lg border border-surface-elevated bg-surface text-text-primary focus:outline-none focus:border-primary-500"
                            placeholder="0"
                          />
                          <input
                            type="number"
                            value={set.reps || ''}
                            onChange={(e) => updateSet(exercise.name, setIndex, 'reps', parseInt(e.target.value) || 0)}
                            className="col-span-2 px-3 py-2 rounded-lg border border-surface-elevated bg-surface text-text-primary focus:outline-none focus:border-primary-500"
                            placeholder="0"
                          />
                          <input
                            type="number"
                            value={set.rpe || ''}
                            onChange={(e) => updateSet(exercise.name, setIndex, 'rpe', parseInt(e.target.value) || 0)}
                            className="col-span-2 px-3 py-2 rounded-lg border border-surface-elevated bg-surface text-text-primary focus:outline-none focus:border-primary-500"
                            placeholder="7"
                            min="1"
                            max="10"
                          />
                          <span className="col-span-3 text-sm font-medium text-primary-400">
                            {set.weight * set.reps} kg
                          </span>
                          <button
                            onClick={() => removeSet(exercise.name, setIndex)}
                            className="col-span-1 text-semantic-error hover:text-semantic-error/80"
                          >
                            ✕
                          </button>
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

              {/* Save Workout Button */}
              {Object.keys(loggedSets).length > 0 && (
                <div className="flex gap-3 pt-4 border-t border-surface-elevated">
                  <button className="btn-secondary flex-1">Cancel</button>
                  <button className="btn-primary flex-1">Save Workout</button>
                </div>
              )}
            </div>
          )}

          {workout.type === 'rest' && (
            <div className="p-4 rounded-lg bg-surface-elevated text-center">
              <p className="text-text-secondary">Rest & Recovery</p>
              <p className="text-sm text-text-tertiary mt-2">
                Focus on recovery • Mobility work • Light stretching • Proper nutrition
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TrainingPlanPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Training Plan</h1>
        <p className="text-text-secondary">Week starting January 2, 2026</p>
      </div>

      {/* Weekly Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-text-tertiary mb-1">Strength Sessions</p>
          <p className="text-2xl font-bold text-accent-400">3 days</p>
          <p className="text-xs text-text-tertiary mt-1">Mon • Thu • Fri</p>
        </div>
        <div className="card">
          <p className="text-sm text-text-tertiary mb-1">Total Exercises</p>
          <p className="text-2xl font-bold text-text-primary">27 exercises</p>
          <p className="text-xs text-text-tertiary mt-1">8 + 8 + 11 per week</p>
        </div>
        <div className="card">
          <p className="text-sm text-text-tertiary mb-1">Training Focus</p>
          <p className="text-2xl font-bold text-primary-400">Full Body</p>
          <p className="text-xs text-text-tertiary mt-1">Progressive overload</p>
        </div>
      </div>

      {/* Training Days */}
      <div className="space-y-3">
        {WEEK_WORKOUTS.map((workout) => (
          <DayCard key={workout.day} workout={workout} />
        ))}
      </div>
    </div>
  );
}
