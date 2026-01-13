'use client';

import { useState } from 'react';
import { User } from '@/lib/db/types';
import { updateUserProfile } from '@/app/actions/nutrition';

interface ProfileSettingsProps {
  user: User;
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const [formData, setFormData] = useState({
    age: user.age || '',
    weight_kg: user.weight_kg || '',
    height_cm: user.height_cm || '',
    gender: user.gender || 'other',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');

    console.log('[ProfileSettings] Starting profile save...');
    console.log('[ProfileSettings] User ID:', user.id);
    console.log('[ProfileSettings] Form data:', formData);

    try {
      const updates = {
        age: formData.age ? parseInt(formData.age as string) : undefined,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg as string) : undefined,
        height_cm: formData.height_cm ? parseFloat(formData.height_cm as string) : undefined,
        gender: formData.gender as 'male' | 'female' | 'other',
      };

      console.log('[ProfileSettings] Updates to send:', updates);

      const result = await updateUserProfile(user.id, updates);

      console.log('[ProfileSettings] Update result:', result);

      if (!result) {
        throw new Error('No result returned from updateUserProfile - database columns may not exist yet');
      }

      setSaveMessage('Profile saved successfully!');
      console.log('[ProfileSettings] Profile saved successfully');

      // Refresh the page after a short delay to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSaveMessage(`Error: ${errorMessage}`);
      console.error('[ProfileSettings] ❌ Error saving profile:', error);
      console.error('[ProfileSettings] Error details:', {
        message: errorMessage,
        error: error,
        stack: error instanceof Error ? error.stack : undefined,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Profile & Body Metrics</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Age (years)
            </label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              placeholder="e.g., 30"
              className="w-full px-4 py-2 rounded-lg border border-surface-elevated bg-surface text-text-primary focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Gender
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' | 'other' })}
              className="w-full px-4 py-2 rounded-lg border border-surface-elevated bg-surface text-text-primary focus:outline-none focus:border-primary-500"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.weight_kg}
              onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
              placeholder="e.g., 75.0"
              className="w-full px-4 py-2 rounded-lg border border-surface-elevated bg-surface text-text-primary focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Height (cm)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.height_cm}
              onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
              placeholder="e.g., 180"
              className="w-full px-4 py-2 rounded-lg border border-surface-elevated bg-surface text-text-primary focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <div>
            {saveMessage && (
              <p className={`text-sm ${saveMessage.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                {saveMessage}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-surface-elevated">
          <p className="text-xs text-text-tertiary">
            💡 These metrics are used to calculate your daily calorie and macronutrient requirements
            in the Nutrition section. Keep them up to date for accurate recommendations.
          </p>
        </div>
      </form>
    </div>
  );
}
