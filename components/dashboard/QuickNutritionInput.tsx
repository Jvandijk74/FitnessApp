'use client';

import { useState } from 'react';
import { logMeal } from '@/app/actions/nutrition';
import { useRouter } from 'next/navigation';

interface QuickNutritionInputProps {
  userId: string;
  date: string;
}

export function QuickNutritionInput({ userId, date }: QuickNutritionInputProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    meal_type: 'breakfast' as 'breakfast' | 'lunch' | 'dinner' | 'snack',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    console.log('[QuickNutritionInput] 📝 Submitting food:', formData);

    try {
      const result = await logMeal({
        user_id: userId,
        log_date: date,
        meal_type: formData.meal_type,
        name: formData.name,
        calories: parseInt(formData.calories),
        protein_grams: parseFloat(formData.protein),
        carbs_grams: parseFloat(formData.carbs),
        fat_grams: parseFloat(formData.fat),
      });

      if (result) {
        console.log('[QuickNutritionInput] ✅ Food logged successfully');
        // Reset form
        setFormData({
          name: '',
          calories: '',
          protein: '',
          carbs: '',
          fat: '',
          meal_type: 'breakfast',
        });
        setIsOpen(false);
        router.refresh();
      } else {
        alert('Failed to log food. Please try again.');
      }
    } catch (error) {
      console.error('[QuickNutritionInput] ❌ Error logging food:', error);
      alert('Error logging food. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full p-4 rounded-xl border-2 border-dashed border-surface-elevated hover:border-primary-500/50 transition-all text-center group"
      >
        <div className="flex items-center justify-center gap-3">
          <span className="text-3xl">🍽️</span>
          <div className="text-left">
            <p className="font-semibold text-text-primary group-hover:text-primary-400 transition">
              Quick Add Food
            </p>
            <p className="text-sm text-text-tertiary">
              Log nutrition without leaving the dashboard
            </p>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Quick Add Food</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-text-tertiary hover:text-text-primary"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Food Name */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Food Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Chicken Breast, Apple"
            required
            className="w-full px-3 py-2 bg-surface rounded-lg border border-surface-elevated focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-text-primary"
          />
        </div>

        {/* Meal Type */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Meal Type
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({ ...formData, meal_type: type })}
                className={`py-2 px-3 rounded-lg border transition-colors ${
                  formData.meal_type === type
                    ? 'bg-primary-500 border-primary-500 text-white'
                    : 'bg-surface-elevated border-surface-elevated text-text-secondary hover:border-primary-500/50'
                }`}
              >
                {type === 'breakfast' && '🌅'}
                {type === 'lunch' && '🌞'}
                {type === 'dinner' && '🌙'}
                {type === 'snack' && '🍎'}
                <span className="block text-xs mt-1 capitalize">{type}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Macros */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Calories
            </label>
            <input
              type="number"
              value={formData.calories}
              onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
              placeholder="300"
              required
              min="0"
              className="w-full px-3 py-2 bg-surface rounded-lg border border-surface-elevated focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-text-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Protein (g)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.protein}
              onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
              placeholder="25"
              required
              min="0"
              className="w-full px-3 py-2 bg-surface rounded-lg border border-surface-elevated focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-text-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Carbs (g)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.carbs}
              onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
              placeholder="30"
              required
              min="0"
              className="w-full px-3 py-2 bg-surface rounded-lg border border-surface-elevated focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-text-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Fat (g)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.fat}
              onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
              placeholder="10"
              required
              min="0"
              className="w-full px-3 py-2 bg-surface rounded-lg border border-surface-elevated focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-text-primary"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2 inline" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging...
              </>
            ) : (
              '✓ Log Food'
            )}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
