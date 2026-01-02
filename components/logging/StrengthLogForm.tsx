'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { TrainingDay } from '@/lib/db/types';

interface StrengthLogFormProps {
  action: (formData: FormData) => Promise<void>;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? 'Saving…' : 'Save strength log'}
    </button>
  );
}

export function StrengthLogForm({ action }: StrengthLogFormProps) {
  const [day, setDay] = useState<TrainingDay>('tuesday');
  const [exercise, setExercise] = useState('Back Squat');
  const [sets, setSets] = useState([
    { weight: '60', reps: '6', rpe: '7', rir: '' },
    { weight: '60', reps: '6', rpe: '7', rir: '' }
  ]);

  return (
    <form className="card space-y-4" action={action}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
          <h3 className="text-lg font-bold">Log strength set</h3>
        </div>
        <span className="badge-accent">Strength</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="form-group">
          <label className="form-label">Day</label>
          <select
            name="day"
            value={day}
            onChange={(e) => setDay(e.target.value as TrainingDay)}
            className="form-select"
          >
            <option value="tuesday">Tuesday</option>
            <option value="thursday">Thursday</option>
            <option value="friday">Friday</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Exercise</label>
          <input
            name="exercise"
            value={exercise}
            onChange={(e) => setExercise(e.target.value)}
            className="form-input"
            placeholder="Back Squat"
          />
        </div>
      </div>
      <div className="space-y-3">
        <label className="form-label">Sets</label>
        <div className="space-y-2">
          {sets.map((s, idx) => (
            <div key={idx} className="glass rounded-lg p-3">
              <div className="grid grid-cols-4 gap-2">
                <div className="form-group">
                  <label className="form-label text-xs">Weight (kg)</label>
                  <input
                    type="number"
                    value={s.weight}
                    onChange={(e) =>
                      setSets((prev) => prev.map((item, i) => (i === idx ? { ...item, weight: e.target.value } : item)))
                    }
                    placeholder="60"
                    className="form-input text-sm"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">Reps</label>
                  <input
                    type="number"
                    value={s.reps}
                    onChange={(e) => setSets((prev) => prev.map((item, i) => (i === idx ? { ...item, reps: e.target.value } : item)))}
                    placeholder="6"
                    className="form-input text-sm"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">RPE</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={s.rpe}
                    onChange={(e) => setSets((prev) => prev.map((item, i) => (i === idx ? { ...item, rpe: e.target.value } : item)))}
                    placeholder="7"
                    className="form-input text-sm"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">RIR</label>
                  <input
                    type="number"
                    value={s.rir}
                    onChange={(e) => setSets((prev) => prev.map((item, i) => (i === idx ? { ...item, rir: e.target.value } : item)))}
                    placeholder="3"
                    className="form-input text-sm"
                  />
                </div>
                <input
                  type="hidden"
                  name="sets"
                  value={JSON.stringify({
                    weight: parseFloat(s.weight),
                    reps: parseInt(s.reps, 10),
                    rpe: s.rpe ? parseInt(s.rpe, 10) : undefined,
                    rir: s.rir ? parseInt(s.rir, 10) : undefined
                  })}
                  readOnly
                />
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="btn-secondary w-full"
          onClick={() => setSets((prev) => [...prev, { weight: '0', reps: '0', rpe: '', rir: '' }])}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add set
        </button>
      </div>
      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
