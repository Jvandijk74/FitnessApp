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
    <form className="card space-y-3" action={action}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Log strength set</h3>
        <p className="text-xs text-white/60">Format enforced: sets × reps, tempo, rest, target RPE/RIR</p>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <label className="grid gap-1">
          Day
          <select
            name="day"
            value={day}
            onChange={(e) => setDay(e.target.value as TrainingDay)}
            className="rounded border border-white/10 p-2"
          >
            <option value="tuesday">Tuesday</option>
            <option value="thursday">Thursday</option>
            <option value="friday">Friday</option>
          </select>
        </label>
        <label className="grid gap-1">
          Exercise
          <input
            name="exercise"
            value={exercise}
            onChange={(e) => setExercise(e.target.value)}
            className="rounded border border-white/10 p-2"
          />
        </label>
      </div>
      <div className="space-y-2 text-sm">
        {sets.map((s, idx) => (
          <div key={idx} className="grid grid-cols-4 gap-2">
            <input
              value={s.weight}
              onChange={(e) =>
                setSets((prev) => prev.map((item, i) => (i === idx ? { ...item, weight: e.target.value } : item)))
              }
              placeholder="Weight"
              className="rounded border border-white/10 p-2"
            />
            <input
              value={s.reps}
              onChange={(e) => setSets((prev) => prev.map((item, i) => (i === idx ? { ...item, reps: e.target.value } : item)))}
              placeholder="Reps"
              className="rounded border border-white/10 p-2"
            />
            <input
              value={s.rpe}
              onChange={(e) => setSets((prev) => prev.map((item, i) => (i === idx ? { ...item, rpe: e.target.value } : item)))}
              placeholder="RPE"
              className="rounded border border-white/10 p-2"
            />
            <input
              value={s.rir}
              onChange={(e) => setSets((prev) => prev.map((item, i) => (i === idx ? { ...item, rir: e.target.value } : item)))}
              placeholder="RIR"
              className="rounded border border-white/10 p-2"
            />
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
        ))}
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setSets((prev) => [...prev, { weight: '0', reps: '0', rpe: '', rir: '' }])}
        >
          Add set
        </button>
      </div>
      <SubmitButton />
    </form>
  );
}
