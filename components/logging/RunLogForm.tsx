'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { TrainingDay } from '@/lib/db/types';

interface RunLogFormProps {
  action: (payload: FormData) => Promise<void>;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? 'Saving…' : 'Save run'}
    </button>
  );
}

export function RunLogForm({ action }: RunLogFormProps) {
  const [day, setDay] = useState<TrainingDay>('monday');
  const [distance, setDistance] = useState('5');
  const [duration, setDuration] = useState('30');
  const [avgHr, setAvgHr] = useState('');
  const [maxHr, setMaxHr] = useState('');
  const [rpe, setRpe] = useState('');

  return (
    <form className="card space-y-4" action={action}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold">Log a run</h3>
        </div>
        <span className="badge-primary">Running</span>
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
            <option value="monday">Monday</option>
            <option value="tuesday">Tuesday</option>
            <option value="wednesday">Wednesday</option>
            <option value="thursday">Thursday</option>
            <option value="friday">Friday</option>
            <option value="saturday">Saturday</option>
            <option value="sunday">Sunday</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Distance (km)</label>
          <input
            name="distance_km"
            type="number"
            step="0.1"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className="form-input"
            placeholder="5.0"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Duration (min)</label>
          <input
            name="duration_minutes"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="form-input"
            placeholder="30"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Avg HR (bpm)</label>
          <input
            name="avg_hr"
            type="number"
            value={avgHr}
            onChange={(e) => setAvgHr(e.target.value)}
            className="form-input"
            placeholder="150"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Max HR (bpm)</label>
          <input
            name="max_hr"
            type="number"
            value={maxHr}
            onChange={(e) => setMaxHr(e.target.value)}
            className="form-input"
            placeholder="180"
          />
        </div>
        <div className="form-group">
          <label className="form-label">RPE (1-10)</label>
          <input
            name="rpe"
            type="number"
            min="1"
            max="10"
            value={rpe}
            onChange={(e) => setRpe(e.target.value)}
            className="form-input"
            placeholder="7"
          />
        </div>
      </div>
      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
