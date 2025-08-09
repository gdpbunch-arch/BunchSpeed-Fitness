/* eslint @typescript-eslint/no-explicit-any: "off" */
'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '../../../lib/supabaseBrowser';

type WorkoutItem = { name: string; sets?: number; reps?: number | string; load?: string };
type LogRow = {
  day: string;
  workout_done?: boolean;
  meals_logged?: boolean;
  protein_g?: number;
  steps?: number;
  sleep_hrs?: number;
  weight_kg?: number; // DB stays in kg
  notes?: string;
};

const kgToLb = (kg: number) => Math.round(kg * 2.20462 * 10) / 10;
const lbToKg = (lb: number) => Math.round((lb / 2.20462) * 10) / 10;

export default function TodayPage() {
  const [meal, setMeal] = useState<{ protein_g?: number; calories?: number; carbs_g?: number; fat_g?: number } | null>(null);
  const [workout, setWorkout] = useState<WorkoutItem[] | null>(null);
  const [log, setLog] = useState<LogRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // form
  const [workoutDone, setWorkoutDone] = useState(false);
  const [mealsLogged, setMealsLogged] = useState(false);
  const [protein, setProtein] = useState('');
  const [steps, setSteps] = useState('');
  const [sleep, setSleep] = useState('');
  const [weight, setWeight] = useState(''); // UI shows lb
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const run = async () => {
      setErr(null);
      const clientId = process.env.NEXT_PUBLIC_CLIENT_DEMO_ID as string | undefined;
      if (!clientId) {
        setErr('Missing NEXT_PUBLIC_CLIENT_DEMO_ID in .env.local');
        setLoading(false);
        return;
      }
      const supabase = supabaseBrowser;

      const { data: mealData } = await supabase
        .from('meal_targets').select('*')
        .eq('client_id', clientId).order('day', { ascending: false }).limit(1).maybeSingle();

      const { data: workoutRow } = await supabase
        .from('workouts').select('*')
        .eq('client_id', clientId).order('day', { ascending: false }).limit(1).maybeSingle();

      const { data: logRow } = await supabase
        .from('logs').select('*')
        .eq('client_id', clientId).order('day', { ascending: false }).limit(1).maybeSingle();

      setMeal(mealData || null);
      setWorkout((workoutRow?.items as WorkoutItem[]) || null);
      setLog((logRow as LogRow) || null);

      if (logRow) {
        setWorkoutDone(!!logRow.workout_done);
        setMealsLogged(!!logRow.meals_logged);
        setProtein(logRow.protein_g != null ? String(logRow.protein_g) : '');
        setSteps(logRow.steps != null ? String(logRow.steps) : '');
        setSleep(logRow.sleep_hrs != null ? String(logRow.sleep_hrs) : '');
        setWeight(logRow.weight_kg != null ? String(kgToLb(Number(logRow.weight_kg))) : ''); // kg -> lb for UI
        setNotes(logRow.notes || '');
      }

      setLoading(false);
    };
    run();
  }, []);

  const logToday = async () => {
    try {
      setSaving(true);
      setErr(null);
      const clientId = process.env.NEXT_PUBLIC_CLIENT_DEMO_ID as string;
      const today = new Date().toISOString().slice(0, 10);
      const num = (v: string) => (v === '' ? undefined : Number(v));
      const weightKg = weight === '' ? undefined : lbToKg(Number(weight)); // lb -> kg for DB

      const res = await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          day: today,
          data: {
            workout_done: workoutDone,
            meals_logged: mealsLogged,
            protein_g: num(protein),
            steps: num(steps),
            sleep_hrs: num(sleep),
            weight_kg: weightKg,
            notes: notes || undefined
          }
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to log');

      setLog({
        day: today,
        workout_done: workoutDone,
        meals_logged: mealsLogged,
        protein_g: num(protein),
        steps: num(steps),
        sleep_hrs: num(sleep),
        weight_kg: weightKg,
        notes
      } as LogRow);
      alert('Saved ✔');
    } catch (e: any) {
      setErr(e.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const card: React.CSSProperties = { border: '1px solid #eee', padding: 16, borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' };
  const field: React.CSSProperties = { display: 'grid', gap: 6 };

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;

  const todayFmt = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div style={{ padding: 16, display: 'grid', gap: 16, maxWidth: 960, margin: '0 auto' }}>
      {/* Brand header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Image src="/brand/logo.png" alt="Bunchspeed Fitness" width={32} height={32} />
        <strong style={{ fontSize: 18 }}>Bunchspeed Fitness</strong>
      </div>

      {/* Hero */}
      <div style={{ position: 'relative', width: '100%', height: 340, overflow: 'hidden', borderRadius: 12, border: '1px solid #eee' }}>
        <Image
          src="/brand/hero.jpg"
          alt="Bunchspeed Fitness"
          width={1600}
          height={900}
          priority
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 12%' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0) 100%)' }} />
        <div style={{ position: 'absolute', left: 16, bottom: 16, color: 'white' }}>
          <div style={{ fontWeight: 700, fontSize: 22, lineHeight: 1 }}>Today — {todayFmt}</div>
        </div>
      </div>

      {err && <div style={{ color: 'crimson' }}>{err}</div>}

      {/* Cards */}
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <div style={card}>
          <h2 style={{ marginTop: 0 }}>Meals</h2>
          <p>
            Protein: <strong>{meal?.protein_g ?? '—'} g</strong> · Calories: <strong>{meal?.calories ?? '—'}</strong>
          </p>
          {(meal?.carbs_g != null || meal?.fat_g != null) && (
            <p>Carbs: {meal?.carbs_g ?? '—'} g · Fat: {meal?.fat_g ?? '—'} g</p>
          )}
        </div>

        <div style={card}>
          <h2 style={{ marginTop: 0 }}>Workout</h2>
          {Array.isArray(workout) && workout.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
              {workout.map((w, i) => (
                <li key={i}>
                  <strong>{w.name}</strong>{' '}
                  {w.sets ? `${w.sets}×` : ''}{w.reps ?? ''}{w.load ? ` · ${w.load}` : ''}
                </li>
              ))}
            </ul>
          ) : (
            <div>—</div>
          )}
        </div>
      </div>

      <div style={card}>
        <h2 style={{ marginTop: 0 }}>Today’s Log</h2>
        {log ? (
          <div style={{ lineHeight: 1.8, marginBottom: 12 }}>
            <div>Workout done: {log.workout_done ? 'Yes' : 'No'}</div>
            <div>Meals logged: {log.meals_logged ? 'Yes' : 'No'}</div>
            <div>Protein: {log.protein_g ?? '—'} g</div>
            <div>Steps: {log.steps ?? '—'}</div>
            <div>Sleep: {log.sleep_hrs ?? '—'} hrs</div>
            <div>Weight: {log.weight_kg != null ? `${kgToLb(log.weight_kg)} lb` : '—'}</div>
            <div>Notes: {log.notes || '—'}</div>
          </div>
        ) : (
          <div style={{ marginBottom: 12 }}>No log yet.</div>
        )}

        <div style={{ display: 'grid', gap: 10, maxWidth: 520 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={workoutDone} onChange={e => setWorkoutDone(e.target.checked)} /> Workout done
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={mealsLogged} onChange={e => setMealsLogged(e.target.checked)} /> Meals logged
          </label>

          <div style={field}><label>Protein (g)</label><input value={protein} onChange={e => setProtein(e.target.value)} inputMode="numeric" /></div>
          <div style={field}><label>Steps</label><input value={steps} onChange={e => setSteps(e.target.value)} inputMode="numeric" /></div>
          <div style={field}><label>Sleep (hrs)</label><input value={sleep} onChange={e => setSleep(e.target.value)} inputMode="decimal" /></div>
          <div style={field}><label>Weight (lb)</label><input value={weight} onChange={e => setWeight(e.target.value)} inputMode="decimal" /></div>
          <div style={field}><label>Notes</label><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} /></div>

          <button
            onClick={logToday}
            disabled={saving}
            style={{
              padding: '10px 14px',
              border: '1px solid #ddd',
              borderRadius: 10,
              background: saving ? '#eee' : '#111',
              color: saving ? '#666' : '#fff',
              cursor: saving ? 'default' : 'pointer',
              width: 160
            }}
          >
            {saving ? 'Saving…' : 'Log Today'}
          </button>
        </div>
      </div>
    </div>
  );
}
