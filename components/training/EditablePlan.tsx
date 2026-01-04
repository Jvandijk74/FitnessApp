'use client';

import { useState, useEffect } from 'react';

interface Exercise {
  exerciseName: string;
  sets: number;
  reps: string;
  tempo: string;
  rest: string;
  targetRPE: string;
  notes?: string;
}

interface WorkoutDay {
  dayOfWeek: string;
  name: string;
  type: string;
  exercises: Exercise[];
  scheduledDate?: string; // NEW: for scheduling
}

interface GeneratedPlan {
  planName: string;
  description: string;
  days: WorkoutDay[];
}

interface EditablePlanProps {
  initialPlan: GeneratedPlan;
  userId: string;
  availableExercises: Array<{ name: string; muscle_group: string }>;
  onSave?: (plan: GeneratedPlan) => void;
  onCancel?: () => void;
}

export function EditablePlan({
  initialPlan,
  userId,
  availableExercises,
  onSave,
  onCancel
}: EditablePlanProps) {
  const [plan, setPlan] = useState<GeneratedPlan>(initialPlan);
  const [isSaving, setIsSaving] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState<{
    dayIndex: number;
    insertIndex: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter exercises based on search
  const filteredExercises = availableExercises.filter(ex =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ex.muscle_group.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add exercise to a specific day
  const addExercise = (dayIndex: number, exercise: { name: string; muscle_group: string }) => {
    const newPlan = { ...plan };
    const newExercise: Exercise = {
      exerciseName: exercise.name,
      sets: 3,
      reps: '8-12',
      tempo: '3010',
      rest: '90s',
      targetRPE: '7-8',
      notes: '',
    };

    if (showExercisePicker) {
      newPlan.days[dayIndex].exercises.splice(showExercisePicker.insertIndex, 0, newExercise);
    } else {
      newPlan.days[dayIndex].exercises.push(newExercise);
    }

    setPlan(newPlan);
    setShowExercisePicker(null);
    setSearchQuery('');
  };

  // Remove exercise
  const removeExercise = (dayIndex: number, exerciseIndex: number) => {
    const newPlan = { ...plan };
    newPlan.days[dayIndex].exercises.splice(exerciseIndex, 1);
    setPlan(newPlan);
  };

  // Move exercise up
  const moveExerciseUp = (dayIndex: number, exerciseIndex: number) => {
    if (exerciseIndex === 0) return;
    const newPlan = { ...plan };
    const exercises = newPlan.days[dayIndex].exercises;
    [exercises[exerciseIndex - 1], exercises[exerciseIndex]] =
      [exercises[exerciseIndex], exercises[exerciseIndex - 1]];
    setPlan(newPlan);
  };

  // Move exercise down
  const moveExerciseDown = (dayIndex: number, exerciseIndex: number) => {
    const newPlan = { ...plan };
    const exercises = newPlan.days[dayIndex].exercises;
    if (exerciseIndex === exercises.length - 1) return;
    [exercises[exerciseIndex], exercises[exerciseIndex + 1]] =
      [exercises[exerciseIndex + 1], exercises[exerciseIndex]];
    setPlan(newPlan);
  };

  // Update exercise field
  const updateExercise = (
    dayIndex: number,
    exerciseIndex: number,
    field: keyof Exercise,
    value: any
  ) => {
    const newPlan = { ...plan };
    newPlan.days[dayIndex].exercises[exerciseIndex] = {
      ...newPlan.days[dayIndex].exercises[exerciseIndex],
      [field]: value,
    };
    setPlan(newPlan);
  };

  // Update scheduled date
  const updateScheduledDate = (dayIndex: number, date: string) => {
    const newPlan = { ...plan };
    newPlan.days[dayIndex].scheduledDate = date;
    setPlan(newPlan);
  };

  // Update plan name or description
  const updatePlanInfo = (field: 'planName' | 'description', value: string) => {
    setPlan({ ...plan, [field]: value });
  };

  // Save plan as template
  const savePlanAsTemplate = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: plan.planName,
          description: plan.description,
          days: plan.days.map(day => ({
            day_of_week: day.dayOfWeek,
            name: day.name,
            exercises: day.exercises.map(ex => ({
              exercise_name: ex.exerciseName,
              sets: ex.sets,
              reps: ex.reps,
              tempo: ex.tempo,
              rest_seconds: parseInt(ex.rest) || 90,
              target_rpe: ex.targetRPE,
              notes: ex.notes,
            })),
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to save template');

      console.log('✅ Template saved successfully');
      if (onSave) onSave(plan);
    } catch (error) {
      console.error('❌ Failed to save template:', error);
      alert('Failed to save template. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Plan Header - Editable */}
      <div className="card">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-tertiary mb-2">
              Plan Name
            </label>
            <input
              type="text"
              value={plan.planName}
              onChange={(e) => updatePlanInfo('planName', e.target.value)}
              className="w-full px-4 py-2 bg-surface-elevated border border-surface-elevated rounded-lg focus:outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-tertiary mb-2">
              Description
            </label>
            <textarea
              value={plan.description}
              onChange={(e) => updatePlanInfo('description', e.target.value)}
              className="w-full px-4 py-2 bg-surface-elevated border border-surface-elevated rounded-lg focus:outline-none focus:border-primary-500"
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Workout Days */}
      {plan.days.map((day, dayIndex) => (
        <div key={dayIndex} className="card">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <h4 className="text-lg font-bold text-primary-400 capitalize mb-2">
                  {day.dayOfWeek} - {day.name}
                </h4>

                {/* Date Scheduler */}
                <div className="flex items-center gap-3">
                  <label className="text-sm text-text-tertiary">Schedule for:</label>
                  <input
                    type="date"
                    value={day.scheduledDate || ''}
                    onChange={(e) => updateScheduledDate(dayIndex, e.target.value)}
                    className="px-3 py-1 bg-surface-elevated border border-surface-elevated rounded-lg text-sm focus:outline-none focus:border-primary-500"
                  />
                  {day.scheduledDate && (
                    <button
                      onClick={() => updateScheduledDate(dayIndex, '')}
                      className="text-xs text-text-tertiary hover:text-semantic-error"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <span className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm font-medium">
                {day.exercises.length} exercises
              </span>
            </div>

            {/* Exercises List */}
            <div className="space-y-3">
              {day.exercises.map((exercise, exIndex) => (
                <div key={exIndex} className="bg-surface-base rounded-lg p-4 border border-surface-elevated">
                  {/* Exercise Header with Controls */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h5 className="font-semibold text-text-primary mb-2">{exercise.exerciseName}</h5>
                    </div>

                    {/* Reorder and Delete Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => moveExerciseUp(dayIndex, exIndex)}
                        disabled={exIndex === 0}
                        className="p-1 text-text-tertiary hover:text-primary-400 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveExerciseDown(dayIndex, exIndex)}
                        disabled={exIndex === day.exercises.length - 1}
                        className="p-1 text-text-tertiary hover:text-primary-400 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => removeExercise(dayIndex, exIndex)}
                        className="p-1 text-text-tertiary hover:text-semantic-error"
                        title="Remove exercise"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Editable Exercise Fields */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div>
                      <label className="text-xs text-text-tertiary">Sets</label>
                      <input
                        type="number"
                        value={exercise.sets}
                        onChange={(e) => updateExercise(dayIndex, exIndex, 'sets', parseInt(e.target.value))}
                        className="w-full px-2 py-1 bg-surface-elevated border border-surface-elevated rounded text-sm focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-text-tertiary">Reps</label>
                      <input
                        type="text"
                        value={exercise.reps}
                        onChange={(e) => updateExercise(dayIndex, exIndex, 'reps', e.target.value)}
                        className="w-full px-2 py-1 bg-surface-elevated border border-surface-elevated rounded text-sm focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-text-tertiary">Tempo</label>
                      <input
                        type="text"
                        value={exercise.tempo}
                        onChange={(e) => updateExercise(dayIndex, exIndex, 'tempo', e.target.value)}
                        className="w-full px-2 py-1 bg-surface-elevated border border-surface-elevated rounded text-sm focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-text-tertiary">Rest</label>
                      <input
                        type="text"
                        value={exercise.rest}
                        onChange={(e) => updateExercise(dayIndex, exIndex, 'rest', e.target.value)}
                        className="w-full px-2 py-1 bg-surface-elevated border border-surface-elevated rounded text-sm focus:outline-none focus:border-primary-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="text-xs text-text-tertiary">Target RPE</label>
                      <input
                        type="text"
                        value={exercise.targetRPE}
                        onChange={(e) => updateExercise(dayIndex, exIndex, 'targetRPE', e.target.value)}
                        className="w-full px-2 py-1 bg-surface-elevated border border-surface-elevated rounded text-sm focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-text-tertiary">Notes</label>
                      <textarea
                        value={exercise.notes || ''}
                        onChange={(e) => updateExercise(dayIndex, exIndex, 'notes', e.target.value)}
                        className="w-full px-2 py-1 bg-surface-elevated border border-surface-elevated rounded text-sm focus:outline-none focus:border-primary-500"
                        rows={2}
                        placeholder="Add coaching notes..."
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Exercise Button */}
              <button
                onClick={() => setShowExercisePicker({ dayIndex, insertIndex: day.exercises.length })}
                className="w-full p-3 border-2 border-dashed border-surface-elevated hover:border-primary-500/50 rounded-lg text-text-tertiary hover:text-primary-400 transition-colors"
              >
                + Add Exercise
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Exercise Picker Modal */}
      {showExercisePicker !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-base rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-surface-elevated">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-text-primary">Add Exercise</h3>
                <button
                  onClick={() => {
                    setShowExercisePicker(null);
                    setSearchQuery('');
                  }}
                  className="text-text-tertiary hover:text-text-primary"
                >
                  ✕
                </button>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search exercises..."
                className="w-full px-4 py-2 bg-surface-elevated border border-surface-elevated rounded-lg focus:outline-none focus:border-primary-500"
                autoFocus
              />
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              <div className="space-y-2">
                {filteredExercises.map((exercise, index) => (
                  <button
                    key={index}
                    onClick={() => addExercise(showExercisePicker.dayIndex, exercise)}
                    className="w-full p-3 bg-surface-elevated hover:bg-primary-500/10 hover:border-primary-500/50 border border-surface-elevated rounded-lg text-left transition-colors"
                  >
                    <div className="font-medium text-text-primary">{exercise.name}</div>
                    <div className="text-sm text-text-tertiary">{exercise.muscle_group}</div>
                  </button>
                ))}

                {filteredExercises.length === 0 && (
                  <div className="text-center py-8 text-text-tertiary">
                    No exercises found matching "{searchQuery}"
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="card">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={onCancel}
            className="btn btn-secondary"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={savePlanAsTemplate}
              disabled={isSaving}
              className="btn btn-primary"
            >
              {isSaving ? (
                <>
                  <span className="inline-block animate-spin mr-2">⚙️</span>
                  Saving...
                </>
              ) : (
                <>
                  💾 Save as Template
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
