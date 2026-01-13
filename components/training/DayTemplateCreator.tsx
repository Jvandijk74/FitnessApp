'use client';

import { useState, useEffect } from 'react';
import { DayTemplate, ScheduledWorkoutExercise, createDayTemplate } from '@/app/actions/scheduled-workouts';
import { getExercises, Exercise } from '@/app/actions/templates';

interface DayTemplateCreatorProps {
  userId: string;
  onTemplateCreated?: (templateId: string) => void;
}

export function DayTemplateCreator({ userId, onTemplateCreated }: DayTemplateCreatorProps) {
  const [templateName, setTemplateName] = useState('');
  const [description, setDescription] = useState('');
  const [workoutType, setWorkoutType] = useState<'strength' | 'run' | 'rest'>('strength');
  const [exercises, setExercises] = useState<ScheduledWorkoutExercise[]>([]);
  const [availableExercises, setAvailableExercises] = useState<Record<string, Exercise[]>>({});
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Running workout fields
  const [runDuration, setRunDuration] = useState<number | undefined>();
  const [runDistance, setRunDistance] = useState<number | undefined>();
  const [runIntensity, setRunIntensity] = useState('');
  const [runTargetPace, setRunTargetPace] = useState('');
  const [runTargetRPE, setRunTargetRPE] = useState<number | undefined>();

  useEffect(() => {
    loadExercises();
  }, []);

  async function loadExercises() {
    const exercisesByMuscleGroup = await getExercises();
    setAvailableExercises(exercisesByMuscleGroup);
  }

  const addExercise = (exercise: Exercise) => {
    const newExercise: ScheduledWorkoutExercise = {
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      muscle_group: exercise.muscle_group,
      sets: 3,
      reps: '8-10',
      tempo: '2-0-2-0',
      rest: '90 sec',
      target_rpe: '7-8',
      order_index: exercises.length
    };

    setExercises([...exercises, newExercise]);
    setShowExerciseSelector(false);
  };

  const updateExercise = (index: number, field: keyof ScheduledWorkoutExercise, value: any) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const removeExercise = (index: number) => {
    const updated = exercises.filter((_, i) => i !== index);
    updated.forEach((ex, i) => ex.order_index = i);
    setExercises(updated);
  };

  const moveExercise = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= exercises.length) return;

    const updated = [...exercises];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    updated.forEach((ex, i) => ex.order_index = i);
    setExercises(updated);
  };

  const handleSave = async () => {
    if (!templateName.trim()) {
      setSaveMessage('❌ Please enter a template name');
      return;
    }

    if (workoutType === 'strength' && exercises.length === 0) {
      setSaveMessage('❌ Please add at least one exercise');
      return;
    }

    setSaving(true);
    setSaveMessage('');

    try {
      const template: DayTemplate = {
        user_id: userId,
        name: templateName,
        description,
        workout_type: workoutType,
        run_duration_minutes: runDuration,
        run_distance_km: runDistance,
        run_intensity: runIntensity || undefined,
        run_target_pace: runTargetPace || undefined,
        run_target_rpe: runTargetRPE,
        exercises: workoutType === 'strength' ? exercises : undefined
      };

      const result = await createDayTemplate(template);

      if (result.success && result.template_id) {
        setSaveMessage('✅ Template saved successfully!');
        // Reset form
        setTimeout(() => {
          setTemplateName('');
          setDescription('');
          setExercises([]);
          setRunDuration(undefined);
          setRunDistance(undefined);
          setRunIntensity('');
          setRunTargetPace('');
          setRunTargetRPE(undefined);
          setSaveMessage('');

          if (onTemplateCreated) {
            onTemplateCreated(result.template_id);
          }
        }, 2000);
      } else {
        setSaveMessage('❌ Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      setSaveMessage('❌ Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Template Info */}
      <div className="card">
        <h3 className="text-xl font-bold text-text-primary mb-4">Template Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Template Name *</label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Upper Body Push Day, Easy 5K Run"
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this workout template..."
              className="form-input w-full h-20"
            />
          </div>
        </div>
      </div>

      {/* Workout Type */}
      <div className="card">
        <h3 className="text-lg font-bold text-text-primary mb-3">Workout Type</h3>
        <div className="flex gap-3">
          <button
            onClick={() => setWorkoutType('strength')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              workoutType === 'strength'
                ? 'bg-accent-500 text-white'
                : 'bg-surface-elevated text-text-secondary hover:bg-surface-elevated/80'
            }`}
          >
            💪 Strength
          </button>
          <button
            onClick={() => setWorkoutType('run')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              workoutType === 'run'
                ? 'bg-primary-500 text-white'
                : 'bg-surface-elevated text-text-secondary hover:bg-surface-elevated/80'
            }`}
          >
            🏃 Run
          </button>
          <button
            onClick={() => setWorkoutType('rest')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              workoutType === 'rest'
                ? 'bg-surface-elevated/50 text-text-primary'
                : 'bg-surface-elevated text-text-secondary hover:bg-surface-elevated/80'
            }`}
          >
            😴 Rest
          </button>
        </div>
      </div>

      {/* Running Workout Details */}
      {workoutType === 'run' && (
        <div className="card">
          <h3 className="text-lg font-bold text-text-primary mb-4">Run Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Duration (minutes)</label>
              <input
                type="number"
                value={runDuration || ''}
                onChange={(e) => setRunDuration(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="30"
                className="form-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Distance (km)</label>
              <input
                type="number"
                step="0.1"
                value={runDistance || ''}
                onChange={(e) => setRunDistance(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="5.0"
                className="form-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Intensity</label>
              <select
                value={runIntensity}
                onChange={(e) => setRunIntensity(e.target.value)}
                className="form-input w-full"
              >
                <option value="">Select intensity</option>
                <option value="Easy">Easy</option>
                <option value="Moderate">Moderate</option>
                <option value="Tempo">Tempo</option>
                <option value="Interval">Interval</option>
                <option value="Long Run">Long Run</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Target RPE (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={runTargetRPE || ''}
                onChange={(e) => setRunTargetRPE(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="7"
                className="form-input w-full"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-text-secondary mb-2">Target Pace (min/km)</label>
              <input
                type="text"
                value={runTargetPace}
                onChange={(e) => setRunTargetPace(e.target.value)}
                placeholder="5:30"
                className="form-input w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Strength Workout Details */}
      {workoutType === 'strength' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-text-primary">Exercises</h3>
            <button
              onClick={() => setShowExerciseSelector(true)}
              className="btn-primary text-sm"
            >
              + Add Exercise
            </button>
          </div>

          {exercises.length > 0 ? (
            <div className="space-y-3">
              {exercises.map((exercise, index) => (
                <div key={index} className="border border-surface-elevated rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-text-primary">{exercise.exercise_name}</h4>
                      <p className="text-xs text-primary-400 mt-1">{exercise.muscle_group}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => moveExercise(index, 'up')}
                        disabled={index === 0}
                        className="text-text-tertiary hover:text-text-primary disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveExercise(index, 'down')}
                        disabled={index === exercises.length - 1}
                        className="text-text-tertiary hover:text-text-primary disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => removeExercise(index)}
                        className="text-semantic-error hover:text-semantic-error/80 ml-2"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-text-tertiary mb-1">Sets</label>
                      <input
                        type="number"
                        value={exercise.sets}
                        onChange={(e) => updateExercise(index, 'sets', Number(e.target.value))}
                        className="form-input w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-text-tertiary mb-1">Reps</label>
                      <input
                        type="text"
                        value={exercise.reps}
                        onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                        className="form-input w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-text-tertiary mb-1">Tempo</label>
                      <input
                        type="text"
                        value={exercise.tempo}
                        onChange={(e) => updateExercise(index, 'tempo', e.target.value)}
                        className="form-input w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-text-tertiary mb-1">Rest</label>
                      <input
                        type="text"
                        value={exercise.rest}
                        onChange={(e) => updateExercise(index, 'rest', e.target.value)}
                        className="form-input w-full text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-xs text-text-tertiary mb-1">Target RPE</label>
                      <input
                        type="text"
                        value={exercise.target_rpe || ''}
                        onChange={(e) => updateExercise(index, 'target_rpe', e.target.value)}
                        placeholder="e.g., 7-8"
                        className="form-input w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-text-tertiary mb-1">Target RIR</label>
                      <input
                        type="text"
                        value={exercise.target_rir || ''}
                        onChange={(e) => updateExercise(index, 'target_rir', e.target.value)}
                        placeholder="e.g., 1-2"
                        className="form-input w-full text-sm"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-xs text-text-tertiary mb-1">Notes (optional)</label>
                    <input
                      type="text"
                      value={exercise.notes || ''}
                      onChange={(e) => updateExercise(index, 'notes', e.target.value)}
                      placeholder="Exercise notes..."
                      className="form-input w-full text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-text-tertiary">
              <p className="text-2xl mb-2">💪</p>
              <p>No exercises added yet</p>
              <p className="text-sm mt-1">Click "Add Exercise" to get started</p>
            </div>
          )}
        </div>
      )}

      {/* Save Button */}
      <div className="card">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full"
        >
          {saving ? 'Saving Template...' : 'Save Template'}
        </button>
        {saveMessage && (
          <p className="text-sm text-center mt-3">{saveMessage}</p>
        )}
      </div>

      {/* Exercise Selector Modal */}
      {showExerciseSelector && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-surface-elevated flex items-center justify-between">
              <h3 className="text-xl font-bold text-text-primary">Select Exercise</h3>
              <button
                onClick={() => setShowExerciseSelector(false)}
                className="text-text-tertiary hover:text-text-primary text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {Object.entries(availableExercises).map(([muscleGroup, exerciseList]) => (
                <div key={muscleGroup} className="mb-6">
                  <h4 className="text-lg font-bold text-primary-400 mb-3">{muscleGroup}</h4>
                  <div className="grid gap-2">
                    {exerciseList.map((exercise) => (
                      <button
                        key={exercise.id}
                        onClick={() => addExercise(exercise)}
                        className="text-left p-3 rounded-lg bg-surface-elevated hover:bg-surface-elevated/80 border border-surface-elevated transition-colors"
                      >
                        <p className="text-text-primary font-medium">{exercise.name}</p>
                        {exercise.description && (
                          <p className="text-xs text-text-tertiary mt-1">{exercise.description}</p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
