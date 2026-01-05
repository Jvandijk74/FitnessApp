'use client';

import { useState } from 'react';
import { AIPlanGenerator } from '@/components/training/AIPlanGenerator';
import { DayTemplateCreator } from '@/components/training/DayTemplateCreator';
import { TemplateLibrary } from '@/components/training/TemplateLibrary';

type CreationMode = 'day-template' | 'browse-templates' | 'schedule-workout' | 'ai';

export default function CreateTrainingPage() {
  const [mode, setMode] = useState<CreationMode>('day-template');

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Create Training</h1>
        <p className="text-text-secondary">
          {mode === 'day-template' && 'Create a reusable workout template'}
          {mode === 'browse-templates' && 'Browse your saved workout templates'}
          {mode === 'schedule-workout' && 'Schedule a workout from your templates'}
          {mode === 'ai' && 'Generate a training plan with AI'}
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="card">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={() => setMode('day-template')}
            className={`py-3 px-3 rounded-lg font-medium transition-all text-sm ${
              mode === 'day-template'
                ? 'bg-primary-500 text-white'
                : 'bg-surface-elevated text-text-secondary hover:bg-surface-elevated/80'
            }`}
          >
            <div className="text-xl mb-1">💪</div>
            Create Template
          </button>
          <button
            onClick={() => setMode('browse-templates')}
            className={`py-3 px-3 rounded-lg font-medium transition-all text-sm ${
              mode === 'browse-templates'
                ? 'bg-primary-500 text-white'
                : 'bg-surface-elevated text-text-secondary hover:bg-surface-elevated/80'
            }`}
          >
            <div className="text-xl mb-1">📚</div>
            Browse Templates
          </button>
          <button
            onClick={() => setMode('schedule-workout')}
            className={`py-3 px-3 rounded-lg font-medium transition-all text-sm ${
              mode === 'schedule-workout'
                ? 'bg-primary-500 text-white'
                : 'bg-surface-elevated text-text-secondary hover:bg-surface-elevated/80'
            }`}
          >
            <div className="text-xl mb-1">📅</div>
            Schedule Workout
          </button>
          <button
            onClick={() => setMode('ai')}
            className={`py-3 px-3 rounded-lg font-medium transition-all text-sm ${
              mode === 'ai'
                ? 'bg-primary-500 text-white'
                : 'bg-surface-elevated text-text-secondary hover:bg-surface-elevated/80'
            }`}
          >
            <div className="text-xl mb-1">🤖</div>
            AI Generated
          </button>
        </div>
      </div>

      {/* AI Mode */}
      {mode === 'ai' && (
        <AIPlanGenerator
          userId="demo-user"
          onPlanGenerated={(plan) => {
            console.log('Plan generated:', plan);
            // Optionally navigate somewhere or show success message
          }}
        />
      )}

      {/* Day Template Creator Mode */}
      {mode === 'day-template' && (
        <DayTemplateCreator
          userId="demo-user"
          onTemplateCreated={(templateId) => {
            console.log('Template created:', templateId);
            // Optionally switch to browse mode or show success
            setMode('browse-templates');
          }}
        />
      )}

      {/* Browse Templates Mode */}
      {mode === 'browse-templates' && (
        <div className="card">
          <TemplateLibrary
            userId="demo-user"
            mode="select"
            onTemplateSelect={(template) => {
              console.log('Template selected:', template);
            }}
          />
        </div>
      )}

      {/* Schedule Workout Mode */}
      {mode === 'schedule-workout' && (
        <div className="card">
          <TemplateLibrary
            userId="demo-user"
            mode="schedule"
          />
        </div>
      )}
    </div>
  );
}
