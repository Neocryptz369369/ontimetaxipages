'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

function when(v: any) {
  if (!v) return '';
  try { return new Date(v).toLocaleString(); } catch (e) { return ''; }
}

export default function DriverMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [waiting, setWaiting] = useState(0);
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  const seenRef = useRef<any>({});
  const firstRef = useRef(true);

  async function myToken() {
    try {
      const s = await supabase.auth.getSession();
      return s && s.data && s.data.session ? String(s.data.session.access_token) : '';
    } catch (e) {
      return '';
    }
  }

  function beep() {
    try {
      const w: any = window;
      const Ctx = w.AudioContext || w.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = 880;
      gain.gain.value = 0.25;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      setTimeout(function () {
        try { osc.stop(); ctx.close(); } catch (e) {}
      }, 600);
    } catch (e) {}
  }

  async function load() {
    const tk = await myToken();
    if (!tk) return;
    try {
      const r = await fetch('/api/driver-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tk, action: 'list' }),
      });
      const j: any = await r.json();
      if (!r.ok || !j || !j.ok) return;
      const rows: any[] = j.messages ? j.messages : [];
      setMessages(rows);
      setWaiting(Number(j.waiting || 0));
      let fresh = false;
      rows.forEach(function (m: any) {
        const id = String(m.id);
        if (!seenRef.current[id]) {
          seenRef.current[id] = true;
          if (String(m.status) !== 'handled') fresh = true;
        }
      });
      if (fresh && !firstRef.current) beep();
      firstRef.current = false;
    } catch (e) {}
  }

  useEffect(function () {
    load();
    const t = setInterval(load, 15000);
    return function () { clearInterval(t); };
  }, []);

  async function markHandled(id: string) {
    const tk = await myToken();
    if (!tk) return;
    setBusy(id);
    setMsg('');
    try {
      const r = await fetch('/api/driver-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tk, action: 'handled', id: id }),
      });
      const j: any = await r.json();
      if (!r.ok || !j || !j.ok) setMsg(j && j.error ? String(j.error) : 'That did not save.');
    } catch (e) {
      setMsg('That did not save.');
    }
    setBusy('');
    load();
  }

  const card: any = {
    padding: '24px',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'linear-gradient(180deg, rgba(6,26,40,0.6), rgba(0,6,10,0.4))',
    color: '#ffffff',
  };
  const btn: any = {
    border: 'none',
    borderRadius: '10px',
    padding: '10px 14px',
    fontWeight: 800,
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: '8px',
  };

  const open = messages.filter(function (m) { return String(m.status) !== 'handled'; });
  const done = messages.filter(function (m) { return String(m.status) === 'handled'; });

  return (
    <div style={card}>
      <h2 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 800 }}>Messages from your drivers</h2>
      <p style={{ color: '#b3ccd9', margin: '0 0 14px', fontSize: '14px' }}>
        Anything a driver sends you from their own page lands here.
      </p>

      {waiting > 0 ? (
        <div style={{ background: '#b81111', color: '#fff', fontWeight: 900, borderRadius: '10px', padding: '10px 12px', marginBottom: '12px' }}>
          {waiting === 1 ? '1 message needs you' : waiting + ' messages need you'}
        </div>
      ) : (
        <p style={{ color: '#b3ccd9', fontSize: '14px' }}>Nothing waiting on you.</p>
      )}

      {msg ? <p style={{ color: '#ffd166', fontWeight: 700 }}>{msg}</p> : null}

      {open.map(function (m: any) {
        return (
          <div key={m.id} style={{ background: 'rgba(255,59,59,0.10)', border: '2px solid #ff3b3b', borderRadius: '12px', padding: '12px', marginBottom: '10px' }}>
            <div style={{ color: '#ff9d9d', fontWeight: 900, fontSize: '15px' }}>
              {m.driver_name ? m.driver_name : 'A driver'}{m.driver_code ? ' - ID ' + m.driver_code : ''}
            </div>
            <div style={{ color: '#ffffff', fontSize: '15px', marginTop: '6px', lineHeight: 1.5 }}>{m.body}</div>
            <div style={{ color: '#b3ccd9', fontSize: '12px', marginTop: '4px' }}>{when(m.created_at)}</div>
            <button
              type='button'
              disabled={busy === String(m.id)}
              onClick={function () { markHandled(String(m.id)); }}
              style={{ ...btn, background: '#128a3d', color: '#fff' }}
            >
              Mark handled
            </button>
          </div>
        );
      })}

      {done.length > 0 ? (
        <div style={{ marginTop: '10px' }}>
          <div style={{ color: '#b3ccd9', fontWeight: 800, fontSize: '14px', marginBottom: '6px' }}>Already handled</div>
          {done.slice(0, 10).map(function (m: any) {
            return (
              <div key={m.id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '10px 12px', marginBottom: '8px', opacity: 0.85 }}>
                <div style={{ color: '#b3ccd9', fontWeight: 700, fontSize: '13px' }}>
                  {m.driver_name ? m.driver_name : 'A driver'} - {when(m.created_at)}
                </div>
                <div style={{ color: '#ffffff', fontSize: '14px', marginTop: '3px' }}>{m.body}</div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
