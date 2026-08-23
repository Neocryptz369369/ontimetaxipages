'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Pot = { rides: number; fares: number; tips: number; companyKeeps: number; youMade: number; unpaid: number };

const RANGES = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This week' },
  { key: 'month', label: 'This month' },
  { key: 'all', label: 'All time' },
];

function money(n: any) {
  const v = Number(n || 0);
  return '$' + v.toFixed(2);
}

function niceDay(k: string) {
  const bits = String(k).split('-');
  if (bits.length !== 3) return k;
  const d = new Date(Number(bits[0]), Number(bits[1]) - 1, Number(bits[2]));
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function DriverEarnings() {
  const [data, setData] = useState<any>(null);
  const [range, setRange] = useState('today');
  const [showDays, setShowDays] = useState(false);
  const [showRuns, setShowRuns] = useState(false);
  const [note, setNote] = useState('Adding up your pay...');

  async function load() {
    let token = '';
    try {
      const s = await supabase.auth.getSession();
      token = s && s.data && s.data.session ? String(s.data.session.access_token) : '';
    } catch (e) {}
    if (!token) {
      setNote('Sign in to see your pay.');
      return;
    }
    try {
      const r = await fetch('/api/driver-earnings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token }),
      });
      const j: any = await r.json();
      if (!r.ok || !j || !j.ok) {
        setNote('Could not load your pay right now.');
        return;
      }
      setData(j);
      setNote('');
    } catch (e) {
      setNote('Could not load your pay right now.');
    }
  }

  useEffect(function () {
    load();
    const t = setInterval(load, 60000);
    return function () {
      clearInterval(t);
    };
  }, []);

  const card: any = {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  };

  if (!data) {
    return (
      <div style={card}>
        <div style={{ fontWeight: 900, color: '#0f172a', fontSize: 16, marginBottom: 6 }}>YOUR PAY</div>
        <div style={{ color: '#64748b', fontSize: 14 }}>{note}</div>
      </div>
    );
  }

  const pot: Pot = data[range] ? data[range] : { rides: 0, fares: 0, tips: 0, companyKeeps: 0, youMade: 0, unpaid: 0 };
  const days: any[] = data.days ? data.days : [];
  const runs: any[] = data.recent ? data.recent : [];
  const pct = data.commissionPct !== null && data.commissionPct !== undefined ? Number(data.commissionPct) : 20;
  const fee = data.getInFee !== null && data.getInFee !== undefined ? Number(data.getInFee) : 5;

  const tab = function (on: boolean) {
    return {
      border: '1px solid ' + (on ? '#0f172a' : '#cbd5e1'),
      background: on ? '#0f172a' : '#fff',
      color: on ? '#fff' : '#0f172a',
      borderRadius: 999,
      padding: '8px 14px',
      fontWeight: 800,
      fontSize: 14,
      cursor: 'pointer',
    } as any;
  };

  const line: any = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 10,
    padding: '8px 0',
    borderBottom: '1px solid #f1f5f9',
    fontSize: 15,
    color: '#0f172a',
  };

  return (
    <div style={card}>
      <div style={{ fontWeight: 900, color: '#0f172a', fontSize: 16, marginBottom: 4 }}>YOUR PAY</div>
      <div style={{ color: '#64748b', fontSize: 13, marginBottom: 12 }}>
        {data.name ? data.name : 'Driver'}
        {data.code ? ' - ' + data.code : ''}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {RANGES.map(function (x) {
          return (
            <button key={x.key} type='button' onClick={function () { setRange(x.key); }} style={tab(range === x.key)}>
              {x.label}
            </button>
          );
        })}
      </div>

      <div
        style={{
          background: '#0f172a',
          color: '#fff',
          borderRadius: 14,
          padding: '16px 18px',
          marginBottom: 12,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.1em', color: '#f5b301' }}>WHAT YOU TAKE HOME</div>
        <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.2 }}>{money(pot.youMade)}</div>
        <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 700 }}>
          {pot.rides === 1 ? '1 run' : pot.rides + ' runs'}
        </div>
      </div>

      <div style={line}>
        <span>Fares</span>
        <strong>{money(pot.fares)}</strong>
      </div>
      <div style={line}>
        <span>Tips (all yours)</span>
        <strong>{money(pot.tips)}</strong>
      </div>
      <div style={line}>
        <span>Company keeps</span>
        <strong>{money(pot.companyKeeps)}</strong>
      </div>

      {pot.unpaid > 0 ? (
        <div
          style={{
            marginTop: 12,
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            color: '#92400e',
            borderRadius: 12,
            padding: '10px 12px',
            fontWeight: 700,
            lineHeight: 1.5,
          }}
        >
          {pot.unpaid === 1 ? '1 run was' : pot.unpaid + ' runs were'} not paid by card. Those are cash runs. Make sure you
          collected the money.
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
        <button
          type='button'
          onClick={function () { setShowDays(!showDays); }}
          style={{ border: '1px solid #cbd5e1', background: '#fff', color: '#0f172a', borderRadius: 10, padding: '8px 12px', fontWeight: 800, cursor: 'pointer' }}
        >
          {showDays ? 'Hide day by day' : 'Day by day'}
        </button>
        <button
          type='button'
          onClick={function () { setShowRuns(!showRuns); }}
          style={{ border: '1px solid #cbd5e1', background: '#fff', color: '#0f172a', borderRadius: 10, padding: '8px 12px', fontWeight: 800, cursor: 'pointer' }}
        >
          {showRuns ? 'Hide your runs' : 'Your runs'}
        </button>
      </div>

      {showDays ? (
        <div style={{ marginTop: 12 }}>
          {days.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: 14 }}>No runs in the last 30 days yet.</div>
          ) : (
            days.map(function (d: any) {
              return (
                <div key={d.day} style={line}>
                  <span>
                    {niceDay(d.day)} <span style={{ color: '#64748b', fontSize: 13 }}>({d.rides})</span>
                  </span>
                  <strong>{money(d.youMade)}</strong>
                </div>
              );
            })
          )}
        </div>
      ) : null}

      {showRuns ? (
        <div style={{ marginTop: 12 }}>
          {runs.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: 14 }}>You have not run anybody yet.</div>
          ) : (
            runs.map(function (r: any) {
              return (
                <div key={r.id} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>{r.when ? new Date(r.when).toLocaleString() : ''}</span>
                    <strong style={{ color: '#0f172a' }}>{money(r.youMade)}</strong>
                  </div>
                  <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
                    {r.pickup ? r.pickup : 'Pick up not given'} to {r.dropoff ? r.dropoff : 'drop off not given'}
                  </div>
                  <div style={{ color: r.paid ? '#166534' : '#b45309', fontSize: 13, fontWeight: 800, marginTop: 2 }}>
                    {r.paid ? 'Paid by card' : 'Cash run'}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : null}

      <div style={{ marginTop: 14, color: '#64748b', fontSize: 13, lineHeight: 1.6 }}>
        {money(fee)} get in fee on every ride, plus {pct} percent of what is left. Tips are all yours.
      </div>
    </div>
  );
}
