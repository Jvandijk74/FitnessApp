'use client';

import { useState, useEffect } from 'react';
import { TrainingDay } from '@/lib/db/types';
import {
  getExercises,
  createWorkoutTemplate,
  activateTemplate,
  cloneTemplateForWeeks,
  Exercise,
  TemplateDay,
  TemplateExercise,
  calculateTemplateVolume,
  WorkoutTemplate
} from '@/app/actions/templates';

const DAYS: TrainingDay[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function CreateTrainingPage() {
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [currentDay, setCurrentDay] = useState<TrainingDay>('monday');
  const [exercises, setExercises] = useState<Record<string, Exercise[]>>({});
  const [days, setDays] = useState<Record<TrainingDay, TemplateDay>>({
    monday: { day_of_week: 'monday', type: 'strength', exercises: [] },
    tuesday: { day_of_week: 'tuesday', type: 'rest', exercises: [] },
    wednesday: { day_of_week: 'wednesday', type: 'strength', exercises: [] },
    thursday: { day_of_week: 'thursday', type: 'rest', exercises: [] },
    friday: { day_of_week: 'friday', type: 'strength', exercises: [] },
    saturday: { day_of_week: 'saturday', type: 'rest', exercises: [] },
    sunday: { day_of_week: 'sunday', type: 'rest', exercises: [] }
  });
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [muscleGroupVolume, setMuscleGroupVolume] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [savedTemplateId, setSavedTemplateId] = useState<string | null>(null);
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [weeksToClone, setWeeksToClone] = useState(4);

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    // Calculate muscle group volume whenever days change
    const template: WorkoutTemplate = {
      id: '',
      name: templateName,
      created_at: new Date().toISOString(),
      days: Object.values(days)
    };
    calculateTemplateVolume(template).then(setMuscleGroupVolume);
  }, [days, templateName]);

  async function loadExercises() {
    const exercisesByMuscleGroup = await getExercises();
    setExercises(exercisesByMuscleGroup);
  }

  const dayLabels: Record<TrainingDay, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  const updateDayType = (day: TrainingDay, type: 'strength' | 'run' | 'rest') => {
    setDays(prev => ({
      ...prev,
      [day]: { ...prev[day], type, exercises: type === 'strength' ? prev[day].exercises : [] }
    }));
  };

  const addExercise = (exercise: Exercise) => {
    const currentExercises = days[currentDay].exercises || [];
    const newExercise: TemplateExercise = {
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      muscle_group: exercise.muscle_group,
      sets: 3,
      reps: '8-10',
      tempo: '2-0-2-0',
      rest: '90 sec',
      target_rpe: '7-8',
      order_index: currentExercises.length
    };

    setDays(prev => ({
      ...prev,
      [currentDay]: {
        ...prev[currentDay],
        exercises: [...currentExercises, newExercise]
      }
    }));

    setShowExerciseSelector(false);
  };

  const updateExercise = (day: TrainingDay, index: number, field: keyof TemplateExercise, value: any) => {
    setDays(prev => {
      const dayExercises = [...(prev[day].exercises || [])];
      dayExercises[index] = { ...dayExercises[index], [field]: value };
      return {
        ...prev,
        [day]: { ...prev[day], exercises: dayExercises }
      };
    });
  };

  const removeExercise = (day: TrainingDay, index: number) => {
    setDays(prev => {
      const dayExercises = [...(prev[day].exercises || [])];
      dayExercises.splice(index, 1);
      // Update order_index
      dayExercises.forEach((ex, i) => ex.order_index = i);
      return {
        ...prev,
        [day]: { ...prev[day], exercises: dayExercises }
      };
    });
  };

  const moveExercise = (day: TrainingDay, index: number, direction: 'up' | 'down') => {
    setDays(prev => {
      const dayExercises = [...(prev[day].exercises || [])];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= dayExercises.length) return prev;

      [dayExercises[index], dayExercises[newIndex]] = [dayExercises[newIndex], dayExercises[index]];
      dayExercises.forEach((ex, i) => ex.order_index = i);

      return {
        ...prev,
        [day]: { ...prev[day], exercises: dayExercises }
      };
    });
  };

  const getWeekStartDate = (week: number, year: number): string => {
    const jan4 = new Date(year, 0, 4);
    const daysToAdd = (week - 1) * 7 - jan4.getDay() + 1;
    const weekStart = new Date(year, 0, 4 + daysToAdd);
    return weekStart.toISOString().split('T')[0];
  };

  const getCurrentWeek = () => {
    const now = new Date();
    const onejan = new Date(now.getFullYear(), 0, 1);
    const week = Math.ceil((((now.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
    return { week, year: now.getFullYear() };
  };

  const activateForWeeks = async () => {
    if (!savedTemplateId) return;

    const { week, year } = getCurrentWeek();
    const weekDates: string[] = [];

    for (let i = 0; i < weeksToClone; i++) {
      const targetWeek = week + i;
      weekDates.push(getWeekStartDate(targetWeek, year));
    }

    const result = await cloneTemplateForWeeks('demo-user', savedTemplateId, weekDates);

    if (result.success) {
      window.location.href = '/plan';
    }
  };

  const saveTemplate = async () => {
    if (!templateName.trim()) {
      setSaveMessage('❌ Please enter a template name');
      return;
    }

    setSaving(true);
    setSaveMessage('');

    try {
      const result = await createWorkoutTemplate({
        user_id: 'demo-user',
        name: templateName,
        description: templateDescription,
        days: Object.values(days)
      });

      if (result.success && result.template_id) {
        setSaveMessage('✅ Template saved successfully!');
        setSavedTemplateId(result.template_id);
        setShowActivateDialog(true);
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

  const currentDayData = days[currentDay];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Create Training Plan</h1>
        <p className="text-text-secondary">Build your custom weekly workout template</p>
      </div>

      {/* Template Info */}
      <div className="card">
        <h2 className="text-xl font-bold text-white mb-4">Template Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Template Name *</label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., PPL Split, Full Body 3x/week"
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Description (optional)</label>
            <textarea
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="Describe your training plan..."
              className="form-input w-full h-20"
            />
          </div>
        </div>
      </div>

      {/* Muscle Group Volume Preview */}
      {Object.keys(muscleGroupVolume).length > 0 && (
        <div className="card">
          <h3 className="text-lg font-bold text-white mb-4">Weekly Volume by Muscle Group</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(muscleGroupVolume).map(([muscleGroup, sets]) => (
              <div key={muscleGroup} className="bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-xs text-white/60 mb-1">{muscleGroup}</p>
                <p className="text-2xl font-bold text-white">{sets} <span className="text-sm font-normal">sets</span></p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day Tabs */}
      <div className="card">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setCurrentDay(day)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                currentDay === day
                  ? 'bg-primary text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {dayLabels[day]}
            </button>
          ))}
        </div>

        {/* Day Type Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white/80 mb-2">Day Type</label>
          <div className="flex gap-3">
            <button
              onClick={() => updateDayType(currentDay, 'strength')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentDayData.type === 'strength'
                  ? 'bg-accent text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              💪 Strength
            </button>
            <button
              onClick={() => updateDayType(currentDay, 'run')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentDayData.type === 'run'
                  ? 'bg-primary text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              🏃 Run
            </button>
            <button
              onClick={() => updateDayType(currentDay, 'rest')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentDayData.type === 'rest'
                  ? 'bg-white/10 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              😴 Rest
            </button>
          </div>
        </div>

        {/* Exercises List */}
        {currentDayData.type === 'strength' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Exercises</h3>
              <button
                onClick={() => setShowExerciseSelector(true)}
                className="btn-primary text-sm"
              >
                + Add Exercise
              </button>
            </div>

            {currentDayData.exercises && currentDayData.exercises.length > 0 ? (
              <div className="space-y-3">
                {currentDayData.exercises.map((exercise, index) => (
                  <div key={index} className="border border-white/10 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{exercise.exercise_name}</h4>
                        <p className="text-xs text-primary mt-1">{exercise.muscle_group}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => moveExercise(currentDay, index, 'up')}
                          disabled={index === 0}
                          className="text-white/60 hover:text-white disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveExercise(currentDay, index, 'down')}
                          disabled={index === currentDayData.exercises!.length - 1}
                          className="text-white/60 hover:text-white disabled:opacity-30"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => removeExercise(currentDay, index)}
                          className="text-red-400 hover:text-red-300 ml-2"
                        >
                          ×
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs text-white/60 mb-1">Sets</label>
                        <input
                          type="number"
                          value={exercise.sets}
                          onChange={(e) => updateExercise(currentDay, index, 'sets', Number(e.target.value))}
                          className="form-input w-full text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-white/60 mb-1">Reps</label>
                        <input
                          type="text"
                          value={exercise.reps}
                          onChange={(e) => updateExercise(currentDay, index, 'reps', e.target.value)}
                          className="form-input w-full text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-white/60 mb-1">Tempo</label>
                        <input
                          type="text"
                          value={exercise.tempo}
                          onChange={(e) => updateExercise(currentDay, index, 'tempo', e.target.value)}
                          className="form-input w-full text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-white/60 mb-1">Rest</label>
                        <input
                          type="text"
                          value={exercise.rest}
                          onChange={(e) => updateExercise(currentDay, index, 'rest', e.target.value)}
                          className="form-input w-full text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="block text-xs text-white/60 mb-1">Target RPE</label>
                        <input
                          type="text"
                          value={exercise.target_rpe || ''}
                          onChange={(e) => updateExercise(currentDay, index, 'target_rpe', e.target.value)}
                          placeholder="e.g., 7-8"
                          className="form-input w-full text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-white/60 mb-1">Target RIR</label>
                        <input
                          type="text"
                          value={exercise.target_rir || ''}
                          onChange={(e) => updateExercise(currentDay, index, 'target_rir', e.target.value)}
                          placeholder="e.g., 1-2"
                          className="form-input w-full text-sm"
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-xs text-white/60 mb-1">Notes (optional)</label>
                      <input
                        type="text"
                        value={exercise.notes || ''}
                        onChange={(e) => updateExercise(currentDay, index, 'notes', e.target.value)}
                        placeholder="Exercise notes..."
                        className="form-input w-full text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-white/60">
                <p className="text-2xl mb-2">💪</p>
                <p>No exercises added yet</p>
                <p className="text-sm mt-1">Click "Add Exercise" to get started</p>
              </div>
            )}
          </div>
        )}

        {currentDayData.type === 'rest' && (
          <div className="text-center py-12 text-white/60">
            <p className="text-2xl mb-2">😴</p>
            <p>Rest & Recovery Day</p>
            <p className="text-sm mt-1">Focus on recovery, mobility, and nutrition</p>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="card">
        <button
          onClick={saveTemplate}
          disabled={saving}
          className="btn-primary w-full"
        >
          {saving ? 'Saving Template...' : 'Save Training Template'}
        </button>
        {saveMessage && (
          <p className="text-sm text-center mt-3">{saveMessage}</p>
        )}
      </div>

      {/* Exercise Selector Modal */}
      {showExerciseSelector && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Select Exercise</h3>
              <button
                onClick={() => setShowExerciseSelector(false)}
                className="text-white/60 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {Object.entries(exercises).map(([muscleGroup, exerciseList]) => (
                <div key={muscleGroup} className="mb-6">
                  <h4 className="text-lg font-bold text-primary mb-3">{muscleGroup}</h4>
                  <div className="grid gap-2">
                    {exerciseList.map((exercise) => (
                      <button
                        key={exercise.id}
                        onClick={() => addExercise(exercise)}
                        className="text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                      >
                        <p className="text-white font-medium">{exercise.name}</p>
                        {exercise.description && (
                          <p className="text-xs text-white/60 mt-1">{exercise.description}</p>
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

      {/* Activation Dialog */}
      {showActivateDialog && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-white mb-4">✅ Template Saved!</h3>
            <p className="text-white/80 mb-6">
              Would you like to activate this template for the upcoming weeks?
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-white/80 mb-2">
                Number of weeks to activate
              </label>
              <input
                type="number"
                value={weeksToClone}
                onChange={(e) => setWeeksToClone(Number(e.target.value))}
                min="1"
                max="52"
                className="form-input w-full"
              />
              <p className="text-xs text-white/60 mt-1">
                This will schedule the template for the next {weeksToClone} week{weeksToClone > 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.location.href = '/plan'}
                className="btn-secondary flex-1"
              >
                Skip for Now
              </button>
              <button
                onClick={activateForWeeks}
                className="btn-primary flex-1"
              >
                Activate Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
