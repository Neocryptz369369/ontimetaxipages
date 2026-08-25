'use client';

import { useEffect, useRef, useState } from 'react';

type Props = { ids: string[]; who?: string };

function btn(bg: string, fg: string): any {
  return { background: bg, color: fg, border: 'none', borderRadius: 10, padding: '8px 12px', fontWeight: 800, fontSize: 13, cursor: 'pointer' };
}

function keyToBytes(b64: string): Uint8Array {
  const s = String(b64 || '').replace(/-/g, '+').replace(/_/g, '/');
  const over = s.length % 4;
  const pad = over === 0 ? '' : '===='.slice(over);
  const raw = window.atob(s + pad);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export default function NewOrderAlarm({ ids, who }: Props) {
  const [on, setOn] = useState(false);
  const [ringing, setRinging] = useState(false);
  const [note, setNote] = useState('');
  const [bg, setBg] = useState(false);
  const [bgMsg, setBgMsg] = useState('');
  const seenRef = useRef<string[] | null>(null);
  const ctxRef = useRef<any>(null);
  const loopRef = useRef<any>(null);

  const tag = who === 'driver' ? 'otx_driver_alarm' : 'otx_admin_alarm';
  const list = (Array.isArray(ids) ? ids : []).map((x) => String(x || '')).filter((x) => x.length > 0);
  const key = list.join(',');

  useEffect(() => {
    try {
      if (window.localStorage.getItem(tag) === 'on') setOn(true);
      if (window.localStorage.getItem(tag + '_bg') === 'on') setBg(true);
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

  async function turnOnClosedAlerts() {
    setBgMsg('Setting this phone up...');
    try {
      const N: any = (window as any).Notification;
      const navAny: any = navigator;
      if (!N || !navAny.serviceWorker || !(window as any).PushManager) {
        setBgMsg('This browser cannot do closed-app alerts. On an iPhone you must first save On Time Taxi to your home screen and open it from there.');
        return;
      }
      let perm = N.permission;
      if (perm !== 'granted') perm = await N.requestPermission();
      if (perm !== 'granted') {
        setBgMsg('You have to press Allow when the phone asks about notifications.');
        return;
      }
      const pub = String(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '');
      if (!pub) {
        setBgMsg('The alert key is missing on the server.');
        return;
      }
      const reg = await navAny.serviceWorker.register('/otx-push-sw.js');
      await navAny.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyToBytes(pub) });
      }
      const raw: any = sub.toJSON();
      const r = await fetch('/api/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: raw.endpoint,
          p256dh: raw.keys ? raw.keys.p256dh : '',
          auth: raw.keys ? raw.keys.auth : '',
          who: who === 'driver' ? 'driver' : 'admin',
        }),
      });
      const j: any = await r.json();
      if (j && j.ok) {
        setBg(true);
        try { window.localStorage.setItem(tag + '_bg', 'on'); } catch (e) {}
        setBgMsg('Done. This phone will get an alert even when On Time Taxi is closed.');
      } else {
        setBgMsg('Could not turn it on. ' + String((j && j.error) || ''));
      }
    } catch (e: any) {
      setBgMsg('Could not turn it on. ' + String(e && e.message ? e.message : e));
    }
  }

  async function sendTestAlert() {
    setBgMsg('Sending a test alert...');
    try {
      const r = await fetch('/api/push-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true }),
      });
      const j: any = await r.json();
      if (j && j.ok) setBgMsg('Test alert sent to ' + String(j.phones) + ' phone(s).');
      else setBgMsg('Test alert failed. ' + String((j && j.error) || ''));
    } catch (e: any) {
      setBgMsg('Test alert failed. ' + String(e && e.message ? e.message : e));
    }
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
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginTop: 10 }}>
        <div style={{ flex: '1 1 220px', minWidth: 0, fontSize: 12, color: ringing ? '#fff' : '#94a3b8' }}>
          {bgMsg || (bg ? 'Closed-app alerts are ON for this phone.' : 'Closed-app alerts are OFF. Turn them on to be told about orders when On Time Taxi is shut.')}
        </div>
        {bg ? null : (
          <button type="button" onClick={turnOnClosedAlerts} style={btn('#2563eb', '#fff')}>Get alerts when the app is closed</button>
        )}
        <button type="button" onClick={sendTestAlert} style={btn('#0f172a', '#fff')}>Send a test alert</button>
      </div>
      {bg ? null : (
        <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.5, color: '#fbbf24' }}>
          iPhone owners: Apple only lets a website send alerts if the site is saved to the Home Screen first. In Safari tap the Share box at the bottom of the screen, tap Add to Home Screen, tap Add, then open On Time Taxi from that new icon and press the blue button above. After that On Time Taxi shows up under Settings, Notifications on your iPhone so you can turn the sound on.
        </div>
      )}
    </div>
  );
}
