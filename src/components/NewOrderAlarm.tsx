'use client';

import { useEffect, useRef, useState } from 'react';

type Props = { ids: string[]; who?: string };

function btn(bg: string, fg: string): any {
  return { background: bg, color: fg, border: 'none', borderRadius: 10, padding: '8px 12px', fontWeight: 800, fontSize: 13, cursor: 'pointer' };
}

export default function NewOrderAlarm({ ids, who }: Props) {
  const [on, setOn] = useState(false);
  const [ringing, setRinging] = useState(false);
  const [note, setNote] = useState('');
  const seenRef = useRef<string[] | null>(null);
  const ctxRef = useRef<any>(null);
  const loopRef = useRef<any>(null);

  const tag = who === 'driver' ? 'otx_driver_alarm' : 'otx_admin_alarm';
  const list = (Array.isArray(ids) ? ids : []).map((x) => String(x || '')).filter((x) => x.length > 0);
  const key = list.join(',');

  useEffect(() => {
    try {
      if (window.localStorage.getItem(tag) === 'on') setOn(true);
    } catch (e) {}
  }, [tag]);

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
    for (let i = 0; i < 8; i++) {
      const at = start + i * 0.28;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'square';
      o.frequency.setValueAtTime(i % 2 === 0 ? 1180 : 780, at);
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(1, at + 0.02);
      g.gain.setValueAtTime(1, at + 0.2);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.25);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(at);
      o.stop(at + 0.27);
    }
    try {
      const nav: any = navigator;
      if (nav && nav.vibrate) nav.vibrate([500, 250, 500, 250, 500]);
    } catch (e) {}
  }

  function startAlarm() {
    setRinging(true);
    blast();
    if (loopRef.current) clearInterval(loopRef.current);
    loopRef.current = setInterval(blast, 2400);
  }

  function stopAlarm() {
    setRinging(false);
    if (loopRef.current) {
      clearInterval(loopRef.current);
      loopRef.current = null;
    }
  }

  function phoneNote(howMany: number) {
    try {
      const N: any = (window as any).Notification;
      if (!N || N.permission !== 'granted') return;
      const body = howMany > 1 ? howMany + ' new taxi orders are waiting.' : 'A new taxi order just came in. Open On Time Taxi.';
      const n = new N('On Time Taxi - new order', { body: body, tag: 'otx-new-order' });
      setTimeout(() => {
        try { n.close(); } catch (e) {}
      }, 30000);
    } catch (e) {}
  }

  useEffect(() => {
    const now = key.length > 0 ? key.split(',') : [];
    if (seenRef.current === null) {
      seenRef.current = now;
      return;
    }
    const old = seenRef.current;
    const fresh = now.filter((x) => old.indexOf(x) < 0);
    seenRef.current = now;
    if (fresh.length > 0) {
      setNote(fresh.length > 1 ? fresh.length + ' new taxi orders just came in.' : 'A new taxi order just came in.');
      phoneNote(fresh.length);
      if (on) startAlarm();
    }
    if (now.length === 0) {
      stopAlarm();
      setNote('');
    }
  }, [key, on]);

  useEffect(() => {
    return () => {
      if (loopRef.current) clearInterval(loopRef.current);
    };
  }, []);

  function turnOn() {
    setOn(true);
    try { window.localStorage.setItem(tag, 'on'); } catch (e) {}
    audio();
    try {
      const N: any = (window as any).Notification;
      if (N && N.permission === 'default') N.requestPermission();
    } catch (e) {}
    blast();
  }

  function turnOff() {
    setOn(false);
    try { window.localStorage.setItem(tag, 'off'); } catch (e) {}
    stopAlarm();
  }

  return (
    <div style={{ border: '2px solid #ef4444', borderRadius: 14, padding: '12px 14px', marginBottom: 16, background: ringing ? '#ef4444' : 'rgba(239,68,68,0.10)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: ringing ? '#fff' : '#ef4444' }}>{ringing ? 'NEW RIDE ORDER' : 'New order alarm'}</div>
        <div style={{ flex: '1 1 200px', minWidth: 0, fontSize: 13, color: ringing ? '#fff' : '#94a3b8' }}>
          {ringing ? note : note || (on ? 'The alarm is ON. You will hear a loud alert the moment an order comes in.' : 'The alarm is OFF. Press Turn the alarm on so you hear new orders.')}
        </div>
        {ringing ? (
          <button type="button" onClick={stopAlarm} style={btn('#fff', '#b91c1c')}>Stop the alarm</button>
        ) : null}
        {on ? (
          <button type="button" onClick={turnOff} style={btn('#334155', '#fff')}>Turn the alarm off</button>
        ) : (
          <button type="button" onClick={turnOn} style={btn('#16a34a', '#fff')}>Turn the alarm on</button>
        )}
        <button type="button" onClick={() => { audio(); blast(); }} style={btn('#f59e0b', '#111')}>Test the alarm</button>
      </div>
    </div>
  );
}
