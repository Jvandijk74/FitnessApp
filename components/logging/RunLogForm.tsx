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
    <form className="card space-y-3" action={action}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Log a run</h3>
        <p className="text-xs text-white/60">Strava imports require confirmation</p>
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
            <option value="monday">Monday</option>
            <option value="tuesday">Tuesday</option>
            <option value="wednesday">Wednesday</option>
            <option value="thursday">Thursday</option>
            <option value="friday">Friday</option>
            <option value="saturday">Saturday</option>
            <option value="sunday">Sunday</option>
          </select>
        </label>
        <label className="grid gap-1">
          Distance (km)
          <input
            name="distance_km"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className="rounded border border-white/10 p-2"
          />
        </label>
        <label className="grid gap-1">
          Duration (minutes)
          <input
            name="duration_minutes"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="rounded border border-white/10 p-2"
          />
        </label>
        <label className="grid gap-1">
          Avg HR
          <input name="avg_hr" value={avgHr} onChange={(e) => setAvgHr(e.target.value)} className="rounded border border-white/10 p-2" />
        </label>
        <label className="grid gap-1">
          Max HR
          <input name="max_hr" value={maxHr} onChange={(e) => setMaxHr(e.target.value)} className="rounded border border-white/10 p-2" />
        </label>
        <label className="grid gap-1">
          RPE
          <input name="rpe" value={rpe} onChange={(e) => setRpe(e.target.value)} className="rounded border border-white/10 p-2" />
        </label>
      </div>
      <SubmitButton />
    </form>
  );
}
