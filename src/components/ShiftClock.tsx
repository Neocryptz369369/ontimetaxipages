'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Slot = { id: string; startedAt: string; endedAt: string | null; minutes: number };

function when(iso: string | null) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString();
  } catch (err) {
    return String(iso);
  }
}

function hoursText(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0) return h + ' hr ' + m + ' min';
  return m + ' min';
}

export default function ShiftClock() {
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState(false);
  const [openSince, setOpenSince] = useState<string | null>(null);
  const [today, setToday] = useState<Slot[]>([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [problem, setProblem] = useState('');

  async function call(action: string) {
    try {
      const got = await supabase.auth.getSession();
      const token = got && got.data && got.data.session ? got.data.session.access_token : '';
      if (!token) {
        setProblem('Please sign in again to use the time clock.');
        setReady(true);
        return;
      }
      const r = await fetch('/api/driver-shift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token, action: action }),
      });
      const j = await r.json();
      if (!r.ok) {
        setProblem(j && j.error ? j.error : 'The time clock did not answer.');
        setReady(true);
        return;
      }
      setProblem('');
      setLive(j.live ? true : false);
      setOpenSince(j.openSince ? j.openSince : null);
      setToday(j.today ? j.today : []);
      setTotalMinutes(j.totalMinutes ? j.totalMinutes : 0);
    } catch (err) {
      setProblem('The time clock did not answer.');
    }
    setReady(true);
  }

  useEffect(() => {
    call('status');
    const t = setInterval(() => { call('status'); }, 60000);
    return () => { clearInterval(t); };
  }, []);

  async function press(action: string) {
    if (busy) return;
    setBusy(true);
    await call(action);
    setBusy(false);
  }

  const card: any = {
    marginTop: '32px',
    padding: '24px',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'linear-gradient(180deg, rgba(6,40,20,0.55), rgba(0,10,6,0.4))',
  };

  return (
    <div style={card}>
      <div style={{ fontSize: '13px', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 800, color: '#8ff0b5', marginBottom: '8px' }}>
        Your hours today
      </div>
      <p style={{ margin: '0 0 16px', color: '#cfe9d9', fontSize: '14px' }}>
        Tap Go live when you start working and Go off the clock when you stop. Every time is written
        down with the date and the time so the insurance company can see who was covered and when.
      </p>

      {live ? (
        <div style={{ fontWeight: 900, fontSize: '18px', color: '#86efac', marginBottom: '12px' }}>
          You are LIVE since {when(openSince)}
        </div>
      ) : (
        <div style={{ fontWeight: 800, fontSize: '18px', color: '#fca5a5', marginBottom: '12px' }}>
          You are off the clock
        </div>
      )}

      <button
        onClick={() => press(live ? 'stop' : 'start')}
        disabled={busy || !ready}
        style={{
          width: '100%',
          padding: '18px 14px',
          fontSize: '20px',
          fontWeight: 900,
          letterSpacing: 1,
          color: '#fff',
          background: live ? '#dc2626' : '#16a34a',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          opacity: busy ? 0.7 : 1,
        }}
      >
        {busy ? 'ONE MOMENT...' : live ? 'GO OFF THE CLOCK' : 'GO LIVE'}
      </button>

      {problem ? (
        <div style={{ color: '#fca5a5', fontSize: '14px', marginTop: '10px' }}>{problem}</div>
      ) : null}

      <div style={{ marginTop: '16px', fontWeight: 800, color: '#fff' }}>
        Total today: {hoursText(totalMinutes)}
      </div>

      <div style={{ marginTop: '10px', display: 'grid', gap: '8px' }}>
        {today.length === 0 ? (
          <div style={{ color: '#9fd8b6', fontSize: '14px' }}>Nothing on the clock yet today.</div>
        ) : (
          today.map((s: Slot) => (
            <div
              key={s.id}
              style={{
                borderRadius: '12px',
                padding: '12px 14px',
                background: 'rgba(0,0,0,0.28)',
                border: '1px solid rgba(255,255,255,0.08)',
                fontSize: '14px',
                color: '#dff3e7',
              }}
            >
              On: {when(s.startedAt)} — Off: {s.endedAt ? when(s.endedAt) : 'still live'} — {hoursText(s.minutes)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
