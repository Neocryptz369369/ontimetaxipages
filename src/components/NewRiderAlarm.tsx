'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

function btn(bg: string, fg: string): any {
  return { background: bg, color: fg, border: 'none', borderRadius: 10, padding: '8px 12px', fontWeight: 800, fontSize: 13, cursor: 'pointer' };
}

const TAG = 'otx_admin_rider_alarm';

export default function NewRiderAlarm() {
  const [on, setOn] = useState(false);
  const [ringing, setRinging] = useState(false);
  const [note, setNote] = useState('');
  const seenRef = useRef<Set<string> | null>(null);
  const ctxRef = useRef<any>(null);
  const loopRef = useRef<any>(null);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(TAG) === 'on') setOn(true);
    } catch (e) {}
  }, []);

  function audio() {
    try {
      if (!ctxRef.current) {
        const AC: any = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!AC) return null;
        ctxRef.current = new AC();
      }
      if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
      return ctxRef.current;
    } catch (e) {
      return null;
    }
  }

  function blast() {
    const ctx = audio();
    if (!ctx) return;
    const start = ctx.currentTime + 0.05;
    for (let i = 0; i < 5; i++) {
      const at = start + i * 0.3;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(i % 2 === 0 ? 900 : 650, at);
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(1, at + 0.02);
      g.gain.setValueAtTime(1, at + 0.22);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.27);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(at);
      o.stop(at + 0.29);
    }
    try {
      const nav: any = navigator;
      if (nav && nav.vibrate) nav.vibrate([300, 150, 300]);
    } catch (e) {}
  }

  function startAlarm() {
    setRinging(true);
    blast();
    if (loopRef.current) clearInterval(loopRef.current);
    loopRef.current = setInterval(blast, 2600);
  }

  function stopAlarm() {
    setRinging(false);
    if (loopRef.current) {
      clearInterval(loopRef.current);
      loopRef.current = null;
    }
  }

  function phoneNote(text: string) {
    try {
      const N: any = (window as any).Notification;
      if (!N || N.permission !== 'granted') return;
      const n = new N('On Time Taxi - new rider', { body: text, tag: 'otx-new-rider' });
      setTimeout(() => {
        try { n.close(); } catch (e) {}
      }, 30000);
    } catch (e) {}
  }

  useEffect(() => {
    let live = true;
    async function poll() {
      try {
        const got = await supabase.auth.getSession();
        const token = got.data.session ? got.data.session.access_token : '';
        if (!token) return;
        const res = await fetch('/api/rider-signups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: token }),
        });
        const j = await res.json();
        if (!live || !res.ok || !j || !j.ok) return;
        const rows: any[] = j.riders || [];
        const now = new Set<string>(rows.map((r: any) => String(r.id)));
        if (seenRef.current === null) {
          seenRef.current = now;
          return;
        }
        const old = seenRef.current;
        const fresh = rows.filter((r: any) => !old.has(String(r.id)));
        seenRef.current = now;
        if (fresh.length > 0) {
          const text =
            fresh.length > 1
              ? fresh.length + ' new riders just signed up.'
              : fresh[0].full_name
              ? fresh[0].full_name + ' just signed up as a rider.'
              : 'A new rider just signed up.';
          setNote(text);
          phoneNote(text);
          if (on) startAlarm();
        }
      } catch (e) {}
    }
    poll();
    const t = setInterval(poll, 12000);
    return () => {
      live = false;
      clearInterval(t);
    };
  }, [on]);

  useEffect(() => {
    return () => {
      if (loopRef.current) clearInterval(loopRef.current);
    };
  }, []);

  function turnOn() {
    setOn(true);
    try {
      window.localStorage.setItem(TAG, 'on');
    } catch (e) {}
    audio();
    try {
      const N: any = (window as any).Notification;
      if (N && N.permission === 'default') N.requestPermission();
    } catch (e) {}
    blast();
  }

  function turnOff() {
    setOn(false);
    try {
      window.localStorage.setItem(TAG, 'off');
    } catch (e) {}
    stopAlarm();
  }

  return (
    <div style={{ border: '2px solid #2563eb', borderRadius: 14, padding: '12px 14px', marginBottom: 16, background: ringing ? '#2563eb' : 'rgba(37,99,235,0.10)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: ringing ? '#fff' : '#60a5fa' }}>{ringing ? 'NEW RIDER SIGNUP' : 'New rider alarm'}</div>
        <div style={{ flex: '1 1 200px', minWidth: 0, fontSize: 13, color: ringing ? '#fff' : '#94a3b8' }}>
          {ringing
            ? note
            : note || (on ? 'The alarm is ON. You will hear a sound when someone new signs up as a rider.' : 'The alarm is OFF. Press Turn the alarm on so you hear new signups.')}
        </div>
        {ringing ? (
          <button type="button" onClick={stopAlarm} style={btn('#fff', '#1d4ed8')}>
            Stop the alarm
          </button>
        ) : null}
        {on ? (
          <button type="button" onClick={turnOff} style={btn('#334155', '#fff')}>
            Turn the alarm off
          </button>
        ) : (
          <button type="button" onClick={turnOn} style={btn('#16a34a', '#fff')}>
            Turn the alarm on
          </button>
        )}
        <button type="button" onClick={() => { audio(); blast(); }} style={btn('#f59e0b', '#111')}>
          Test the alarm
        </button>
      </div>
    </div>
  );
}
