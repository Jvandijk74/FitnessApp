'use client';

import { useState } from 'react';
import { EditablePlan } from './EditablePlan';

interface Question {
  id: string;
  question: string;
  type: 'single' | 'multiple' | 'text' | 'number';
  options?: string[];
}

interface Answers {
  experience?: 'beginner' | 'intermediate' | 'advanced';
  frequency?: number;
  sessionDuration?: number; // NEW: minutes per session
  goals?: string[];
  focusAreas?: string[];
  otherSports?: string; // NEW: other sports they do
  limitations?: string;
  equipment?: string[];
}

interface GeneratedPlan {
  planName: string;
  description: string;
  days: Array<{
    dayOfWeek: string;
    name: string;
    type: string;
    exercises: Array<{
      exerciseName: string;
      sets: number;
      reps: string;
      tempo: string;
      rest: string;
      targetRPE: string;
      notes?: string;
    }>;
  }>;
}

interface AIPlanGeneratorProps {
  userId: string;
  onPlanGenerated?: (plan: GeneratedPlan) => void;
}

const QUESTIONS: Question[] = [
  {
    id: 'experience',
    question: 'What is your strength training experience level?',
    type: 'single',
    options: ['beginner', 'intermediate', 'advanced']
  },
  {
    id: 'frequency',
    question: 'How many days per week do you want to train?',
    type: 'number',
  },
  {
    id: 'sessionDuration',
    question: 'How long should each training session be?',
    type: 'single',
    options: ['30 minutes', '45 minutes', '60 minutes', '75 minutes', '90+ minutes']
  },
  {
    id: 'goals',
    question: 'What are your primary training goals? (Select all that apply)',
    type: 'multiple',
    options: ['hypertrophy', 'strength', 'endurance', 'fat loss', 'athletic performance']
  },
  {
    id: 'focusAreas',
    question: 'Which muscle groups do you want to prioritize?',
    type: 'multiple',
    options: ['Legs', 'Chest', 'Back', 'Shoulders', 'Arms', 'Core']
  },
  {
    id: 'otherSports',
    question: 'Do you combine strength training with other sports or activities?',
    type: 'text',
  },
  {
    id: 'equipment',
    question: 'What equipment do you have access to?',
    type: 'multiple',
    options: ['Barbell', 'Dumbbells', 'Machines', 'Cables', 'Bodyweight only']
  },
  {
    id: 'limitations',
    question: 'Do you have any injuries or limitations we should know about?',
    type: 'text',
  }
];

export function AIPlanGenerator({ userId, onPlanGenerated }: AIPlanGeneratorProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [availableExercises, setAvailableExercises] = useState<Array<{ name: string; muscle_group: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const currentQuestion = QUESTIONS[currentStep];
  const isLastQuestion = currentStep === QUESTIONS.length - 1;

  const handleAnswer = (value: any) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      generatePlan();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const generatePlan = async () => {
    setIsGenerating(true);
    setError(null);

    console.log('\n🤖 [AI Plan Generator] Generating plan');
    console.log('   Answers:', answers);

    try {
      const response = await fetch('/api/generate/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          experience: answers.experience,
          frequency: answers.frequency,
          sessionDuration: answers.sessionDuration,
          goals: answers.goals || [],
          focusAreas: answers.focusAreas || [],
          otherSports: answers.otherSports || '',
          limitations: answers.limitations || '',
          equipment: answers.equipment || [],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate plan');
      }

      const data = await response.json();

      console.log('✅ [AI Plan Generator] Plan generated successfully');
      console.log('   Plan:', data.plan.planName);

      setGeneratedPlan(data.plan);
      setAvailableExercises(data.availableExercises || []);
      setIsEditing(true); // Start in edit mode
      if (onPlanGenerated) {
        onPlanGenerated(data.plan);
      }
    } catch (err) {
      console.error('❌ [AI Plan Generator] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetQuestionnaire = () => {
    setCurrentStep(0);
    setAnswers({});
    setGeneratedPlan(null);
    setError(null);
    setShowQuestionnaire(false);
  };

  // Check if current question is answered
  const currentAnswer = answers[currentQuestion?.id as keyof Answers];
  const canProceed = currentAnswer !== undefined && currentAnswer !== '' &&
    (Array.isArray(currentAnswer) ? currentAnswer.length > 0 : true);

  if (!showQuestionnaire && !generatedPlan) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🤖💪</div>
          <h3 className="text-2xl font-bold text-text-primary mb-2">
            AI Workout Plan Generator
          </h3>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Let our AI coach create a personalized strength training plan for you based on your goals and experience
          </p>
          <button
            onClick={() => setShowQuestionnaire(true)}
            className="btn btn-primary btn-lg"
          >
            <span className="mr-2">🚀</span>
            Create My Plan
          </button>
        </div>
      </div>
    );
  }

  if (generatedPlan && isEditing) {
    return (
      <EditablePlan
        initialPlan={generatedPlan}
        userId={userId}
        availableExercises={availableExercises}
        onSave={(plan) => {
          console.log('✅ Plan saved as template');
          setIsEditing(false);
        }}
        onCancel={resetQuestionnaire}
      />
    );
  }

  return (
    <div className="card">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-tertiary">
            Question {currentStep + 1} of {QUESTIONS.length}
          </span>
          <span className="text-sm text-primary-400 font-medium">
            {Math.round(((currentStep + 1) / QUESTIONS.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-surface-elevated rounded-full h-2">
          <div
            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-text-primary mb-6">
          {currentQuestion.question}
        </h3>

        {/* Single Choice */}
        {currentQuestion.type === 'single' && (
          <div className="grid gap-3">
            {currentQuestion.options?.map(option => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  currentAnswer === option
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-surface-elevated hover:border-primary-500/50'
                }`}
              >
                <span className="font-medium capitalize">{option}</span>
              </button>
            ))}
          </div>
        )}

        {/* Multiple Choice */}
        {currentQuestion.type === 'multiple' && (
          <div className="grid gap-3">
            {currentQuestion.options?.map(option => {
              const selected = Array.isArray(currentAnswer) && currentAnswer.includes(option);
              return (
                <button
                  key={option}
                  onClick={() => {
                    const current = (currentAnswer as string[]) || [];
                    const newValue = selected
                      ? current.filter(v => v !== option)
                      : [...current, option];
                    handleAnswer(newValue);
                  }}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selected
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-surface-elevated hover:border-primary-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option}</span>
                    {selected && <span className="text-primary-400">✓</span>}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Number Input */}
        {currentQuestion.type === 'number' && (
          <div>
            <input
              type="number"
              min="1"
              max="7"
              value={currentAnswer as number || ''}
              onChange={(e) => handleAnswer(parseInt(e.target.value))}
              className="w-full max-w-xs px-4 py-3 bg-surface-elevated border border-surface-elevated rounded-lg focus:outline-none focus:border-primary-500"
              placeholder="Enter number of days"
            />
            <p className="text-sm text-text-tertiary mt-2">Recommended: 3-6 days per week</p>
          </div>
        )}

        {/* Text Input */}
        {currentQuestion.type === 'text' && (
          <div>
            <textarea
              value={currentAnswer as string || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              className="w-full px-4 py-3 bg-surface-elevated border border-surface-elevated rounded-lg focus:outline-none focus:border-primary-500"
              rows={4}
              placeholder={
                currentQuestion.id === 'otherSports'
                  ? 'e.g., Running 3x/week, Soccer on weekends, Cycling... (optional)'
                  : 'Describe any injuries or limitations... (optional)'
              }
            />
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-semantic-error/10 border border-semantic-error/20 rounded-lg">
          <p className="text-semantic-error text-sm">❌ {error}</p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className="btn btn-secondary"
        >
          ← Back
        </button>

        <button
          onClick={handleNext}
          disabled={!canProceed || isGenerating}
          className="btn btn-primary"
        >
          {isGenerating ? (
            <>
              <span className="inline-block animate-spin mr-2">⚙️</span>
              Generating Plan...
            </>
          ) : isLastQuestion ? (
            <>
              Generate Plan 🚀
            </>
          ) : (
            <>
              Next →
            </>
          )}
        </button>
      </div>
    </div>
  );
}
