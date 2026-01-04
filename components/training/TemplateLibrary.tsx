'use client';

import { useState, useEffect } from 'react';
import { DayTemplate, getDayTemplates, scheduleFromTemplate } from '@/app/actions/scheduled-workouts';

interface TemplateLibraryProps {
  userId: string;
  onTemplateSelect?: (template: DayTemplate) => void;
  mode?: 'select' | 'schedule';
}

export function TemplateLibrary({ userId, onTemplateSelect, mode = 'select' }: TemplateLibraryProps) {
  const [templates, setTemplates] = useState<DayTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<DayTemplate | null>(null);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, [userId]);

  async function loadTemplates() {
    setLoading(true);
    try {
      const data = await getDayTemplates(userId);
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSchedule() {
    if (!selectedTemplate || !scheduleDate) return;

    setScheduling(true);
    try {
      const result = await scheduleFromTemplate(userId, selectedTemplate.id!, scheduleDate);
      if (result.success) {
        setShowScheduleDialog(false);
        setSelectedTemplate(null);
        setScheduleDate('');
        // Show success message
        alert('Workout scheduled successfully!');
      } else {
        alert('Failed to schedule workout: ' + result.error);
      }
    } catch (error) {
      console.error('Error scheduling workout:', error);
      alert('Failed to schedule workout');
    } finally {
      setScheduling(false);
    }
  }

  function handleTemplateClick(template: DayTemplate) {
    if (mode === 'select' && onTemplateSelect) {
      onTemplateSelect(template);
    } else if (mode === 'schedule') {
      setSelectedTemplate(template);
      setShowScheduleDialog(true);
      // Set default date to today
      const today = new Date().toISOString().split('T')[0];
      setScheduleDate(today);
    }
  }

  const typeIcons = {
    strength: '💪',
    run: '🏃',
    rest: '😴'
  };

  const typeColors = {
    strength: 'bg-accent-500/20 text-accent-400 border-accent-500/30',
    run: 'bg-primary-500/20 text-primary-400 border-primary-500/30',
    rest: 'bg-surface-elevated text-text-secondary border-surface-elevated'
  };

  if (loading) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <p className="text-text-tertiary">Loading templates...</p>
        </div>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <p className="text-4xl mb-4">📋</p>
          <p className="text-text-primary font-medium mb-2">No Templates Yet</p>
          <p className="text-text-tertiary text-sm">
            Create your first workout template to reuse it later
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-text-primary">Your Templates</h3>
          <p className="text-sm text-text-tertiary">{templates.length} template{templates.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="grid gap-3">
          {templates.map((template) => (
            <div
              key={template.id}
              onClick={() => handleTemplateClick(template)}
              className="card cursor-pointer hover:border-primary-500/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border ${typeColors[template.workout_type]}`}>
                    {typeIcons[template.workout_type]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-text-primary">{template.name}</h4>
                      {template.is_favorite && <span className="text-yellow-400">⭐</span>}
                    </div>
                    {template.description && (
                      <p className="text-sm text-text-tertiary mt-1">{template.description}</p>
                    )}

                    {/* Workout Details */}
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-text-secondary">
                      {template.workout_type === 'run' && (
                        <>
                          {template.run_duration_minutes && (
                            <span className="flex items-center gap-1">
                              ⏱️ {template.run_duration_minutes} min
                            </span>
                          )}
                          {template.run_distance_km && (
                            <span className="flex items-center gap-1">
                              📏 {template.run_distance_km} km
                            </span>
                          )}
                          {template.run_intensity && (
                            <span className="flex items-center gap-1">
                              🔥 {template.run_intensity}
                            </span>
                          )}
                          {template.run_target_rpe && (
                            <span className="flex items-center gap-1">
                              💯 RPE {template.run_target_rpe}
                            </span>
                          )}
                        </>
                      )}
                      {template.workout_type === 'strength' && template.exercises && (
                        <span className="flex items-center gap-1">
                          🏋️ {template.exercises.length} exercise{template.exercises.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {/* Exercise List for Strength */}
                    {template.workout_type === 'strength' && template.exercises && template.exercises.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {template.exercises.slice(0, 3).map((ex, idx) => (
                          <div key={idx} className="text-xs text-text-tertiary">
                            {ex.exercise_name} • {ex.sets} sets × {ex.reps}
                          </div>
                        ))}
                        {template.exercises.length > 3 && (
                          <div className="text-xs text-text-tertiary">
                            +{template.exercises.length - 3} more exercise{template.exercises.length - 3 !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-2xl text-text-tertiary">
                  →
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Dialog */}
      {showScheduleDialog && selectedTemplate && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-text-primary mb-4">Schedule Workout</h3>

            <div className="mb-6 p-4 bg-surface-elevated rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{typeIcons[selectedTemplate.workout_type]}</span>
                <div>
                  <p className="font-semibold text-text-primary">{selectedTemplate.name}</p>
                  <p className="text-sm text-text-tertiary capitalize">{selectedTemplate.workout_type} workout</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Workout Date
              </label>
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="form-input w-full"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowScheduleDialog(false);
                  setSelectedTemplate(null);
                }}
                className="btn-secondary flex-1"
                disabled={scheduling}
              >
                Cancel
              </button>
              <button
                onClick={handleSchedule}
                className="btn-primary flex-1"
                disabled={scheduling || !scheduleDate}
              >
                {scheduling ? 'Scheduling...' : 'Schedule Workout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
